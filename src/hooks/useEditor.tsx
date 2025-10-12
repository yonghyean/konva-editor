import { create } from "zustand";
import type { Editor } from "../editor";

type EditorStore = {
  editor: Editor | null;
  setEditor: (editor: Editor) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
}));

export const useEditor = () => useEditorStore((state) => state.editor);
