import { createContext, useCallback, useContext, useState } from 'react';
import { useEditor, useEditorValue } from './useEditor';
import type { StylePath, StyleValue } from '@/providers/StylesProvider';

type StylesContextValue = {
  onValueChange: <TPath extends StylePath>(path: TPath, value: StyleValue<TPath>) => void;
};

export const StylesContext = createContext<StylesContextValue | null>(null);

export function useStyles() {
  const context = useContext(StylesContext);

  if (!context) {
    throw Error('useStyles must be used within a StyleProvider');
  }

  return context;
}

/**
 * 선택된 도형들의 공유 가능한 스타일을 가져옴
 */
export function useSharedStyle<TPath extends StylePath>(path: TPath) {
  const editor = useEditor();
  const { onValueChange } = useStyles();
  const configValue = useEditorValue(`style.${path}`, () => editor.getState(`style.${path}`));
  const sharedValue = useEditorValue('selection.ids', () => editor.getSharedStyle(path));

  // TODO: 내부 상태를 사용하지 않고 최신 값을 설정할 수 있는 방법 필요
  const [value, setValue] = useState<any>(sharedValue || configValue);

  const handleValueChange = useCallback(
    (value: StyleValue<TPath>) => {
      if (!value) return;
      onValueChange(path, value);
      setValue(value);
    },
    [onValueChange, path],
  );

  return { value, onValueChange: handleValueChange };
}
