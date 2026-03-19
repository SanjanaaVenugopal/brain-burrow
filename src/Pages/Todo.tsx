import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { TodoViewToggle } from "../components/Todo/TodoViewToggle";
import { TodoDashboard } from "../components/Todo/TodoDashboard";
import { TodoCalendar } from "../components/Todo/TodoCalendar";
import { AddTodoButton } from "../components/Todo/AddTodoButton";
import { TodoHeader } from "../components/Todo/TodoHeader";
import { Box } from "@chakra-ui/react";
import { addTodo } from "../components/Todo/TodoSlice";
import { BoardSidebar } from "../components/Board/BoardSidebar";
import { BoardView } from "../components/Board/BoardView";
import type { AppDispatch } from "../store";

export const TodoPage = () => {
    const [mode, setMode] = React.useState<"dashboard" | "calendar">("dashboard");
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>();

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
