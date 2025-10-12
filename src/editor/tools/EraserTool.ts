import Konva from "konva";
import type { Editor } from "..";
import { BaseTool } from "./Tool";

export class EraserTool extends BaseTool {
  name = "eraser";
  state: "idle" | "erasing" = "idle";
  line: Konva.Line | null = null;

  constructor(editor: Editor) {
    super(editor);
  }

  onEnter() {
    this.editor.canvas.stage.container().style.cursor = "crosshair";
  }

  onExit() {}

  onPointerDown() {
    this.state = "erasing";
    this.line = new Konva.Line({
      name: "shape",
      points: [],
      stroke: "#ffffff", // 보통 흰색 또는 배경색으로 설정
      strokeWidth: 20, // 지우개 크기 조절
      globalCompositeOperation: "destination-out", // 실제 지우개 효과
      lineCap: "round",
      lineJoin: "round",
    });

    this.editor.canvas.layer.add(this.line);
    this.editor.canvas.layer.draw();
  }

  onPointerMove() {
    if (this.state !== "erasing") return;
    const pos = this.editor.canvas.stage.getPointerPosition();
    if (!pos) return;
    const points = this.line?.points() || [];
    points.push(pos.x, pos.y);
    this.line?.points(points);
    this.editor.canvas.layer.batchDraw();
  }

  onPointerUp() {
    this.line = null;
    this.state = "idle";
  }
}
