import Konva from "konva";
import type { Context } from "konva/lib/Context";
import { _registerNode } from "konva/lib/Global";

export interface DiamondConfig extends Konva.ShapeConfig {
  width: number;
  height: number;
}

export class Diamond extends Konva.Shape {
  _sceneFunc(ctx: Context) {
    const width = this.width();
    const height = this.height();
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width, height / 2);
    ctx.lineTo(width / 2, height);
    ctx.lineTo(0, height / 2);
    ctx.closePath();
    ctx.fillStrokeShape(this);
  }
}

Diamond.prototype.className = 'Diamond';
_registerNode(Diamond);