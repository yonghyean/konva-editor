import type { IconName } from "lucide-react/dynamic";
import React, { useContext } from "react";
import { useEditor } from "./useEditor";

export interface StyleItem {
  id: string;
  label: string;
  iconName: IconName;
  onSelect: (e: React.MouseEvent) => void;
}

type StylesContextType = {
  onValueChange: (value: string) => void;
};

const StylesContext = React.createContext<null | StylesContextType>(null);

interface StylesProviderProps {
  children: React.ReactNode;
}

export function StyleProvider({ children }: StylesProviderProps) {
  const editor = useEditor();

  const handleValueChange = (value: string) => {
    if (!editor) return;
    editor.setStyleForSelectedShapes(value);
    editor.setStyleForNextShapes(value);
  };

  return (
    <StylesContext.Provider
      value={{
        onValueChange: handleValueChange,
      }}
    >
      {children}
    </StylesContext.Provider>
  );
}

export function useStyles() {
  const context = useContext(StylesContext);

  if (!context) {
    throw Error("useStyles must be used within a StyleProvider");
  }

  return context;
}
