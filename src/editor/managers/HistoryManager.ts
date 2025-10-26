import type { Editor } from '..';
import type { Record as StateRecord } from '../types/record';

export class HistoryManager {
  editor: Editor;
  private undoStack: StateRecord[][] = [];
  private redoStack: StateRecord[][] = [];

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Record 배열을 히스토리에 기록
   * @param records Record 배열
   */
  record(records: StateRecord[]): void {
    if (records.length === 0) return;

    this.undoStack.push(records);
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * undo 실행 - 역방향 Record 배열 반환
   * @returns 역방향 Record 배열 또는 null
   */
  undo(): StateRecord[] | null {
    const records = this.undoStack.pop();
    if (!records) return null;

    // Record를 역순으로 하고 각각을 역방향으로 변환
    const reversedRecords = records
      .slice()
      .reverse()
      .map((record) => this.reverseRecord(record));

    this.redoStack.push(records);
    return reversedRecords;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * redo 실행 - 정방향 Record 배열 반환
   * @returns 정방향 Record 배열 또는 null
   */
  redo(): StateRecord[] | null {
    const records = this.redoStack.pop();
    if (!records) return null;

    this.undoStack.push(records);
    return records;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Record를 역방향으로 변환
   * @param record 원본 Record
   * @returns 역방향 Record
   */
  private reverseRecord(record: StateRecord): StateRecord {
    switch (record.type) {
      case 'added':
        return { type: 'removed', path: record.path, value: record.value };
      case 'updated':
        return { type: 'updated', path: record.path, from: record.to, to: record.from };
      case 'removed':
        return { type: 'added', path: record.path, value: record.value };
      default:
        throw new Error(`Unknown record type: ${(record as StateRecord).type}`);
    }
  }
}
