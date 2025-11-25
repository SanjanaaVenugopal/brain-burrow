export type RecurrencePattern = 
  | { type: 'none' }
  | { type: 'daily' }
  | { type: 'weekly'; daysOfWeek?: number[] } // 0 = Sunday, 6 = Saturday
  | { type: 'monthly'; dayOfMonth?: number }
  | { type: 'yearly'; month?: number; day?: number }
  | { type: 'custom'; intervalDays: number }; // Every N days

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date; // When it's due (used for grouping)
  scheduledAt?: Date; // Exact time for Today / Tomorrow tasks. For recurring instances, this is the instance date
  description?: string;
  tags?: string[]; // e.g. ["work", "personal", "urgent"]
  
  // Recurring fields
  recurring?: RecurrencePattern; // Only present on base todos (when recurringBaseId is undefined)
  recurringBaseId?: string; // If this is an instance, points to the base todo ID. If undefined + recurring exists = base todo
  
  // Completion tracking
  completedAt?: Date; // When this specific todo/instance was completed
};

/**
 * Helper type to count completions for a recurring todo base
 * You can derive this from querying instances with the same recurringBaseId
 */
export type RecurringTodoStats = {
  baseId: string;
  totalInstances: number; // Total instances created
  completedInstances: number; // How many have been completed
  currentStreak: number; // Consecutive completions
  lastCompletedAt?: Date;
};
