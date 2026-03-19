import {
  isBefore,
  isSameDay,
  isToday,
  addDays,
  isAfter,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { DisplayTodo } from "./Todo.type";
import { normalizeDate } from "./NormalizeDates";

/**
 * Groups display todos into logical time buckets
 */
export const GroupedTodos = (displayTodos: DisplayTodo[]): Record<string, DisplayTodo[]> => {
  return {
    Overdue: displayTodos
      .filter((t) => {
        const due = normalizeDate(t.scheduledAt);
        return due && isBefore(due, startOfDay(new Date())) && !t.completed;
      })
      .sort((a, b) => {
        const aDate = normalizeDate(a.scheduledAt);
        const bDate = normalizeDate(b.scheduledAt);
        return aDate && bDate ? bDate.getTime() - aDate.getTime() : 0;
      }),

    Today: displayTodos
      .filter((t) => {
        const due = normalizeDate(t.scheduledAt);
        return due && isToday(due);
      })
      .sort((a, b) => {
        const aDate = normalizeDate(a.scheduledAt);
        const bDate = normalizeDate(b.scheduledAt);
        return aDate && bDate ? aDate.getTime() - bDate.getTime() : 0;
      }),

    Tomorrow: displayTodos
      .filter((t) => {
        const due = normalizeDate(t.scheduledAt);
        return due && isSameDay(due, addDays(new Date(), 1));
      })
      .sort((a, b) => {
        const aDate = normalizeDate(a.scheduledAt);
        const bDate = normalizeDate(b.scheduledAt);
        return aDate && bDate ? aDate.getTime() - bDate.getTime() : 0;
      }),

    "This Week": displayTodos.filter((t) => {
      const due = normalizeDate(t.scheduledAt);
      return (
        due &&
        isWithinInterval(due, {
          start: addDays(new Date(), 2),
          end: addDays(new Date(), 7),
        })
      );
    }),

    "This Month": displayTodos.filter((t) => {
      const due = normalizeDate(t.scheduledAt);
      return (
        due &&
        isWithinInterval(due, {
          start: addDays(new Date(), 7),
          end: addDays(new Date(), 30),
        })
      );
    }),

    Upcoming: displayTodos.filter((t) => {
      const due = normalizeDate(t.scheduledAt);
      return !due || isAfter(due, addDays(new Date(), 31));
    }),
  };
};
