import {
  isSameDay,
  isToday,
  addDays,
  isThisWeek,
  isThisMonth,
  isAfter,
} from "date-fns";
import { Todo } from "./Todo.type";

/**
 * Groups todos into logical time buckets
 */
export const GroupedTodos = (allTodos: Todo[]): Record<string, Todo[]> => {
  return {
    Today: allTodos
      .filter((t) => t.dueDate && isToday(t.dueDate))
      .sort((a, b) =>
        a.scheduledAt && b.scheduledAt
          ? a.scheduledAt.getTime() - b.scheduledAt.getTime()
          : 0
      ),

    Tomorrow: allTodos
      .filter((t) => t.dueDate && isSameDay(t.dueDate, addDays(new Date(), 1)))
      .sort((a, b) =>
        a.scheduledAt && b.scheduledAt
          ? a.scheduledAt.getTime() - b.scheduledAt.getTime()
          : 0
      ),

    "This Week": allTodos.filter(
      (t) => t.dueDate && isThisWeek(t.dueDate, { weekStartsOn: 1 })
    ),

    "This Month": allTodos.filter(
      (t) =>
        t.dueDate &&
        isThisMonth(t.dueDate) &&
        !isThisWeek(t.dueDate, { weekStartsOn: 1 })
    ),

    Upcoming: allTodos.filter(
      (t) => !t.dueDate || isAfter(t.dueDate, addDays(new Date(), 31))
    ),
  };
};
