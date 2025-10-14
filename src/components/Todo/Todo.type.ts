export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: Date;
  group?: string;
  description?: string;
  scheduledAt?: Date;
};
