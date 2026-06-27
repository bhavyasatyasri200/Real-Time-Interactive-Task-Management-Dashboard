/**
 * TaskModal component.
 *
 * A fully accessible modal dialog for creating and editing tasks.
 *
 * Accessibility features:
 * - Focus is trapped inside the modal while it is open; tabbing cycles within it
 * - Pressing Escape closes the modal
 * - Clicking the backdrop overlay closes the modal
 * - role="dialog" + aria-modal="true" for screen reader context
 * - First focusable element receives focus on open
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTaskStore } from '../../store/TaskContext';

// Selector to find all focusable elements within a container
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const PRIORITIES = ['Low', 'Medium', 'High'];

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'Medium',
  assignee: '',
  dueDate: '',
};

export default function TaskModal() {
  const { state, closeModal, addTask, updateTask, deleteTask, addToast } = useTaskStore();
  const { isModalOpen, editingTaskId } = state.ui;

  const isEditMode = Boolean(editingTaskId);
  const editingTask = isEditMode
    ? state.tasks.find((t) => t.id === editingTaskId) ?? null
    : null;

  // ── Local form state ───────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  const firstFocusRef = useRef(null);

  // Populate form when modal opens (edit mode) or clear it (create mode)
  useEffect(() => {
    if (!isModalOpen) return;
    if (isEditMode && editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        assignee: editingTask.assignee,
        dueDate: editingTask.dueDate,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    // Focus the first input on open
    requestAnimationFrame(() => firstFocusRef.current?.focus());
  }, [isModalOpen, editingTaskId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Focus Trapping ─────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusable = [...modalRef.current.querySelectorAll(FOCUSABLE_SELECTORS)];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleKeyDown]);

  // ── Form Handlers ──────────────────────────────────────────────────────────
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (isEditMode && editingTask) {
      updateTask(editingTaskId, { ...form, title: form.title.trim() });
      addToast(`Task "${form.title.trim()}" updated successfully.`, 'success');
    } else {
      addTask({ ...form, title: form.title.trim() });
      addToast(`Task "${form.title.trim()}" created successfully.`, 'success');
    }
    closeModal();
  }

  function handleDelete() {
    if (!editingTask) return;
    if (window.confirm(`Delete "${editingTask.title}"? This cannot be undone.`)) {
      deleteTask(editingTaskId);
      addToast(`Task "${editingTask.title}" deleted.`, 'error');
      closeModal();
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeModal();
  }

  if (!isModalOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {isEditMode ? '✏️ Edit Task' : '✨ Create New Task'}
          </h2>
          <button
            className="modal-close-btn"
            onClick={closeModal}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Title <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="task-title"
                ref={firstFocusRef}
                className={`form-control${errors.title ? ' error' : ''}`}
                type="text"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                aria-required="true"
                aria-describedby={errors.title ? 'title-error' : undefined}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && (
                <span id="title-error" className="form-error" role="alert">
                  ⚠ {errors.title}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                className="form-control"
                placeholder="Add more context or details..."
                rows={3}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            {/* Priority + Assignee row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="form-control"
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee">Assignee</label>
                <input
                  id="task-assignee"
                  className="form-control"
                  type="text"
                  placeholder="Name..."
                  value={form.assignee}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-dueDate">Due Date</label>
              <input
                id="task-dueDate"
                className="form-control"
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            {isEditMode && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                aria-label="Delete this task"
              >
                🗑 Delete
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditMode ? '💾 Save Changes' : '➕ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
