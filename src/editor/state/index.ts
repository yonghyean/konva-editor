import type Konva from "konva";

export interface EditorState {
  camera: CameraState;
  selection: SelectionState;
  shapes: ShapeState;
  tool: ToolState;
  style: StyleState;

  canUndo: boolean;
  canRedo: boolean;
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

export type Shape = { id: string; } & Konva.Shape['attrs'];

export type ShapeState = Shape[];

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
