/**
 * App.jsx — Root Component
 *
 * Wires together:
 * - TaskProvider (global state)
 * - Header (brand, Add Task button, View Toggle)
 * - Stats bar (task counts per column)
 * - FilterBar (search, priority, assignee)
 * - Main view (KanbanBoard or TableView)
 * - TaskModal (create/edit dialog)
 * - ToastContainer (transient notifications)
 *
 * Data is initialized from localStorage on first render via useEffect.
 * Seed data is loaded only if localStorage is empty.
 */

import { useEffect, useMemo } from 'react';
import { TaskProvider, useTaskStore } from './store/TaskContext';
import { storage, STORAGE_KEY } from './utils/storage';
import { seedTasks } from './store/seedData';
import { getFilteredTasks } from './utils/filters';
import KanbanBoard from './components/kanban/KanbanBoard';
import TableView from './components/table/TableView';
import TaskModal from './components/forms/TaskModal';
import FilterBar from './components/common/FilterBar';
import ToastContainer from './components/common/ToastContainer';
import './styles/global.css';
import './styles/components.css';

// ── Inner App (needs to be inside TaskProvider to use the store) ───────────────

function AppContent() {
  const { state, initTasks, openModal, setView } = useTaskStore();
  const { tasks, view } = state;

  // ── Hydrate from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    const persisted = storage.load(STORAGE_KEY, null);
    if (persisted && Array.isArray(persisted) && persisted.length > 0) {
      initTasks(persisted);
    } else {
      // First-time load: use seed data for a rich demo experience
      initTasks(seedTasks);
      storage.save(STORAGE_KEY, seedTasks);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.column === 'todo').length,
    inProgress: tasks.filter((t) => t.column === 'in-progress').length,
    done: tasks.filter((t) => t.column === 'done').length,
  }), [tasks]);

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">⚡</div>
          <div>
            <div className="header-title">TaskFlow</div>
            <div className="header-subtitle">Interactive Task Management</div>
          </div>
        </div>

        <div className="header-actions">
          {/* View Toggle */}
          <div
            className="view-toggle"
            role="group"
            aria-label="Switch between views"
            data-testid="view-toggle"
          >
            <button
              className={`view-toggle-btn${view === 'kanban' ? ' active' : ''}`}
              onClick={() => setView('kanban')}
              aria-pressed={view === 'kanban'}
              aria-label="Kanban board view"
            >
              ▦ Kanban
            </button>
            <button
              className={`view-toggle-btn${view === 'table' ? ' active' : ''}`}
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              aria-label="Table view"
            >
              ≡ Table
            </button>
          </div>

          {/* Add Task Button */}
          <button
            className="btn btn-primary"
            onClick={() => openModal()}
            data-testid="add-task-btn"
            aria-label="Add new task"
          >
            ➕ Add Task
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="main-content" id="main-content">

        {/* Stats Bar */}
        <div className="stats-bar" role="region" aria-label="Task statistics">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {stats.todo}
            </span>
            <span className="stat-label">To Do</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {stats.inProgress}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {stats.done}
            </span>
            <span className="stat-label">Done</span>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar />

        {/* Active View */}
        {view === 'kanban' ? <KanbanBoard /> : <TableView />}
      </main>

      {/* ── Global Overlays ─────────────────────────────────────────────────── */}
      <TaskModal />
      <ToastContainer />
    </div>
  );
}

// ── Root App (wraps with Provider) ─────────────────────────────────────────────
export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
