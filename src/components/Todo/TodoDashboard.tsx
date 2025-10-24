import { Box, Heading, Checkbox, Flex, Text, Tag, TagLabel, IconButton, useToast } from "@chakra-ui/react";
import { format } from "date-fns";
import { normalizeDate } from "./NormalizeDates";
import { Edit2, Trash2 } from "lucide-react";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { deleteTodo, toggleTodo } from "./TodoSlice";
import { GroupedTodos } from "./GroupedTodos";

type TodoDashboardProps = {
};

export const TodoDashboard: React.FC<TodoDashboardProps> = () => {
    const toast = useToast();
    const dispatch = useDispatch<AppDispatch>();

    // Get todos from Redux instead of local state
    const todos = useSelector((state: RootState) => state.todos.todos);

    const groupedTodos = GroupedTodos(todos);

    const handleToggle = async (id: string) => {
        //update database
        const updatedTododocRef = doc(db, "BrainBurrowTodos", id);
        const document = await getDoc(updatedTododocRef);
        if (document) {
            await updateDoc(updatedTododocRef, { completed: !document.data()?.completed });
        }
        dispatch(toggleTodo(id));
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "BrainBurrowTodos", id));
            dispatch(deleteTodo(id))
        } catch (error) {
            console.error("Error deleting todo:", error);
            toast({
                title: "Error deleting todo",
                description: (error as Error).message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
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
                    <Heading fontSize="lg" mb={3} key={idx}>
                        {group}
                    </Heading>

                    {todos.map((todo, id) => (
                        <Flex
                            align="center"
                            p={2}
                            borderRadius="md"
                            _hover={{ bg: "whiteAlpha.200" }}
                            role="group"
                            transition="background 0.2s ease"
                            justify="flex-start"
                            gap={3}
                            key={id}
                        >
                            {/* Checkbox */}
                            <Checkbox
                                isChecked={todo.completed}
                                onChange={() => handleToggle(todo.id)}
                                flexShrink={0}
                            />

                            {/* Left content */}
                            <Box flex="1" textAlign="left">
                                <Text
                                    fontWeight="medium"
                                    as={todo.completed ? "del" : undefined}
                                    noOfLines={1}
                                >
                                    {todo.title}
                                </Text>

                                {(group === "Today" || group === "Tomorrow") && todo.scheduledAt && (
                                    <Text fontSize="sm" opacity={0.7}>
                                        🕒 {format(normalizeDate(todo.scheduledAt)!, "hh:mm a")}
                                    </Text>
                                )}

                                {/* Tags */}
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

                            {/* Hover icons */}
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
                                    colorScheme="gray"
                                    aria-label="Edit"
                                    icon={<Edit2 size={14} />}
                                />
                                <IconButton
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    aria-label="Delete"
                                    icon={<Trash2 size={14} />}
                                    onClick={() => handleDelete(todo.id)}
                                />
                            </Flex>
                        </Flex>
                    ))}
                </Box >
            ))}
        </Flex>
    );
}

