import { addDays, format, startOfDay } from "date-fns";
import { DisplayTodo, Todo } from "./Todo.type";
import { normalizeDate } from "./NormalizeDates";

/**
 * Given all todos from Firestore, compute the display list:
 * - Non-recurring todos pass through as-is
 * - Recurring base todos generate virtual instances for the visible date range
 * - Override docs replace the virtual instance for their specific date
 */
export function computeDisplayTodos(allTodos: Todo[]): DisplayTodo[] {
  const result: DisplayTodo[] = [];

  // Separate overrides from regular todos
  const overrides = allTodos.filter((t) => t.overrideOf);
  const regularTodos = allTodos.filter((t) => !t.overrideOf);

  // Build a lookup: baseId -> { "YYYY-MM-DD": overrideTodo }
  const overrideMap = new Map<string, Map<string, Todo>>();
  for (const o of overrides) {
    if (!o.overrideOf || !o.overrideDate) continue;
    if (!overrideMap.has(o.overrideOf)) overrideMap.set(o.overrideOf, new Map());
    overrideMap.get(o.overrideOf)!.set(o.overrideDate, o);
  }

  for (const todo of regularTodos) {
    const isRecurring = todo.recurring && todo.recurring.type !== "none";

    if (!isRecurring) {
      // Non-recurring: pass through as-is
      result.push(todo);
      continue;
    }

    // Recurring base: generate virtual instances
    const startDate = normalizeDate(todo.scheduledAt) || normalizeDate(todo.dueDate);
    if (!startDate) continue;

    const endDate = normalizeDate(todo.recurringEndDate);
    // Only generate instances for yesterday through tomorrow
    // This keeps recurring todos in Overdue/Today/Tomorrow only
    const rangeStart = addDays(startOfDay(new Date()), -1);
    const rangeEnd = addDays(startOfDay(new Date()), 2); // end of tomorrow

    const dates = generateRecurringDates(todo, startDate, rangeStart, rangeEnd, endDate);
    const baseOverrides = overrideMap.get(todo.id);

    for (const date of dates) {
      const dateStr = format(date, "yyyy-MM-dd");

      // Check if there's an override for this date
      const override = baseOverrides?.get(dateStr);
      if (override) {
        // Use the override doc, but mark it as virtual for UI tracking
        result.push({
          ...override,
          completed: !!todo.completions?.[dateStr],
          _virtualDate: dateStr,
          _baseId: todo.id,
        });
        continue;
      }

      // Create virtual instance from base
      const isCompleted = !!todo.completions?.[dateStr];
      const instanceDate = new Date(date);
      // Preserve the time from the base todo's scheduledAt
      instanceDate.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());

      result.push({
        id: `${todo.id}::recurring::${dateStr}`,
        title: todo.title,
        description: todo.description,
        tags: todo.tags,
        completed: isCompleted,
        completedAt: todo.completions?.[dateStr]
          ? new Date(todo.completions[dateStr].completedAt)
          : undefined,
        scheduledAt: instanceDate,
        dueDate: instanceDate,
        recurring: todo.recurring,
        recurringEndDate: todo.recurringEndDate,
        _virtualDate: dateStr,
        _baseId: todo.id,
      });
    }
  }

  return result;
}

/**
 * Generate all dates for a recurring pattern within [rangeStart, rangeEnd]
 */
function generateRecurringDates(
  todo: Todo,
  startDate: Date,
  rangeStart: Date,
  rangeEnd: Date,
  endDate?: Date
): Date[] {
  if (!todo.recurring || todo.recurring.type === "none") return [];

  const dates: Date[] = [];
  const effectiveEnd = endDate && endDate < rangeEnd ? endDate : rangeEnd;
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  // Limit iterations as a safety guard
  let iterations = 0;
  const MAX_ITERATIONS = 1000;

  while (current <= effectiveEnd && iterations < MAX_ITERATIONS) {
    iterations++;

    if (current >= rangeStart) {
      dates.push(new Date(current));
    }

    // Advance to next date
    const next = getNextDate(todo, current);
    if (!next || next <= current) break; // prevent infinite loop
    current = next;
  }

  return dates;
}

function getNextDate(todo: Todo, current: Date): Date | null {
  if (!todo.recurring) return null;

  switch (todo.recurring.type) {
    case "daily": {
      const next = new Date(current);
      next.setDate(next.getDate() + 1);
      return next;
    }

    case "weekly": {
      const days = todo.recurring.daysOfWeek;
      if (days && days.length > 0) {
        const sorted = [...days].sort((a, b) => a - b);
        const currentDay = current.getDay();
        const nextDay = sorted.find((d) => d > currentDay);
        const next = new Date(current);
        if (nextDay !== undefined) {
          next.setDate(next.getDate() + (nextDay - currentDay));
        } else {
          next.setDate(next.getDate() + (7 - currentDay + sorted[0]));
        }
        return next;
      }
      const next = new Date(current);
      next.setDate(next.getDate() + 7);
      return next;
    }

    case "monthly": {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      const targetDay = todo.recurring.dayOfMonth;
      if (targetDay) {
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(targetDay, maxDay));
      }
      return next;
    }

    case "yearly": {
      const next = new Date(current);
      next.setFullYear(next.getFullYear() + 1);
      if (todo.recurring.month !== undefined) next.setMonth(todo.recurring.month);
      if (todo.recurring.day !== undefined) {
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(todo.recurring.day, maxDay));
      }
      return next;
    }

    case "custom": {
      const next = new Date(current);
      next.setDate(next.getDate() + todo.recurring.intervalDays);
      return next;
    }

    default:
      return null;
  }
}
