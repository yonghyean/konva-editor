import { DynamicIcon } from "lucide-react/dynamic";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { ToolItem } from "@/hooks/useTools";

interface ToolbarItemProps extends ToolItem {
  isSelected: boolean;
}

export function ToolbarItem({
  tool,
  iconName,
  isSelected,
  onSelect,
}: ToolbarItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={isSelected ? "default" : "ghost"}
          onClick={onSelect}
        >
          <DynamicIcon name={iconName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tool}</TooltipContent>
    </Tooltip>
  );
}
