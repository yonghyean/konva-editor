import type { Editor } from "..";
import {
  applyPatches,
  enablePatches,
  produceWithPatches,
  type Patch,
} from "immer";
import type { EditorState } from "../state";

interface HistoryState {
  patches: Patch[];
  inversePatches: Patch[];
}

enablePatches();

export class HistoryManager {
  editor: Editor;
  private undoStack: HistoryState[] = [];
  private redoStack: HistoryState[] = [];

  private isUndo: boolean = false;
  private isRedo: boolean = false;

  constructor(editor: Editor) {
    this.editor = editor;

    this.editor.store.subscribe((next, prev) => {
      if (next.shapes === prev.shapes) return;
      if (this.isUndo || this.isRedo) {
        this.isUndo = false;
        this.isRedo = false;
        return;
      }

      this.record(next, prev);
    });
  }

  record(nextState: EditorState, prevState: EditorState) {
    const [, patches, inversePatches] = produceWithPatches(
      prevState,
      (draft) => {
        Object.assign(draft, nextState);
      }
    );

    if (patches.length) {
      this.undoStack.push({ patches, inversePatches });
      this.redoStack = []; // 새로운 변경 시 redo 무효화
    }
  }

  pushState(state: HistoryState) {
    this.undoStack.push(state);
    this.redoStack = [];
  }

  undo() {
    const state = this.editor.store.getState();
    const entry = this.undoStack.pop();
    if (!entry) return;
    const next = applyPatches(state, entry.inversePatches);
    this.isUndo = true;
    this.editor.store.setState(next);
    this.redoStack.push(entry);
  }

  redo() {
    const state = this.editor.store.getState();
    const entry = this.redoStack.pop();
    if (!entry) return;
    const next = applyPatches(state, entry.patches);
    this.isRedo = true;
    this.editor.store.setState(next);
    this.undoStack.push(entry);
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
