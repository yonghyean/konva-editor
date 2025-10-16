import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { EditorState } from "../editor/state";
import { set as _set } from "lodash-es";

const initialEditorState: EditorState = {
  camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
  selection: { ids: [] },
  shapes: { entities: {}, selectedIds: [] },
  tool: { current: "select", locked: false, mode: "idle" },
  style: {
    strokeColor: "#000000",
    fillColor: "#ffffff00",
    strokeWidth: 2,
    opacity: 1,
  },
};

export const useEditorState = create<
  EditorState & {
    update: (path: string, value: any) => void;
  }
>()(
  immer((set) => ({
    ...initialEditorState,
    update: (path, value) => {
      set((state) => _set(state, path, value));
    },
  }))
);
