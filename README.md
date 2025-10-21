## 🧩 Editor 아키텍처 설계 구조입니다.

현재 Editor의 상태 관리와 트랜잭션 흐름을 **Store 중심의 계층형 구조**로 재정비했습니다.  
각 계층의 책임과 관계를 명확히 구분하여, **UI와 내부 로직의 결합을 제거하고**,  
도형 관리, 이력, 트랜잭션이 독립적으로 동작할 수 있는 구조를 만들었습니다.

---

### 🔷 전체 구조 개요

```
Editor (src/editor)
 ├── index.ts           # Editor 퍼사드 (canvas + managers + store)
 ├── canvas/            # Konva Stage/Layer 래퍼 (Canvas)
 ├── store/             # Store 클래스 (path 기반 상태 컨테이너)
 ├── state/             # EditorState 타입 정의
 ├── managers/          # 도메인 매니저 (Shape/History/Transaction/Tool)
 │   ├── ShapeManager.ts
 │   ├── HistoryManager.ts
 │   ├── TransactionManager.ts
 │   └── ToolManager.ts
 └── tools/             # Brush, Eraser, Select 등 사용자 입력 툴
```

---

### 🧱 Store

- **Editor의 내부 상태를 단일 진입점으로 관리**하는 핵심 계층입니다.
- 매니저와 툴은 Editor가 들고 있는 Store를 통해 상태를 조회·변경하고,  
  UI 레이어와는 필요한 시점에만 동기화합니다.
- Store는 `EditorState` 전체를 보관하며, path 기반 `get/set` API와 스냅샷 기능을 제공합니다.

```ts
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
  get(path: string): any;
  set(path: string, value: any): void;
  getState(): EditorState;
  setState(next: EditorState | ((prev: EditorState) => EditorState)): void;
  snapshot(): EditorState;
}
```

---

### ⚙️ Editor

- Editor는 **Canvas, Store, Managers를 통합 제어하는 퍼사드(Facade)** 역할을 합니다.
- Konva Stage 이벤트는 `ToolManager`가 받아 툴에 위임하고, 상태 변경은 `Store`를 중심으로 히스토리에 기록됩니다.
- 외부에서는 Editor를 통해 도형 생성/수정, 히스토리 제어, 트랜잭션 실행, 툴 전환 등을 수행합니다.

```ts
export class Editor {
  canvas: Canvas;
  store: Store;

  shapeManager: ShapeManager;
  toolManager: ToolManager;
  historyManager: HistoryManager;
  transactionManager: TransactionManager;

  run<T>(fn: () => T): T;
  createShape(shape: Omit<Shape, "id">): string;
  updateShape(shape: Partial<Shape> & { id: string }): void;
  setCurrentTool(tool: string): void;
  undo(): void;
  redo(): void;
  startTransaction(): void;
  commitTransaction(): void;
  cancelTransaction(): void;
}
```

---

### 🧩 Managers

각 매니저는 Editor 내부의 독립된 기능 단위를 담당합니다.  
모두 Editor 인스턴스를 주입받아 Store, Canvas, 다른 매니저에 간접 접근하며 필요한 책임만 수행합니다.

| 매니저                 | 주요 역할                                                       |
| ---------------------- | --------------------------------------------------------------- |
| **ShapeManager**       | Konva.Shape를 생성·삭제·업데이트하고, shape id ↔ node 매핑 관리 |
| **HistoryManager**     | 실행 기록 저장 및 undo/redo 기능 제공                           |
| **TransactionManager** | 여러 변경을 하나의 트랜잭션 단위로 묶고 히스토리 기록을 트리거  |
| **ToolManager**        | Stage 이벤트를 받아 현재 툴에 전달하고 툴 수명주기를 관리       |

#### 예시 구조

```ts
class ShapeManager {
  private shapeNodeMap = new Map<string, Konva.Node>()

  createShape(data: ShapeData) { ... }
  updateShape(id: string, attrs: ShapeAttributes) { ... }
  deleteShape(id: string) { ... }
}
```

---

### 🧮 Transaction 흐름

`TransactionManager`는 상태 변경을 명시적으로 감싸서  
히스토리 기록을 **“의도 단위”**로 관리할 수 있게 합니다. `Editor.run` 역시 내부적으로 트랜잭션을 열어 여러 API 호출을 묶어 줍니다.

```
BrushTool 사용 시
 → editor.startTransaction()
 → editor.createShape()
 → editor.updateShape()
 → editor.commitTransaction() → HistoryManager.record()
```

이로써 도형 생성 과정 전체가 하나의 트랜잭션으로 기록되어  
불필요한 undo 스택 증가가 사라집니다.

---

### 🎨 Canvas

- Konva Stage와 Layer를 관리하는 렌더링 계층입니다.
- `Canvas` 클래스가 Stage, 기본 Layer, 상위 Layer를 생성하고 Editor에 노출합니다.
- `ShapeManager`에서 생성된 Node를 받아 Layer에 추가하거나 제거합니다.
- Store는 직렬화 가능한 데이터만 유지하며,  
  Konva.Node는 메모리 내에서만 관리되어 런타임 성능을 보장합니다.

---

### 🛠 Tools (예: BrushTool, EraserTool)

- 사용자 입력을 처리하고, 내부적으로는 `TransactionManager`와 `ShapeManager`를 사용합니다.
- Tool 자체는 Store를 직접 수정하지 않으며, Editor를 통해 모든 작업을 요청합니다.

```ts
class BrushTool extends BaseTool {
  onPointerDown() {
    this.editor.startTransaction();
    this.lineId = this.editor.createShape({ /* 스타일 + 초기 포인트 */ });
  }

  onPointerMove() {
    if (!this.lineId) return;
    this.editor.updateShape({ id: this.lineId, points: /* 새 좌표 */ });
  }

  onPointerUp() {
    this.editor.commitTransaction();
    this.lineId = null;
  }
}
```

`ToolManager`가 Konva Stage 이벤트를 받아 현재 툴의 핸들러(`onPointerDown`, `onPointerMove` 등)를 호출하고, 툴 전환 시 `onEnter`/`onExit` 수명주기를 관리합니다.

---

### 📈 설계 효과

| 목표              | 달성 내용                                                     |
| ----------------- | ------------------------------------------------------------- |
| UI와 Editor 분리  | UI 훅 제거, 내부 Store 중심 구조 확립                         |
| 일관된 상태 관리  | 모든 변경은 Store → Manager → Renderer 단일 경로로 처리       |
| 트랜잭션 제어     | 브러시 등 연속 이벤트를 하나의 이력으로 묶어 Undo/Redo 안정화 |
| 성능 및 구조 개선 | Konva Node 참조 O(1), 불필요한 구독 제거, 유지보수성 향상     |

---

### 🧠 요약

> Editor는 Store를 중심으로 Managers를 조정하고,  
> Managers는 각 기능(도형, 이력, 트랜잭션)을 분리된 책임으로 수행합니다.
>
> 이 구조를 통해 **Editor 내부의 상태 일관성과 UI 독립성**,  
> **Undo/Redo 안정성**, **Konva 렌더링 효율성**을 모두 확보했습니다.
