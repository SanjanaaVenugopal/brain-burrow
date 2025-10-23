import {
  isSameDay,
  isToday,
  addDays,
  isThisWeek,
  isThisMonth,
  isAfter,
} from "date-fns";
import { Todo } from "./Todo.type";
import { normalizeDate } from "./NormalizeDates";

/**
 * Groups todos into logical time buckets
 */
export const GroupedTodos = (allTodos: Todo[]): Record<string, Todo[]> => {
  return {
    Today: allTodos
      .filter((t) => {
        const due = normalizeDate(t.dueDate);
        return due && isToday(due);
      })
      .sort((a, b) => {
        const aDate = normalizeDate(a.scheduledAt);
        const bDate = normalizeDate(b.scheduledAt);
        return aDate && bDate ? aDate.getTime() - bDate.getTime() : 0;
      }),

    Tomorrow: allTodos
      .filter((t) => {
        const due = normalizeDate(t.dueDate);
        return due && isSameDay(due, addDays(new Date(), 1));
      })
      .sort((a, b) => {
        const aDate = normalizeDate(a.scheduledAt);
        const bDate = normalizeDate(b.scheduledAt);
        return aDate && bDate ? aDate.getTime() - bDate.getTime() : 0;
      }),

    "This Week": allTodos.filter((t) => {
      const due = normalizeDate(t.dueDate);
      return due && isThisWeek(due, { weekStartsOn: 1 });
    }),

    "This Month": allTodos.filter((t) => {
      const due = normalizeDate(t.dueDate);
      return due && isThisMonth(due) && !isThisWeek(due, { weekStartsOn: 1 });
    }),

    Upcoming: allTodos.filter((t) => {
      const due = normalizeDate(t.dueDate);
      return !due || isAfter(due, addDays(new Date(), 31));
    }),
  };
};
