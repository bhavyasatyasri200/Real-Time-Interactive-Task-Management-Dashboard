/**
 * KanbanColumn component.
 *
 * Responsibilities:
 * - Renders a vertical list of TaskCards for a given column ID
 * - Acts as a drop zone for native HTML5 drag-and-drop
 * - Provides visual feedback (drag-over highlight) via CSS class toggling
 */

import { useState, useCallback } from 'react';
import { useTaskStore } from '../../store/TaskContext';
import { getTasksForColumn, getFilteredTasks } from '../../utils/filters';
import TaskCard from './TaskCard';

const COLUMN_META = {
  todo: { label: 'To Do', testId: 'column-todo', className: 'todo' },
  'in-progress': { label: 'In Progress', testId: 'column-in-progress', className: 'in-progress' },
  done: { label: 'Done', testId: 'column-done', className: 'done' },
};

export default function KanbanColumn({ columnId }) {
  const { state, moveTask, addToast } = useTaskStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  const meta = COLUMN_META[columnId];

  // Apply filters to get the visible tasks for this specific column
  const allFiltered = getFilteredTasks(state.tasks, state.filters);
  const columnTasks = getTasksForColumn(allFiltered, columnId);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────

  function handleDragOver(e) {
    // MUST call preventDefault to designate this element as a valid drop zone
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    // Only clear when leaving the column entirely, not between child elements
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Find the task and only act if it's moving to a different column
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || task.column === columnId) return;

    moveTask(taskId, columnId);
    addToast(`"${task.title}" moved to ${meta.label}.`, 'success');
  }

  const handleDragStart = useCallback((id) => setDraggingId(id), []);
  const handleDragEnd = useCallback(() => setDraggingId(null), []);

  return (
    <div
      className={`kanban-column ${meta.className}${isDragOver ? ' drag-over' : ''}`}
      data-testid={meta.testId}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="list"
      aria-label={`${meta.label} column with ${columnTasks.length} tasks`}
      aria-dropeffect="move"
    >
      {/* Column Header */}
      <div className="column-header">
        <div className="column-title-wrap">
          <span className="column-dot" aria-hidden="true" />
          <h2 className="column-name">{meta.label}</h2>
        </div>
        <span className="column-count" aria-label={`${columnTasks.length} tasks`}>
          {columnTasks.length}
        </span>
      </div>

      {/* Column Body — scrollable task list */}
      <div className="column-body">
        {columnTasks.length === 0 ? (
          <div className="column-empty" aria-label="No tasks in this column">
            <span className="column-empty-icon" aria-hidden="true">
              {columnId === 'todo' ? '📋' : columnId === 'in-progress' ? '⚡' : '✅'}
            </span>
            {isDragOver ? 'Drop here' : 'No tasks here'}
          </div>
        ) : (
          columnTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}
