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
      if (index !== -1) state.todos[index] = action.payload;
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      state.todos.map((todo) =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    },
  },
});

export const { setTodos, addTodo, deleteTodo, updateTodo, toggleTodo } =
  todoSlice.actions;
export default todoSlice.reducer;
