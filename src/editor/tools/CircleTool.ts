import type { Editor } from '..';
import type { Shape, StyleState } from '../state';
import { BaseShapeTool } from './BaseShapeTool';

export class CircleTool extends BaseShapeTool {
  name = 'circle';

  constructor(editor: Editor) {
    super(editor);
  }

  protected createInitialShape(pointer: { x: number; y: number }, styleState: StyleState): Shape {
    return this.editor.createShape({
      className: 'Circle',
      x: pointer.x,
      y: pointer.y,
      radius: 0,
      fill: styleState.fill,
      stroke: styleState.stroke,
      strokeWidth: styleState.strokeWidth,
      opacity: styleState.opacity,
      offsetX: 0,
      offsetY: 0,
    });
  }

  protected updateShapeGeometry(startPoint: { x: number; y: number }, currentPoint: { x: number; y: number }): void {
    if (!this.shape) return;

    const dw = currentPoint.x - startPoint.x;
    const dh = currentPoint.y - startPoint.y;
    const x = startPoint.x + dw / 2;
    const y = startPoint.y + dh / 2;
    const width = Math.abs(dw);
    const height = Math.abs(dh);

    const radius = Math.max(width, height) / 2;

    this.editor.updateShape({
      id: this.shape.id,
      x,
      y,
      radius,
    });
  }
}
