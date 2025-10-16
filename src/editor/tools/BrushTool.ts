import Konva from "konva";
import type { Editor } from "..";
import { BaseTool } from "./Tool";
import { produce } from "immer";

export class BrushTool extends BaseTool {
  name = "brush";
  state: "idle" | "drawing" = "idle";

  line: Konva.Line | null = null;

  constructor(editor: Editor) {
    super(editor);
  }

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
    this.line.id(`${this.line._id}`);
    this.editor.canvas.layer.add(this.line);
  }

  onPointerMove() {
    if (this.state !== "drawing") return;
    const pos = this.editor.canvas.stage.getPointerPosition();
    if (!pos) return;
    this.line?.points().push(pos.x, pos.y);
    this.line?.draw();
  }

  onPointerUp() {
    if (this.state !== "drawing") return;
    if (!this.line) return;
    const id = this.line._id;
    const data = this.line.toJSON();
    this.editor.store.setState(
      produce((state) => {
        state.shapes.entities[`${id}`] = {
          id: `${id}`,
          attrs: data,
        };
      })
    );

    this.line = null;
    // create a line from points
    this.state = "idle";
  }
}
