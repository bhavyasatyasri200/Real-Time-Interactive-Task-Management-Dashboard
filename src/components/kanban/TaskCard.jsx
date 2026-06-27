/**
 * TaskCard component.
 *
 * Responsibilities:
 * - Displays task data (title, description snippet, priority badge, assignee, due date)
 * - Provides Edit and Delete action buttons
 * - Implements native HTML5 drag-and-drop (draggable="true")
 * - Provides a keyboard-accessible "Move" context menu for WCAG compliance
 */

import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../../store/TaskContext';

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: '○' },
  { id: 'in-progress', label: 'In Progress', icon: '◑' },
  { id: 'done', label: 'Done', icon: '●' },
];

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function TaskCard({ task, onDragStart, onDragEnd }) {
  const { openModal, deleteTask, moveTask, addToast } = useTaskStore();
  const [isDragging, setIsDragging] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const moveMenuRef = useRef(null);

  // Close move menu on outside click
  useEffect(() => {
    if (!showMoveMenu) return;
    function handleClick(e) {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target)) {
        setShowMoveMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMoveMenu]);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function handleDragStart(e) {
    // Store task ID in dataTransfer for retrieval in the drop handler
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    onDragStart?.(task.id);
  }

  function handleDragEnd() {
    setIsDragging(false);
    onDragEnd?.();
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function handleEdit(e) {
    e.stopPropagation();
    openModal(task.id);
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      deleteTask(task.id);
      addToast(`Task "${task.title}" deleted.`, 'error');
    }
  }

  function handleMove(targetColumn) {
    if (task.column === targetColumn) return;
    const colLabel = COLUMNS.find((c) => c.id === targetColumn)?.label ?? targetColumn;
    moveTask(task.id, targetColumn);
    addToast(`"${task.title}" moved to ${colLabel}.`, 'info');
    setShowMoveMenu(false);
  }

  const overdueFlag = isOverdue(task.dueDate) && task.column !== 'done';

  return (
    <div
      className={`task-card${isDragging ? ' dragging' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      tabIndex={0}
      role="listitem"
      aria-label={`Task: ${task.title}, Priority: ${task.priority}, Status: ${task.column}`}
      data-task-id={task.id}
    >
      {/* Card Header: title + action buttons */}
      <div className="task-card-header">
        <span className="task-card-title">{task.title}</span>
        <div className="task-card-actions">
          {/* Move menu (keyboard-accessible alternative to drag-and-drop) */}
          <div className="move-menu-wrap" ref={moveMenuRef}>
            <button
              className="task-action-btn edit"
              onClick={(e) => { e.stopPropagation(); setShowMoveMenu((v) => !v); }}
              aria-label="Move task to column"
              aria-expanded={showMoveMenu}
              aria-haspopup="menu"
              title="Move task"
            >
              <MoveIcon />
            </button>
            {showMoveMenu && (
              <div className="move-menu" role="menu" aria-label="Move task">
                <div className="move-menu-label">Move to</div>
                {COLUMNS.filter((c) => c.id !== task.column).map((col) => (
                  <button
                    key={col.id}
                    className="move-menu-item"
                    role="menuitem"
                    onClick={(e) => { e.stopPropagation(); handleMove(col.id); }}
                  >
                    <span>{col.icon}</span>
                    {col.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit */}
          <button
            className="task-action-btn edit"
            onClick={handleEdit}
            aria-label={`Edit task: ${task.title}`}
            data-testid={`edit-task-btn-${task.id}`}
            title="Edit task"
          >
            <EditIcon />
          </button>

          {/* Delete */}
          <button
            className="task-action-btn delete"
            onClick={handleDelete}
            aria-label={`Delete task: ${task.title}`}
            title="Delete task"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      {/* Description snippet */}
      {task.description && (
        <p className="task-card-desc" title={task.description}>
          {task.description}
        </p>
      )}

      {/* Priority badge */}
      <span className={`priority-badge ${task.priority}`} aria-label={`Priority: ${task.priority}`}>
        {task.priority}
      </span>

      {/* Meta row: assignee + due date */}
      <div className="task-card-meta" style={{ marginTop: '8px' }}>
        {task.assignee && (
          <span className="task-meta-item">
            <UserIcon />
            {task.assignee}
          </span>
        )}
        {task.dueDate && (
          <span
            className="task-meta-item"
            style={overdueFlag ? { color: 'var(--priority-high-text)' } : undefined}
            title={overdueFlag ? 'Overdue' : undefined}
          >
            <CalendarIcon />
            {formatDate(task.dueDate)}
            {overdueFlag && ' ⚠'}
          </span>
        )}
      </div>
    </div>
  );
}
