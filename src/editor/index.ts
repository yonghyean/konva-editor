import type Konva from "konva";
import { Canvas, type CanvasOptions } from "./canvas";
import { HistoryManager } from "./managers/HistoryManager";
import { ShapeManager } from "./managers/ShapeManager";
import { ToolManager } from "./managers/ToolManager";
import type { EditorStore } from "./store";
import { produce } from "immer";

interface EditorOptions {
  canvas: CanvasOptions;
  store: EditorStore;
}

export class Editor {
  canvas: Canvas;
  store: EditorStore;
  // managers

  shapeManager: ShapeManager;
  toolManager: ToolManager;
  hisotryManager: HistoryManager;

  constructor(options: EditorOptions) {
    this.canvas = new Canvas(options.canvas);
    this.store = options.store;
    this.shapeManager = new ShapeManager(this);
    this.toolManager = new ToolManager(this);
    this.hisotryManager = new HistoryManager(this);

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
    this.toolManager.changeTool(tool);
  }

  setStyleForSelectedShapes(value: string) {
    // 선택된 도형 찾기
    const shapes = this.canvas.topLayer.find(".selected") as Konva.Shape[];
    shapes.forEach((shape) => {
      shape.stroke(value);
    });
  }

  setStyleForNextShapes(value: string) {
    this.store.setState(
      produce((state) => {
        state.style.strokeColor = value;
      })
    );
  }
}
