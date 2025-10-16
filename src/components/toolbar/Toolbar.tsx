import { ToolButton } from "./ToolButton";

export function Toolbar() {
  return (
    <div className="flex gap-1 shadow-xs bg-background border rounded-lg p-1">
      <ToolButton tool="select" iconName="mouse-pointer-2" />
      <ToolButton tool="brush" iconName="brush" />
      <ToolButton tool="eraser" iconName="eraser" />
      <ToolButton tool="undo" iconName="undo-2" />
      <ToolButton tool="redo" iconName="redo-2" />
    </div>
  );
}
