import type { IconName } from "lucide-react/dynamic";
import React, { useContext } from "react";
import { useEditor } from "./useEditor";

export interface ToolItem {
  tool: string;
  label: string;
  iconName: IconName;
  onSelect: (e: React.MouseEvent) => void;
}

type ToolsContextType = Record<string, ToolItem>;

const ToolsContext = React.createContext<null | ToolsContextType>(null);

interface ToolsProviderProps {
  children: React.ReactNode;
}

export function ToolProvider({ children }: ToolsProviderProps) {
  const editor = useEditor();

  const value = React.useMemo(() => {
    if (!editor) return {};
    const tools: ToolItem[] = [
      {
        tool: "select",
        label: "select",
        iconName: "mouse-pointer-2",
        onSelect: () => {
          editor?.setCurrentTool("select");
        },
      },
      {
        tool: "brush",
        label: "brush",
        iconName: "brush",
        onSelect: () => {
          editor?.setCurrentTool("brush");
        },
      },
      {
        tool: "eraser",
        label: "eraser",
        iconName: "eraser",
        onSelect: () => {
          editor?.setCurrentTool("eraser");
        },
      },
    ];

    return Object.fromEntries(tools.map((item) => [item.tool, item]));
  }, [editor]);

  return (
    <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>
  );
}

export function useTools() {
  const context = useContext(ToolsContext);

  if (!context) {
    throw Error("useTools must be used within a ToolProvider");
  }

  return context;
}
