import Konva from 'konva';
import type { Editor } from '..';

export class SelectionManager {
  private editor: Editor;
  private transformer: Konva.Transformer | null = null;

  constructor(editor: Editor) {
    this.editor = editor;

    this._createTransformer();

    this.editor.store.listen('selection.ids', (ids) => {
      this.syncSelection(ids);
    });
  }

  /**
   * 선택된 shapes를 동기화합니다. Transformer의 노드를 직접 업데이트합니다.
   * @param ids 선택된 shapes의 id 배열
   */
  private syncSelection(ids: string[]) {
    if (!this.transformer) return;

    // 현재 transformer에 연결된 노드들
    const currentNodes = this.transformer.nodes();
    const currentIds = currentNodes
      .map((node) => node.id())
      .filter((id): id is string => id !== null && id !== undefined);

    // Set을 사용한 효율적인 비교
    const nextSet = new Set(ids);
    const currentSet = new Set(currentIds);

    // 선택이 동일한 경우 early return
    if (nextSet.size === currentSet.size && ids.every((id) => currentSet.has(id))) {
      return;
    }

    // Set 차집합을 사용하여 제거할 노드들 계산
    const removedIds = [...currentSet].filter((id) => !nextSet.has(id));

    // 제거된 노드들의 draggable을 false로 설정
    removedIds.forEach((id) => {
      const node = this.editor.getShapeNode(id);
      if (node) {
        node.draggable(false);
      }
    });

    // 추가된 노드들의 draggable을 true로 설정하고 노드 배열 생성
    const nodes: Konva.Node[] = [];
    nextSet.forEach((id) => {
      const node = this.editor.getShapeNode(id);
      if (node) {
        node.draggable(true);
        nodes.push(node);
      }
    });

    // transformer nodes 업데이트
    this.transformer.nodes(nodes);
  }

  private handleTransformStart() {
    if (!this.transformer) return;
    this.editor.startTransaction();
  }

  /**
   * transformer 이벤트 처리: 각 노드의 attrs를 직접 수집하여 store에 즉시 업데이트
   */
  private handleTransformEnd() {
    if (!this.transformer) return;
    try {
      const nodes = this.transformer.nodes();
      if (nodes.length === 0) {
        this.editor.commitTransaction();
        return;
      }

      // 각 노드의 변경된 attrs를 수집
      const updates = nodes.map((node) => {
        const id = node.id();
        return {
          id: id!,
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        };
      });

      // 한 번에 업데이트
      this.editor.updateShapes(updates);
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
    });

    this.transformer.on('transformstart dragstart', () => {
      this.handleTransformStart();
    });

    this.transformer.on('transformend dragend', () => {
      this.handleTransformEnd();
    });

    this.editor.canvas.topLayer.add(this.transformer);
  }
}
