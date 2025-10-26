import { useTools } from '@/hooks/useTools';
import { ToolbarItem } from './ToolbarItem';
import { useMemo } from 'react';
import { useEditor, useEditorValue } from '@/hooks/useEditor';

interface ToolButtonProps {
  tool: string;
}

export function ToolButton({ tool }: ToolButtonProps) {
  const tools = useTools();
  const editor = useEditor();
  const currentTool = useEditorValue('tool.current', () => editor.getCurrentTool());

  const isSelected = useMemo(() => currentTool === tool, [tool, currentTool]);

  return <ToolbarItem {...tools[tool]} isSelected={isSelected} />;
}
