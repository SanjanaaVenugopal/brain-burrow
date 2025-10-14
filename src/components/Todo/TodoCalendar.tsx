import React from "react";
import Calendar from "react-calendar";
import { Box, Badge, Stack, useColorModeValue, Text } from "@chakra-ui/react";
import { isSameDay } from "date-fns";
import { Todo } from "./Todo.type";

type Props = {
    todos: Todo[];
    onSelectDate: (date: Date) => void;
};

export const TodoCalendar: React.FC<Props> = ({ todos, onSelectDate }) => {
    const bg = useColorModeValue(
        "rgba(120, 81, 169, 0.25)",
        "rgba(26, 32, 44, 0.5)"
    );

    return (
        <Box
            backdropFilter="blur(10px)"
            bg={bg}
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.15)"
            p={6}
            shadow="xl"
            color="white"
            mx="auto"
        >
            <Calendar
                onClickDay={onSelectDate}
                tileContent={({ date }) => {
                    const dayTodos = todos.filter((t) => isSameDay(t.dueDate ?? Date.now(), date));
                    if (!dayTodos.length) return null;
                    return (
                        <Stack spacing={1} mt={2}>
                            {dayTodos.slice(0, 2).map((t) => (
                                <Badge
                                    key={t.id}
                                    colorScheme={t.completed ? "green" : "purple"}
                                    fontSize="xs"
                                    rounded="lg"
                                >
                                    {t.title}
                                </Badge>
                            ))}
                            {dayTodos.length > 2 && (
                                <Text fontSize="xs" opacity={0.7}>
                                    +{dayTodos.length - 2} more
                                </Text>
                            )}
                        </Stack>
                    );
                }}
            />
        </Box>
    );
};
