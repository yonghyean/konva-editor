import Konva from "konva";
import type { Editor } from "..";
import { BaseTool } from "./Tool";

export class BrushTool extends BaseTool {
  name = "brush";
  state: "idle" | "drawing" = "idle";

  line: Konva.Line | null = null;

  constructor(editor: Editor) {
    super(editor);
  }

  onEnter() {
    this.editor.canvas.stage.container().style.cursor = "crosshair";
    // sync state
    // this.line.setAttrs({
    //   stroke: this.editor.stateManager.strokeColor,
    //   strokeWidth: this.editor.stateManager.strokeWidth,
    // });
  }

  onExit() {}

  onPointerDown() {
    this.state = "drawing";
    this.line = new Konva.Line({
      name: "shape",
      points: [],
      fill: "",
      stroke: "#000000",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
      lineCap: "round",
      lineJoin: "round",
      hitStrokeWidth: 10,
      // hitStrokeWidth: ,
      // globalCompositeOperation: "source-over",
    });

    this.editor.canvas.layer.add(this.line);
    this.editor.canvas.layer.draw();
  }

  onPointerMove() {
    if (this.state !== "drawing") return;
    const pos = this.editor.canvas.stage.getPointerPosition();
    if (!pos) return;
    this.line?.points().push(pos.x, pos.y);
    this.line?.draw();
  }

  onPointerUp() {
    this.line?.draw();
    this.line = null;
    // create a line from points
    this.state = "idle";
  }
}
