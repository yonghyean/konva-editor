import Konva from "konva";

export interface CanvasOptions extends Omit<Konva.StageConfig, "container"> {
  containerId: string;
}

export class Canvas {
  stage: Konva.Stage;
  layer: Konva.Layer;
  topLayer: Konva.Layer;

  constructor({ containerId, ...opts }: CanvasOptions) {
    this.stage = new Konva.Stage({
      container: containerId,
      ...opts,
    });
    this.layer = new Konva.Layer();
    this.topLayer = new Konva.Layer();
    this.stage.add(this.layer, this.topLayer);
  }
}
