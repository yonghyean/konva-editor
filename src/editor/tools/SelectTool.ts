import Konva from 'konva';
import type { Editor } from '..';
import { BaseTool } from './Tool';

export class SelectTool extends BaseTool {
  name = 'select';
  /**
   * idle = not interacting
   * transforming =
   * dragging = dragging selected shapes
   */
  state: 'idle' | 'selection' | 'transforming' | 'dragging' = 'idle';

  selectionBox: Konva.Rect | null = null;

  lastPointerPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(editor: Editor) {
    super(editor);

    this._createSelectionBox();
  }

  onEnter() {}
  onExit() {}

  onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (this.selectionBox?.visible()) return;

    // if click on empty area - remove all selections
    if (e.target === this.editor.canvas.stage) {
      this.editor.setSelectedShapes([]);
      return;
    }
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    if (!this.selectionBox) return;
    // e.target이 Shape이면 단일 선택

    if (e.target instanceof Konva.Shape) {
      // 현재 선택된 도형이 이미 선택되어 있으면 무시
      if (this.editor.getSelectedShapes().some((shape) => shape.id === e.target.id())) return;

      // 선택 추가
      this.editor.setSelectedShapes([e.target.id()]);
      return;
    }

    // Stage에서만 Group Selection 가능
    if (e.target.nodeType !== 'Stage') return;
    this.state = 'dragging';

    this.lastPointerPosition = this.editor.canvas.stage.getPointerPosition() || { x: 0, y: 0 };

    this.selectionBox.setAttrs({
      x: this.lastPointerPosition.x,
      y: this.lastPointerPosition.y,
      width: 0,
      height: 0,
      visible: true,
    });
  }

  onPointerMove() {
    if (!this.selectionBox) return;
    if (!this.selectionBox.visible()) return;
    // 현재 포인터 위치
    const pos = this.editor.canvas.stage.getPointerPosition();
    if (!pos) return;

    // 이동한 거리 계산
    const width = Math.abs(pos.x - this.lastPointerPosition.x);
    const height = Math.abs(pos.y - this.lastPointerPosition.y);

    // 선택 박스 크기 조정
    this.selectionBox.setAttrs({
      x: Math.min(this.lastPointerPosition.x, pos.x),
      y: Math.min(this.lastPointerPosition.y, pos.y),
      width: width,
      height: height,
    });
  }

  onPointerUp() {
    if (!this.selectionBox) return;
    if (!this.selectionBox.visible()) return;
    this.lastPointerPosition = { x: 0, y: 0 };

    setTimeout(() => {
      if (this.selectionBox) this.selectionBox.visible(false);
    });

    const box = this.selectionBox.getClientRect();
    const shapes = this.editor.getShapes();
    const selectedIds: string[] = [];

    // 선택 박스와 교차하는 도형 찾기
    shapes.forEach((shape) => {
      const shapeNode = this.editor.getShapeNode(shape.id);
      if (!shapeNode) return;
      const intersected = Konva.Util.haveIntersection(box, shapeNode.getClientRect());
      if (intersected) {
        selectedIds.push(shape.id);
      }
    });

    this.editor.setSelectedShapes(selectedIds);
  }

  private _createSelectionBox() {
    if (this.selectionBox) return;

    this.selectionBox = new Konva.Rect({
      fill: 'rgba(0,0,255,0.1)',
      stroke: 'blue',
      strokeWidth: 1,
      listening: false,
      visible: false,
    });

    this.editor.canvas.topLayer.add(this.selectionBox);
  }
}
