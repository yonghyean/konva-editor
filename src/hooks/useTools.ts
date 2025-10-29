import type { IconName } from 'lucide-react/dynamic';
import type { MouseEvent } from 'react';
import { createContext, useContext } from 'react';

type ToolsContextValue = Record<string, ToolItem>;

export const ToolsContext = createContext<ToolsContextValue | null>(null);

export interface ToolItem {
  tool: string;
  label: string;
  iconName: IconName;
  hotkey?: string;
  onSelect: (e?: MouseEvent | KeyboardEvent) => void;
}

export function useTools() {
  const context = useContext(ToolsContext);

  if (!context) {
    throw Error('useTools must be used within a ToolProvider');
  }

  return context;
}
