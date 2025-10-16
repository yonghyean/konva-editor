import { useTools } from "@/hooks/useTools";
import { ToolbarItem } from "./ToolbarItem";
import { useEditorState } from "@/hooks/useEditorState";
import React from "react";

interface ToolButtonProps {
  tool: string;
}
export function ToolButton({ tool }: ToolButtonProps) {
  const tools = useTools();
  const currentTool = useEditorState((state) => state.tool.current);
  const isSelected = React.useMemo(
    () => currentTool === tool,
    [tool, currentTool]
  );

  return <ToolbarItem {...tools[tool]} isSelected={isSelected} />;
}
