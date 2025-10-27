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

  getShapeNode(id: string): Konva.Shape {
    const shape = this.shapes.get(id);
    if (!shape) throw new Error(`Shape with id ${id} not found`);
    return shape;
  }

  createShape(shape: Omit<Shape, 'id'>): Shape {
    const createdShape = {
      id: this.generateId(),
      className: shape.className,
      scaleX: shape.scaleX || 1,
      scaleY: shape.scaleY || 1,
      rotation: shape.rotation || 0,
      x: shape.x,
      y: shape.y,
      offsetX: shape.offsetX,
      offsetY: shape.offsetY,
      opacity: shape.opacity,
      visible: shape.visible,
      ...shape,
    } as Shape;
    return createdShape;
  }

  updateShape(shape: Partial<Shape>, partialShape: Partial<Shape>): Shape {
    const updatedShape = { ...shape, ...partialShape } as Shape;
    return updatedShape;
  }

  private syncShapes(shapes: ShapeState): void {
    for (const [id, shape] of Object.entries(shapes)) {
      // this.shapes에 없으면 도형을 생성
      if (!this.shapes.has(id)) {
        this.createShapeNode(shape);
      } else {
        // this.shapes에 있으면 도형을 업데이트
        this.updateShapeNode(shape);
      }
    }

    // this.shapes에 있는 도형이 없는 도형은 삭제
    for (const id of this.shapes.keys()) {
      if (!shapes[id]) {
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
