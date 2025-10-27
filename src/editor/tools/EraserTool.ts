import Konva from 'konva';
import type { Editor } from '..';
import { BaseTool } from './Tool';

const PREVIEW_OPACITY = 0.3;

export class EraserTool extends BaseTool {
  name = 'eraser';
  state: 'idle' | 'erasing' = 'idle';
  targetIds: Set<string>;
  group: Konva.Group; // 삭제될 도형

  constructor(editor: Editor) {
    super(editor);

    this.targetIds = new Set();

    this.group = new Konva.Group({
      opacity: PREVIEW_OPACITY,
    });

    this.editor.canvas.topLayer.add(this.group);
  }

  onPointerDown() {
    this.editor.startTransaction();
    this.state = 'erasing';
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>) {
    if (this.state !== 'erasing') return;
    if (!(e.target instanceof Konva.Shape)) return;
    if (this.targetIds.has(e.target.id())) return;

    this.targetIds.add(e.target.id());
    const shape: Konva.Shape = e.target;
    this.group.add(shape);
  }

  onPointerUp() {
    this.state = 'idle';

    this.editor.removeShapes(this.group.getChildren().map((child) => child.id()));
    this.editor.commitTransaction();
    this.group.removeChildren();
  }
}
