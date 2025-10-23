import {
  isSameDay,
  isToday,
  addDays,
  isThisWeek,
  isThisMonth,
  isAfter,
  isWithinInterval,
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
      return (
        due &&
        isWithinInterval(due, {
          start: addDays(new Date(), 2),
          end: addDays(new Date(), 7),
        })
      );
    }),

    "This Month": allTodos.filter((t) => {
      const due = normalizeDate(t.dueDate);
      return (
        due &&
        isWithinInterval(due, {
          start: addDays(new Date(), 2),
          end: addDays(new Date(), 30),
        })
      );
    }),

    Upcoming: allTodos.filter((t) => {
      const due = normalizeDate(t.dueDate);
      return !due || isAfter(due, addDays(new Date(), 31));
    }),
  };
};
