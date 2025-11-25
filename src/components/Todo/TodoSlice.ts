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
      // If it's a recurring base, create a week's worth of instances
      if (!action.payload.recurringBaseId && action.payload.recurring && action.payload.recurring.type !== 'none') {
        let currentBase = action.payload;
        // Create 7 instances
        for (let i = 0; i < 7; i++) {
          const nextInstance = createNextRecurringInstance(action.payload, currentBase);
          if (nextInstance) {
            state.todos.push(nextInstance);
            currentBase = nextInstance;
          }
        }
      }
    },
    checkAndCreateMissingInstances: (state) => {
      // Call this periodically (e.g., on app load or daily)
      // Ensures each recurring base has a week's worth of instances
      const baseTodos = state.todos.filter(t => !t.recurringBaseId && t.recurring && t.recurring.type !== 'none');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      baseTodos.forEach(baseTodo => {
        const instances = state.todos.filter(t => t.recurringBaseId === baseTodo.id);
        
        // Find the latest instance date
        const latestInstance = instances
          .sort((a, b) => {
            const dateA = a.scheduledAt || new Date(0);
            const dateB = b.scheduledAt || new Date(0);
            return dateB.getTime() - dateA.getTime();
          })[0];
        
        const lastDate = latestInstance?.scheduledAt || baseTodo.scheduledAt || baseTodo.dueDate;
        
        if (lastDate) {
          const lastDateOnly = new Date(lastDate);
          lastDateOnly.setHours(0, 0, 0, 0);
          
          // Calculate how far ahead we need to go (today + 7 days)
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + 7); // A week from today
          
          // If latest instance is before target date, create instances up to target
          if (lastDateOnly < targetDate) {
            let currentDate = new Date(lastDateOnly);
            let currentBase = latestInstance || baseTodo;
            
            // Create instances until we have a week covered
            let count = 0;
            while (currentDate < targetDate && count < 365) {
              const nextInstance = createNextRecurringInstance(baseTodo, currentBase);
              if (nextInstance) {
                state.todos.push(nextInstance);
                currentBase = nextInstance;
                currentDate = new Date(nextInstance.scheduledAt || targetDate);
                currentDate.setHours(0, 0, 0, 0);
              } else {
                break;
              }
              count++;
            }
          }
        }
      });
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((t) => t.id !== action.payload);
    },
    updateTodo: (state, action: PayloadAction<Todo>) => {
      const index = state.todos.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.todos[index] = action.payload;
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((t) => t.id === action.payload);
      if (todo) {
        const wasCompleted = todo.completed;
        todo.completed = !todo.completed;
        
        // If marking as complete
        if (!wasCompleted && todo.completed) {
          todo.completedAt = new Date();
        } else if (wasCompleted && !todo.completed) {
          // If unmarking as complete, clear completedAt
          todo.completedAt = undefined;
        }
      }
    },
    createRecurringInstances: (state, action: PayloadAction<{ baseId: string; count: number }>) => {
      // Manually create multiple instances of a recurring todo
      const baseTodo = state.todos.find((t) => t.id === action.payload.baseId && !t.recurringBaseId);
      if (baseTodo && baseTodo.recurring && baseTodo.recurring.type !== 'none') {
        const lastInstance = state.todos
          .filter((t) => t.recurringBaseId === baseTodo.id)
          .sort((a, b) => {
            const dateA = a.scheduledAt || a.dueDate || new Date(0);
            const dateB = b.scheduledAt || b.dueDate || new Date(0);
            return dateB.getTime() - dateA.getTime();
          })[0];
        
        let currentBase = lastInstance || baseTodo;
        for (let i = 0; i < action.payload.count; i++) {
          const nextInstance = createNextRecurringInstance(baseTodo, currentBase);
          if (nextInstance) {
            state.todos.push(nextInstance);
            currentBase = nextInstance;
          }
        }
      }
    },
  },
});

// Helper function to calculate next occurrence based on recurrence pattern
// baseTodo: the original recurring todo with the pattern
// fromTodo: the todo to calculate the next date from
function createNextRecurringInstance(baseTodo: Todo, fromTodo: Todo): Todo | null {
  if (!baseTodo.recurring || baseTodo.recurring.type === 'none') return null;
  
  const baseDate = fromTodo.scheduledAt || fromTodo.dueDate || new Date();
  let nextDate: Date;
  
  switch (baseTodo.recurring.type) {
    case 'daily':
      nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + 1);
      break;
      
    case 'weekly':
      nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + 7);
      break;
      
    case 'monthly':
      nextDate = new Date(baseDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
      
    case 'yearly':
      nextDate = new Date(baseDate);
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
      
    case 'custom':
      nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + baseTodo.recurring.intervalDays);
      break;
      
    default:
      return null;
  }
  
  return {
    id: `${baseTodo.id}-instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: baseTodo.title,
    description: baseTodo.description,
    tags: baseTodo.tags,
    completed: false,
    completedAt: undefined,
    dueDate: nextDate,
    scheduledAt: nextDate, // This serves as both the scheduled time AND the instance date
    recurringBaseId: baseTodo.id, // Link back to the base (presence of this means it's an instance, not a base)
  };
}

export const { 
  setTodos, 
  addTodo, 
  deleteTodo, 
  updateTodo, 
  toggleTodo,
  createRecurringInstances,
  checkAndCreateMissingInstances,
} = todoSlice.actions;

export default todoSlice.reducer;
