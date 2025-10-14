import { Box, Heading, Checkbox, Flex, Text } from "@chakra-ui/react";
import { Todo } from "./Todo.type";

type Props = { groupedTodos: Record<string, Todo[]>; toggleTodo: (id: number) => void };

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
                    <Flex key={todo.id} align="center" gap={2} mb={2}>
                        <Checkbox
                            isChecked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <Text as={todo.completed ? "del" : undefined}>{todo.title}</Text>
                    </Flex>
                ))}
            </Box>
        ))}
    </Flex>
);
