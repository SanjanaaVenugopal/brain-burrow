import { Box, Heading, Checkbox, Flex, Text, Tag, TagLabel, IconButton, useDisclosure,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from "@chakra-ui/react";
import { format } from "date-fns";
import { normalizeDate } from "./NormalizeDates";
import { Edit2, Trash2, Repeat } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { GroupedTodos } from "./GroupedTodos";
import { useTodoForm } from "./useTodoForm";
import { useToggleTodo } from "./useToggleTodo";
import { useDeleteTodo } from "./useDeleteTodo";
import { useEditAllInstances, useEditJustToday, useUpdateTodo, useUpdateBoardTask } from "./useEditTodo";
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

    const todos = useSelector((state: RootState) => state.todos.todos);
    const boards = useSelector((state: RootState) => state.boards.boards);

    const toggleTodo = useToggleTodo();
    const deleteTodo = useDeleteTodo();
    const editAllInstances = useEditAllInstances();
    const editJustToday = useEditJustToday();
    const updateRegular = useUpdateTodo();
    const updateBoardTask = useUpdateBoardTask();

    // Build board name lookup
    const boardNameMap = React.useMemo(() => {
        const map = new Map<string, string>();
        for (const b of boards) map.set(b.id, b.name);
        return map;
    }, [boards]);

    const displayTodos = React.useMemo(() => {
        const computed = computeDisplayTodos(todos);
        // Enrich board tasks with board name
        return computed.map((t) =>
            t.boardId ? { ...t, _boardName: boardNameMap.get(t.boardId) || "Board" } : t
        );
    }, [todos, boardNameMap]);

    const [editingTodo, setEditingTodo] = useState<DisplayTodo | undefined>(undefined);
    const [pendingEditTodo, setPendingEditTodo] = useState<Todo | undefined>(undefined);

    const groupedTodos = GroupedTodos(displayTodos);

    // Called from form submit
    const handleEditSubmit = async (todo: Todo) => {
        if (editingTodo?.boardId) {
            await updateBoardTask(todo, editingTodo);
            onClose();
            setEditingTodo(undefined);
            return;
        }

        if (editingTodo?._virtualDate) {
            setPendingEditTodo(todo);
            onClose();
            onAlertOpen();
        } else {
            await updateRegular(todo, editingTodo!);
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
                                    onChange={() => toggleTodo(todo)}
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
                                    {(!todo._virtualDate || todo.boardId) && (
                                        <IconButton
                                            size="xs"
                                            variant="ghost"
                                            aria-label="Delete"
                                            icon={<Trash2 size={14} className="text-purple-950 dark:text-white" />}
                                            onClick={() => deleteTodo(todo)}
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
                                    if (pendingEditTodo) await editJustToday(pendingEditTodo, editingTodo!);
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
                                    if (pendingEditTodo) await editAllInstances(pendingEditTodo, editingTodo!);
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

