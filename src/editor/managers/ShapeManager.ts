import Konva from "konva";
import type { Editor } from "..";
import type { Shape, ShapeState } from "../state";

export class ShapeManager {
  private root: Editor;
  private shapeNodes = new Map<string, Konva.Shape>();
  private shapes = new Map<string, Shape>(); // 내부 메모리 상태

  constructor(root: Editor) {
    this.root = root;

  }

  createShape(attrs: Omit<Shape, 'id'>): string {
    return this.createShapes([attrs])[0];
  }

  createShapes(shapes: Omit<Shape, 'id'>[]): string[] {
    const createdIds: string[] = [];

    for (const attrs of shapes) {
      const id = this.generateId();
      const shape: Shape = { id, ...attrs };
      
      // 1. 메모리 상태 업데이트
      this.shapes.set(id, shape);
      
      // 2. 노드 생성
      this.createShapeNode(shape);
      
      createdIds.push(id);
    }
    
    
    return createdIds;
  }

  updateShape(attrs: Partial<Shape> & { id: string }): void {
    return this.updateShapes([attrs]);
  }

  updateShapes(attrs: (Partial<Shape> & { id: string })[]): void {
    if (!attrs.length) return;

    for (const attr of attrs) {
      const existing = this.shapes.get(attr.id);
      if (!existing) continue;
      
      const updated = { ...existing, ...attr };
      
      // 1. 메모리 상태 업데이트
      this.shapes.set(attr.id, updated);
      
      // 2. 노드 업데이트
      this.updateShapeNode(updated);
    }
  }

  removeShape(id: string): void {
    this.removeShapes([id]);
  }

  removeShapes(ids: string[]): void {
    if (!ids.length) return;

    for (const id of ids) {
      // 1. 메모리 상태 제거
      this.shapes.delete(id);
      
      // 2. 노드 제거
      this.removeShapeNode(id);
    }
  }

  getShapeNode<T extends Konva.Shape = Konva.Shape>(id: string): T | null {
    const node = this.shapeNodes.get(id);
    return node as T | null;
  }

  syncShapes(shapes: ShapeState): void {
    // 1. 메모리 상태 업데이트
    this.shapes.clear();
    shapes.forEach(shape => this.shapes.set(shape.id, shape));
    
    // 2. 노드 동기화
    const visibleIds = new Set<string>(this.shapeNodes.keys());
    
    for (const shape of shapes) {
      if (!this.shapeNodes.has(shape.id)) {
        this.createShapeNode(shape);
      } else {
        this.updateShapeNode(shape);
      }
      visibleIds.delete(shape.id);
    }
    
    for (const id of visibleIds) {
      this.removeShapeNode(id);
    }
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * 도형 노드를 생성하고 관리하는 메서드
   * @param attrs 도형 속성
   * @returns 도형 노드
   */
  private createShapeNode(shape: Shape): Konva.Shape {
    console.log("shape", {...shape});
    const attrs = structuredClone(shape);
    
    const node = new Konva.Line(attrs);
    
    // if (!node.id()) node.id(shape.id);
    this.shapeNodes.set(node.id(), node);
    this.root.canvas.layer.add(node);
    
    return node;
  }

  private updateShapeNode(shape: Shape) {
    const node = this.shapeNodes.get(shape.id);
    if (!node) return;
    node.attrs = shape;
    node.draw();
  }

  private removeShapeNode(id: string) {
    const node = this.shapeNodes.get(id);
    if (!node) return;
    this.shapeNodes.delete(id);
    node.destroy();
  }
}