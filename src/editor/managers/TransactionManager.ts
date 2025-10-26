import type { Editor } from '..';
import type { Record as StateRecord } from '../types/record';

export class TransactionManager {
  private root: Editor;
  private isTransaction = false;
  private recordBuffer: StateRecord[] = [];

  constructor(root: Editor) {
    this.root = root;
  }

  /**
   * 트랜잭션 시작
   */
  start(): void {
    if (this.isTransaction) {
      throw new Error('Transaction already in progress');
    }

    this.isTransaction = true;
    this.recordBuffer = [];
  }

  /**
   * Record 배열을 버퍼에 추가
   * @param records Record 배열
   */
  add(records: StateRecord[]): void {
    if (!this.isTransaction) {
      throw new Error('No transaction in progress');
    }
    this.recordBuffer.push(...records);
  }

  /**
   * 트랜잭션 커밋 - 병합된 Record 배열 반환
   * @returns 병합된 Record 배열 또는 null
   */
  commit(): StateRecord[] | null {
    if (!this.isTransaction) {
      throw new Error('No transaction in progress');
    }

    if (this.recordBuffer.length === 0) {
      this.isTransaction = false;
      return null;
    }

    // Record 병합 (같은 path의 연속된 update 병합)
    const mergedRecords = this.mergeRecords(this.recordBuffer);

    // 트랜잭션 완료
    this.isTransaction = false;
    this.recordBuffer = [];

    return mergedRecords;
  }

  /**
   * 트랜잭션 롤백
   */
  rollback(): void {
    if (!this.isTransaction) {
      throw new Error('No transaction in progress');
    }

    // 버퍼의 Record를 역순으로 Store에 적용하여 취소
    const reversedRecords = this.recordBuffer
      .slice()
      .reverse()
      .map((record) => this.reverseRecord(record));

    this.root.store.put(reversedRecords);

    // 트랜잭션 완료
    this.isTransaction = false;
    this.recordBuffer = [];
  }

  /**
   * 트랜잭션 상태 확인
   * @returns 트랜잭션 활성 여부
   */
  isActive(): boolean {
    return this.isTransaction;
  }

  /**
   * Record 병합 - 같은 path의 연속된 update를 하나로 병합
   * @param records 원본 Record 배열
   * @returns 병합된 Record 배열
   */
  private mergeRecords(records: StateRecord[]): StateRecord[] {
    const merged = new Map<string, StateRecord>();

    for (const record of records) {
      const key = record.path;
      const existing = merged.get(key);

      if (!existing) {
        merged.set(key, record);
        continue;
      }

      // 같은 path의 연속된 update 병합
      if (existing.type === 'updated' && record.type === 'updated') {
        merged.set(key, {
          type: 'updated',
          path: record.path,
          from: existing.from,
          to: record.to,
        });
      } else if (existing.type === 'added' && record.type === 'updated') {
        // added + updated = added (최종 값으로)
        merged.set(key, {
          type: 'added',
          path: record.path,
          value: record.to,
        });
      } else if (existing.type === 'updated' && record.type === 'removed') {
        // updated + removed = removed
        merged.set(key, record);
      } else if (existing.type === 'added' && record.type === 'removed') {
        // added + removed = 제거 (아무것도 추가하지 않음)
        merged.delete(key);
      } else {
        // 다른 조합은 그대로 유지
        merged.set(key, record);
      }
    }

    return Array.from(merged.values());
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
