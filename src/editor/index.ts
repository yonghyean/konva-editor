import Konva from 'konva';
import { Canvas, type CanvasOptions } from './canvas';
import { HistoryManager } from './managers/HistoryManager';
import { SelectionManager } from './managers/SelectionManager';
import { ShapeManager } from './managers/ShapeManager';
import { ToolManager } from './managers/ToolManager';
import { TransactionManager } from './managers/TransactionManager';
import { Store, type PathValue, type PropertyPath } from './store/Store';
import type { Shape, StyleState } from './state';
import type { Record as StateRecord } from './types/record';
import { Diamond } from './shapes/Diamond';

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
    this.canvas.stage.on('click', this.toolManager.handleCick.bind(this.toolManager));
    this.canvas.stage.on('pointerdown', this.toolManager.handlePointerDown.bind(this.toolManager));
    this.canvas.stage.on('pointermove', this.toolManager.handlePointerMove.bind(this.toolManager));
    this.canvas.stage.on('pointerup', this.toolManager.handlePointerUp.bind(this.toolManager));
    this.canvas.stage.on('pointerover', this.toolManager.handlePointerOver.bind(this.toolManager));
    this.canvas.stage.on('pointerout', this.toolManager.handlePointerOut.bind(this.toolManager));
  }

  getShapes() {
    return Object.values(this.store.get('shapes'));
  }

  getSelectedShapes() {
    const ids = this.store.get('selection.ids') as string[];
    return ids.map((id: string) => this.getShape(id));
  }

  setSelectedShapes(ids: string[]) {
    this.run(() => {
      // 선택된 shapes의 id 배열 업데이트
      const record = this.store.createRecord('updated', 'selection.ids', ids);
      this.store.put([record]);
      this.updateHistory([record]);
    });
  }

  public getStyle(): StyleState;
  public getStyle<T extends PropertyPath<StyleState>>(path: T): PathValue<StyleState, T>;
  getStyle<T extends PropertyPath<StyleState>>(path?: T) {
    if (!path) return this.store.get('style');
    return this.store.get(`style.${path}`);
  }

  /**
   * 선택된 도형들의 공통 스타일을 가져옴
   */
  getSharedStyle<T extends PropertyPath<StyleState>>(path: T) {
    const shapes = this.getSelectedShapes();
    if (!shapes.length) return null;
    const allSame = shapes.every((shape: Shape) => shape[path] === shapes[0][path]);
    if (!allSame) return null;
    return shapes[0][path];
  }

  /**
   * 선택된 shapes의 스타일을 설정합니다.
   * @param path 스타일 경로 (예: 'fill', 'stroke', 'strokeWidth', 'strokeColor')
   * @param value 스타일 값
   */
  setStyleForSelectedShapes<T extends PropertyPath<StyleState>>(path: T, value: PathValue<StyleState, T>) {
    const shapes = this.getSelectedShapes();

    this.run(() => {
      const records: StateRecord[] = [];
      // 선택된 shapes의 스타일을 업데이트합니다.
      for (const shape of shapes) {
        records.push(this.store.createRecord('updated', `shapes.${shape.id}.${path}`, value));
      }

      // Store에 반영 및 History 업데이트
      this.store.put(records);
      this.updateHistory(records);
    });
  }

  /**
   * 다음 도형에 적용할 스타일 업데이트
   * @param path 스타일 경로 (예: 'fill', 'stroke', 'strokeWidth', 'strokeColor')
   * @param value 스타일 값
   */
  setStyleForNextShapes<T extends PropertyPath<StyleState>>(path: T, value: PathValue<StyleState, T>) {
    this.run(() => {
      // 스타일 업데이트 Record 생성
      const record = this.store.createRecord('updated', `style.${path}`, value);

      // Store에 반영 및 History 업데이트
      this.store.put([record]);
      this.updateHistory([record]);
    });
  }

  // 트랜잭션 실행
  run<T>(fn: () => T): T {
    // 중첩 run은 그냥 실행 (최상위 run에서만 히스토리 기록)
    if (this.isInTransaction()) {
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

  // Shape API (새로운 아키텍처)
  createShape(shape: Omit<Shape, 'id'>): Shape {
    return this.createShapes([shape])[0];
  }

  createShapes(shapes: Omit<Shape, 'id'>[]): Shape[] {
    return this.run(() => {
      const records: StateRecord[] = [];
      const createdShapes: Shape[] = [];

      for (const shape of shapes) {
        const createdShape = this.shapeManager.createShape(shape);
        createdShapes.push(createdShape);
        records.push(this.store.createRecord('added', `shapes.${createdShape.id}`, createdShape));
      }

      // Store에 반영 및 History 업데이트
      this.store.put(records);
      this.updateHistory(records);

      return createdShapes;
    });
  }

  updateShape(shape: Partial<Shape>): Shape {
    return this.updateShapes([shape])[0];
  }

  updateShapes(shapes: Partial<Shape>[]): Shape[] {
    return this.run(() => {
      // Record 배열 생성
      const records: StateRecord[] = [];
      const updatedShapes: Shape[] = [];

      for (const shape of shapes) {
        const currentShape = this.getShape(shape.id!);
        if (!currentShape) continue;
        const updatedShape = this.shapeManager.updateShape(currentShape, shape);
        updatedShapes.push(updatedShape);
        records.push(this.store.createRecord('updated', `shapes.${updatedShape.id}`, updatedShape));
      }

      // Store 및 History
      this.store.put(records);
      this.updateHistory(records);

      return updatedShapes;
    });
  }

  removeShape(id: string): void {
    return this.removeShapes([id]);
  }

  removeShapes(ids: string[]): void {
    return this.run(() => {
      const records: StateRecord[] = [];

      for (const id of ids) {
        const shape = this.getShape(id);
        if (!shape) continue;
        records.push(this.store.createRecord('removed', `shapes.${shape.id}`, shape));
      }

      this.store.put(records);
      this.updateHistory(records);
    });
  }

  getShape(id: string): Shape {
    return this.store.get(`shapes.${id}`) as Shape;
  }

  getShapeNode(id: string): Konva.Shape {
    return this.shapeManager.getShapeNode(id);
  }

  // Tool API
  setCurrentTool(tool: string): void {
    this.toolManager.changeTool(tool);
    const record = this.store.createRecord('updated', 'tool.current', tool);
    this.store.put([record]);
  }

  getCurrentTool(): string {
    return this.store.get('tool.current') as string;
  }

  // History API
  undo(): void {
    const records = this.hisotryManager.undo();
    if (!records) return;

    // Record를 적용하고 Manager 동기화
    this.store.put(records);
  }

  redo(): void {
    const records = this.hisotryManager.redo();
    if (!records) return;

    // Record를 적용하고 Manager 동기화
    this.store.put(records);
  }

  /**
   * Record 배열을 히스토리에 업데이트
   * @param records Record 배열
   */
  updateHistory(records: StateRecord[]): void {
    if (this.transactionManager.isActive()) {
      this.transactionManager.add(records);
    } else {
      this.hisotryManager.record(records);
    }
  }

  // Transaction API
  isInTransaction(): boolean {
    return this.transactionManager.isActive();
  }

  startTransaction(): void {
    this.transactionManager.start();
  }

  commitTransaction(): void {
    const records = this.transactionManager.commit();
    if (records) {
      this.hisotryManager.record(records);
    }
  }

  cancelTransaction(): void {
    this.transactionManager.rollback();
  }
}

Konva.Util._assign(Konva, {
  Diamond: Diamond,
});
