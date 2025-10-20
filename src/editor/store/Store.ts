import { get as _get, set as _set } from "lodash-es";
import type { EditorState } from "../state";

type Listener = (value: any, prevValue: any) => void;

const defaultInitialState: EditorState = {
  camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
  selection: { ids: [] },
  shapes: [],
  tool: { current: "select", locked: false, mode: "idle" },
  style: {
    strokeColor: "#000000",
    fillColor: "#ffffff00",
    strokeWidth: 2,
    opacity: 1,
  },
  canUndo: false,
  canRedo: false,
};

export class Store {
  private state: EditorState;
  private listeners: Map<string, Set<Listener>> = new Map();

  constructor(initialState: EditorState = defaultInitialState) {
    this.state = initialState
  }
  
  // path 기반 getter
  get(path: string): any {
    return _get(this.state, path);
  }

  // path 기반 setter (변경 시 해당 path의 리스너 실행)
  set(path: string, value: any): void {
    const prevValue = this.get(path);

    this.state = _set(this.state, path, value);

    // path에 등록된 리스너 실행
    const pathListeners = this.listeners.get(path);
    if (pathListeners) {
      pathListeners.forEach((listener) => {
        listener(value, prevValue);
      });
    }
  }

  // 전체 state getter
  getState(): EditorState {
    return this.state;
  }

  // 전체 state setter
  setState(next: EditorState | ((prev: EditorState) => EditorState)): void {
    const prevState = this.state;

    if (typeof next === "function") {
      this.state = next(prevState);
    } else {
      this.state = { ...prevState, ...next };
    }

    // 전체 변경 리스너 실행 (path: '')
    const rootListeners = this.listeners.get("");
    if (rootListeners) {
      rootListeners.forEach((listener) => {
        listener(this.state, prevState);
      });
    }
  }

  // 스냅샷 생성 (run에서 사용)
  snapshot(): EditorState {
    return structuredClone(this.state);
  }

  // path 기반 구독
  listen(path: string, listener: Listener): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path)!.add(listener);

    // unsubscribe 함수 반환
    return () => {
      const pathListeners = this.listeners.get(path);
      if (pathListeners) {
        pathListeners.delete(listener);
        if (pathListeners.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
  }

  // 모든 리스너 제거
  clearListeners(): void {
    this.listeners.clear();
  }
}
