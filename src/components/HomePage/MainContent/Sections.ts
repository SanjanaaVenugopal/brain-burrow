import { CheckSquare, NotebookPen } from "lucide-react";
import { NavigateFunction } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { isToday, formatDistanceToNow } from "date-fns";
import { normalizeDate } from "../../Todo/NormalizeDates";
import { computeDisplayTodos } from "../../Todo/computeInstances";

export const useSections = (navigate: NavigateFunction) => {
  const todos = useSelector((state: RootState) => state.todos.todos);
  const entries = useSelector((state: RootState) => state.journal.entries);

  // Count tasks due today
  const displayTodos = computeDisplayTodos(todos);
  const todayCount = displayTodos.filter((t) => {
    const d = normalizeDate(t.scheduledAt);
    return d && isToday(d) && !t.completed;
  }).length;
  const todoSummary =
    todayCount === 0
      ? "All caught up!"
      : `${todayCount} task${todayCount !== 1 ? "s" : ""} due today`;

  // Most recent journal entry
  let journalSummary = "No entries yet";
  if (entries.length > 0) {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    journalSummary = `Last entry: ${formatDistanceToNow(new Date(sorted[0].updatedAt), { addSuffix: true })}`;
  }

  return [
    {
      title: "Journal",
      summary: journalSummary,
      icon: NotebookPen,
      onClick: () => navigate("/journal"),
    },
    {
      title: "To-Do",
      summary: todoSummary,
      icon: CheckSquare,
      onClick: () => navigate("/todo"),
    },
  ];
};
