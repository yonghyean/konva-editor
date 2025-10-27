import Konva from 'konva';
import type { Editor } from '..';

export class SelectionManager {
  private editor: Editor;
  private transformer: Konva.Transformer | null = null;
  private selectionGroup: Konva.Group | null = null;

  constructor(editor: Editor) {
    this.editor = editor;

    this._createTransformer();
    this._createSelectionGroup();

    this.editor.store.listen('selection.ids', (ids) => {
      this.syncSelection(ids);
    });
  }

  /**
   * 선택된 shapes를 동기화합니다. Konva.Transformer와 Konva.Group을 업데이트합니다.
   * @param ids 선택된 shapes의 id 배열
   */
  private syncSelection(ids: string[]) {
    if (!this.transformer || !this.selectionGroup) return;

    // null이 아닌 유효한 id만 필터링
    const currentIds = this.selectionGroup
      .getChildren()
      .map((child) => child.id())
      .filter((id): id is string => id !== null && id !== undefined);

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

  private handleTransformStart() {
    if (!this.transformer || !this.selectionGroup) return;
    this.editor.startTransaction();
  }

  /**
   * transformer 이벤트 처리: 각 child shape의 absoluteTransform을 계산하여 store에 즉시 업데이트
   */
  private handleTransformEnd() {
    if (!this.transformer || !this.selectionGroup) return;
    try {
      this.selectionGroup.getChildren().forEach((child) => {
        // child의 absoluteTransform을 직접 계산 (group 내에서의 최종 절대 위치)
        const absoluteTransform = child.getAbsoluteTransform();
        const decomposed = absoluteTransform.decompose();

        // 현재 shape의 className을 가져와서 Shape 타입에 맞게 구성
        const currentShape = this.editor.getShape(child.id()!);
        this.editor.updateShape({
          id: currentShape.id,
          ...decomposed,
        });
      });

      // selectionGroup transform 초기화
      this.selectionGroup.setAttrs({
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      });

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
