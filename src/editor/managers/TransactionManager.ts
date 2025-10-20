
import type { EditorState } from "../state";
import type { Editor } from "..";

export class TransactionManager {
  private root: Editor;

  private isTransaction = false;
  private startSnapshot: EditorState | null = null;

  constructor(root: Editor) {
    this.root = root;
  }

  // 트랜잭션 시작
  startTransaction(): void {
    if (this.isTransaction) {
      throw new Error("Transaction already in progress");
    }
    
    this.isTransaction = true;
    this.startSnapshot = this.root.store.snapshot();
  }

  // 트랜잭션 커밋
  commitTransaction(): void {
    if (!this.isTransaction || !this.startSnapshot) {
      throw new Error("No transaction in progress");
    }
    
    const endSnapshot = this.root.store.snapshot();
    
    // 히스토리 기록
    this.root.hisotryManager.record(this.startSnapshot, endSnapshot);
    
    // 트랜잭션 완료
    this.isTransaction = false;
    this.startSnapshot = null;
  }

  // 트랜잭션 취소
  cancelTransaction(): void {
    if (!this.isTransaction || !this.startSnapshot) {
      throw new Error("No transaction in progress");
    }
    
    // 시작 스냅샷으로 롤백
    this.root.store.setState(this.startSnapshot);
    
    // 트랜잭션 완료
    this.isTransaction = false;
    this.startSnapshot = null;
  }

  // 트랜잭션 상태 확인
  isInTransaction(): boolean {
    return this.isTransaction;
  }
}
