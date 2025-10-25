import type Konva from 'konva';

export type TransformerState = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

export type EditorState = {
  camera: CameraState;
  selection: SelectionState;
  shapes: ShapeState;
  tool: ToolState;
  style: StyleState;
  transformer: TransformerState;

  canUndo: boolean;
  canRedo: boolean;
};

export type CameraState = {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
};

export type SelectionState = {
  ids: string[];
};

export type ShapeType =
  | 'Line'
  | 'Rect'
  | 'Circle'
  | 'Ellipse'
  | 'Polygon'
  | 'Path'
  | 'Text'
  | 'Image'
  | 'Group'
  | 'Diamond';

export type Shape = { id: string; className: ShapeType } & Konva.ShapeConfig;

export type ShapeState = Record<string, Shape>; // id를 key로 사용

export type ToolState = {
  current: string; // "select" | "brush" | "text" 등
  locked: boolean;
  mode: 'idle' | 'drawing' | 'transforming' | 'panning';
};

export type StyleState = {
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
};
