import type { EditorState } from '../state';

export interface EditorStore {
  getState: () => EditorState;
  setState: (next: Partial<EditorState> | ((prev: EditorState) => EditorState)) => void;
  subscribe: <T>(selector: (state: EditorState) => T, listener: (state: T, prev: T) => void) => void;
}
