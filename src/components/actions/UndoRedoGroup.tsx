import { ActionButton } from "./ActionButton";

export function UndoRedoGroup() {
  return (
    <div className="flex">
      <UndoButton />
      <RedoButton />
    </div>
  );
}

function UndoButton() {
  // const canUndo = useEditor().hisotryManager.canUndo();

  return <ActionButton actionId="undo" />;
}

function RedoButton() {
  // const canRedo = useEditor().hisotryManate.canRedo);

  return <ActionButton actionId="redo" />;
}
