import { ToolProvider } from "@/providers/ToolsProvider";
import { ToolButton } from "./ToolButton";

export function Toolbar() {
  return (
    <ToolProvider>
      <div className="flex gap-1 shadow-xs bg-background border rounded-lg p-1">
        <ToolButton tool="select" />
        <ToolButton tool="brush" />
        <ToolButton tool="eraser" />
        <ToolButton tool="rect" />
        <ToolButton tool="circle" />
        <ToolButton tool="diamond" />
      </div>
    </ToolProvider>
  );
}
