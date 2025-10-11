import { useEffect } from "react";
import "./App.css";
import { Editor } from "./editor";
import { useEditorStore } from "./hooks/useEditor";

function App() {
  const setEditor = useEditorStore((state) => state.setEditor);
  const setCurrentTool = useEditorStore((state) => state.setCurrentTool);

  useEffect(() => {
    const editor = new Editor({
      canvas: {
        containerId: "canvas-container",
        width: innerWidth,
        height: innerHeight,
      },
      store: useEditorStore.getState(),
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
        <button
          onClick={() => {
            setCurrentTool("brush");
          }}
        >
          Brush
        </button>
        <button
          onClick={() => {
            setCurrentTool("eraser");
          }}
        >
          Eraser
        </button>
      </div>
    </div>
  );
}

export default App;
