import Konva from "konva";
import { Canvas, type CanvasOptions } from "./canvas";
import { HistoryManager } from "./managers/HistoryManager";
import { SelectionManager } from "./managers/SelectionManager";
import { ShapeManager } from "./managers/ShapeManager";
import { ToolManager } from "./managers/ToolManager";
import { TransactionManager } from "./managers/TransactionManager";
import { Store, type PathValue, type PropertyPath } from "./store/Store";
import type { EditorState, Shape } from "./state";
import { Diamond } from "./shapes/Diamond";

interface EditorOptions {
  canvas: CanvasOptions;
}

export class Editor {
  canvas: Canvas;
  store: Store;
  // managers
  selectionManager: SelectionManager;
  shapeManager: ShapeManager;
  toolManager: ToolManager;
  hisotryManager: HistoryManager;
  transactionManager: TransactionManager;

  constructor(options: EditorOptions) {
    this.canvas = new Canvas(options.canvas);

    // 외부 store 저장
    this.store = new Store();

    this.selectionManager = new SelectionManager(this);
    this.shapeManager = new ShapeManager(this);
    this.toolManager = new ToolManager(this);
    this.hisotryManager = new HistoryManager(this);
    this.transactionManager = new TransactionManager(this);

    this.bindEvents();
  }

  private bindEvents() {
    this.canvas.stage.on(
      "click",
      this.toolManager.handleCick.bind(this.toolManager)
    );
    this.canvas.stage.on(
      "pointerdown",
      this.toolManager.handlePointerDown.bind(this.toolManager)
    );
    this.canvas.stage.on(
      "pointermove",
      this.toolManager.handlePointerMove.bind(this.toolManager)
    );
    this.canvas.stage.on(
      "pointerup",
      this.toolManager.handlePointerUp.bind(this.toolManager)
    );
    this.canvas.stage.on(
      "pointerover",
      this.toolManager.handlePointerOver.bind(this.toolManager)
    );
    this.canvas.stage.on(
      "pointerout",
      this.toolManager.handlePointerOut.bind(this.toolManager)
    );
  }

  // store 업데이트
  setState<T extends PropertyPath<EditorState>>(path: T, value?: PathValue<EditorState, T>): void {
    this.store.set(path, value);
    this.store.emit(path);
  }

  getState(): EditorState
  getState<T extends PropertyPath<EditorState>>(path: T): PathValue<EditorState, T>
  getState<T extends PropertyPath<EditorState>>(path?: T): PathValue<EditorState, T> | EditorState {
    if (!path) return this.store.get();
    return this.store.get(path);
  }

  getSelectedShapes() {
    const ids = this.getState('selection.ids');
    return ids.map((id) => this.getShape(id))
  }

  setSelectedShapes(ids: string[]) {
    // 히스토리가 최신이면 히스토리 초기화
    const canRedo = this.hisotryManager.canRedo();
    console.log("ignoreHistory", canRedo && ids.length === 0);
      this.run(() => {
        this.selectionManager.setSelectedShapes(ids);
      }, { keepRedoStack: canRedo && ids.length === 0 });
   
  }

  setStyleForSelectedShapes(value: string) {
    // 선택된 도형 찾기
    const shapes = this.getSelectedShapes();
    this.run(() => {
      this.setState('style.strokeColor', value);
      this.updateShapes(shapes.map((shape) => ({ ...shape, stroke: value })));
    });
  }

  setStyleForNextShapes(value: string) {
    this.setState('style.strokeColor', value);
    this.setState('style.fillColor', value);
  }

  // 트랜잭션 실행
  run<T>(fn: () => T, options: { keepRedoStack: boolean } = { keepRedoStack: false }): T {
    const { keepRedoStack } = options;
    // 중첩 run은 그냥 실행 (최상위 run에서만 히스토리 기록)
    // 히스토리 기록 여부가 false인 경우 히스토리 기록 안함
    if (this.isInTransaction()) {
      return fn();
    }

    this.startTransaction();

    try {
      const result = fn();
      if (!keepRedoStack) {
        this.commitTransaction();
      }
      return result;
    } catch (error) {
      this.cancelTransaction();
      throw error;
    }
  }
  
  // Shape API (내부적으로 매니저에 위임)
  createShape(shape: Omit<Shape, 'id'>): string {
    return this.run(() => this.shapeManager.createShape(shape));
  }

  createShapes(shapes: Omit<Shape, 'id'>[]): string[] {
    return this.run(() => this.shapeManager.createShapes(shapes));
  }

  updateShape(shape: Partial<Shape> & { id: string }): void {
    return this.run(() => this.shapeManager.updateShape(shape));
  }

  updateShapes(shapes: Shape[]): void {
    return this.run(() => this.shapeManager.updateShapes(shapes));
  }
  
  removeShape(id: string): void {
    return this.run(() => this.shapeManager.removeShape(id)) 
  }

  removeShapes(ids: string[]): void {
    return this.run(() => this.shapeManager.removeShapes(ids));
  }

  getShape(id: string): Shape {
    return this.getState(`shapes.${id}`);
  }

  getShapeNode<T extends Konva.Shape>(id: string): T | null {
    return this.shapeManager.getShapeNode<T>(id);
  }
  
  // Tool API
  setCurrentTool(tool: string): void {
    this.toolManager.changeTool(tool);
    this.setState('tool.current', tool);
  }
  
  getCurrentTool(): string {
    return this.store.get('tool.current')
  }
  
  // History API
  undo(): void {
    this.hisotryManager.undo();
  }
  
  redo(): void {
    this.hisotryManager.redo();
  }

  // Transaction API
  isInTransaction(): boolean {
    return this.transactionManager.isInTransaction();
  }

  startTransaction(): void {
    this.transactionManager.startTransaction();
  }

  commitTransaction(): void {
    this.transactionManager.commitTransaction();
  }

  cancelTransaction(): void {
    this.transactionManager.cancelTransaction();
  }
}


Konva.Util._assign(Konva, {
  Diamond: Diamond
});