import type Konva from "konva";
import type { Editor } from "..";

export interface Tool {
  name: string;
  editor: Editor;

  onEnter(): void;
  onExit(): void;

  onClick?(e: Konva.KonvaEventObject<MouseEvent>): void;
  onPointerDown?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerMove?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerUp?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerCancel?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerOver?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerEnter?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerOut?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerLeave?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerClick?(e: Konva.KonvaEventObject<PointerEvent>): void;
  onPointerDblClick?(e: Konva.KonvaEventObject<PointerEvent>): void;
}

export abstract class BaseTool implements Tool {
  editor: Editor;
  abstract name: string;

  constructor(editor: Editor) {
    this.editor = editor!;
  }
}
