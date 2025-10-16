import React, { useContext } from "react";
import { useEditor } from "./useEditor";
import type { IconName } from "lucide-react/dynamic";

export interface ActionItem {
  id: string;
  label: string;
  iconName: IconName;
  onSelect: (e: React.MouseEvent) => void;
}

export type ActionsContextType = Record<string, ActionItem>;

const ActionsContext = React.createContext<ActionsContextType | null>(null);

interface ActionsProviderProps {
  children: React.ReactNode;
}

export function ActionsProvider({ children }: ActionsProviderProps) {
  const editor = useEditor();
  const value = React.useMemo(() => {
    if (!editor) return {};
    const actions: ActionItem[] = [
      {
        id: "undo",
        label: "undo",
        iconName: "undo-2",
        onSelect: () => {
          editor?.hisotryManager.undo();
        },
      },
      {
        id: "redo",
        label: "redo",
        iconName: "redo-2",
        onSelect: () => {
          editor?.hisotryManager.redo();
        },
      },
    ];

    return Object.fromEntries(actions.map((item) => [item.id, item]));
  }, [editor]);

  return (
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
}

export function useActions() {
  const context = useContext(ActionsContext);
  if (!context) {
    throw Error("useActions must be used within a ActionProvider");
  }
  return context;
}
