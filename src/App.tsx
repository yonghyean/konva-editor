import { useEffect } from "react";
import "./App.css";
import { Editor } from "./editor";
import { useEditor, useEditorStore } from "./hooks/useEditor";
import { useShallow } from "zustand/shallow";
import { useEditorState } from "./hooks/useEditorState";
import { applyPatches, enablePatches } from "immer";

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
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}>
        <ToolButton toolName="select" />
        <ToolButton toolName="brush" />
        <ToolButton toolName="eraser" />
        <UndoButton />
      </div>
    </div>
  );
}

const ToolButton = ({ toolName }: { toolName: string }) => {
  const { currentTool, setCurrentTool } = useEditorState(
    useShallow((state) => ({
      currentTool: state.currentTool,
      setCurrentTool: state.setCurrentTool,
    }))
  );

  const handleClick = () => {
    setCurrentTool(toolName);
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
  const state = useEditorState(
    useShallow((state) => ({ currentTool: state.currentTool }))
  );

  const handleClick = () => {
    const inversePatches = editor?.hisotryManager.undo();
    if (inversePatches) {
      useEditorState.setState(applyPatches(state, inversePatches));
    }
  };

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
      onClick={handleClick}
    >
      undo
    </button>
  );
};

export default App;
