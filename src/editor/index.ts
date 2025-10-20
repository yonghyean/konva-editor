import type Konva from "konva";
import { Canvas, type CanvasOptions } from "./canvas";
import { HistoryManager } from "./managers/HistoryManager";
import { ShapeManager } from "./managers/ShapeManager";
import { ToolManager } from "./managers/ToolManager";
import { TransactionManager } from "./managers/TransactionManager";
import { Store } from "./store/Store";
import type { Shape } from "./state";

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

  setCurrenTool(tool: string) {
    this.setCurrentTool(tool);
  }

  setStyleForSelectedShapes(value: string) {
    // 선택된 도형 찾기
    const shapes = this.canvas.topLayer.find(".selected") as Konva.Shape[];
    shapes.forEach((shape) => {
      shape.stroke(value);
    });
  }

  setStyleForNextShapes(value: string) {
    this.store.set('style.strokeColor', value);
    this.store.set('style.fillColor', value);
    this.store.set('style.strokeWidth', value);
    this.store.set('style.opacity', value);
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
    return this.run(() => {
      this.toolManager.changeTool(tool);
      // store 업데이트
      this.store.set('tool.current', tool);
      console.log(this.store.getState());
    })
  }
  
  getCurrentTool(): string {
    return this.store.getState().tool.current;
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
