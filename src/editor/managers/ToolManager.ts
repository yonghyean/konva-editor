import type Konva from "konva";
import type { Editor } from "..";
import { BrushTool } from "../tools/BrushTool";
import type { Tool } from "../tools/Tool";
import { EraserTool } from "../tools/EraserTool";
import { SelectTool } from "../tools/SelectTool";

export class ToolManager {
  private editor: Editor;

  tools: Map<string, Tool> = new Map();

  constructor(editor: Editor) {
    this.editor = editor;

    this.registerTools([
      new SelectTool(this.editor),
      new BrushTool(this.editor),
      new EraserTool(this.editor),
    ]);
  }

  changeTool(tool: string) {
    if (!this.tools.has(tool)) {
      throw new Error("Tool not found");
    }
    // 이전 툴의 onExit 호출
    const prevTool = this.tools.get(this.editor.store.getState().tool.current);
    if (prevTool) {
      prevTool.onExit();
    }
    // 새로운 툴의 onEnter 호출
    const nextTool = this.tools.get(tool)!;
    nextTool.onEnter();
  }

  hasTool(tool: string) {
    return this.tools.has(tool);
  }

  registerTools(tools: Tool[]) {
    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  handleCick(e: Konva.KonvaEventObject<MouseEvent>) {
    const currentTool = this.editor.toolManager.tools.get(
      this.editor.store.getState().tool.current
    );
    if (!currentTool?.onClick) return;
    currentTool.onClick(e);
  }

  handlePointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.toolManager.tools.get(
      this.editor.store.getState().tool.current
    );
    if (!currentTool?.onPointerDown) return;
    currentTool.onPointerDown(e);
  }

  handlePointerMove(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.toolManager.tools.get(
      this.editor.store.getState().tool.current
    );
    if (!currentTool?.onPointerMove) return;
    currentTool.onPointerMove(e);
  }

  handlePointerUp(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.toolManager.tools.get(
      this.editor.store.getState().tool.current
    );
    if (!currentTool?.onPointerUp) return;
    currentTool.onPointerUp(e);
  }

  handlePointerOver(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.toolManager.tools.get(
      this.editor.store.getState().tool.current
    );
    if (!currentTool?.onPointerOver) return;
    currentTool.onPointerOver(e);
  }

  handlePointerOut(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.toolManager.tools.get(
      this.editor.store.getState().tool.current
    );
    if (!currentTool?.onPointerOut) return;
    currentTool.onPointerOut(e);
  }
}
