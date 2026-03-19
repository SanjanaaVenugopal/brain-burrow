export type BoardColumn = {
  id: string;
  name: string;
};

export type Board = {
  id: string;
  name: string;
  columns: BoardColumn[];
};

export type BoardTask = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  completed: boolean;
  description?: string;
  scheduledAt?: Date;
  tags?: string[];
  order: number;
};
