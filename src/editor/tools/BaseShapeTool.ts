import type { Editor } from '..';
import { BaseTool } from './Tool';

export abstract class BaseShapeTool extends BaseTool {
  state: 'idle' | 'drawing' = 'idle';
  shapeId: string | null = null;
  startPoint: { x: number; y: number } | null = null;

  constructor(editor: Editor) {
    super(editor);
  }

  onPointerDown() {
    this.state = 'drawing';
    const styleState = this.editor.getState('style');
    const pointer = this.editor.canvas.stage.getPointerPosition();

    if (!pointer) return;

    this.startPoint = { x: pointer.x, y: pointer.y };

    // 트랜잭션 시작
    this.editor.startTransaction();

    // 초기 도형 생성 (트랜잭션 내에서)
    this.shapeId = this.createInitialShape(pointer, styleState);
  }

  onPointerMove() {
    if (this.state !== 'drawing') return;
    if (!this.shapeId || !this.startPoint) return;

    const pointer = this.editor.canvas.stage.getPointerPosition();
    if (!pointer) return;

    // drawing 중: store 업데이트 없이 노드만 직접 업데이트
    this.updateShapeGeometry(this.startPoint, pointer);
  }

  onPointerUp() {
    if (this.state !== 'drawing') return;
    if (!this.shapeId) return;

    // 트랜잭션 커밋
    this.editor.commitTransaction();

    this.shapeId = null;
    this.startPoint = null;
    this.state = 'idle';
  }

  /**
   * 초기 도형을 생성합니다.
   * @param pointer 시작 포인터 위치
   * @param styleState 현재 스타일 상태
   * @returns 생성된 도형의 ID
   */
  protected abstract createInitialShape(pointer: { x: number; y: number }, styleState: any): string;

  /**
   * 포인터 이동에 따라 도형의 기하학적 속성을 업데이트합니다.
   * @param startPoint 시작 포인터 위치
   * @param currentPoint 현재 포인터 위치
   */
  protected abstract updateShapeGeometry(
    startPoint: { x: number; y: number },
    currentPoint: { x: number; y: number },
  ): void;
}
