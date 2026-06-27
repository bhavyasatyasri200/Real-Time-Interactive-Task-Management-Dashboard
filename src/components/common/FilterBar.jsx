/**
 * FilterBar component.
 *
 * Provides composite (AND) filtering above the board:
 * - Text search (title substring, case-insensitive)
 * - Priority dropdown
 * - Assignee dropdown (dynamically populated from all tasks)
 * - Clear Filters button
 */

import { useMemo } from 'react';
import { useTaskStore } from '../../store/TaskContext';
import { getUniqueAssignees, getFilteredTasks } from '../../utils/filters';

export default function FilterBar() {
  const { state, setFilter, clearFilters } = useTaskStore();
  const { filters, tasks } = state;

  // Unique assignees for the dropdown (derived from master task list)
  const assignees = useMemo(() => getUniqueAssignees(tasks), [tasks]);

  // Count of currently visible tasks after filtering
  const filteredCount = useMemo(
    () => getFilteredTasks(tasks, filters).length,
    [tasks, filters]
  );

  const hasActiveFilters =
    filters.searchQuery || filters.priority || filters.assignee;

  return (
    <div className="filter-bar" role="search" aria-label="Task filters">
      {/* Search Input */}
      <div className="filter-search-wrap">
        <span className="filter-search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          className="form-control"
          placeholder="Search tasks..."
          value={filters.searchQuery}
          onChange={(e) => setFilter('searchQuery', e.target.value)}
          data-testid="search-input"
          aria-label="Search tasks by title"
        />
      </div>

      {/* Priority Filter */}
      <select
        className="form-control filter-select"
        value={filters.priority}
        onChange={(e) => setFilter('priority', e.target.value)}
        data-testid="priority-filter"
        aria-label="Filter by priority"
      >
        <option value="">All Priorities</option>
        <option value="High">🔴 High</option>
        <option value="Medium">🟡 Medium</option>
        <option value="Low">🟢 Low</option>
      </select>

      {/* Assignee Filter */}
      <select
        className="form-control filter-select"
        value={filters.assignee}
        onChange={(e) => setFilter('assignee', e.target.value)}
        data-testid="assignee-filter"
        aria-label="Filter by assignee"
      >
        <option value="">All Assignees</option>
        {assignees.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {/* Clear Button */}
      {hasActiveFilters && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={clearFilters}
          aria-label="Clear all filters"
        >
          ✕ Clear
        </button>
      )}

      {/* Stats */}
      <span className="filter-stats" aria-live="polite" aria-atomic="true">
        {filteredCount} task{filteredCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
