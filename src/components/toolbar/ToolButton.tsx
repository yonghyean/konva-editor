import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useEditorState } from "@/hooks/useEditorState";

interface ToolButtonProps {
  tool: string;
  iconName: IconName;
}

export function ToolButton({ tool, iconName }: ToolButtonProps) {
  const currentTool = useEditorState((state) => state.tool.current);
  const update = useEditorState((state) => state.update);
  const isActive = tool === currentTool;

  const handleClick = () => {
    update("tool.current", tool);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={isActive ? "default" : "ghost"}
          onClick={handleClick}
        >
          <DynamicIcon name={iconName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tool}</TooltipContent>
    </Tooltip>
  );
}
