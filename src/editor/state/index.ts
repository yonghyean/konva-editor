export interface EditorState {
  camera: CameraState;
  selection: SelectionState;
  shapes: ShapeState;
  tool: ToolState;
  style: StyleState;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface SelectionState {
  ids: string[];
}

export interface Shape {
  id: string;
  type: "rect" | "circle" | "line" | "image" | "text";
  x: number;
  y: number;
  rotation: number;
  width?: number;
  height?: number;
  props?: Record<string, any>;
}

export interface ShapeState {
  entities: Record<string, Shape>;
  selectedIds: string[];
}

export interface ToolState {
  current: string; // "select" | "brush" | "text" 등
  locked: boolean;
  mode: "idle" | "drawing" | "transforming" | "panning";
}

export interface StyleState {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
}
