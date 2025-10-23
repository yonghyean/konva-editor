import { useTools } from "@/hooks/useTools";
import { ToolbarItem } from "./ToolbarItem";
// import { useEditorState } from "@/hooks/useEditorState";
import React from "react";
import { useEditor, useEditorValue } from "@/hooks/useEditor";

interface ToolButtonProps {
  tool: string;
}

export function ToolButton({ tool }: ToolButtonProps) {
  const tools = useTools();
  const editor = useEditor(); 
  const currentTool = useEditorValue("tool.current", () => editor.getState("tool.current"));
  
  const isSelected = React.useMemo(
    () => currentTool === tool,
    [tool, currentTool]
  );

  return <ToolbarItem {...tools[tool]} isSelected={isSelected} />;
}
