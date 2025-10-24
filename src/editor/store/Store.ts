import { get as _get, set as _set } from 'lodash-es';
import type { EditorState } from '../state';

export type PropertyPath<T extends Record<string, unknown>> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown> ? K | `${K}.${PropertyPath<T[K]>}` : K;
}[keyof T & string];

export type PathValue<
  T extends Record<string, unknown>,
  U extends PropertyPath<T>,
> = U extends `${infer TProperty}.${infer TRestPropertyPath}`
  ? T[TProperty] extends Record<string, unknown>
    ? PathValue<T[TProperty], TRestPropertyPath>
    : never // T[TProperty]는 항상 Record<string, unknown>에 할당 가능하기 때문에 never에 도달하는 경우는 없습니다.
  : T[U];

/**
 * path 기반 리스너 타입, path에 등록된 값이 변경된 경우 리스너 실행
 * @param value 변경된 값
 */
type Listener<T = any> = (value: T) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

const defaultInitialState: EditorState = {
  camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
  selection: { ids: [] },
  shapes: {},
  tool: { current: 'select', locked: false, mode: 'idle' },
  style: {
    strokeColor: '#000000',
    fillColor: '#ffffff00',
    strokeWidth: 2,
    opacity: 1,
  },
  transformer: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
  canUndo: false,
  canRedo: false,
};

export type StorePath = PropertyPath<EditorState>;
export type StoreValue<T extends StorePath> = PathValue<EditorState, T>;

export class Store<
  TState extends EditorState = EditorState,
  TPath extends PropertyPath<TState> = PropertyPath<TState>,
> {
  private state: TState;
  private listeners: Map<TPath, Set<Listener>> = new Map();

  constructor(initialState?: Partial<TState>) {
    this.state = { ...defaultInitialState, ...initialState } as TState;
    console.log('Store constructor', this.state);
  }

  // path 기반 getter
  get(): TState;
  get<T extends TPath>(path: T): PathValue<TState, T>;
  get<T extends TPath>(path?: T): PathValue<TState, T> | TState {
    if (!path) return this.state;
    return _get(this.state, path) as PathValue<TState, T>;
  }

  // path 기반 setter (변경 시 해당 path의 리스너 실행)
  set(path: TPath, value?: PathValue<TState, TPath>): void {
    this.state = _set(this.state, path, value);

    if (!value) {
      this.listeners.delete(path);
    }
  }

  // 스냅샷 생성 (run에서 사용)
  snapshot(): Readonly<TState> {
    return Object.freeze(structuredClone(this.state));
  }

  /**
   * path 기반 리스너 등록, path를 통해 구독한 값이 변경된 경우 리스너 실행
   * @param path 'root' 또는 '.'로 구분된 path
   * @param listener
   * @returns 리스너 제거 함수
   */
  listen<T extends TPath>(path: T, listener: Listener<PathValue<TState, T>>): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path)!.add(listener);

    // unsubscribe 함수 반환
    return () => {
      this.listeners.get(path)!.delete(listener);
      if (this.listeners.get(path)!.size === 0) {
        this.listeners.delete(path);
      }
    };
  }

  /**
   * path 기반 값 실행, path에 등록된 모든 리스너 실행
   * @param path 실행할 path
   * @param value 실행할 값
   */
  emit<T extends TPath>(path: T): void {
    // path의 상위 path에 등록된 리스너 실행
    this.listeners.forEach((listeners, parentPath) => {
      // path가 parentPath의 하위 path인 경우 리스너 실행
      if (path.startsWith(parentPath)) {
        listeners.forEach((listener) => {
          // 변경된 값을 리스너에 전달
          listener(this.get(parentPath));
        });
      }

      // parentPath가 path의 상위 path인 경우 리스너 실행
      if (parentPath.startsWith(path)) {
        listeners.forEach((listener) => {
          // 변경된 값을 리스너에 전달
          listener(this.get(path));
        });
      }
    });
  }

  // 모든 리스너 제거
  clearListeners(): void {
    this.listeners.clear();
  }
}
