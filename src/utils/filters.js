/**
 * Pure filter/selector functions for derived state.
 * These never mutate the master tasks array — they derive a new filtered/sorted array.
 */

/**
 * Returns tasks belonging to a specific column.
 * @param {Task[]} tasks - The master tasks array
 * @param {string} columnId - 'todo' | 'in-progress' | 'done'
 * @returns {Task[]}
 */
export function getTasksForColumn(tasks, columnId) {
  return tasks.filter((task) => task.column === columnId);
}

/**
 * Applies conjunctive (AND) filters to the task list.
 * All provided filters must match for a task to be included.
 * @param {Task[]} tasks - The master tasks array
 * @param {{ searchQuery: string, priority: string|null, assignee: string|null }} filters
 * @returns {Task[]} The filtered array (derived, non-mutating)
 */
export function getFilteredTasks(tasks, filters) {
  return tasks.filter((task) => {
    const matchesSearch = filters.searchQuery
      ? task.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
      : true;
    const matchesPriority = filters.priority ? task.priority === filters.priority : true;
    const matchesAssignee = filters.assignee ? task.assignee === filters.assignee : true;
    return matchesSearch && matchesPriority && matchesAssignee;
  });
}

/**
 * Returns a sorted copy of the tasks array.
 * Leaves the original array untouched.
 * @param {Task[]} tasks
 * @param {{ key: string, direction: 'asc'|'desc' }} sort
 * @returns {Task[]}
 */
export function getSortedTasks(tasks, sort) {
  if (!sort.key) return [...tasks];
  return [...tasks].sort((a, b) => {
    let aVal = a[sort.key];
    let bVal = b[sort.key];

    // Priority ordering
    if (sort.key === 'priority') {
      const order = { Low: 1, Medium: 2, High: 3 };
      aVal = order[aVal] ?? 0;
      bVal = order[bVal] ?? 0;
    }

    // Date comparison
    if (sort.key === 'dueDate') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Extracts unique assignee names from the task list for populating the filter dropdown.
 * @param {Task[]} tasks
 * @returns {string[]}
 */
export function getUniqueAssignees(tasks) {
  const names = tasks.map((t) => t.assignee).filter(Boolean);
  return [...new Set(names)].sort();
}
