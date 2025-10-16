import { useLayoutEffect } from "react";
import { Editor } from "./editor";
import { useEditor, useEditorStore } from "./hooks/useEditor";
import { useEditorState } from "./hooks/useEditorState";
import { enablePatches } from "immer";
import { Toolbar } from "./components/toolbar";
import { UndoRedoGroup } from "./components/actions/UndoRedoGroup";
import { ActionsProvider } from "./hooks/useActions";

enablePatches();

function App() {
  return (
    <div className="App">
      <CanvasEditor />
    </div>
  );
}

function CanvasEditor() {
  const editor = useEditor();
  const setEditor = useEditorStore((state) => state.setEditor);

  useLayoutEffect(() => {
    const editor = new Editor({
      canvas: {
        containerId: "canvas-container",
        width: innerWidth,
        height: innerHeight,
      },
      store: useEditorState,
    });

    setEditor(editor);
  }, [setEditor]);

  return (
    <div>
      <div
        id="canvas-container"
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "#f0f0f0",
        }}
      ></div>
      {editor && (
        <>
          <div className="absolute flex left-0 right-0 mx-auto top-3 items-center justify-center">
            <Toolbar />
          </div>
          <ActionsProvider>
            <div className="absolute flex right-3 mx-auto bottom-3 rounded-md items-center justify-center bg-background">
              <UndoRedoGroup />
            </div>
          </ActionsProvider>
        </>
      )}
    </div>
  );
}

export default App;
