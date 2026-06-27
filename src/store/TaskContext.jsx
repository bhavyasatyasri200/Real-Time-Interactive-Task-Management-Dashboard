/**
 * Global State Store using React Context + useReducer.
 *
 * Architecture:
 * - Single source of truth: one `tasks` array in master state
 * - Derived state (filtered, sorted, column-specific) is computed via selectors in utils/filters.js
 * - localStorage is synchronized on every state mutation via the reducer
 *
 * Actions:
 *  INIT_TASKS        - Hydrate state from localStorage on app mount
 *  ADD_TASK          - Create a new task (assigned to 'todo' column by default)
 *  UPDATE_TASK       - Mutate an existing task by ID
 *  DELETE_TASK       - Remove a task from the master array
 *  MOVE_TASK         - Change a task's column (called from drag-and-drop drop handler)
 *  SET_FILTER        - Update a single filter field (searchQuery, priority, assignee)
 *  CLEAR_FILTERS     - Reset all filters to defaults
 *  SET_VIEW          - Switch between 'kanban' and 'table' views
 *  OPEN_MODAL        - Open the task creation/editing modal
 *  CLOSE_MODAL       - Close the modal and clear editing state
 *  ADD_TOAST         - Display a temporary toast notification
 *  REMOVE_TOAST      - Dismiss/remove a toast by ID
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import { storage, STORAGE_KEY } from '../utils/storage';
import { generateId } from '../utils/uuid';

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  tasks: [],           // Master list — single source of truth
  filters: {
    searchQuery: '',
    priority: '',
    assignee: '',
  },
  view: 'kanban',      // 'kanban' | 'table'
  ui: {
    isModalOpen: false,
    editingTaskId: null, // null = create mode, string = edit mode
  },
  toasts: [],          // Array of { id, message, type }
};

// ─── Reducer ───────────────────────────────────────────────────────────────────

function taskReducer(state, action) {
  let nextTasks;

  switch (action.type) {
    case 'INIT_TASKS': {
      return { ...state, tasks: action.payload };
    }

    case 'ADD_TASK': {
      const newTask = {
        id: generateId(),
        title: action.payload.title,
        description: action.payload.description || '',
        priority: action.payload.priority || 'Medium',
        assignee: action.payload.assignee || '',
        dueDate: action.payload.dueDate || '',
        column: 'todo',
        createdAt: new Date().toISOString(),
      };
      nextTasks = [...state.tasks, newTask];
      storage.save(STORAGE_KEY, nextTasks);
      return { ...state, tasks: nextTasks };
    }

    case 'UPDATE_TASK': {
      nextTasks = state.tasks.map((task) =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.updates }
          : task
      );
      storage.save(STORAGE_KEY, nextTasks);
      return { ...state, tasks: nextTasks };
    }

    case 'DELETE_TASK': {
      nextTasks = state.tasks.filter((task) => task.id !== action.payload.id);
      storage.save(STORAGE_KEY, nextTasks);
      return { ...state, tasks: nextTasks };
    }

    case 'MOVE_TASK': {
      nextTasks = state.tasks.map((task) =>
        task.id === action.payload.taskId
          ? { ...task, column: action.payload.targetColumn }
          : task
      );
      storage.save(STORAGE_KEY, nextTasks);
      return { ...state, tasks: nextTasks };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value },
      };
    }

    case 'CLEAR_FILTERS': {
      return {
        ...state,
        filters: { searchQuery: '', priority: '', assignee: '' },
      };
    }

    case 'SET_VIEW': {
      return { ...state, view: action.payload.view };
    }

    case 'OPEN_MODAL': {
      return {
        ...state,
        ui: { isModalOpen: true, editingTaskId: action.payload.taskId ?? null },
      };
    }

    case 'CLOSE_MODAL': {
      return {
        ...state,
        ui: { isModalOpen: false, editingTaskId: null },
      };
    }

    case 'ADD_TOAST': {
      const toast = {
        id: generateId(),
        message: action.payload.message,
        type: action.payload.type || 'success', // 'success' | 'info' | 'error'
      };
      return { ...state, toasts: [...state.toasts, toast] };
    }

    case 'REMOVE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };
    }

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

const TaskContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Action creators wrapped in useCallback for stable references
  const initTasks = useCallback((tasks) =>
    dispatch({ type: 'INIT_TASKS', payload: tasks }), []);

  const addTask = useCallback((taskData) =>
    dispatch({ type: 'ADD_TASK', payload: taskData }), []);

  const updateTask = useCallback((id, updates) =>
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } }), []);

  const deleteTask = useCallback((id) =>
    dispatch({ type: 'DELETE_TASK', payload: { id } }), []);

  const moveTask = useCallback((taskId, targetColumn) =>
    dispatch({ type: 'MOVE_TASK', payload: { taskId, targetColumn } }), []);

  const setFilter = useCallback((key, value) =>
    dispatch({ type: 'SET_FILTER', payload: { key, value } }), []);

  const clearFilters = useCallback(() =>
    dispatch({ type: 'CLEAR_FILTERS' }), []);

  const setView = useCallback((view) =>
    dispatch({ type: 'SET_VIEW', payload: { view } }), []);

  const openModal = useCallback((taskId = null) =>
    dispatch({ type: 'OPEN_MODAL', payload: { taskId } }), []);

  const closeModal = useCallback(() =>
    dispatch({ type: 'CLOSE_MODAL' }), []);

  const addToast = useCallback((message, type = 'success') =>
    dispatch({ type: 'ADD_TOAST', payload: { message, type } }), []);

  const removeToast = useCallback((id) =>
    dispatch({ type: 'REMOVE_TOAST', payload: { id } }), []);

  const value = {
    state,
    dispatch,
    // Action creators
    initTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    setFilter,
    clearFilters,
    setView,
    openModal,
    closeModal,
    addToast,
    removeToast,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Custom hook to consume the task store from any component.
 * Must be used inside a <TaskProvider> tree.
 */
export function useTaskStore() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskStore must be used within a TaskProvider');
  }
  return context;
}
