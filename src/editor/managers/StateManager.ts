import type { Editor } from "..";

export interface State {
  currentTool: string;
  mode: Mode;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  cursor: "default" | "grabbing" | "crosshair";
}

export type Mode = "idle" | "drawing" | "panning";

export class StateManager {
  private editor: Editor;
  private store: any;
  private listeners: Array<(state: State) => void> = [];

  currentTool: string = "brush";

  mode: Mode = "idle";

  // brush settings
  strokeColor: string = "#000000";
  strokeWidth: number = 2;
  fillColor: string = "transparent";

  cursor: "default" | "grabbing" | "crosshair" = "default";

  constructor(editor: Editor, store: any) {
    this.editor = editor;
    this.store = store;
  }

  setCurrentTool(tool: string) {
    this.currentTool = tool;
    this.store.setState({ currentTool: tool });
  }
}
