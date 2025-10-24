import type { ReactNode } from "react";
import { useMemo } from "react";
import { useEditor } from "@/hooks/useEditor";
import { ActionsContext, type ActionItem } from "@/hooks/useActions";


interface ActionsProviderProps {
  children: ReactNode;
}

export function ActionsProvider({ children }: ActionsProviderProps) {
  const editor = useEditor();

  const value = useMemo(() => {
    const actions: ActionItem[] = [
      {
        id: "undo",
        label: "undo",
        iconName: "undo-2",
        onSelect: () => {
          editor.hisotryManager.undo();
        },
      },
      {
        id: "redo",
        label: "redo",
        iconName: "redo-2",
        onSelect: () => {
          editor.hisotryManager.redo();
        },
      },
    ];

    return Object.fromEntries(actions.map((item) => [item.id, item]));
  }, [editor]);

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
}