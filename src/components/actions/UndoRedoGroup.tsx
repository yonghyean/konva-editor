import { ActionButton } from "./ActionButton";
import { useEditorState } from "@/hooks/useEditorState";

export function UndoRedoGroup() {
  return (
    <div className="flex">
      <UndoButton />
      <RedoButton />
    </div>
  );
}

function UndoButton() {
  const canUndo = useEditorState((state) => state.canUndo);

  return <ActionButton actionId="undo" disabled={!canUndo} />;
}

function RedoButton() {
  const canRedo = useEditorState((state) => state.canRedo);

  return <ActionButton actionId="redo" disabled={!canRedo} />;
}
