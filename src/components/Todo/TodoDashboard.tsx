import { Box, Heading, Checkbox, Flex, Text, Tag, TagLabel, IconButton, useToast, useDisclosure,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from "@chakra-ui/react";
import { format } from "date-fns";
import { normalizeDate } from "./NormalizeDates";
import { Edit2, Trash2, Repeat } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { addTodo, deleteTodo, toggleRecurringCompletion, toggleTodo, updateTodo } from "./TodoSlice";
import { deleteBoardTask, toggleBoardTask, updateBoardTask } from "../Board/BoardSlice";
import { GroupedTodos } from "./GroupedTodos";
import { useTodoForm } from "./useTodoForm";
import { DisplayTodo, Todo } from "./Todo.type";
import { TodoModal } from "./TodoModal";
import { CloseButtonIcon } from "../HomePage/CommandBar/CloseButtonIcon";
import { computeDisplayTodos } from "./computeInstances";
import React, { useRef, useState } from "react";

type TodoDashboardProps = {
};

export const TodoDashboard: React.FC<TodoDashboardProps> = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const toast = useToast();
    const dispatch = useDispatch<AppDispatch>();

    const todos = useSelector((state: RootState) => state.todos.todos);
    const boards = useSelector((state: RootState) => state.boards.boards);
    const boardTasks = useSelector((state: RootState) => state.boards.tasks);

    // Build board name lookup
    const boardNameMap = React.useMemo(() => {
        const map = new Map<string, string>();
        for (const b of boards) map.set(b.id, b.name);
        return map;
    }, [boards]);

    // Convert board tasks with scheduledAt into DisplayTodos
    const boardDisplayTodos: DisplayTodo[] = React.useMemo(() =>
        boardTasks
            .filter((t) => t.scheduledAt)
            .map((t) => ({
                id: `board::${t.id}`,
                title: t.title,
                completed: t.completed,
                description: t.description,
                scheduledAt: t.scheduledAt,
                tags: t.tags,
                _boardName: boardNameMap.get(t.boardId) || "Board",
                _boardTaskId: t.id,
                _boardId: t.boardId,
            })),
        [boardTasks, boardNameMap]
    );

    const displayTodos = React.useMemo(() => {
        const fromTodos = computeDisplayTodos(todos);
        return [...fromTodos, ...boardDisplayTodos];
    }, [todos, boardDisplayTodos]);

    const [editingTodo, setEditingTodo] = useState<DisplayTodo | undefined>(undefined);
    const [pendingEditTodo, setPendingEditTodo] = useState<Todo | undefined>(undefined);

    const groupedTodos = GroupedTodos(displayTodos);

    const handleToggle = async (todo: DisplayTodo) => {
        // Board task toggle
        if (todo._boardTaskId) {
            dispatch(toggleBoardTask(todo._boardTaskId));
            try {
                const docRef = doc(db, "BrainBurrowBoardTasks", todo._boardTaskId);
                await updateDoc(docRef, { completed: !todo.completed });
            } catch (err) { console.error("Error toggling board task:", err); }
            return;
        }

        if (todo._virtualDate && todo._baseId) {
            // Recurring virtual instance — toggle completion in base doc's completions map
            const baseId = todo._baseId;
            const dateStr = todo._virtualDate;
            const baseTodo = todos.find((t) => t.id === baseId);
            const wasCompleted = !!baseTodo?.completions?.[dateStr];

            dispatch(toggleRecurringCompletion({ baseId, dateStr }));

            try {
                const baseDocRef = doc(db, "BrainBurrowTodos", baseId);
                if (wasCompleted) {
                    await updateDoc(baseDocRef, { [`completions.${dateStr}`]: null });
                } else {
                    await updateDoc(baseDocRef, {
                        [`completions.${dateStr}`]: { completedAt: new Date().toISOString() },
                    });
                }
            } catch (err) {
                console.error("Error toggling recurring completion:", err);
            }
        } else {
            // Regular todo
            dispatch(toggleTodo(todo.id));
            try {
                const docRef = doc(db, "BrainBurrowTodos", todo.id);
                const newCompleted = !todo.completed;
                await updateDoc(docRef, {
                    completed: newCompleted,
                    completedAt: newCompleted ? new Date() : null,
                });
            } catch (err) {
                console.error("Error updating Firestore:", err);
            }
        }
    };

    const handleDelete = async (todo: DisplayTodo) => {
        // Board task delete
        if (todo._boardTaskId) {
            try {
                await deleteDoc(doc(db, "BrainBurrowBoardTasks", todo._boardTaskId));
                dispatch(deleteBoardTask(todo._boardTaskId));
            } catch (error) {
                toast({ title: "Error deleting", description: (error as Error).message, status: "error", duration: 3000, isClosable: true });
            }
            return;
        }

        if (todo._baseId && todo.overrideOf) {
            // Delete override doc
            try {
                await deleteDoc(doc(db, "BrainBurrowTodos", todo.id));
                dispatch(deleteTodo(todo.id));
            } catch (error) {
                toast({ title: "Error deleting", description: (error as Error).message, status: "error", duration: 3000, isClosable: true });
            }
        } else if (!todo._virtualDate) {
            // Regular todo
            try {
                await deleteDoc(doc(db, "BrainBurrowTodos", todo.id));
                dispatch(deleteTodo(todo.id));
            } catch (error) {
                toast({ title: "Error deleting", description: (error as Error).message, status: "error", duration: 3000, isClosable: true });
            }
        }
    };

    // Called when "Update all instances" is chosen
    const handleEditAll = async (todo: Todo) => {
        if (!editingTodo?._baseId) return;
        const baseId = editingTodo._baseId;
        const updatedBase: Todo = {
            ...todos.find((t) => t.id === baseId)!,
            title: todo.title,
            description: todo.description,
            tags: todo.tags,
            scheduledAt: todo.scheduledAt,
            recurring: todo.recurring,
            recurringEndDate: todo.recurringEndDate,
        };
        try {
            const baseDocRef = doc(db, "BrainBurrowTodos", baseId);
            await updateDoc(baseDocRef, {
                title: todo.title,
                description: todo.description || "",
                tags: todo.tags || [],
                scheduledAt: todo.scheduledAt || null,
                recurring: todo.recurring,
                ...(todo.recurringEndDate ? { recurringEndDate: todo.recurringEndDate } : {}),
            });
            dispatch(updateTodo(updatedBase));
        } catch (err) {
            toast({ title: "Error updating", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };

    // Called when "Just today" is chosen — create an override doc
    const handleEditJustToday = async (todo: Todo) => {
        if (!editingTodo?._virtualDate || !editingTodo?._baseId) return;
        const { recurringEndDate: _re, completions: _c, ...rest } = todo;
        const overrideDoc: Todo = {
            ...rest,
            id: "",
            overrideOf: editingTodo._baseId,
            overrideDate: editingTodo._virtualDate,
            completed: editingTodo.completed,
            recurring: { type: "none" },
        };
        try {
            const docRef = await addDoc(collection(db, "BrainBurrowTodos"), overrideDoc);
            await updateDoc(docRef, { id: docRef.id });
            overrideDoc.id = docRef.id;
            dispatch(addTodo(overrideDoc));
        } catch (err) {
            toast({ title: "Error creating override", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };

    // Called from form submit
    const handleEditSubmit = async (todo: Todo) => {
        // Board task edit
        if (editingTodo?._boardTaskId) {
            try {
                const docRef = doc(db, "BrainBurrowBoardTasks", editingTodo._boardTaskId);
                await updateDoc(docRef, {
                    title: todo.title,
                    description: todo.description || "",
                    tags: todo.tags || [],
                    scheduledAt: todo.scheduledAt || null,
                });
                dispatch(updateBoardTask({
                    ...boardTasks.find((t) => t.id === editingTodo._boardTaskId)!,
                    title: todo.title,
                    description: todo.description,
                    tags: todo.tags,
                    scheduledAt: todo.scheduledAt,
                }));
            } catch (err) {
                toast({ title: "Error updating", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
            }
            onClose();
            setEditingTodo(undefined);
            return;
        }

        if (editingTodo?._virtualDate) {
            // Recurring instance — show "all or just today" dialog
            setPendingEditTodo(todo);
            onClose(); // close edit modal
            onAlertOpen(); // open choice dialog
        } else {
            // Regular todo — update directly in Firestore + Redux
            const updatedTodo = { ...todo, id: editingTodo!.id };
            try {
                const docRef = doc(db, "BrainBurrowTodos", editingTodo!.id);
                await updateDoc(docRef, {
                    title: todo.title,
                    description: todo.description || "",
                    tags: todo.tags || [],
                    scheduledAt: todo.scheduledAt || null,
                    recurring: todo.recurring,
                    ...(todo.recurringEndDate ? { recurringEndDate: todo.recurringEndDate } : {}),
                });
            } catch (err) {
                toast({ title: "Error updating", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
            }
            dispatch(updateTodo(updatedTodo));
            onClose();
            setEditingTodo(undefined);
        }
    };

    const form = useTodoForm({
        onSuccess: handleEditSubmit,
        skipFirestore: true,
    });

    // Build enriched todo and load it into the form
    const openEditFor = (todo: DisplayTodo) => {
        setEditingTodo(todo);
        let enriched: Todo = todo;
        if (todo._baseId) {
            const baseTodo = todos.find((t) => t.id === todo._baseId);
            if (baseTodo) {
                enriched = {
                    ...todo,
                    recurring: baseTodo.recurring,
                    recurringEndDate: baseTodo.recurringEndDate,
                };
            }
        }
        form.loadTodo(enriched);
        onOpen();
    };

    return (
        <>
            <Flex wrap="wrap" gap={6} justify="center">
                {Object.entries(groupedTodos).map(([group, todos], idx) => (
                    <Box
                        key={idx}
                        backdropFilter="blur(10px)"
                        bg="rgba(120, 81, 169, 0.25)"
                        border="1px solid rgba(255,255,255,0.15)"
                        rounded="2xl"
                        p={4}
                        w="380px"
                        shadow="md"
                    >
                        <Heading fontSize="lg" mb={3}>
                            {group}
                        </Heading>

                        {todos.map((todo) => (
                            <Flex
                                align="center"
                                p={2}
                                borderRadius="md"
                                _hover={{ bg: "whiteAlpha.200" }}
                                role="group"
                                transition="all 0.2s ease"
                                justify="flex-start"
                                gap={3}
                                opacity={todo.completed ? 0.45 : 1}
                                key={todo._virtualDate ? `${todo._baseId}::${todo._virtualDate}` : todo.id}
                            >
                                <Checkbox
                                    isChecked={todo.completed}
                                    onChange={() => handleToggle(todo)}
                                    colorScheme="purple"
                                    className="[&>span]:!border-purple-600 dark:[&>span]:!border-white/40"
                                    flexShrink={0}
                                />

                                <Box flex="1" textAlign="left">
                                    <Text
                                        fontWeight="medium"
                                        as={todo.completed ? "del" : undefined}
                                        noOfLines={1}
                                    >
                                        {todo.title}
                                        {todo._virtualDate && (
                                            <Repeat size={12} style={{ display: "inline-block", marginLeft: "6px", verticalAlign: "middle", opacity: 0.7 }} />
                                        )}
                                    </Text>

                                    {(group === "Today" || group === "Tomorrow") && todo.scheduledAt && (
                                        <Text fontSize="sm" opacity={0.7}>
                                            🕒 {format(normalizeDate(todo.scheduledAt)!, "hh:mm a")}
                                        </Text>
                                    )}

                                    {todo.tags && todo.tags.length > 0 && (
                                        <Flex wrap="wrap" gap={1} mt={1}>
                                            {todo._boardName && (
                                                <Tag size="sm" colorScheme="pink" borderRadius="full">
                                                    <TagLabel>{todo._boardName}</TagLabel>
                                                </Tag>
                                            )}
                                            {todo.tags.map((tag, i) => (
                                                <Tag key={i} size="sm" colorScheme="purple" borderRadius="full">
                                                    <TagLabel>{tag}</TagLabel>
                                                </Tag>
                                            ))}
                                        </Flex>
                                    )}
                                    {!todo.tags?.length && todo._boardName && (
                                        <Flex wrap="wrap" gap={1} mt={1}>
                                            <Tag size="sm" colorScheme="pink" borderRadius="full">
                                                <TagLabel>{todo._boardName}</TagLabel>
                                            </Tag>
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
                                        onClick={() => openEditFor(todo)}
                                        className="!bg-transparent !border-none hover:opacity-80 transition"
                                    />
                                    {(!todo._virtualDate || todo._boardTaskId) && (
                                        <IconButton
                                            size="xs"
                                            variant="ghost"
                                            aria-label="Delete"
                                            icon={<Trash2 size={14} className="text-purple-950 dark:text-white" />}
                                            onClick={() => handleDelete(todo)}
                                            className="!bg-transparent !border-none hover:opacity-80 transition"
                                        />
                                    )}
                                </Flex>
                            </Flex>
                        ))}
                    </Box>
                ))}
            </Flex>

            <TodoModal isOpen={isOpen} onClose={onClose} form={form} title="Edit Todo" submitLabel="Update" />

            {/* "Update all or just today" dialog */}
            <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
                <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
                    <AlertDialogContent
                        className="!bg-zinc-600/30 !backdrop-blur-md !border !border-white/15"
                        rounded="2xl"
                        shadow="xl"
                        position="relative"
                    >
                        <CloseButtonIcon
                            onClick={() => {
                                onAlertClose();
                                setEditingTodo(undefined);
                                setPendingEditTodo(undefined);
                            }}
                            wantDark={false}
                        />
                        <AlertDialogHeader className="!text-white/80" fontSize="lg" fontWeight="bold" pt={6}>
                            Update Recurring Todo
                        </AlertDialogHeader>
                        <AlertDialogBody className="!text-white/60">
                            Do you want to update all instances or just this one?
                        </AlertDialogBody>
                        <AlertDialogFooter gap={3} pb={6}>
                            <Button
                                onClick={async () => {
                                    if (pendingEditTodo) await handleEditJustToday(pendingEditTodo);
                                    onAlertClose();
                                    setEditingTodo(undefined);
                                    setPendingEditTodo(undefined);
                                }}
                                variant="outline"
                                className="!text-white/80 !border-white/20 hover:!bg-white/10"
                            >
                                Just Today
                            </Button>
                            <Button
                                onClick={async () => {
                                    if (pendingEditTodo) await handleEditAll(pendingEditTodo);
                                    onAlertClose();
                                    setEditingTodo(undefined);
                                    setPendingEditTodo(undefined);
                                }}
                                bg="purple.600"
                                color="white"
                                _hover={{ bg: "purple.700" }}
                                className="!shadow-md"
                            >
                                All Instances
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}

