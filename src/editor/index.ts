import { Canvas, type CanvasOptions } from "./canvas";
import { StateManager } from "./managers/StateManager";
import { ToolManager } from "./managers/ToolManager";

interface EditorOptions {
  canvas: CanvasOptions;
  store: any;
}

export class Editor {
  canvas: Canvas;

  // managers
  stateManager: StateManager;
  toolManager: ToolManager;

  constructor(options: EditorOptions) {
    this.canvas = new Canvas(options.canvas);
    this.stateManager = new StateManager(this, options.store);
    this.toolManager = new ToolManager(this);
    this.bindEvents();
  }

  bindEvents() {
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
  }
}
