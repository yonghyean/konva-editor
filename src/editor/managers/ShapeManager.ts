import Konva from "konva";
import type { Editor } from "..";
import type { ShapeState } from "../state";

export class ShapeManager {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;

    this.editor.store.subscribe((state, prev) => {
      if (state.shapes !== prev.shapes) this.sync(state.shapes, prev.shapes);
    });
  }

  sync(next: ShapeState, prev: ShapeState) {
    for (const key of Object.keys(next.entities)) {
      // next에는 있지만 prev에 없으면 생성
      if (!prev.entities[key]) {
        const target = this.editor.canvas.layer.findOne(`#${key}`);
        // 도형이 없는 경우에 생성해서 추가
        if (!target) {
          const shape = Konva.Shape.create(next.entities[key].attrs);
          this.editor.canvas.layer.add(shape);
        }
      }
    }

    for (const key of Object.keys(prev.entities)) {
      // prev에는 있지만 next에 없으면 삭제
      if (!next.entities[key]) {
        const target = this.editor.canvas.layer.findOne(`#${key}`);
        target?.destroy();
      }
    }
  }
}
