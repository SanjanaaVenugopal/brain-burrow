export type BoardColumn = {
  id: string;
  name: string;
};

export type Board = {
  id: string;
  name: string;
  columns: BoardColumn[];
};
