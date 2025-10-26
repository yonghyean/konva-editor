import type { Editor } from '..';
import { BaseTool } from './Tool';
import type { Shape } from '../state';

export class BrushTool extends BaseTool {
  name = 'brush';
  state: 'idle' | 'drawing' = 'idle';

  line: Shape | null = null;

  constructor(editor: Editor) {
    super(editor);
  }

  onPointerDown() {
    this.state = 'drawing';
    const styleState = this.editor.getState('style');
    const pointer = this.editor.canvas.stage.getPointerPosition();
    const initialPoints = pointer ? [pointer.x, pointer.y] : [];

    // 트랜잭션 시작
    this.editor.startTransaction();

    // shape 생성 (트랜잭션 내에서)
    this.line = this.editor.createShape({
      className: 'Line',
      points: initialPoints,
      fill: '',
      stroke: styleState.stroke,
      strokeWidth: styleState.strokeWidth,
      opacity: styleState.opacity,
      originX: 'center',
      originY: 'center',
      lineCap: 'round',
      lineJoin: 'round',
      hitStrokeWidth: 10,
    });
  }

  onPointerMove() {
    if (this.state !== 'drawing') return;
    if (!this.line) return;

    const pos = this.editor.canvas.stage.getPointerPosition();
    if (!pos || !this.line) return;

    this.line = this.editor.updateShape({
      ...this.line,
      points: this.line.points.concat([pos.x, pos.y]),
    });
  }

  onPointerUp() {
    if (this.state !== 'drawing') return;
    if (!this.line) return;

    // 트랜잭션 커밋
    this.editor.commitTransaction();

    this.line = null;
    this.state = 'idle';
  }
}
