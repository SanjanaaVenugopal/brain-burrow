import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Todo } from "../../components/Todo/Todo.type";

type TodoState = {
  todos: Todo[];
};

const initialState: TodoState = {
  todos: [],
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setTodos: (state, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload;
    },
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.todos.push(action.payload);
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((t) => t.id !== action.payload);
    },
    updateTodo: (state, action: PayloadAction<Todo>) => {
      const index = state.todos.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.todos[index] = action.payload;
      }
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date() : undefined;
      }
    },
    // Toggle a completion for a recurring todo's virtual instance
    toggleRecurringCompletion: (
      state,
      action: PayloadAction<{ baseId: string; dateStr: string }>
    ) => {
      const baseTodo = state.todos.find((t) => t.id === action.payload.baseId);
      if (baseTodo) {
        if (!baseTodo.completions) baseTodo.completions = {};
        if (baseTodo.completions[action.payload.dateStr]) {
          delete baseTodo.completions[action.payload.dateStr];
        } else {
          baseTodo.completions[action.payload.dateStr] = {
            completedAt: new Date().toISOString(),
          };
        }
      }
    },
  },
});

export const {
  setTodos,
  addTodo,
  deleteTodo,
  updateTodo,
  toggleTodo,
  toggleRecurringCompletion,
} = todoSlice.actions;

export default todoSlice.reducer;
