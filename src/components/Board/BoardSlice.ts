import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Board, BoardTask } from "./Board.type";

type BoardState = {
  boards: Board[];
  tasks: BoardTask[];
};

const initialState: BoardState = {
  boards: [],
  tasks: [],
};

const boardSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload;
    },
    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
    },
    updateBoard: (state, action: PayloadAction<Board>) => {
      const idx = state.boards.findIndex((b) => b.id === action.payload.id);
      if (idx !== -1) state.boards[idx] = action.payload;
    },
    deleteBoard: (state, action: PayloadAction<string>) => {
      state.boards = state.boards.filter((b) => b.id !== action.payload);
      state.tasks = state.tasks.filter((t) => t.boardId !== action.payload);
    },
    setBoardTasks: (state, action: PayloadAction<BoardTask[]>) => {
      state.tasks = action.payload;
    },
    addBoardTask: (state, action: PayloadAction<BoardTask>) => {
      state.tasks.push(action.payload);
    },
    updateBoardTask: (state, action: PayloadAction<BoardTask>) => {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
    },
    deleteBoardTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    toggleBoardTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) task.completed = !task.completed;
    },
  },
});

export const {
  setBoards,
  addBoard,
  updateBoard,
  deleteBoard,
  setBoardTasks,
  addBoardTask,
  updateBoardTask,
  deleteBoardTask,
  toggleBoardTask,
} = boardSlice.actions;

export default boardSlice.reducer;
