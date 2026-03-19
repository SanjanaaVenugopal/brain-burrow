import React, { useState, useMemo } from "react";
import Calendar from "react-calendar";
import {
    Box, Text, Flex, Checkbox, Tag, TagLabel, Heading,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
} from "@chakra-ui/react";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { DisplayTodo } from "./Todo.type";
import { normalizeDate } from "./NormalizeDates";
import { computeDisplayTodos } from "./computeInstances";
import { Repeat } from "lucide-react";
import { CloseButtonIcon } from "../HomePage/CommandBar/CloseButtonIcon";

export const TodoCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activeMonth, setActiveMonth] = useState(new Date());
    const todos = useSelector((state: RootState) => state.todos.todos);

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
                        {selectedTodos.length > 0 && (
                            <Text fontSize="sm" fontWeight="normal" opacity={0.5} mt={1}>
                                {selectedTodos.filter((t) => t.completed).length}/{selectedTodos.length} completed
                            </Text>
                        )}
                    </ModalHeader>
                    <ModalBody pb={6} overflowY="auto">
                        {selectedTodos.length === 0 ? (
                            <Text className="!text-white/40" textAlign="center" py={8}>
                                No tasks for this day
                            </Text>
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
                                >
                                    <Checkbox
                                        isChecked={todo.completed}
                                        isReadOnly
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
                                </Flex>
                            ))
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};
