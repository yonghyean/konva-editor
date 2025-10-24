import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Editor } from '@/editor';
import { EditorContext } from '@/hooks/useEditor';

interface EditorProviderProps {
  children: ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    const instance = new Editor({
      canvas: {
        containerId: 'canvas-container',
        width: innerWidth,
        height: innerHeight,
      },
    });

    setEditor(instance);

    return () => {
      setEditor(null);
    };
  }, []);

  return (
    <EditorContext.Provider value={editor}>
      <div id="canvas-container">{editor && children}</div>
    </EditorContext.Provider>
  );
}
