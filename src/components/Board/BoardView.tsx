import React, { useState, useMemo } from "react";
import {
    Box, Flex, Text, Heading, Checkbox, IconButton, Input, Button, Tag, TagLabel, useToast,
    useDisclosure,
} from "@chakra-ui/react";
import { Plus, Trash2, Edit2 } from "lucide-react";
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
    const boardTasks = useMemo(() => allTasks.filter((t) => t.boardId === boardId), [allTasks, boardId]);

    const [addingColumnName, setAddingColumnName] = useState("");
    const [isAddingColumn, setIsAddingColumn] = useState(false);

    // For add/edit task via TodoModal
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalColumnId, setModalColumnId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<BoardTask | null>(null);

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
                description: todo.description || "",
                tags: todo.tags || [],
                order: colTasks.length,
                ...(todo.scheduledAt ? { scheduledAt: todo.scheduledAt } : {}),
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
        onSuccess: handleFormSuccess,
        skipFirestore: true,
    });

    const openAddModal = (columnId: string) => {
        setEditingTask(null);
        setModalColumnId(columnId);
        form.resetForm();
        onOpen();
    };

    const openEditModal = (task: BoardTask) => {
        setEditingTask(task);
        setModalColumnId(task.columnId);
        form.loadTodo({
            id: task.id,
            title: task.title,
            description: task.description,
            completed: task.completed,
            scheduledAt: task.scheduledAt ? normalizeDate(task.scheduledAt) : undefined,
            tags: task.tags,
        });
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
            <div className="w-full flex justify-center">
                <div className="flex flex-col items-center text-center max-w-3xl w-full">
                    <h1 className="text-4xl md:text-5xl font-bold italic">{board.name}</h1>
                    <p className="text-base md:text-lg mt-2 text-purple-950/40 dark:text-white/40">
                        {board.columns.length} column{board.columns.length !== 1 ? "s" : ""} · {boardTasks.length} task{boardTasks.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <Flex gap={5} overflowX="auto" pb={4} pt={6} align="flex-start">
                {board.columns.map((col) => {
                    const colTasks = boardTasks
                        .filter((t) => t.columnId === col.id)
                        .sort((a, b) => a.order - b.order);

                    return (
                        <Box
                            key={col.id}
                            minW="300px"
                            maxW="340px"
                            className="bg-purple-300/50 dark:bg-[rgba(120,81,169,0.25)] border border-purple-400/30 dark:border-white/15"
                            backdropFilter="blur(10px)"
                            rounded="2xl"
                            p={4}
                            shadow="md"
                            flexShrink={0}
                        >
                            {/* Column header */}
                            <Flex align="center" justify="space-between" mb={3} role="group">
                                <Heading fontSize="lg">
                                    {col.name}
                                </Heading>
                                <Flex gap={1} align="center">
                                    <Text fontSize="xs" className="!text-purple-950/40 dark:!text-white/40" mt={1}>
                                        {colTasks.length}
                                    </Text>
                                    <IconButton
                                        aria-label="Delete column"
                                        icon={<Trash2 size={14} className="text-purple-950 dark:text-white" />}
                                        size="xs"
                                        variant="ghost"
                                        className="!bg-transparent !border-none hover:opacity-80 transition"
                                        opacity={0}
                                        _groupHover={{ opacity: 1 }}
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
                                    borderRadius="md"
                                    _hover={{ bg: "whiteAlpha.200" }}
                                    role="group"
                                    transition="all 0.2s ease"
                                    justify="flex-start"
                                    gap={3}
                                    opacity={task.completed ? 0.45 : 1}
                                >
                                    <Checkbox
                                        isChecked={task.completed}
                                        onChange={() => handleToggleTask(task)}
                                        colorScheme="purple"
                                        className="[&>span]:!border-purple-600 dark:[&>span]:!border-white/40"
                                        flexShrink={0}
                                    />
                                    <Box flex="1" textAlign="left">
                                        <Text
                                            fontWeight="medium"
                                            as={task.completed ? "del" : undefined}
                                            noOfLines={1}
                                        >
                                            {task.title}
                                        </Text>
                                        {task.description && (
                                            <Text fontSize="sm" opacity={0.5} noOfLines={1}>
                                                {task.description}
                                            </Text>
                                        )}
                                        {task.scheduledAt && (
                                            <Text fontSize="sm" className="text-purple-700/70 dark:text-white/70">
                                                🕒 {format(normalizeDate(task.scheduledAt)!, "MMM d, hh:mm a")}
                                            </Text>
                                        )}
                                        {task.tags && task.tags.length > 0 && (
                                            <Flex wrap="wrap" gap={1} mt={1}>
                                                {task.tags.map((tag, i) => (
                                                    <Tag key={i} size="sm" colorScheme="purple" borderRadius="full">
                                                        <TagLabel>{tag}</TagLabel>
                                                    </Tag>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>
                                    <Flex
                                        opacity={0}
                                        _groupHover={{ opacity: 1 }}
                                        transition="opacity 0.2s ease"
                                        gap={1}
                                        flexShrink={0}
                                    >
                                        <IconButton
                                            size="xs"
                                            variant="ghost"
                                            aria-label="Edit"
                                            icon={<Edit2 size={14} className="text-purple-950 dark:text-white" />}
                                            onClick={() => openEditModal(task)}
                                            className="!bg-transparent !border-none hover:opacity-80 transition"
                                        />
                                        <IconButton
                                            size="xs"
                                            variant="ghost"
                                            aria-label="Delete"
                                            icon={<Trash2 size={14} className="text-purple-950 dark:text-white" />}
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="!bg-transparent !border-none hover:opacity-80 transition"
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
                                className="hover:bg-purple-200/40 dark:hover:bg-white/10"
                                transition="background 0.15s"
                                onClick={() => openAddModal(col.id)}
                            >
                                <Plus size={14} className="text-purple-600 dark:text-white/40" />
                                <Text fontSize="xs" className="!text-purple-600 dark:!text-white/40">
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
                        className="bg-purple-100/40 dark:bg-[rgba(120,81,169,0.15)] border border-dashed border-purple-300/30 dark:border-white/20"
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
                            className="!bg-purple-50 dark:!bg-white/10 !text-purple-900 dark:!text-white !border-purple-200 dark:!border-white/20"
                            border="1px solid"
                            rounded="lg"
                            autoFocus
                        />
                        <Flex gap={2} mt={3}>
                            <Button size="sm" colorScheme="purple" onClick={handleAddColumn}>
                                Add Column
                            </Button>
                            <Button size="sm" variant="ghost" className="!text-purple-500 dark:!text-white/60"
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
                        className="border border-dashed border-purple-400/50 dark:border-white/15"
                        rounded="2xl"
                        cursor="pointer"
                        _hover={{ borderColor: "purple.500" }}
                        transition="all 0.2s"
                        flexShrink={0}
                        onClick={() => setIsAddingColumn(true)}
                    >
                        <Flex align="center" gap={2}>
                            <Plus size={16} className="text-purple-600 dark:text-white/40" />
                            <Text fontSize="sm" className="!text-purple-600 dark:!text-white/40">
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
