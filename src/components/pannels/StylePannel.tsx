import { StyleProvider, type StylePath } from '@/providers/StylesProvider';
import { useSharedStyle } from '@/hooks/useStyles';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { STYLES } from '@/constants/styles';
import type { PropertyPath } from '@/editor/store/Store';
import type { StyleState } from '@/editor/state';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useMemo } from 'react';

export function StylePannel() {
  return (
    <StyleProvider>
      <div className="flex flex-col gap-3 shadow-xs bg-background border rounded-lg p-3 w-52 text-sm">
        <div className="flex flex-col gap-1">
          <StylePannelColoricker title="선 색상" path="stroke" items={STYLES.color} />
          <StylePannelColoricker title="채우기 색상" path="fill" items={STYLES.color} />
        </div>
        <StylePannelButtonPicker
          title="선 두께"
          path="strokeWidth"
          items={[
            { value: '2', label: '2px' },
            { value: '4', label: '4px' },
            { value: '8', label: '8px' },
            { value: '10', label: '10px' },
          ]}
        />
        <StylePannelSlider
          title="투명도"
          path="opacity"
          min={0}
          max={1}
          step={0.05}
          formatValue={(value) => `${Math.round(value * 100)}%`}
        />
      </div>
    </StyleProvider>
  );
}

interface StylePannelButtonPickerProps {
  title: string;
  path: StylePath;
  items: Array<{ value: string; label: string; iconName?: IconName }>;
}

function StylePannelButtonPicker({ title, path, items }: StylePannelButtonPickerProps) {
  const { value, onValueChange } = useSharedStyle(path);

  return (
    <StylePannelGroup>
      <p>{title}</p>
      <div className="flex gap-1 flex-wrap">
        {items.map((item) => (
          <Button
            key={item.value}
            className="text-xs"
            size="icon"
            variant={item.value === value?.toString() ? 'default' : 'outline'}
            value={item.value}
            data-path={path}
            onClick={() => onValueChange(item.value)}
          >
            {item.iconName ? <DynamicIcon name={item.iconName} className="size-4" /> : item.label}
          </Button>
        ))}
      </div>
    </StylePannelGroup>
  );
}

interface StylePannelColorickerProps {
  title: string;
  path: Extract<StylePath, 'stroke' | 'fill'>;
  items: Array<{ value: string }>;
}
function StylePannelColoricker({ title, path, items }: StylePannelColorickerProps) {
  const { value, onValueChange } = useSharedStyle(path);

  return (
    <StylePannelGroup>
      <p>{title}</p>
      <div className="flex gap-1 flex-wrap">
        <ToggleGroup
          type="single"
          className="grid grid-cols-5"
          value={value?.toString() ?? ''}
          onValueChange={onValueChange}
        >
          {items.map((color) => (
            <ToggleGroupItem key={color.value} value={color.value}>
              <span className="size-5 rounded-full" style={{ background: color.value }}></span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </StylePannelGroup>
  );
}

interface StylePannelSliderProps {
  title: string;
  path: Extract<PropertyPath<StyleState>, 'strokeWidth' | 'opacity'>;
  min: number;
  max: number;
  step: number;
  formatValue?: (value: number) => string;
}

function StylePannelSlider({ title, path, min, max, step, formatValue }: StylePannelSliderProps) {
  const { value, onValueChange } = useSharedStyle(path);

  const clampedValue = useMemo(() => {
    const parsedValue = typeof value === 'number' ? value : Number(value);
    return Math.min(max, Math.max(min, parsedValue));
  }, [value, min, max]);

  return (
    <StylePannelGroup>
      <div className="flex items-center justify-between">
        <p>{title}</p>
        <span className="text-muted-foreground">
          {formatValue ? formatValue(clampedValue) : clampedValue.toString()}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[clampedValue]}
        onValueChange={([value]) => onValueChange(value)}
        className="w-full"
      />
    </StylePannelGroup>
  );
}

const StylePannelGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-2">{children}</div>;
};
