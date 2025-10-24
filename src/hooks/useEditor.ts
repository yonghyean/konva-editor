import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { StorePath } from '@/editor/store/Store';
import type { Editor } from '@/editor';

export const EditorContext = createContext<Editor | null>(null);

export function useEditor() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error('useEditor must be used within a EditorProvider');
  }

  return context;
}

export function useEditorValue<T extends StorePath, R>(path: T, listener: () => R): R {
  const editor = useEditor();
  const [value, setValue] = useState<R>(listener());

  const handleListener = useCallback(() => {
    setValue(listener());
  }, [listener]);

  useEffect(() => {
    const unsubscribe = editor.store.listen<T>(path, handleListener);

    return () => {
      unsubscribe();
    };
  }, [editor, path, handleListener]);

  return value;
}
