import { StyleProvider } from '@/providers/StylesProvider';
import { useStyles } from '@/hooks/useStyles';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { useEditor, useEditorValue } from '@/hooks/useEditor';
import { STYLES } from '@/constants/styles';
import type { PropertyPath } from '@/editor/store/Store';
import type { StyleState } from '@/editor/state';

export function StylePannel() {
  return (
    <StyleProvider>
      <div className="flex flex-col gap-3 shadow-xs bg-background border rounded-lg p-3 w-52 text-sm">
        <div className="flex flex-col gap-1">
          <StylePannelColoricker title="선 색상" path="strokeColor" items={STYLES.color} />
          <StylePannelColoricker title="채우기 색상" path="fillColor" items={STYLES.color} />
        </div>
      </div>
    </StyleProvider>
  );
}

interface StylePannelColorickerProps {
  title: string;
  path: PropertyPath<StyleState>;
  items: Array<{ value: string }>;
}
function StylePannelColoricker({ title, path, items }: StylePannelColorickerProps) {
  const editor = useEditor();
  const value = useEditorValue(`style.${path}`, () => editor.getState(`style.${path}`));

  const { onValueChange } = useStyles();

  return (
    <div className="flex flex-col gap-1">
      <p>{title}</p>
      <div className="flex gap-1 flex-wrap">
        <ToggleGroup type="single" className="grid grid-cols-5" value={value.toString()} onValueChange={onValueChange}>
          {items.map((color) => (
            <ToggleGroupItem key={color.value} value={color.value}>
              <span className="size-5 rounded-full" style={{ background: color.value }}></span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
