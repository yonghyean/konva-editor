import Konva from 'konva';
import type { Editor } from '..';
import type { TransformerState } from '../state';

export class SelectionManager {
  private editor: Editor;
  private transformer: Konva.Transformer | null = null;
  private selectionGroup: Konva.Group | null = null;

  constructor(editor: Editor) {
    this.editor = editor;

    // store 리스너 등록

    this.editor.store.listen('transformer', (attrs) => {
      this.syncTransformer(attrs);
    });

    this.editor.store.listen('selection.ids', (ids) => {
      this.syncSelection(ids);
    });

    this._createTransformer();
    this._createSelectionGroup();
  }

  /**
   * 선택된 shapes 설정
   */
  setSelectedShapes(ids: string[]) {
    if (!this.selectionGroup) return;
    const shapes = this.editor.getSelectedShapes();

    shapes.forEach((shape) => {
      // 업데이트 transform
      const shapeNode = this.editor.getShapeNode(shape.id);
      if (!shapeNode) return;
      const transform = shapeNode.getAbsoluteTransform();
      this.editor.updateShape({
        id: shape.id,
        ...transform.decompose(),
      });
    });

    this.editor.setState('selection.ids', ids);
    this.editor.setState('transformer', { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
  }
  /**
   * selection.ids 변경 시 호출
   * - ids 추가: shapes를 selectionGroup으로 이동, transformer nodes 업데이트
   * - ids 제거: selectionGroup.getAbsoluteTransform()로 최종 위치 계산 → shapes 업데이트 → layer로 복귀
   */
  private syncSelection(ids: string[]) {
    if (!this.transformer || !this.selectionGroup) return;

    const currentIds = this.selectionGroup.getChildren().map((child) => child.id());
    const addedIds = ids.filter((id) => !currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !ids.includes(id));

    // 제거된 shapes 처리: 원래 layer로 이동
    if (removedIds.length > 0) {
      removedIds.forEach((id) => {
        const shape = this.editor.getShapeNode(id);
        if (!shape) return;
        shape.moveTo(this.editor.canvas.layer);
      });
    }

    // 추가된 shapes 처리: selectionGroup으로 이동
    if (addedIds.length > 0) {
      addedIds.forEach((id) => {
        const shape = this.editor.getShapeNode(id);
        if (!shape) return;
        shape.moveTo(this.selectionGroup);
      });
    }

    // transformer nodes 업데이트
    if (ids.length > 0) {
      this.transformer.nodes([this.selectionGroup]);
    } else {
      this.transformer.nodes([]);
    }
  }

  /**
   * store.transformer 변경 시 호출
   */
  private syncTransformer(attrs: TransformerState) {
    if (!this.transformer || !this.selectionGroup) return;
    this.selectionGroup.setAttrs(attrs);
  }

  private handleTransformStart() {
    if (!this.transformer) return;

    this.editor.startTransaction();
  }

  /**
   * transformer 이벤트 처리: store.transformer만 업데이트 (shapes 미변경)
   */
  private handleTransformEnd() {
    if (!this.transformer || !this.selectionGroup) return;

    const attrs = {
      x: this.selectionGroup.x(),
      y: this.selectionGroup.y(),
      scaleX: this.selectionGroup.getAttr('scaleX'),
      scaleY: this.selectionGroup.getAttr('scaleY'),
      rotation: this.selectionGroup.getAttr('rotation'),
    };

    try {
      this.editor.setState('transformer', attrs);

      this.editor.commitTransaction();
    } catch (error) {
      this.editor.cancelTransaction();
      throw error;
    }
  }

  private _createTransformer() {
    if (this.transformer) return;

    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      shouldOverdrawWholeArea: true,
      ignoreStroke: true,
    });

    this.transformer.on('transformstart dragstart', () => {
      this.handleTransformStart();
    });

    this.transformer.on('transformend dragend', () => {
      this.handleTransformEnd();
    });

    this.editor.canvas.topLayer.add(this.transformer);
  }

  private _createSelectionGroup() {
    this.selectionGroup = new Konva.Group({
      draggable: true,
    });

    this.editor.canvas.topLayer.add(this.selectionGroup);
  }
}
