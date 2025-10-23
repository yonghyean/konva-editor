import type { Editor } from "..";
import type { StyleState } from "../state";
import { BaseShapeTool } from "./BaseShapeTool";

export class CircleTool extends BaseShapeTool {
  name = "circle";

  constructor(editor: Editor) {
    super(editor);
  }

  protected createInitialShape(
    pointer: { x: number; y: number },
    styleState: StyleState
  ): string {
    return this.editor.createShape({
      className: "Circle",
      x: pointer.x,
      y: pointer.y,
      radius: 0,
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

    const radius = Math.min(width, height) / 2;

    this.editor.updateShape({
      id: this.shapeId,
      x: x + radius,
      y: y + radius,
      radius,
    });
  }
}
