import Konva from 'konva';
import type { Editor } from '..';
import { BaseShapeTool } from './BaseShapeTool';

export class RectTool extends BaseShapeTool {
  name = 'rect';

  constructor(editor: Editor) {
    super(editor);
  }

  protected createInitialShape(pointer: { x: number; y: number }, styleState: any): string {
    return this.editor.createShape({
      className: 'Rect',
      x: pointer.x,
      y: pointer.y,
      width: 0,
      height: 0,
      fill: styleState.fillColor,
      stroke: styleState.strokeColor,
      strokeWidth: styleState.strokeWidth,
      opacity: styleState.opacity,
      originX: 'left',
      originY: 'top',
    });
  }

  protected updateShapeGeometry(startPoint: { x: number; y: number }, currentPoint: { x: number; y: number }): void {
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
