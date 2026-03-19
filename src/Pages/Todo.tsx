import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { TodoViewToggle } from "../components/Todo/TodoViewToggle";
import { TodoDashboard } from "../components/Todo/TodoDashboard";
import { TodoCalendar } from "../components/Todo/TodoCalendar";
import { Todo } from "../components/Todo/Todo.type";
import { AddTodoButton } from "../components/Todo/AddTodoButton";
import { TodoHeader } from "../components/Todo/TodoHeader";
import { Box, useToast } from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { addTodo, setTodos } from "../components/Todo/TodoSlice";
import { setBoards, setBoardTasks } from "../components/Board/BoardSlice";
import { Board, BoardTask } from "../components/Board/Board.type";
import { BoardSidebar } from "../components/Board/BoardSidebar";
import { BoardView } from "../components/Board/BoardView";
import type { AppDispatch } from "../store";
import { normalizeDate } from "../components/Todo/NormalizeDates";

export const TodoPage = () => {
    const [mode, setMode] = React.useState<"dashboard" | "calendar">("dashboard");
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    // Fetch todos
    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const snapshot = await getDocs(collection(db, "BrainBurrowTodos"));
                const todoList: Todo[] = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        dueDate: normalizeDate(data.dueDate),
                        scheduledAt: normalizeDate(data.scheduledAt),
                        recurringEndDate: normalizeDate(data.recurringEndDate),
                        completedAt: normalizeDate(data.completedAt),
                        completions: data.completions || {},
                    } as Todo;
                });
                dispatch(setTodos(todoList));
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

    // Fetch boards + board tasks
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const snap = await getDocs(collection(db, "BrainBurrowBoards"));
                const boards: Board[] = snap.docs.map((d) => ({
                    ...d.data(),
                    id: d.id,
                } as Board));
                dispatch(setBoards(boards));
            } catch (err) {
                console.error("Error fetching boards:", err);
            }
        };
        const fetchBoardTasks = async () => {
            try {
                const snap = await getDocs(collection(db, "BrainBurrowBoardTasks"));
                const tasks: BoardTask[] = snap.docs.map((d) => ({
                    ...d.data(),
                    id: d.id,
                } as BoardTask));
                dispatch(setBoardTasks(tasks));
            } catch (err) {
                console.error("Error fetching board tasks:", err);
            }
        };
        fetchBoards();
        fetchBoardTasks();
    }, [dispatch]);

    return (
        <>
            <BoardSidebar activeBoardId={activeBoardId} onSelect={setActiveBoardId} />

            {/* Main content area — shifted right for sidebar */}
            <Box ml={{ base: "48px", md: "220px" }} transition="margin 0.2s" minH="100vh" px={4} pt={2}>
                {activeBoardId === null ? (
                    /* Main Dashboard */
                    <>
                        <TodoHeader />
                        <br />
                        <Box position="fixed" top="100px" left={{ base: "68px", md: "240px" }} zIndex={10}>
                            <TodoViewToggle mode={mode} onChange={setMode} />
                        </Box>
                        {mode === "dashboard" ? (
                            <TodoDashboard />
                        ) : (
                            <TodoCalendar />
                        )}
                        <AddTodoButton
                            onAdd={(todo) => dispatch(addTodo(todo))}
                        />
                    </>
                ) : (
                    /* Custom Board */
                    <Box pt={4}>
                        <BoardView boardId={activeBoardId} />
                    </Box>
                )}
            </Box>
        </>
    );
};
