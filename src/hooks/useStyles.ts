import type { IconName } from 'lucide-react/dynamic';
import type { MouseEvent } from 'react';
import { createContext, useContext } from 'react';

type StylesContextValue = {
  onValueChange: (value: string) => void;
};

export const StylesContext = createContext<StylesContextValue | null>(null);

export interface StyleItem {
  id: string;
  label: string;
  iconName: IconName;
  onSelect: (e: MouseEvent) => void;
}

export function useStyles() {
  const context = useContext(StylesContext);

  if (!context) {
    throw Error('useStyles must be used within a StyleProvider');
  }

  return context;
}
