import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Todo } from "../../components/Todo/Todo.type";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

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
      // If it's a recurring base, create a week's worth of instances and persist them
      if (!action.payload.recurringBaseId && action.payload.recurring && action.payload.recurring.type !== 'none') {
        let currentBase = action.payload;
        const instancesToSave: Todo[] = [];
        for (let i = 0; i < 7; i++) {
          const nextInstance = createNextRecurringInstance(action.payload, currentBase);
          if (nextInstance) {
            state.todos.push(nextInstance);
            instancesToSave.push(nextInstance);
            currentBase = nextInstance;
          }
        }
        // Persist instances to Firestore (deep clone to avoid Immer proxy issues)
        persistInstancesToFirestore(JSON.parse(JSON.stringify(instancesToSave)));
      }
    },
    checkAndCreateMissingInstances: (state) => {
      // Call this periodically (e.g., on app load or daily)
      // Ensures each recurring base has a week's worth of instances
      const baseTodos = state.todos.filter(t => !t.recurringBaseId && t.recurring && t.recurring.type !== 'none');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const allNewInstances: Todo[] = [];
      
      baseTodos.forEach(baseTodo => {
        const instances = state.todos.filter(t => t.recurringBaseId === baseTodo.id);
        
        // Find the latest instance date
        const latestInstance = [...instances]
          .sort((a, b) => {
            const dateA = toSafeDate(a.scheduledAt) || new Date(0);
            const dateB = toSafeDate(b.scheduledAt) || new Date(0);
            return dateB.getTime() - dateA.getTime();
          })[0];
        
        const lastDate = toSafeDate(latestInstance?.scheduledAt) || toSafeDate(baseTodo.scheduledAt) || toSafeDate(baseTodo.dueDate);
        
        if (lastDate) {
          const lastDateOnly = new Date(lastDate);
          lastDateOnly.setHours(0, 0, 0, 0);
          
          // Calculate how far ahead we need to go (today + 7 days)
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + 7); // A week from today
          
          // If latest instance is before target date, create instances up to target
          if (lastDateOnly.getTime() < targetDate.getTime()) {
            let currentDate = new Date(lastDateOnly);
            let currentBase = latestInstance || baseTodo;
            
            // Create instances until we have a week covered
            let count = 0;
            while (currentDate.getTime() < targetDate.getTime() && count < 365) {
              const nextInstance = createNextRecurringInstance(baseTodo, currentBase);
              if (nextInstance) {
                state.todos.push(nextInstance);
                allNewInstances.push(nextInstance);
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
      // Persist any newly created instances to Firestore
      if (allNewInstances.length > 0) {
        persistInstancesToFirestore(JSON.parse(JSON.stringify(allNewInstances)));
      }
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

// Persist recurring instances to Firestore (called outside of reducer synchronously)
async function persistInstancesToFirestore(instances: Todo[]) {
  console.log(`[Recurring] Persisting ${instances.length} instances to Firestore`);
  for (const instance of instances) {
    try {
      const docRef = doc(db, "BrainBurrowTodos", instance.id);
      await setDoc(docRef, {
        ...instance,
        scheduledAt: instance.scheduledAt,
        dueDate: instance.dueDate,
      });
      console.log(`[Recurring] Saved instance ${instance.id} for ${instance.scheduledAt}`);
    } catch (err) {
      console.error("Failed to persist recurring instance:", instance.id, err);
    }
  }
}

// Safely convert any date-like value (Date, string, Timestamp, {seconds}) to a Date
function toSafeDate(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }
  if (value.seconds !== undefined) return new Date(value.seconds * 1000);
  if (value.toDate) return value.toDate();
  return undefined;
}

// Helper function to calculate next occurrence based on recurrence pattern
// baseTodo: the original recurring todo with the pattern
// fromTodo: the todo to calculate the next date from
function createNextRecurringInstance(baseTodo: Todo, fromTodo: Todo): Todo | null {
  if (!baseTodo.recurring || baseTodo.recurring.type === 'none') return null;
  
  const baseDate = toSafeDate(fromTodo.scheduledAt) || toSafeDate(fromTodo.dueDate) || new Date();
  let nextDate: Date;
  
  switch (baseTodo.recurring.type) {
    case 'daily':
      nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + 1);
      break;
      
    case 'weekly': {
      const days = baseTodo.recurring.daysOfWeek;
      if (days && days.length > 0) {
        // Find the next matching day of the week
        const sorted = [...days].sort((a, b) => a - b);
        const currentDay = new Date(baseDate).getDay();
        // Find the next day in the list after currentDay
        const nextDay = sorted.find(d => d > currentDay);
        nextDate = new Date(baseDate);
        if (nextDay !== undefined) {
          nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
        } else {
          // Wrap to next week's first selected day
          nextDate.setDate(nextDate.getDate() + (7 - currentDay + sorted[0]));
        }
      } else {
        nextDate = new Date(baseDate);
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;
    }
      
    case 'monthly': {
      nextDate = new Date(baseDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const targetDay = baseTodo.recurring.dayOfMonth;
      if (targetDay) {
        // Clamp to the last day of the target month
        const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(targetDay, maxDay));
      }
      break;
    }
      
    case 'yearly': {
      nextDate = new Date(baseDate);
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      if (baseTodo.recurring.month !== undefined) {
        nextDate.setMonth(baseTodo.recurring.month);
      }
      if (baseTodo.recurring.day !== undefined) {
        const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(baseTodo.recurring.day, maxDay));
      }
      break;
    }
      
    case 'custom':
      nextDate = new Date(baseDate);
      nextDate.setDate(nextDate.getDate() + baseTodo.recurring.intervalDays);
      break;
      
    default:
      return null;
  }
  
  // Enforce recurringEndDate
  if (baseTodo.recurringEndDate) {
    const endDate = toSafeDate(baseTodo.recurringEndDate);
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      if (nextDate.getTime() > endDate.getTime()) return null;
    }
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
