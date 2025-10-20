import { StyleProvider, useStyles } from "@/hooks/useStyles";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { STYLES } from "@/constants/styles";


export function StylePannel() {
  // const currentStyle = useEditorState((state) => state.style);

  return (
    <StyleProvider>
      <div className="flex flex-col gap-3 shadow-xs bg-background border rounded-lg p-3 w-52 text-sm">
        <div className="flex flex-col gap-1">
          {/* <StylePannelColoricker
            title="선 색상"
            items={STYLES.color}
            value={currentStyle.strokeColor} */}
          {/* /> */}
        </div>
      </div>
    </StyleProvider>
  );
}

interface StylePannelColorickerProps {
  title: string;
  items: Array<{ value: string }>;
  value: string;
}
function StylePannelColoricker({
  title,
  value,
  items,
}: StylePannelColorickerProps) {
  const { onValueChange } = useStyles();

  return (
    <div className="flex flex-col gap-1">
      <p>{title}</p>
      <div className="flex gap-1 flex-wrap">
        <ToggleGroup
          type="single"
          className="grid grid-cols-5"
          value={value}
          onValueChange={onValueChange}
        >
          {items.map((color) => (
            <ToggleGroupItem key={color.value} value={color.value}>
              <span
                className="size-5 rounded-full"
                style={{ background: color.value }}
              ></span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
