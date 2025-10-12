import Konva from "konva";
import type { Editor } from "..";
import { BaseTool } from "./Tool";

export class SelectTool extends BaseTool {
  name = "select";
  /**
   * idle = not interacting
   * transforming =
   * dragging = dragging selected shapes
   */
  state: "idle" | "selection" | "transforming" | "dragging" = "idle";

  transformer: Konva.Transformer | null = null;
  selectionBox: Konva.Rect | null = null;
  selectionGroup: Konva.Group | null = null;

  lastPointerPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(editor: Editor) {
    super(editor);

    this._createSelectionBox();
    this._createTransformer();
    this._createSelectionGroup();
  }

  onEnter() {}
  onExit() {}

  onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (this.selectionBox?.visible()) return;

    // if click on empty area - remove all selections
    if (e.target === this.editor.canvas.stage) {
      this.transformer?.nodes([]);
      this.editor.stateManager.set({ selection: [] });
      return;
    }
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    if (!this.selectionBox || !this.selectionGroup) return;
    if (
      e.target.getParent() === this.transformer ||
      e.target.getParent() === this.selectionGroup
    )
      return;

    this.state = "dragging";

    this.lastPointerPosition =
      this.editor.canvas.stage.getPointerPosition() || { x: 0, y: 0 };

    this.selectionBox.setAttrs({
      x: this.lastPointerPosition.x,
      y: this.lastPointerPosition.y,
      width: 0,
      height: 0,
      visible: true,
    });

    // move old selection back to original layer
    this.selectionGroup.children.slice().forEach((shape) => {
      const transform = shape.getAbsoluteTransform();
      shape.moveTo(this.editor.canvas.layer);
      shape.setAttrs(transform.decompose());
    });

    // reset group transforms
    this.selectionGroup.setAttrs({
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    });
    this.selectionGroup.clearCache();
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
    if (!this.selectionBox || !this.transformer || !this.selectionGroup) return;
    if (!this.selectionBox.visible()) return;
    this.lastPointerPosition = { x: 0, y: 0 };

    setTimeout(() => {
      if (this.selectionBox) this.selectionBox.visible(false);
    });

    const shapes = this.editor.canvas.layer.find(".shape") as Konva.Shape[];
    const box = this.selectionBox.getClientRect();

    // 렌더링 퍼모먼스를 위해 모든 자식을 임시 제거
    this.editor.canvas.layer.removeChildren();

    // 선택 박스와 교차하는 도형은 선택 그룹으로, 아닌 도형은 렌더 레이어에 추가
    shapes.forEach((shape) => {
      const intersected = Konva.Util.haveIntersection(
        box,
        shape.getClientRect()
      );
      if (intersected) {
        this.selectionGroup?.add(shape);
        shape.shadowBlur(2);
      } else {
        this.editor.canvas.layer.add(shape);
        shape.shadowBlur(0);
      }
    });

    if (this.selectionGroup.children.length) {
      this.transformer.nodes([this.selectionGroup]);
      this.selectionGroup.cache();
      this.editor.stateManager.set({
        selection: this.selectionGroup.getChildren().map((v) => v.id()),
      });
    } else {
      this.transformer.nodes([]);
      this.selectionGroup.clearCache();
      this.editor.stateManager.set({
        selection: [],
      });
    }
  }

  private _createTransformer() {
    if (this.transformer) return;

    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
    });

    this.editor.canvas.topLayer.add(this.transformer);
  }

  private _createSelectionBox() {
    if (this.selectionBox) return;

    this.selectionBox = new Konva.Rect({
      fill: "rgba(0,0,255,0.1)",
      stroke: "blue",
      strokeWidth: 1,
      listening: false,
      visible: false,
    });

    this.editor.canvas.topLayer.add(this.selectionBox);
  }

  private _createSelectionGroup() {
    this.selectionGroup = new Konva.Group({
      draggable: true,
    });
    this.editor.canvas.topLayer.add(this.selectionGroup);
  }
}
