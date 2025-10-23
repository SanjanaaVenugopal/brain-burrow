export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date; // When it's due (used for grouping)
  scheduledAt?: Date; // Exact time for Today / Tomorrow tasks
  description?: string;
  tags?: string[]; // e.g. ["work", "personal", "urgent"]
};
