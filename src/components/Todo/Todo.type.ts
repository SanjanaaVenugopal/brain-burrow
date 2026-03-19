export type RecurrencePattern =
  | { type: "none" }
  | { type: "daily" }
  | { type: "weekly"; daysOfWeek?: number[] } // 0 = Sunday, 6 = Saturday
  | { type: "monthly"; dayOfMonth?: number }
  | { type: "yearly"; month?: number; day?: number }
  | { type: "custom"; intervalDays: number }; // Every N days

export type CompletionRecord = {
  completedAt: string; // ISO date string
};

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  scheduledAt?: Date;
  description?: string;
  tags?: string[];

  // Recurring fields
  recurring?: RecurrencePattern;
  recurringEndDate?: Date;
  completions?: Record<string, CompletionRecord>; // keyed by "YYYY-MM-DD"

  // Override fields — only present on single-day override docs
  overrideOf?: string;   // base todo ID this overrides
  overrideDate?: string; // "YYYY-MM-DD" this override is for

  // Completion tracking (non-recurring)
  completedAt?: Date;
};

/**
 * A todo as displayed in the UI.
 * For recurring todos, virtual instances are computed on the fly.
 */
export type DisplayTodo = Todo & {
  _virtualDate?: string; // "YYYY-MM-DD" — present if this is a computed recurring instance
  _baseId?: string;      // base recurring todo ID
  _boardName?: string;   // present if this task comes from a board
  _boardTaskId?: string; // original board task ID (for toggle/edit/delete)
  _boardId?: string;     // board ID this task belongs to
};
