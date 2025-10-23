import { Box, Heading, Checkbox, Flex, Text, Tag, TagLabel } from "@chakra-ui/react";
import { Todo } from "./Todo.type";
import { format } from "date-fns";
import { normalizeDate } from "./NormalizeDates";

type Props = {
    groupedTodos: Record<string, Todo[]>;
    toggleTodo: (id: string) => void;
};

export const TodoDashboard: React.FC<Props> = ({ groupedTodos, toggleTodo }) => (
    <Flex wrap="wrap" gap={6} justify="center">
        {Object.entries(groupedTodos).map(([group, todos]) => (
            <Box
                key={group}
                backdropFilter="blur(10px)"
                bg="rgba(120, 81, 169, 0.25)"
                border="1px solid rgba(255,255,255,0.15)"
                rounded="2xl"
                p={4}
                w="280px"
                shadow="md"
            >
                <Heading fontSize="lg" mb={3}>
                    {group}
                </Heading>

                {todos.map((todo) => (
                    <Flex
                        key={todo.id}
                        align="flex-start"
                        gap={2}
                        mb={3}
                        p={2}
                        rounded="md"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    >
                        <Checkbox
                            isChecked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            mt={1}
                        />
                        <Box>
                            <Text
                                fontWeight="medium"
                                as={todo.completed ? "del" : undefined}
                                noOfLines={1}
                            >
                                {todo.title}
                            </Text>

                            {/* Show scheduled time for Today & Tomorrow */}
                            {(group === "Today" || group === "Tomorrow") && todo.scheduledAt && (
                                <Text fontSize="sm" opacity={0.7}>
                                    🕒 {todo.scheduledAt ? format(normalizeDate(todo.scheduledAt)!, "hh:mm a") : "-"}
                                </Text>
                            )}

                            {/* Show tags */}
                            {todo.tags && todo.tags.length > 0 && (
                                <Flex wrap="wrap" gap={1} mt={1}>
                                    {todo.tags.map((tag, i) => (
                                        <Tag key={i} size="sm" colorScheme="purple" borderRadius="full">
                                            <TagLabel>{tag}</TagLabel>
                                        </Tag>
                                    ))}
                                </Flex>
                            )}
                        </Box>
                    </Flex>
                ))}
            </Box>
        ))}
    </Flex>
);
