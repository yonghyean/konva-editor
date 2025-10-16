import { useEffect } from "react";
import { Editor } from "./editor";
import { useEditor, useEditorStore } from "./hooks/useEditor";
import { useEditorState } from "./hooks/useEditorState";
import { enablePatches } from "immer";
import { StylePannel, Toolbar } from "./components/toolbar";

enablePatches();

function App() {
  const setEditor = useEditorStore((state) => state.setEditor);

  useEffect(() => {
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
    <div className="App">
      <div
        id="canvas-container"
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "#f0f0f0",
        }}
      ></div>
      <div className="absolute flex left-0 right-0 mx-auto top-3 items-center justify-center">
        <Toolbar />
      </div>
      <div className="absolute flex right-3 top-3 items-center justify-center">
        <StylePannel />
      </div>
    </div>
  );
}

const ToolButton = ({ toolName }: { toolName: string }) => {
  const { current: currentTool } = useEditorState((state) => state.tool);
  const update = useEditorState((state) => state.update);
  const handleClick = () => {
    update("tool.current", toolName);
  };
  return (
    <button
      onClick={handleClick}
      style={{
        marginRight: 10,
        padding: "8px 16px",
        fontSize: 16,
        cursor: "pointer",
        backgroundColor: currentTool === toolName ? "#007bff" : "#e0e0e0",
        color: currentTool === toolName ? "#fff" : "#000",
        border: "none",
        borderRadius: 4,
      }}
    >
      {toolName}
    </button>
  );
};

const UndoButton = () => {
  const editor = useEditor();

  return (
    <button
      style={{
        marginRight: 10,
        padding: "8px 16px",
        fontSize: 16,
        cursor: "pointer",
        border: "none",
        borderRadius: 4,
      }}
      onClick={() => editor?.hisotryManager.undo()}
    >
      undo
    </button>
  );
};

const RedoButton = () => {
  const editor = useEditor();

  return (
    <button
      style={{
        marginRight: 10,
        padding: "8px 16px",
        fontSize: 16,
        cursor: "pointer",
        border: "none",
        borderRadius: 4,
      }}
      onClick={() => editor?.hisotryManager.redo()}
    >
      redo
    </button>
  );
};

export default App;
