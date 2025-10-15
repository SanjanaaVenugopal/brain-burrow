import React from "react";
import { TodoViewToggle } from "../components/Todo/TodoViewToggle";
import { TodoDashboard } from "../components/Todo/TodoDashboard";
import { TodoCalendar } from "../components/Todo/TodoCalendar";
import { Todo } from "../components/Todo/Todo.type";
import { AddTodoButton } from "../components/Todo/AddTodoButton";
import { GroupedTodos } from "../components/Todo/GroupedTodos";
import { TodosMock } from "../Data/todo.mock";
import { TodoHeader } from "../components/Todo/TodoHeader";
import { Box } from "@chakra-ui/react";

export const TodoPage = () => {
    const [mode, setMode] = React.useState<"dashboard" | "calendar">("dashboard");

    // ✅ initialize state with your mock data only once
    const [todos, setTodos] = React.useState<Todo[]>(TodosMock);

    const toggleTodo = (id: number) => {
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const groupedTodos = GroupedTodos(todos);

    const addTodo = (partial: Partial<Todo>) => {
        const todo: Todo = {
            id: Date.now(),
            title: partial.title ?? "Untitled Task",
            completed: false,
            dueDate:
                partial.dueDate ??
                new Date(new Date().setDate(new Date().getDate() + 1000)),
            description: partial.description ?? "",
            scheduledAt:
                partial.scheduledAt ??
                new Date(new Date().setDate(new Date().getDate() + 1000)),
        };
        setTodos((prev) => [...prev, todo]);
    };

    return (
        <>
            <TodoHeader />
            <br></br>
            <Box position="fixed" top="100px" left="20px" zIndex={10}>
                <TodoViewToggle mode={mode} onChange={setMode} />
            </Box>
            {mode === "dashboard" ? (
                <TodoDashboard groupedTodos={groupedTodos} toggleTodo={toggleTodo} />
            ) : (
                <TodoCalendar todos={todos} onSelectDate={(d) => console.log(d)} />
            )}
            <AddTodoButton onAdd={addTodo} />
        </>
    );
};
