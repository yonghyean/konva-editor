import { diff } from "just-diff";
import type { EditorState } from "./StateManager";
import type { Editor } from "..";
import type { Patch } from "immer";

// type DotKeys<T, P extends string = ""> = {
//   [K in keyof T & string]: T[K] extends Record<string, any>
//     ? DotKeys<T[K], `${P}${K}.`>
//     : `${P}${K}`;
// }[keyof T & string];

// type Diff = ReturnType<typeof diff<DotKeys<EditorState>>>;
type Diff = Patch[];

export class HistoryManager {
  editor: Editor;
  private undoStack: Diff[] = [];
  private redoStack: Diff[] = [];

  constructor(editor: Editor) {
    this.editor = editor;
  }

  record(nextState: EditorState, prevState: EditorState) {
    const delta = diff(nextState, prevState);
    if (delta.length) {
      this.pushState(delta);
    }
  }

  pushState(state: Diff) {
    this.undoStack.push(state);
    this.redoStack = [];
  }

  undo(): Diff | null {
    if (this.undoStack.length === 0) return null;
    const state = this.undoStack.pop()!;
    this.redoStack.push(state);
    return state;
  }

  redo(): Diff | null {
    if (this.redoStack.length === 0) return null;
    const state = this.redoStack.pop()!;
    this.undoStack.push(state);
    return state;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
