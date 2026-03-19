import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./components/Todo/TodoSlice";
import boardReducer from "./components/Board/BoardSlice";
import journalReducer from "./components/Journal/JournalSlice";

export const store = configureStore({
  reducer: {
    todos: todoReducer,
    boards: boardReducer,
    journal: journalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // example to ignore non-serializable warnings
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
