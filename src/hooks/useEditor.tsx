import { create } from "zustand";
import type { Editor } from "../editor";
import type { State } from "../editor/managers/StateManager";

type EditorStore = {
  editor: Editor | null;
  setEditor: (editor: Editor) => void;
  currentTool: string;
  setCurrentTool: (tool: string) => void;
  // strokeColor: string;
  // setStrokeColor: (color: string) => void;
  // strokeWidth: number;
  // setStrokeWidth: (width: number) => void;
  // fillColor: string;
  // setFillColor: (color: string) => void;
  // mode: Mode;
  // setMode: (mode: Mode) => void;
} & State;

export const useEditorStore = create<EditorStore>((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),

  currentTool: "brush",
  setCurrentTool: (tool: string) => set({ currentTool: tool }),

  strokeColor: "#000000",
  setStrokeColor: (color: string) => set({ strokeColor: color }),

  strokeWidth: 2,
  setStrokeWidth: (width: number) => set({ strokeWidth: width }),

  fillColor: "",
  setFillColor: (color: string) => set({ fillColor: color }),

  mode: "idle",

  cursor: "default",
  // setMode: (mode: Mode) => set({ mode }),
}));

export const useEditor = () => useEditorStore((state) => state.editor);

useEditorStore.subscribe((state) => {
  const editor = state.editor;
  if (editor) {
    console.log("editor state changed", state);
    // sync editor properties with store
    editor.stateManager.currentTool = state.currentTool;
    editor.stateManager.strokeColor = state.strokeColor;
    editor.stateManager.strokeWidth = state.strokeWidth;
    editor.stateManager.fillColor = state.fillColor;
    editor.stateManager.mode = state.mode;
  }
});

// export const useStylePannel = () =>
//   useEditorStore((state) => ({
//     strokeColor: state.strokeColor,
//     setStrokeColor: state.setStrokeColor,
//     strokeWidth: state.strokeWidth,
//     setStrokeWidth: state.setStrokeWidth,
//     fillColor: state.fillColor,
//     setFillColor: state.setFillColor,
//   }));

// export const useToolbar = () =>
//   useEditorStore((state) => ({
//     currentTool: state.currentTool,
//     setCurrentTool: state.setCurrentTool,
//   }));
