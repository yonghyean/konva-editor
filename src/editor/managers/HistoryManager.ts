import type { Editor } from "..";
import {
  applyPatches,
  enablePatches,
  produce,
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

      this.editor.store.setState(
        produce((state) => {
          state.canUndo = true;
          state.canRedo = false;
        })
      );
    }
  }

  pushState(state: HistoryState) {
    this.undoStack.push(state);
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  undo() {
    const state = this.editor.store.getState();
    const entry = this.undoStack.pop();
    if (!entry) return;
    const next = applyPatches(state, entry.inversePatches);
    this.isUndo = true;
    this.redoStack.push(entry);

    this.editor.store.setState({
      ...next,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  redo() {
    const state = this.editor.store.getState();
    const entry = this.redoStack.pop();
    if (!entry) return;
    const next = applyPatches(state, entry.patches);
    this.isRedo = true;
    this.undoStack.push(entry);

    this.editor.store.setState({
      ...next,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
