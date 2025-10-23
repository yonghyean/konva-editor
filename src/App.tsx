import { EditorProvider, useEditor } from "./hooks/useEditor";
import { Toolbar } from "./components/toolbar";
import { UndoRedoGroup } from "./components/actions/UndoRedoGroup";
import { ActionsProvider } from "./hooks/useActions";
import { StylePannel } from "./components/pannels/StylePannel";

function App() {
  return (
    <div className="App">
      <EditorProvider>
        <CanvasEditor />
      </EditorProvider>
    </div>
  );
}

function CanvasEditor() {
  const editor = useEditor();

  return (
    <div>
      {editor && (
        <>
          <ActionsProvider>
            <div className="absolute flex left-0 right-0 mx-auto top-3 items-center justify-center">
              <Toolbar />
            </div>
            <div className="absolute flex left-3 top-3 rounded-md items-center justify-center bg-background">
              <StylePannel />
            </div>
            <div className="absolute flex right-3 bottom-3 rounded-md items-center justify-center bg-background">
              <UndoRedoGroup />
            </div>
          </ActionsProvider>
        </>
      )}
    </div>
  );
}

export default App;
