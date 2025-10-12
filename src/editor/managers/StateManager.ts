import type { Editor } from "..";

export interface EditorState {
  selection: string[]; // selected object ids
  currentTool: string;
  mode: Mode;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  cursor: "default" | "grabbing" | "crosshair";
}

export interface EditorStore {
  getState: () => EditorState;
  setState: (state: Partial<EditorState>) => void;
  subscribe: (
    listener: (state: EditorState, prevState: EditorState) => void
  ) => () => void;
}

export type Mode = "idle" | "drawing" | "panning";

export class StateManager {
  private editor: Editor;
  private store: EditorStore;

  constructor(editor: Editor, store: EditorStore) {
    this.editor = editor;
    this.store = store;

    this.store.subscribe((state, prev) => {
      // currentTool 변경 감지
      if (state.currentTool !== prev.currentTool) {
        this.editor.toolManager.changeTool(state.currentTool);
      }
      if (state && prev) {
        this.editor.hisotryManager.record(state, prev);
      }
    });
  }

  get<K extends keyof EditorState>(key: K): EditorState[K] {
    return this.store.getState()[key];
  }

  set(patch: Partial<EditorState>) {
    this.store.setState(patch);
  }
}
