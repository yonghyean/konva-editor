import Konva from 'konva';
import type { Editor } from '..';
import { BaseTool } from './Tool';

export class BrushTool extends BaseTool {
  name = 'brush';
  state: 'idle' | 'drawing' = 'idle';

  lineId: string | null = null;

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
    this.lineId = this.editor.createShape({
      className: 'Line',
      points: initialPoints,
      fill: '',
      stroke: styleState.strokeColor,
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
    if (!this.lineId) return;

    // drawing 중: store 업데이트 없이 노드만 직접 업데이트
    const line = this.editor.getShapeNode<Konva.Line>(this.lineId);
    const pos = this.editor.canvas.stage.getPointerPosition();
    if (!line || !pos) return;

    this.editor.updateShape({
      id: this.lineId,
      points: [...line.points(), pos.x, pos.y],
    });
  }

  onPointerUp() {
    if (this.state !== 'drawing') return;
    if (!this.lineId) return;

    // 트랜잭션 커밋
    this.editor.commitTransaction();

    this.lineId = null;
    this.state = 'idle';
  }
}
