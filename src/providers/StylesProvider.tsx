import { useCallback, type ReactNode } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { StylesContext } from '@/hooks/useStyles';
import type { PropertyPath, PathValue } from '@/editor/store/Store';
import type { EditorState, StyleState } from '@/editor/state';

interface StylesProviderProps {
  children: ReactNode;
}

export type StylePath = PropertyPath<StyleState>;
export type StyleValue<TPath extends StylePath> = PathValue<EditorState, `style.${TPath}`>;

export function StyleProvider({ children }: StylesProviderProps) {
  const editor = useEditor();

  const handleValueChange = useCallback(
    <TPath extends StylePath>(path: TPath, value: StyleValue<TPath>) => {
      // TODO: any 제거 (EditorState에 path, value에 타입 통일 필요)
      editor.setStyleForSelectedShapes(path, value as any);
      editor.setStyleForNextShapes(path, value as any);
    },
    [editor],
  );

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
