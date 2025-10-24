import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TodoViewToggle } from "../components/Todo/TodoViewToggle";
import { TodoDashboard } from "../components/Todo/TodoDashboard";
import { TodoCalendar } from "../components/Todo/TodoCalendar";
import { Todo } from "../components/Todo/Todo.type";
import { AddTodoButton } from "../components/Todo/AddTodoButton";
import { GroupedTodos } from "../components/Todo/GroupedTodos";
import { TodoHeader } from "../components/Todo/TodoHeader";
import { Box, useToast } from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { setTodos, toggleTodo } from "../components/Todo/TodoSlice";
import type { RootState, AppDispatch } from "../store";
import { normalizeDate } from "../components/Todo/NormalizeDates";

export const TodoPage = () => {
    const [mode, setMode] = React.useState<"dashboard" | "calendar">("dashboard");

    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    // Get todos from Redux instead of local state
    const todos = useSelector((state: RootState) => state.todos.todos);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const snapshot = await getDocs(collection(db, "BrainBurrowTodos"));
                const todoList: Todo[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    dueDate: normalizeDate(doc.data().dueDate),
                    scheduledAt: normalizeDate(doc.data().scheduledAt),
                    ...(doc.data() as Omit<Todo, "id">),
                }));
                dispatch(setTodos(todoList)); // push todos to Redux store
            } catch (err) {
                console.error("Error fetching todos:", err);
                toast({
                    title: "Error fetching todos",
                    description: (err as Error).message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        };

        fetchTodos();
    }, [dispatch, toast]);

    return (
        <>
            <TodoHeader />
            <br />
            <Box position="fixed" top="100px" left="20px" zIndex={10}>
                <TodoViewToggle mode={mode} onChange={setMode} />
            </Box>
            {mode === "dashboard" ? (
                <TodoDashboard />
            ) : (
                <TodoCalendar todos={todos} onSelectDate={(d) => console.log(d)} />
            )}
            <AddTodoButton
                onAdd={(todo) => dispatch(setTodos([...todos, todo]))}
            />
        </>
    );
};
