import type Konva from "konva";
import { Canvas, type CanvasOptions } from "./canvas";
import { HistoryManager } from "./managers/HistoryManager";
import { ShapeManager } from "./managers/ShapeManager";
import { ToolManager } from "./managers/ToolManager";
import { TransactionManager } from "./managers/TransactionManager";
import { Store, type PathValue, type PropertyPath, type StorePath } from "./store/Store";
import type { EditorState, Shape } from "./state";

interface EditorOptions {
  canvas: CanvasOptions;
}

export class Editor {
  canvas: Canvas;
  store: Store;
  // managers

  shapeManager: ShapeManager;
  toolManager: ToolManager;
  hisotryManager: HistoryManager;
  transactionManager: TransactionManager;

  constructor(options: EditorOptions) {
    this.canvas = new Canvas(options.canvas);

    // 외부 store 저장
    this.store = new Store();

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
  setState(...args: Parameters<typeof this.store.set>) {
    this.store.set(...args);
   
    this.store.emit(...args);
  }

  getState(): EditorState
  getState<T extends PropertyPath<EditorState>>(path: T): PathValue<EditorState, T>
  getState<T extends PropertyPath<EditorState>>(path?: T): PathValue<EditorState, T> | EditorState {
    if (!path) return this.store.get();
    return this.store.get(path);
  }

  setStyleForSelectedShapes(value: string) {
    // 선택된 도형 찾기
    const shapes = this.canvas.topLayer.find(".selected") as Konva.Shape[];
    this.setState('style.strokeColor', value);
    shapes.forEach((shape) => {
      shape.setAttr('stroke', value);
    });
  }

  setStyleForNextShapes(value: string) {
    
      this.setState('style.strokeColor', value);
      this.setState('style.fillColor', value);
      this.setState('style.opacity', value);
    
  }

  // 트랜잭션 실행
  run<T>(fn: () => T): T {
    if (this.isInTransaction()) {
      // 중첩 run은 그냥 실행 (최상위 run에서만 히스토리 기록)
      return fn();
    }
    
    this.startTransaction();
    try {
      const result = fn();
      this.commitTransaction();
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

  updateShapes(shapes: Partial<Shape> & { id: string }[]): void {
    return this.run(() => this.shapeManager.updateShapes(shapes));
  }
  
  removeShape(id: string): void {
    return this.run(() => this.shapeManager.removeShape(id)) 
  }

  removeShapes(ids: string[]): void {
    return this.run(() => this.shapeManager.removeShapes(ids));
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
