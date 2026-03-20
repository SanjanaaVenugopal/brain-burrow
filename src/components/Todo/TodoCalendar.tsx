import React, { useState, useMemo, useRef } from "react";
import Calendar from "react-calendar";
import {
    Box, Text, Flex, Checkbox, Tag, TagLabel, Heading, IconButton, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button,
} from "@chakra-ui/react";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { DisplayTodo, Todo } from "./Todo.type";
import { normalizeDate } from "./NormalizeDates";
import { computeDisplayTodos } from "./computeInstances";
import { Edit2, Plus, Repeat, Trash2 } from "lucide-react";
import { CloseButtonIcon } from "../HomePage/CommandBar/CloseButtonIcon";
import { addTodo } from "./TodoSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useTodoForm } from "./useTodoForm";
import { useToggleTodo } from "./useToggleTodo";
import { useDeleteTodo } from "./useDeleteTodo";
import { useEditAllInstances, useEditJustToday, useUpdateTodo } from "./useEditTodo";
import { TodoModal } from "./TodoModal";

export const TodoCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activeMonth, setActiveMonth] = useState(new Date());
    const todos = useSelector((state: RootState) => state.todos.todos);
    const dispatch = useDispatch<AppDispatch>();

    const toggleTodo = useToggleTodo();
    const removeTodo = useDeleteTodo();
    const editAllInstances = useEditAllInstances();
    const editJustToday = useEditJustToday();
    const updateRegular = useUpdateTodo();

    // Modal / dialog state
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const [editingTodo, setEditingTodo] = useState<DisplayTodo | undefined>(undefined);
    const [pendingEditTodo, setPendingEditTodo] = useState<Todo | undefined>(undefined);

    // Compute display todos for the visible calendar month (with padding)
    const displayTodos = useMemo(() => {
        const monthStart = addDays(startOfMonth(activeMonth), -7);
        const monthEnd = addDays(endOfMonth(activeMonth), 7);
        return computeDisplayTodos(todos, { rangeStart: monthStart, rangeEnd: monthEnd });
    }, [todos, activeMonth]);

    // Group todos by date string for fast lookup
    const todosByDate = useMemo(() => {
        const map = new Map<string, DisplayTodo[]>();
        for (const todo of displayTodos) {
            const date = normalizeDate(todo.scheduledAt) || normalizeDate(todo.dueDate);
            if (!date) continue;
            const key = format(date, "yyyy-MM-dd");
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(todo);
        }
        return map;
    }, [displayTodos]);

    const selectedTodos = useMemo(() => {
        if (!selectedDate) return [];
        const key = format(selectedDate, "yyyy-MM-dd");
        return (todosByDate.get(key) || []).sort((a, b) => {
            const aDate = normalizeDate(a.scheduledAt);
            const bDate = normalizeDate(b.scheduledAt);
            return aDate && bDate ? aDate.getTime() - bDate.getTime() : 0;
        });
    }, [selectedDate, todosByDate]);

    // ── Toggle ──
    const handleToggle = async (todo: DisplayTodo) => toggleTodo(todo);

    // ── Delete ──
    const handleDelete = async (todo: DisplayTodo) => removeTodo(todo);

    // ── Edit ──
    const handleEditSubmit = async (todo: Todo) => {
        if (editingTodo?._virtualDate) {
            setPendingEditTodo(todo);
            onEditClose();
            onAlertOpen();
        } else {
            await updateRegular(todo, editingTodo!);
            onEditClose();
            setEditingTodo(undefined);
        }
    };

    const editForm = useTodoForm({ onSuccess: handleEditSubmit, skipFirestore: true });

    const openEditFor = (todo: DisplayTodo) => {
        setEditingTodo(todo);
        let enriched: Todo = todo;
        if (todo._baseId) {
            const baseTodo = todos.find((t) => t.id === todo._baseId);
            if (baseTodo) enriched = { ...todo, recurring: baseTodo.recurring, recurringEndDate: baseTodo.recurringEndDate };
        }
        editForm.loadTodo(enriched);
        onEditOpen();
    };

    // ── Add new task ──
    const handleAddSubmit = (todo: Todo) => {
        dispatch(addTodo(todo));
        onAddClose();
    };

    const addForm = useTodoForm({ onSuccess: handleAddSubmit });

    const openAddForDate = () => {
        addForm.resetForm();
        if (selectedDate) addForm.setScheduledAt(selectedDate);
        onAddOpen();
    };

    return (
        <Box mx="auto" maxW="900px" px={4}>
            <Box
                backdropFilter="blur(10px)"
                bg="rgba(120, 81, 169, 0.25)"
                borderRadius="2xl"
                border="1px solid rgba(255,255,255,0.15)"
                p={6}
                shadow="xl"
                className="todo-calendar"
            >
                <Calendar
                    onClickDay={(date: Date) => setSelectedDate(date)}
                    onActiveStartDateChange={({ activeStartDate }: { activeStartDate: Date | null }) => {
                        if (activeStartDate) setActiveMonth(activeStartDate);
                    }}
                    tileClassName={({ date }: { date: Date }) => {
                        const key = format(date, "yyyy-MM-dd");
                        const dayTodos = todosByDate.get(key);
                        return dayTodos?.length ? "has-tasks" : "";
                    }}
                    formatDay={(_locale: string | undefined, date: Date) => date.getDate().toString()}
                    tileContent={({ date }: { date: Date }) => {
                        const key = format(date, "yyyy-MM-dd");
                        const dayTodos = todosByDate.get(key);
                        if (!dayTodos?.length) return null;

                        const shown = dayTodos.slice(0, 2);
                        const extra = dayTodos.length - 2;

                        return (
                            <Box mt={1} w="100%">
                                {shown.map((t, i) => (
                                    <div
                                        key={i}
                                        className={`cal-task-pill ${t.completed ? "cal-task-pill--done" : "cal-task-pill--active"}`}
                                    >
                                        {t.title}
                                    </div>
                                ))}
                                {extra > 0 && (
                                    <Text fontSize="2xs" className="!text-purple-600 dark:!text-purple-200" opacity={0.7} lineHeight="1.2" mt="1px">
                                        +{extra} more
                                    </Text>
                                )}
                            </Box>
                        );
                    }}
                />
            </Box>

            {/* Day detail modal */}
            <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} isCentered size="md">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
                <ModalContent
                    className="!bg-zinc-600/30 !backdrop-blur-md !border !border-white/15"
                    rounded="2xl"
                    shadow="xl"
                    position="relative"
                    maxH="70vh"
                >
                    <CloseButtonIcon onClick={() => setSelectedDate(null)} wantDark={false} />
                    <ModalHeader className="!text-white/80" pt={6} pb={2}>
                        <Heading fontSize="lg">
                            {selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : ""}
                        </Heading>
                        <Flex align="center" justify="space-between" mt={1}>
                            {selectedTodos.length > 0 && (
                                <Text fontSize="sm" fontWeight="normal" opacity={0.5}>
                                    {selectedTodos.filter((t) => t.completed).length}/{selectedTodos.length} completed
                                </Text>
                            )}
                            <IconButton
                                aria-label="Add task"
                                icon={<Plus size={16} />}
                                size="sm"
                                variant="ghost"
                                className="!text-white/60 hover:!text-white hover:!bg-white/10"
                                onClick={openAddForDate}
                            />
                        </Flex>
                    </ModalHeader>
                    <ModalBody pb={6} overflowY="auto">
                        {selectedTodos.length === 0 ? (
                            <Flex direction="column" align="center" py={8} gap={3}>
                                <Text className="!text-white/40" textAlign="center">
                                    No tasks for this day
                                </Text>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={<Plus size={14} />}
                                    className="!text-white/50 hover:!text-white hover:!bg-white/10"
                                    onClick={openAddForDate}
                                >
                                    Add a task
                                </Button>
                            </Flex>
                        ) : (
                            selectedTodos.map((todo, i) => (
                                <Flex
                                    key={todo._virtualDate ? `${todo._baseId}::${todo._virtualDate}` : todo.id}
                                    align="center"
                                    p={2}
                                    borderRadius="md"
                                    _hover={{ bg: "whiteAlpha.100" }}
                                    transition="background 0.2s ease"
                                    gap={3}
                                    borderBottom={i < selectedTodos.length - 1 ? "1px solid" : "none"}
                                    borderColor="whiteAlpha.100"
                                    role="group"
                                    opacity={todo.completed ? 0.45 : 1}
                                >
                                    <Checkbox
                                        isChecked={todo.completed}
                                        onChange={() => handleToggle(todo)}
                                        flexShrink={0}
                                        colorScheme="purple"
                                    />

                                    <Box flex="1" textAlign="left">
                                        <Text
                                            className="!text-white/80"
                                            fontWeight="medium"
                                            as={todo.completed ? "del" : undefined}
                                            noOfLines={1}
                                        >
                                            {todo.title}
                                            {todo._virtualDate && (
                                                <Repeat size={12} style={{ display: "inline-block", marginLeft: "6px", verticalAlign: "middle", opacity: 0.7 }} />
                                            )}
                                        </Text>

                                        {todo.scheduledAt && (
                                            <Text fontSize="sm" className="!text-white/50">
                                                🕒 {format(normalizeDate(todo.scheduledAt)!, "hh:mm a")}
                                            </Text>
                                        )}

                                        {todo.description && (
                                            <Text fontSize="xs" className="!text-white/40" noOfLines={1} mt={0.5}>
                                                {todo.description}
                                            </Text>
                                        )}

                                        {todo.tags && todo.tags.length > 0 && (
                                            <Flex wrap="wrap" gap={1} mt={1}>
                                                {todo.tags.map((tag, j) => (
                                                    <Tag key={j} size="sm" colorScheme="purple" borderRadius="full">
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
                                            icon={<Edit2 size={14} />}
                                            onClick={() => openEditFor(todo)}
                                            className="!text-white/60 hover:!text-white hover:!bg-white/10 !border-none transition"
                                        />
                                        {!todo._virtualDate && (
                                            <IconButton
                                                size="xs"
                                                variant="ghost"
                                                aria-label="Delete"
                                                icon={<Trash2 size={14} />}
                                                onClick={() => handleDelete(todo)}
                                                className="!text-red-400 hover:!text-red-300 hover:!bg-red-500/20 !border-none transition"
                                            />
                                        )}
                                    </Flex>
                                </Flex>
                            ))
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Edit Todo Modal */}
            <TodoModal isOpen={isEditOpen} onClose={onEditClose} form={editForm} title="Edit Todo" submitLabel="Update" />

            {/* Add Todo Modal */}
            <TodoModal isOpen={isAddOpen} onClose={onAddClose} form={addForm} title="Add a new Todo" submitLabel="Add" />

            {/* "Update all or just today" recurring dialog */}
            <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
                <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
                    <AlertDialogContent
                        className="!bg-zinc-600/30 !backdrop-blur-md !border !border-white/15"
                        rounded="2xl" shadow="xl" position="relative"
                    >
                        <CloseButtonIcon onClick={() => { onAlertClose(); setEditingTodo(undefined); setPendingEditTodo(undefined); }} wantDark={false} />
                        <AlertDialogHeader className="!text-white/80" fontSize="lg" fontWeight="bold" pt={6}>
                            Update Recurring Todo
                        </AlertDialogHeader>
                        <AlertDialogBody className="!text-white/60">
                            Do you want to update all instances or just this one?
                        </AlertDialogBody>
                        <AlertDialogFooter gap={3} pb={6}>
                            <Button
                                ref={cancelRef}
                                onClick={async () => { if (pendingEditTodo) await editJustToday(pendingEditTodo, editingTodo!); onAlertClose(); setEditingTodo(undefined); setPendingEditTodo(undefined); }}
                                variant="outline"
                                className="!text-white/80 !border-white/20 hover:!bg-white/10"
                            >
                                Just Today
                            </Button>
                            <Button
                                onClick={async () => { if (pendingEditTodo) await editAllInstances(pendingEditTodo, editingTodo!); onAlertClose(); setEditingTodo(undefined); setPendingEditTodo(undefined); }}
                                bg="purple.600" color="white" _hover={{ bg: "purple.700" }} className="!shadow-md"
                            >
                                All Instances
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};
