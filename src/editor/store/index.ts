import type { EditorState } from "../state";

export interface EditorStore {
  getState: () => EditorState;
  setState: (
    next: Partial<EditorState> | ((prev: EditorState) => EditorState)
  ) => void;
  subscribe: (
    listener: (state: EditorState, prev: EditorState) => void
  ) => () => void;
}
