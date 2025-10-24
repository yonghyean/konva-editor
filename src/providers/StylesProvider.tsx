import type { ReactNode } from "react";
import { useEditor } from "@/hooks/useEditor";
import { StylesContext } from "@/hooks/useStyles";

interface StylesProviderProps {
  children: ReactNode;
}

function StyleProvider({ children }: StylesProviderProps) {
  const editor = useEditor();

  const handleValueChange = (value: string) => {
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

export { StyleProvider, StylesContext };