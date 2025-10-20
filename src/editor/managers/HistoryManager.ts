import type { Editor } from "..";
import { diff } from "just-diff";
import { diffApply } from "just-diff-apply";
import type { EditorState } from "../state";
import { get, set } from "lodash-es";

type Operation = "add" | "replace" | "remove";

interface Patch { op: Operation; path: Array<string | number>; value: any }
interface HistoryState {
  patches: Patch[];
  inversePatches: Patch[];
}

export class HistoryManager {
  editor: Editor;
  private undoStack: HistoryState[] = [];
  private redoStack: HistoryState[] = [];

  constructor(editor: Editor) {
    this.editor = editor;
  }

  record(prevState: EditorState, nextState: EditorState) {
    const diff= this.diff(prevState, nextState);
    console.log("diff", diff);
    this.undoStack.push(diff);
    this.redoStack = [];
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

    console.log("entry", entry);
    console.log("state", state);
    const next = this.applyPatches(state, entry.inversePatches);
    console.log("next", next);
    this.redoStack.push(entry);
    this.editor.store.setState(next);
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  redo() {
    // const state = this.editor.store.getState();
    // const entry = this.redoStack.pop();
    // if (!entry) return;
    // const next = applyPatches(state, entry.patches);
    // this.undoStack.push(entry);

    // this.editor.store.setState({
    //   ...next,
    //   canUndo: this.canUndo(),
    //   canRedo: this.canRedo(),
    // });
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  private diff(prev: EditorState, next: EditorState) {
    const delta = diff(prev, next);
    // inversePatches는 prev에서 next로 변경된 부분을 저장
    return delta.reduce((acc, patch) => {
      acc.patches.push(patch);
      acc.inversePatches.push({
        op: patch.op === "add" ? "remove" : patch.op === "remove" ? "add" : patch.op,
        path: patch.path,
        value: get(prev, patch.path),
      });
      return acc;
    }, { patches: [] as Patch[], inversePatches: [] as Patch[] });
  }

  private applyPatches(state: EditorState, patches: Patch[]) {
    return diffApply(state, patches);
  }
}
