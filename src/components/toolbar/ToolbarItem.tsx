import { DynamicIcon } from 'lucide-react/dynamic';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import type { ToolItem } from '@/hooks/useTools';
import { useEffect } from 'react';

interface ToolbarItemProps extends ToolItem {
  isSelected: boolean;
}

export function ToolbarItem({ tool, iconName, isSelected, hotkey, onSelect }: ToolbarItemProps) {
  // TODO: Key Map 관리 및 핸들러 바운더리 (ex. HotKeyProvider)로 전환 필요)
  useEffect(() => {
    if (hotkey) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === hotkey) {
          onSelect(e);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [hotkey, onSelect]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant={isSelected ? 'default' : 'ghost'} onClick={onSelect}>
          <DynamicIcon name={iconName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {tool} {hotkey ? `(${hotkey.toUpperCase()})` : ''}
      </TooltipContent>
    </Tooltip>
  );
}
