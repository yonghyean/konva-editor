import { ActionButton } from "./ActionButton";

export function UndoRedoGroup() {
  return (
    <div className="flex">
      <ActionButton actionId="undo" />
      <ActionButton actionId="redo" />
    </div>
  );
}
