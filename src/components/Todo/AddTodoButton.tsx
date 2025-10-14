// components/AddTodoButton.tsx
import { useState } from "react";
import {
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Button,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { Todo } from "./Todo.type";

type AddTodoButtonProps = {
    onAdd: (todo: Todo) => void;
};

export const AddTodoButton: React.FC<AddTodoButtonProps> = ({ onAdd }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [group, setGroup] = useState("Today");
    const [scheduledAt, setScheduledAt] = useState(undefined);

    const id = Date.now();
    const completed = false;
    const dueDate = undefined;

    const handleAdd = () => {
        if (!title.trim()) return;
        onAdd({ id, title, description, group, scheduledAt, completed, dueDate });
        setTitle("");
        setDescription("");
        setScheduledAt(undefined);
        setGroup("Today");
        onClose();
    };

    return (
        <>
            {/* Floating button */}
            <IconButton
                icon={<Plus size={24} />}
                aria-label="Add Todo"
                position="fixed"
                bottom="24px"
                right="24px"
                rounded="full"
                size="lg"
                bg="purple.600"
                color="white"
                shadow="lg"
                _hover={{
                    bg: "purple.700",
                    transform: "scale(1.1)",
                    transition: "0.2s",
                }}
                onClick={onOpen}
            />

            {/* Add Todo Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent
                    bg="rgba(45, 23, 79, 0.8)"
                    backdropFilter="blur(12px)"
                    color="white"
                    border="1px solid rgba(255,255,255,0.1)"
                >
                    <ModalHeader>Add a New To-Do</ModalHeader>
                    <ModalBody display="flex" flexDir="column" gap={4}>
                        <FormControl isRequired>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What do you want to do?"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add some details (optional)"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Group</FormLabel>
                            <Select value={group} onChange={(e) => setGroup(e.target.value)}>
                                <option value="Today">Today</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Week">This Week</option>
                                <option value="Month">This Month</option>
                            </Select>
                        </FormControl>

                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" onClick={onClose} mr={3}>
                            Cancel
                        </Button>
                        <Button bg="purple.500" _hover={{ bg: "purple.600" }} onClick={handleAdd}>
                            Add
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
