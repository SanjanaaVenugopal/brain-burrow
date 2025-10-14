import React from "react";
import { TodoViewToggle } from "../components/Todo/TodoViewToggle";
import { TodoDashboard } from "../components/Todo/TodoDashboard";
import { TodoCalendar } from "../components/Todo/TodoCalendar";
import { Todo } from "../components/Todo/Todo.type";
import { AddTodoButton } from "../components/Todo/AddTodoButton";

export const TodoPage = () => {
    const [mode, setMode] = React.useState<"dashboard" | "calendar">("dashboard");
    const [todos, setTodos] = React.useState<Todo[]>([]);

    const toggleTodo = (id: number) =>
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );

    const todosHardcoded = [
        { id: 1, title: "Buy groceries", dueDate: new Date(), completed: false },
        { id: 2, title: "Finish Chakra UI setup", dueDate: new Date(), completed: true },
        { id: 3, title: "Plan Europe trip", dueDate: new Date(2025, 9, 15), completed: false },
    ];

    const allTodos = [...todosHardcoded, ...todos];

    const groupedTodosHardcoded: Record<string, Todo[]> = {
        "Today": allTodos
            .filter((t) => t.dueDate?.toDateString() === new Date().toDateString())
            .map((t) => ({ ...t, group: "Today" })),
        "Upcoming": allTodos
            .filter((t) => t.dueDate ? t.dueDate > new Date() : true)
            .map((t) => ({ ...t, group: "Upcoming" })),
    };

    const addTodo = (partial: Partial<Todo>) => {
        const todo: Todo = {
            id: Date.now(),
            title: partial.title ?? "Untitled Task",
            completed: false,
            group: partial.group,
            dueDate: partial.dueDate,
            description: partial.description ?? "",
            scheduledAt: partial.scheduledAt,
        };
        setTodos((prev) => [...prev, todo]);
    };

    return (
        <>
            <TodoViewToggle mode={mode} onChange={setMode} />
            {mode === "dashboard" ? (
                <TodoDashboard groupedTodos={groupedTodosHardcoded} toggleTodo={toggleTodo} />
            ) : (
                <TodoCalendar todos={todos} onSelectDate={(d) => console.log(d)} />
            )}
            {/* <TodoDashboard groupedTodos={groupedTodos} toggleTodo={toggleTodo} /> */}
            <AddTodoButton onAdd={addTodo} />
        </>
    );
};
