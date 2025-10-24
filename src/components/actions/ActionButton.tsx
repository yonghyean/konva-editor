import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Button } from '../ui/button';
import { useActions } from '@/hooks/useActions';

interface ActionButtonProps {
  actionId: string;
  disabled?: boolean;
}
export function ActionButton({ actionId, disabled = false }: ActionButtonProps) {
  const actions = useActions();
  const { iconName, label, onSelect } = actions[actionId];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" onClick={onSelect} disabled={disabled}>
          <DynamicIcon name={iconName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
