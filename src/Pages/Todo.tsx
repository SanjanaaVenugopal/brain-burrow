import React, { useEffect } from "react";
import { TodoViewToggle } from "../components/Todo/TodoViewToggle";
import { TodoDashboard } from "../components/Todo/TodoDashboard";
import { TodoCalendar } from "../components/Todo/TodoCalendar";
import { Todo } from "../components/Todo/Todo.type";
import { AddTodoButton } from "../components/Todo/AddTodoButton";
import { GroupedTodos } from "../components/Todo/GroupedTodos";
import { TodoHeader } from "../components/Todo/TodoHeader";
import { Box, useToast } from "@chakra-ui/react";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const TodoPage = () => {
    const [mode, setMode] = React.useState<"dashboard" | "calendar">("dashboard");

    // initialize state with your mock data only once
    const [todos, setTodos] = React.useState<Todo[]>([]);

    const toast = useToast();

    const toggleTodo = async (id: string) => {
        try {
            //update database
            const updatedTododocRef = doc(db, "BrainBurrowTodos", id);
            const document = await getDoc(updatedTododocRef);
            if (document) {
                await updateDoc(updatedTododocRef, { completed: !document.data()?.completed });
            }
            //updtae state
            setTodos((prev) =>
                prev.map((todo) =>
                    todo.id === id ? { ...todo, completed: !todo.completed } : todo
                )
            );

        } catch (err) {
            console.error("Error toggling todo:", err);
            toast({
                title: "Error togling todo",
                description: (err as Error).message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const addTodo = (todo: Todo) => {
        setTodos((prev) => [...prev, todo]);
    };

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const snapshot = await getDocs(collection(db, "BrainBurrowTodos"));
                const todoList: Todo[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Todo, "id">),
                }));
                setTodos(todoList);
                console.log(todos);
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
    }, []);

    const groupedTodos = GroupedTodos(todos);
    return (
        <>
            <TodoHeader />
            <br></br>
            <Box position="fixed" top="100px" left="20px" zIndex={10}>
                <TodoViewToggle mode={mode} onChange={setMode} />
            </Box>
            {mode === "dashboard" ? (
                <TodoDashboard groupedTodos={groupedTodos} toggleTodo={toggleTodo} setTodos={setTodos} />
            ) : (
                <TodoCalendar todos={todos} onSelectDate={(d) => console.log(d)} />
            )}
            <AddTodoButton onAdd={addTodo} />
        </>
    );
};

