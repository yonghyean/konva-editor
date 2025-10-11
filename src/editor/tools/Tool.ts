import type Konva from "konva";
import type { Editor } from "..";

export abstract class Tool {
  protected editor: Editor;
  name: string;

  constructor(editor: Editor, name: string) {
    this.editor = editor;
    this.name = name;
  }

  /** Tool 활성 */
  onEnter() {}

  /** Tool 비활성 */
  onExit() {}

  abstract onPointerDown(e?: Konva.KonvaEventObject<PointerEvent>): void;
  abstract onPointerMove(e?: Konva.KonvaEventObject<PointerEvent>): void;
  abstract onPointerUp(e?: Konva.KonvaEventObject<PointerEvent>): void;
}
