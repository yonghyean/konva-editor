import type Konva from "konva";
import type { Editor } from "..";
import { BrushTool } from "../tools/BrushTool";
import type { Tool } from "../tools/Tool";
import { EraserTool } from "../tools/EraserTool";

export class ToolManager {
  private editor: Editor;

  tools: Map<string, Tool> = new Map();

  constructor(editor: Editor) {
    this.editor = editor;

    this.registerTools([
      new BrushTool(this.editor),
      new EraserTool(this.editor),
    ]);
  }

  setTool(tool: string) {
    if (!this.tools.has(tool)) {
      throw new Error("Tool not found");
    }
    const currentTool = this.tools.get(tool)!;
    this.editor.stateManager.currentTool = currentTool.name;
  }

  hasTool(tool: string) {
    return this.tools.has(tool);
  }

  registerTools(tools: Tool[]) {
    for (const tool of tools) {
      console.log("Register tool:", tool.name);
      this.tools.set(tool.name, tool);
    }
  }

  handlePointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.stateManager.currentTool;
    this.editor.toolManager.tools.get(currentTool)?.onPointerDown(e);
  }

  handlePointerMove(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.stateManager.currentTool;
    this.editor.toolManager.tools.get(currentTool)?.onPointerMove(e);
  }

  handlePointerUp(e: Konva.KonvaEventObject<PointerEvent>) {
    const currentTool = this.editor.stateManager.currentTool;
    this.editor.toolManager.tools.get(currentTool)?.onPointerUp(e);
  }
}
