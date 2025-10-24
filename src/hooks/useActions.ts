import type { IconName } from 'lucide-react/dynamic';
import type { MouseEvent } from 'react';
import { createContext, useContext } from 'react';

export interface ActionItem {
  id: string;
  label: string;
  iconName: IconName;
  onSelect: (e: MouseEvent) => void;
}

type ActionsContextValue = Record<string, ActionItem>;

export const ActionsContext = createContext<ActionsContextValue | null>(null);

export function useActions() {
  const context = useContext(ActionsContext);

  if (!context) {
    throw Error('useActions must be used within a ActionProvider');
  }

  return context;
}
