import React, { useState, useMemo } from "react";
import {
    Box, Flex, Text, Heading, Checkbox, IconButton, Input, Button, useToast,
    useDisclosure,
} from "@chakra-ui/react";
import { Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Board, BoardTask } from "./Board.type";
import {
    updateBoard, addBoardTask, deleteBoardTask, toggleBoardTask, updateBoardTask,
} from "./BoardSlice";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useTodoForm } from "../Todo/useTodoForm";
import { TodoModal } from "../Todo/TodoModal";
import { Todo } from "../Todo/Todo.type";
import { normalizeDate } from "../Todo/NormalizeDates";
import { format } from "date-fns";

type Props = {
    boardId: string;
};

export const BoardView: React.FC<Props> = ({ boardId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    const board = useSelector((state: RootState) =>
        state.boards.boards.find((b) => b.id === boardId)
    );
    const allTasks = useSelector((state: RootState) => state.boards.tasks);
    const boardTasks = allTasks.filter((t) => t.boardId === boardId);

    const [addingColumnName, setAddingColumnName] = useState("");
    const [isAddingColumn, setIsAddingColumn] = useState(false);

    // For add/edit task via TodoModal
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalColumnId, setModalColumnId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<BoardTask | null>(null);

    // Convert a BoardTask to a Todo shape for the form
    const editingAsTodo: Todo | undefined = useMemo(() => {
        if (!editingTask) return undefined;
        return {
            id: editingTask.id,
            title: editingTask.title,
            description: editingTask.description,
            completed: editingTask.completed,
            scheduledAt: editingTask.scheduledAt ? normalizeDate(editingTask.scheduledAt) : undefined,
            tags: editingTask.tags,
        };
    }, [editingTask]);

    const handleFormSuccess = async (todo: Todo) => {
        if (editingTask) {
            // Edit existing
            const updated: BoardTask = {
                ...editingTask,
                title: todo.title,
                description: todo.description,
                scheduledAt: todo.scheduledAt,
                tags: todo.tags,
            };
            try {
                await updateDoc(doc(db, "BrainBurrowBoardTasks", updated.id), {
                    title: updated.title,
                    description: updated.description || "",
                    scheduledAt: updated.scheduledAt || null,
                    tags: updated.tags || [],
                });
                dispatch(updateBoardTask(updated));
            } catch (err) {
                toast({ title: "Error updating task", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
            }
        } else if (modalColumnId) {
            // Add new
            const colTasks = boardTasks.filter((t) => t.columnId === modalColumnId);
            const task: BoardTask = {
                id: "",
                boardId,
                columnId: modalColumnId,
                title: todo.title,
                completed: false,
                description: todo.description,
                scheduledAt: todo.scheduledAt,
                tags: todo.tags,
                order: colTasks.length,
            };
            try {
                const docRef = await addDoc(collection(db, "BrainBurrowBoardTasks"), task);
                await updateDoc(docRef, { id: docRef.id });
                task.id = docRef.id;
                dispatch(addBoardTask(task));
            } catch (err) {
                toast({ title: "Error adding task", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
            }
        }
        onClose();
        setEditingTask(null);
        setModalColumnId(null);
    };

    const form = useTodoForm({
        existingTodo: editingAsTodo,
        onSuccess: handleFormSuccess,
        skipFirestore: true,
    });

    const openAddModal = (columnId: string) => {
        setEditingTask(null);
        setModalColumnId(columnId);
        onOpen();
    };

    const openEditModal = (task: BoardTask) => {
        setEditingTask(task);
        setModalColumnId(task.columnId);
        onOpen();
    };

    if (!board) return null;

    const handleAddColumn = async () => {
        const name = addingColumnName.trim();
        if (!name) return;

        const newCol = { id: `col-${Date.now()}`, name };
        const updated: Board = { ...board, columns: [...board.columns, newCol] };
        try {
            await updateDoc(doc(db, "BrainBurrowBoards", board.id), {
                columns: updated.columns,
            });
            dispatch(updateBoard(updated));
            setAddingColumnName("");
            setIsAddingColumn(false);
        } catch (err) {
            toast({ title: "Error adding column", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        const updated: Board = {
            ...board,
            columns: board.columns.filter((c) => c.id !== columnId),
        };
        try {
            await updateDoc(doc(db, "BrainBurrowBoards", board.id), {
                columns: updated.columns,
            });
            // Delete tasks in this column
            const colTasks = boardTasks.filter((t) => t.columnId === columnId);
            for (const t of colTasks) {
                await deleteDoc(doc(db, "BrainBurrowBoardTasks", t.id));
                dispatch(deleteBoardTask(t.id));
            }
            dispatch(updateBoard(updated));
        } catch (err) {
            toast({ title: "Error deleting column", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };

    const handleToggleTask = async (task: BoardTask) => {
        dispatch(toggleBoardTask(task.id));
        try {
            await updateDoc(doc(db, "BrainBurrowBoardTasks", task.id), {
                completed: !task.completed,
            });
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(db, "BrainBurrowBoardTasks", taskId));
            dispatch(deleteBoardTask(taskId));
        } catch (err) {
            toast({ title: "Error deleting task", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };



    return (
        <Box>
            <Heading fontSize="2xl" mb={1} className="!text-white">
                {board.name}
            </Heading>
            <Text fontSize="sm" className="!text-white/40" mb={6}>
                {board.columns.length} column{board.columns.length !== 1 ? "s" : ""} · {boardTasks.length} task{boardTasks.length !== 1 ? "s" : ""}
            </Text>

            <Flex gap={5} overflowX="auto" pb={4} align="flex-start">
                {board.columns.map((col) => {
                    const colTasks = boardTasks
                        .filter((t) => t.columnId === col.id)
                        .sort((a, b) => a.order - b.order);

                    return (
                        <Box
                            key={col.id}
                            minW="300px"
                            maxW="340px"
                            bg="rgba(120, 81, 169, 0.25)"
                            backdropFilter="blur(10px)"
                            border="1px solid rgba(255,255,255,0.15)"
                            rounded="2xl"
                            p={4}
                            shadow="md"
                            flexShrink={0}
                        >
                            {/* Column header */}
                            <Flex align="center" justify="space-between" mb={3}>
                                <Heading fontSize="md" className="!text-white/90">
                                    {col.name}
                                </Heading>
                                <Flex gap={1}>
                                    <Text fontSize="xs" className="!text-white/40" mt={1}>
                                        {colTasks.length}
                                    </Text>
                                    <IconButton
                                        aria-label="Delete column"
                                        icon={<Trash2 size={12} />}
                                        size="xs"
                                        variant="ghost"
                                        color="whiteAlpha.400"
                                        _hover={{ color: "red.300" }}
                                        onClick={() => handleDeleteColumn(col.id)}
                                    />
                                </Flex>
                            </Flex>

                            {/* Tasks */}
                            {colTasks.map((task) => (
                                <Flex
                                    key={task.id}
                                    align="center"
                                    p={2}
                                    mb={1}
                                    rounded="lg"
                                    bg="whiteAlpha.50"
                                    _hover={{ bg: "whiteAlpha.100" }}
                                    transition="background 0.15s"
                                    role="group"
                                    gap={2}
                                >
                                    <GripVertical size={12} opacity={0.3} style={{ flexShrink: 0 }} />
                                    <Checkbox
                                        isChecked={task.completed}
                                        onChange={() => handleToggleTask(task)}
                                        colorScheme="purple"
                                        flexShrink={0}
                                    />
                                    <Box flex={1} minW={0}>
                                        <Text
                                            fontSize="sm"
                                            className="!text-white/80"
                                            as={task.completed ? "del" : undefined}
                                            noOfLines={1}
                                            opacity={task.completed ? 0.5 : 1}
                                        >
                                            {task.title}
                                        </Text>
                                        {task.description && (
                                            <Text fontSize="xs" className="!text-white/30" noOfLines={1}>
                                                {task.description}
                                            </Text>
                                        )}
                                        {task.scheduledAt && (
                                            <Text fontSize="xs" className="!text-white/40">
                                                🕒 {format(normalizeDate(task.scheduledAt)!, "MMM d, hh:mm a")}
                                            </Text>
                                        )}
                                    </Box>
                                    <Flex
                                        opacity={0}
                                        _groupHover={{ opacity: 1 }}
                                        transition="opacity 0.15s"
                                        gap={0.5}
                                        flexShrink={0}
                                    >
                                        <IconButton
                                            aria-label="Edit"
                                            icon={<Edit2 size={12} />}
                                            size="xs"
                                            variant="ghost"
                                            color="whiteAlpha.500"
                                            _hover={{ color: "white" }}
                                            onClick={() => openEditModal(task)}
                                        />
                                        <IconButton
                                            aria-label="Delete"
                                            icon={<Trash2 size={12} />}
                                            size="xs"
                                            variant="ghost"
                                            color="whiteAlpha.400"
                                            _hover={{ color: "red.300" }}
                                            onClick={() => handleDeleteTask(task.id)}
                                        />
                                    </Flex>
                                </Flex>
                            ))}

                            {/* Add task */}
                            <Flex
                                align="center"
                                gap={1}
                                mt={2}
                                px={2}
                                py={1.5}
                                rounded="lg"
                                cursor="pointer"
                                _hover={{ bg: "whiteAlpha.100" }}
                                transition="background 0.15s"
                                onClick={() => openAddModal(col.id)}
                            >
                                <Plus size={14} opacity={0.4} />
                                <Text fontSize="xs" className="!text-white/40">
                                    Add task
                                </Text>
                            </Flex>
                        </Box>
                    );
                })}

                {/* Add column button */}
                {isAddingColumn ? (
                    <Box
                        minW="280px"
                        bg="rgba(120, 81, 169, 0.15)"
                        border="1px dashed rgba(255,255,255,0.2)"
                        rounded="2xl"
                        p={4}
                        flexShrink={0}
                    >
                        <Input
                            placeholder="Column name (e.g. January, Phase 1...)"
                            size="sm"
                            value={addingColumnName}
                            onChange={(e) => setAddingColumnName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            className="!text-white"
                            rounded="lg"
                            autoFocus
                        />
                        <Flex gap={2} mt={3}>
                            <Button size="sm" colorScheme="purple" onClick={handleAddColumn}>
                                Add Column
                            </Button>
                            <Button size="sm" variant="ghost" className="!text-white/60"
                                onClick={() => { setIsAddingColumn(false); setAddingColumnName(""); }}>
                                Cancel
                            </Button>
                        </Flex>
                    </Box>
                ) : (
                    <Flex
                        minW="200px"
                        h="100px"
                        align="center"
                        justify="center"
                        border="1px dashed rgba(255,255,255,0.15)"
                        rounded="2xl"
                        cursor="pointer"
                        _hover={{ bg: "whiteAlpha.50", borderColor: "whiteAlpha.300" }}
                        transition="all 0.2s"
                        flexShrink={0}
                        onClick={() => setIsAddingColumn(true)}
                    >
                        <Flex align="center" gap={2}>
                            <Plus size={16} opacity={0.4} />
                            <Text fontSize="sm" className="!text-white/40">
                                Add Column
                            </Text>
                        </Flex>
                    </Flex>
                )}
            </Flex>

            <TodoModal
                isOpen={isOpen}
                onClose={() => { onClose(); setEditingTask(null); setModalColumnId(null); }}
                form={form}
                title={editingTask ? "Edit Task" : "Add a new Task"}
                submitLabel={editingTask ? "Update" : "Add"}
            />
        </Box>
    );
};
