# TaskFlow — Interactive Task Management Dashboard

A production-ready **Kanban-style task management SPA** built with React + JavaScript (Vite). Features native HTML5 drag-and-drop, real-time filtering, a sortable table view, localStorage persistence, and full WCAG accessibility support.

---

## 🚀 Quick Start (Docker — Recommended)

> Requires: Docker and Docker Compose installed.

```bash
git clone <your-repo-url>
cd Interactive_Task_Management
docker-compose up --build
```

Open your browser at **http://localhost:8080**

The healthcheck will automatically verify the server is responding. To stop:

```bash
docker-compose down
```

---

## 💻 Local Development (Node.js)

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
# → Open http://localhost:5173
```

---

## 🏗️ Architecture

### State Management

A single global store built with **React Context + useReducer** provides the single source of truth:

```
state = {
  tasks: Task[],      ← The ONLY persistent array (never split by column)
  filters: { searchQuery, priority, assignee },
  view: 'kanban' | 'table',
  ui: { isModalOpen, editingTaskId },
  toasts: Toast[]
}
```

**Key principle:** Column-specific task lists are *derived* from the master `tasks` array at render time using pure selector functions in `src/utils/filters.js`. This guarantees perfect synchronization between the Kanban board and table view.

### Component Architecture

```
src/
├── components/
│   ├── kanban/
│   │   ├── KanbanBoard.jsx    ← Grid layout wrapper
│   │   ├── KanbanColumn.jsx   ← Drop zone + task list
│   │   └── TaskCard.jsx       ← Draggable card with actions
│   ├── table/
│   │   └── TableView.jsx      ← Sortable data table
│   ├── forms/
│   │   └── TaskModal.jsx      ← Create/Edit modal with focus trap
│   └── common/
│       ├── FilterBar.jsx      ← Search + dropdowns
│       └── ToastContainer.jsx ← Notification stack
├── store/
│   ├── TaskContext.jsx        ← Global reducer + actions
│   └── seedData.js            ← Demo data for first launch
├── utils/
│   ├── filters.js             ← Pure selector/filter functions
│   ├── storage.js             ← localStorage wrappers
│   └── uuid.js                ← ID generator
└── styles/
    ├── global.css             ← Design tokens, resets, utilities
    └── components.css         ← Component-level styles + responsive
```

### Drag & Drop

Implemented using the **native HTML5 Drag and Drop API** (no third-party library):

| Event | Handler Location | Purpose |
|-------|-----------------|---------|
| `dragstart` | `TaskCard` | Stores task ID in `dataTransfer` |
| `dragover` | `KanbanColumn` | `preventDefault()` to allow drop |
| `dragenter` | `KanbanColumn` | Adds `drag-over` CSS class |
| `dragleave` | `KanbanColumn` | Removes `drag-over` CSS class |
| `drop` | `KanbanColumn` | Reads task ID, dispatches `MOVE_TASK` |
| `dragend` | `TaskCard` | Cleans up `dragging` CSS class |

### localStorage Persistence

Tasks are persisted to `localStorage` under the key `kanban_dashboard_tasks` on every state mutation (create, update, delete, move). On app initialization, the stored JSON is hydrated back into state. All operations use `try/catch` to gracefully handle corrupted data.

---

## ✨ Features

| Feature | Implementation |
|---------|---------------|
| Kanban Board | 3-column grid (todo, in-progress, done) |
| Drag & Drop | Native HTML5 DnD API with visual drop-zone feedback |
| CRUD Modal | Focus-trapped dialog; Esc/overlay dismissal |
| Filtering | Conjunctive AND search + priority + assignee |
| Table View | Sortable headers (Priority, Due Date, asc/desc) |
| Persistence | localStorage JSON (key: `kanban_dashboard_tasks`) |
| Toast Notifications | Auto-dismissing, 4-second stack |
| Accessibility | Focus trapping, aria-labels, keyboard Move menu |
| Responsive | Single-column Kanban on viewports < 768px |

---

## 🧪 Testing

### data-testid Attributes Reference

| Attribute | Element |
|-----------|---------|
| `data-testid="add-task-btn"` | Header "Add Task" button |
| `data-testid="column-todo"` | To Do column |
| `data-testid="column-in-progress"` | In Progress column |
| `data-testid="column-done"` | Done column |
| `data-testid="search-input"` | Search field in FilterBar |
| `data-testid="priority-filter"` | Priority dropdown |
| `data-testid="assignee-filter"` | Assignee dropdown |
| `data-testid="view-toggle"` | View toggle group |
| `data-testid="edit-task-btn-{id}"` | Edit button per task card |

### Running Unit Tests (Optional)

```bash
npm test
```

---

## 🐳 Docker Details

```
┌─────────────────────────────────────────┐
│  Stage 1: node:20-alpine (builder)      │
│  → npm ci && npm run build              │
│  → Output: /app/dist/                   │
└──────────────────┬──────────────────────┘
                   │ COPY /app/dist
┌──────────────────▼──────────────────────┐
│  Stage 2: nginx:alpine (production)     │
│  → Serves /usr/share/nginx/html         │
│  → Port 80 (mapped to host 8080)        │
│  → Healthcheck: wget localhost:80       │
└─────────────────────────────────────────┘
```


---

## 📋 Task Schema

```js
{
  id: string,           // UUID v4
  title: string,        // Required — primary display text
  description: string,  // Optional — multi-line detail
  priority: 'Low' | 'Medium' | 'High',
  assignee: string,
  dueDate: string,      // ISO 8601: YYYY-MM-DD
  column: 'todo' | 'in-progress' | 'done',
  createdAt: string     // ISO 8601 timestamp
}
```

---

## 📄 License

MIT
