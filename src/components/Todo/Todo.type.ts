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

  // Board fields (present when task belongs to a board)
  boardId?: string;
  columnId?: string;
  order?: number;
};

/**
 * A todo as displayed in the UI.
 * For recurring todos, virtual instances are computed on the fly.
 */
export type DisplayTodo = Todo & {
  _virtualDate?: string; // "YYYY-MM-DD" — present if this is a computed recurring instance
  _baseId?: string;      // base recurring todo ID
  _boardName?: string;   // derived display name of the board (present for board tasks)
};
