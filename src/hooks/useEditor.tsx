
import  { Editor } from "../editor";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type StoreValue, type StorePath, type PathValue } from "@/editor/store/Store";

const EditorContext = createContext<Editor | null>(null);

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {  
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    setEditor(new Editor({
      canvas: {
        containerId: "canvas-container",
        width: innerWidth,
        height: innerHeight,
      },
    }));

    return () => {
      setEditor(null);
    };
  }, []);

  return <EditorContext.Provider value={editor}>
    <div id="canvas-container">
      {editor && children}  
    </div>
    </EditorContext.Provider>;
};


export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within a EditorProvider");
  }
  return context;
}

/**
 * path에 해당하는 값을 반환하는 훅
 * @param path 
 */
export function useEditorValue<T extends StorePath, R>(path: T, listener: () => R): R {
  const editor = useEditor();
  const [value, setValue] = useState<R>(listener());
  
  const handleListener = useCallback(() => {
    setValue(listener());
  }, [listener]);
  
  useEffect(() => {
    if (!editor) throw new Error("Editor not found");
    const unsubscribe = editor.store.listen<T>(path, handleListener);

    return () => {
      unsubscribe();
    };
  }, [editor, path, handleListener]);

  return value;
}