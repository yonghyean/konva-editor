import type { ReactNode } from "react";
import { useMemo } from "react";
import { useEditor } from "@/hooks/useEditor";
import { ToolsContext, type ToolItem } from "@/hooks/useTools";

interface ToolProviderProps {
  children: ReactNode;
}

export function ToolProvider({ children }: ToolProviderProps) {
  const editor = useEditor();

  const value = useMemo(() => {
    const tools: ToolItem[] = [
      {
        tool: "select",
        label: "select",
        iconName: "mouse-pointer-2",
        onSelect: () => {
          editor.setCurrentTool("select");
        },
      },
      {
        tool: "brush",
        label: "brush",
        iconName: "brush",
        onSelect: () => {
          editor.setCurrentTool("brush");
        },
      },
      {
        tool: "eraser",
        label: "eraser",
        iconName: "eraser",
        onSelect: () => {
          editor.setCurrentTool("eraser");
        },
      },
      {
        tool: "rect",
        label: "rect",
        iconName: "square",
        onSelect: () => {
          editor.setCurrentTool("rect");
        },
      },
      {
        tool: "circle",
        label: "circle",
        iconName: "circle",
        onSelect: () => {
          editor.setCurrentTool("circle");
        },
      },
      {
        tool: "diamond",
        label: "diamond",
        iconName: "diamond",
        onSelect: () => {
          editor.setCurrentTool("diamond");
        },
      },
    ];

    return Object.fromEntries(tools.map((item) => [item.tool, item]));
  }, [editor]);

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
}