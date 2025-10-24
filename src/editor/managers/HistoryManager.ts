import type { Editor } from '..';
import { diff } from 'just-diff';
import type { EditorState } from '../state';
import { get } from 'lodash-es';

type Operation = 'add' | 'replace' | 'remove';

interface Patch {
  op: Operation;
  path: Array<string | number>;
  value: any;
}
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

  record(
    prevState: EditorState,
    nextState: EditorState,
    options: { keepRedoStack: boolean } = { keepRedoStack: false },
  ) {
    const diff = this.diff(prevState, nextState);
    if (diff.patches.length === 0) return;
    this.undoStack.push(diff);
    if (!options.keepRedoStack) {
      this.redoStack = [];
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
    const entry = this.undoStack.pop();
    if (!entry) return;

    this.applyPatches(entry.inversePatches);
    this.redoStack.push(entry);
    console.log('undo stack', this.undoStack);
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  redo() {
    const entry = this.redoStack.pop();
    if (!entry) return;

    this.applyPatches(entry.patches);
    this.undoStack.push(entry);
    console.log('redo stack', this.redoStack);
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  private diff(prev: EditorState, next: EditorState) {
    const delta = diff(prev, next);
    // inversePatches는 prev에서 next로 변경된 부분을 저장
    return delta.reduce(
      (acc, patch) => {
        acc.patches.push(patch);
        acc.inversePatches.push({
          op: patch.op === 'add' ? 'remove' : patch.op === 'remove' ? 'add' : patch.op,
          path: patch.path,
          value: get(prev, patch.path),
        });
        return acc;
      },
      { patches: [] as Patch[], inversePatches: [] as Patch[] },
    );
  }

  private applyPatches(patches: Patch[]): void {
    for (const patch of patches) {
      this.editor.setState(patch.path.join('.') as never, patch.value);
    }
  }
}
