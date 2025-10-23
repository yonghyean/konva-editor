import type { Editor } from "..";
import { BaseShapeTool } from "./BaseShapeTool";
import type { StyleState } from "../state";

export class DiamondTool extends BaseShapeTool {
  name = "diamond";

  constructor(editor: Editor) {
    super(editor);
  }

  protected createInitialShape(
    pointer: { x: number; y: number },
    styleState: StyleState
  ): string {
    return this.editor.createShape({
      className: "Diamond",
      x: pointer.x,
      y: pointer.y,
      width: 0,
      height: 0,
      fill: styleState.fillColor,
      stroke: styleState.strokeColor,
      strokeWidth: styleState.strokeWidth,
      opacity: styleState.opacity,
      originX: "center",
      originY: "center",
    });
  }

  protected updateShapeGeometry(
    startPoint: { x: number; y: number },
    currentPoint: { x: number; y: number }
  ): void {
    if (!this.shapeId) return;

    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    this.editor.updateShape({
      id: this.shapeId,
      x,
      y,
      width,
      height,
    });
  }
}
