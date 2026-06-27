/**
 * TableView component.
 *
 * A sortable tabular alternative to the Kanban board.
 * Consumes the same filtered state as the Kanban board (same derived data source),
 * ensuring perfect synchronization between views.
 *
 * Features:
 * - Clickable sortable headers (Priority, Due Date) with ascending/descending toggle
 * - Visual sort indicator (arrow icons)
 * - Edit and Delete actions per row
 */

import { useState, useMemo } from 'react';
import { useTaskStore } from '../../store/TaskContext';
import { getFilteredTasks, getSortedTasks } from '../../utils/filters';

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

function SortIcon({ direction }) {
  if (!direction) return <span className="sort-icon" aria-hidden="true" style={{ opacity: 0.3 }}>↕</span>;
  return <span className="sort-icon" aria-hidden="true">{direction === 'asc' ? '↑' : '↓'}</span>;
}

export default function TableView() {
  const { state, openModal, deleteTask, addToast } = useTaskStore();

  // Sort state — key: field name, direction: 'asc' | 'desc' | null
  const [sort, setSort] = useState({ key: null, direction: null });

  // Apply filters (same derivation as Kanban), then sort for table display
  const filteredTasks = useMemo(
    () => getFilteredTasks(state.tasks, state.filters),
    [state.tasks, state.filters]
  );
  const sortedTasks = useMemo(
    () => getSortedTasks(filteredTasks, sort),
    [filteredTasks, sort]
  );

  function handleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: null }; // Third click clears sort
    });
  }

  function handleDelete(task) {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      deleteTask(task.id);
      addToast(`Task "${task.title}" deleted.`, 'error');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return dateStr; }
  }

  return (
    <div className="table-wrap" role="region" aria-label="Task table view">
      <table className="tasks-table" aria-label="Tasks">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th
              scope="col"
              className={`sortable${sort.key === 'priority' ? ' sorted' : ''}`}
              onClick={() => handleSort('priority')}
              aria-sort={sort.key === 'priority' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSort('priority')}
            >
              Priority <SortIcon direction={sort.key === 'priority' ? sort.direction : null} />
            </th>
            <th scope="col">Assignee</th>
            <th
              scope="col"
              className={`sortable${sort.key === 'dueDate' ? ' sorted' : ''}`}
              onClick={() => handleSort('dueDate')}
              aria-sort={sort.key === 'dueDate' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSort('dueDate')}
            >
              Due Date <SortIcon direction={sort.key === 'dueDate' ? sort.direction : null} />
            </th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.length === 0 ? (
            <tr>
              <td className="table-empty" colSpan={7}>
                No tasks match the current filters.
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <tr key={task.id} data-task-id={task.id}>
                <td className="table-title">{task.title}</td>
                <td>
                  <span className="table-desc" title={task.description}>
                    {task.description || <em style={{ color: 'var(--text-muted)' }}>No description</em>}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                </td>
                <td>{task.assignee || '—'}</td>
                <td>{formatDate(task.dueDate)}</td>
                <td>
                  <span className={`table-status ${task.column}`}>
                    {STATUS_LABELS[task.column] ?? task.column}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="task-action-btn edit"
                      onClick={() => openModal(task.id)}
                      aria-label={`Edit task: ${task.title}`}
                      data-testid={`edit-task-btn-${task.id}`}
                      title="Edit"
                    >
                      ✏
                    </button>
                    <button
                      className="task-action-btn delete"
                      onClick={() => handleDelete(task)}
                      aria-label={`Delete task: ${task.title}`}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
