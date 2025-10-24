import Konva from 'konva';
import type { Editor } from '..';
import type { Shape, ShapeState } from '../state';

export class ShapeManager {
  private root: Editor;
  private shapes = new Map<string, Konva.Shape>(); // 내부 메모리 상태

  constructor(root: Editor) {
    this.root = root;
    this.root.store.listen('shapes', (shapes) => {
      this.syncShapes(shapes);
    });
  }

  createShape(attrs: Omit<Shape, 'id'>): string {
    return this.createShapes([attrs])[0];
  }

  createShapes(shapes: Omit<Shape, 'id'>[]): string[] {
    const createdIds: string[] = [];

    for (const attrs of shapes) {
      const id = this.generateId();
      const shape = { id, ...attrs } as Shape;

      // 스토어 업데이트
      this.root.setState(`shapes.${id}`, shape);

      createdIds.push(id);
    }

    return createdIds;
  }

  updateShape(attrs: Partial<Shape>): void {
    return this.updateShapes([attrs]);
  }

  updateShapes(attrs: Partial<Shape>[]): void {
    if (!attrs.length) return;

    for (const attr of attrs) {
      if (!attr.id) continue;
      const existing = this.shapes.get(attr.id);
      if (!existing) continue;

      const updated = { ...existing.attrs, ...attr };

      // 스토어 업데이트
      this.root.setState(`shapes.${attr.id}`, updated as Shape);
    }
  }

  removeShape(id: string): void {
    this.removeShapes([id]);
  }

  removeShapes(ids: string[]): void {
    if (!ids.length) return;

    for (const id of ids) {
      // 노드 제거
      this.removeShapeNode(id);

      // 스토어 업데이트
      this.root.setState(`shapes.${id}`, undefined);
    }
  }

  getShapeNode<T extends Konva.Shape = Konva.Shape>(id: string): T | null {
    const node = this.shapes.get(id);
    if (!node) return null;
    return node as T;
  }

  syncShapes(shapes: ShapeState): void {
    for (const [id, shape] of Object.entries(shapes)) {
      if (!this.shapes.has(id) && shape) {
        this.createShapeNode(shape);
      } else if (shape) {
        this.updateShapeNode(shape);
      } else {
        // 사라진 도형은 shape가 undefined이기 때문에 removeShapeNode를 호출
        this.removeShapeNode(id);
      }
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
    const attrs = shape;
    const node = Konva.Shape.create(JSON.stringify({ className: shape.className, attrs: attrs }));
    node.listening(false);
    this.shapes.set(shape.id, node);
    this.root.canvas.layer.add(node);

    return node;
  }

  private updateShapeNode(shape: Shape) {
    const node = this.shapes.get(shape.id);
    if (!node) return;
    node.setAttrs(shape);
  }

  private removeShapeNode(id: string) {
    const node = this.shapes.get(id);
    if (!node) return;
    this.shapes.delete(id);
    node.destroy();
  }
}
