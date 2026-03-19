import {
  isBefore,
  isSameDay,
  isToday,
  addDays,
  isAfter,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { Todo } from "./Todo.type";
import { normalizeDate } from "./NormalizeDates";

/**
 * Groups todos into logical time buckets
 */

export const GroupedTodos = (allTodos: Todo[]): Record<string, Todo[]> => {
  // Filter out base recurring todos — only show their instances
  const displayTodos = allTodos.filter(
    (t) => !(t.recurring && t.recurring.type !== "none" && !t.recurringBaseId)
  );

  return {
    Overdue: deduplicateRecurring(
      displayTodos
        .filter((t) => {
          const due = normalizeDate(t.scheduledAt);
          return due && isBefore(due, startOfDay(new Date())) && !t.completed;
        })
        .sort((a, b) => {
          const aDate = normalizeDate(a.scheduledAt);
          const bDate = normalizeDate(b.scheduledAt);
          // Sort descending so the most recent overdue is first (kept by dedup)
          return aDate && bDate ? bDate.getTime() - aDate.getTime() : 0;
        })
    ),

    Today: deduplicateRecurring(
      displayTodos
        .filter((t) => {
          const due = normalizeDate(t.scheduledAt);
          return due && isToday(due);
        })
        .sort((a, b) => {
          const aDate = normalizeDate(a.scheduledAt);
          const bDate = normalizeDate(b.scheduledAt);
          return aDate && bDate ? aDate.getTime() - bDate.getTime() : 0;
        })
    ),

    Tomorrow: deduplicateRecurring(
      displayTodos
        .filter((t) => {
          const due = normalizeDate(t.scheduledAt);
          return due && isSameDay(due, addDays(new Date(), 1));
        })
        .sort((a, b) => {
          const aDate = normalizeDate(a.scheduledAt);
          const bDate = normalizeDate(b.scheduledAt);
          return aDate && bDate ? aDate.getTime() - bDate.getTime() : 0;
        })
    ),

    "This Week": deduplicateRecurring(
      displayTodos.filter((t) => {
        const due = normalizeDate(t.scheduledAt);
        return (
          due &&
          isWithinInterval(due, {
            start: addDays(new Date(), 2),
            end: addDays(new Date(), 7),
          })
        );
      })
    ),

    "This Month": deduplicateRecurring(
      displayTodos.filter((t) => {
        const due = normalizeDate(t.scheduledAt);
        return (
          due &&
          isWithinInterval(due, {
            start: addDays(new Date(), 7),
            end: addDays(new Date(), 30),
          })
        );
      })
    ),

    Upcoming: deduplicateRecurring(
      displayTodos.filter((t) => {
        const due = normalizeDate(t.scheduledAt);
        return !due || isAfter(due, addDays(new Date(), 31));
      })
    ),
  };
};

/**
 * For recurring instances, keep only one per recurringBaseId (the first in the array).
 * Non-recurring todos are always kept.
 */
function deduplicateRecurring(todos: Todo[]): Todo[] {
  const seenBaseIds = new Set<string>();
  return todos.filter((t) => {
    if (!t.recurringBaseId) return true;
    if (seenBaseIds.has(t.recurringBaseId)) return false;
    seenBaseIds.add(t.recurringBaseId);
    return true;
  });
}
