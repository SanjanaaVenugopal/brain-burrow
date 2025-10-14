import { CheckSquare, NotebookPen } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

export const getSections = (navigate: NavigateFunction) => {
  return [
    {
      title: "Journal",
      summary: "Last entry: 2 days ago",
      icon: NotebookPen,
      onClick: () => navigate("/journal"),
    },
    {
      title: "To-Do",
      summary: "3 tasks due today",
      icon: CheckSquare,
      onClick: () => navigate("/todo"),
    },
  ];
};
