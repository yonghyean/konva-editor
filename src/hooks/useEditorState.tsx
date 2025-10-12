import { create } from "zustand";
import type { EditorState } from "../editor/managers/StateManager";
import { immer } from "zustand/middleware/immer";

interface Actions {
  setCurrentTool: (tool: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFillColor: (color: string) => void;
}

export const useEditorState = create<EditorState & Actions>()(
  immer((set) => ({
    currentTool: "brush",
    setCurrentTool: (tool: string) => {
      set({ currentTool: tool });
    },

    strokeColor: "#000000",
    setStrokeColor: (color: string) => set({ strokeColor: color }),

    strokeWidth: 2,
    setStrokeWidth: (width: number) => set({ strokeWidth: width }),

    fillColor: "",
    setFillColor: (color: string) => set({ fillColor: color }),

    mode: "idle",

    selection: [],

    cursor: "default",
  }))
);
