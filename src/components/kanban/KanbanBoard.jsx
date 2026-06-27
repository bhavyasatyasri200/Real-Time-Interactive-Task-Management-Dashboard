/**
 * KanbanBoard – renders the three-column Kanban layout.
 * Consumes filtered state from the store; columns derive their own subsets.
 */

import KanbanColumn from './KanbanColumn';

const COLUMN_IDS = ['todo', 'in-progress', 'done'];

export default function KanbanBoard() {
  return (
    <div className="kanban-board" role="region" aria-label="Kanban board">
      {COLUMN_IDS.map((id) => (
        <KanbanColumn key={id} columnId={id} />
      ))}
    </div>
  );
}
