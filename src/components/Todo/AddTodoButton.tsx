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
    Button,
    HStack,
    useToast,
    Box,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Todo } from "./Todo.type";
import { isToday, isSameDay, addDays } from "date-fns";
import { CloseButtonIcon } from "../HomePage/CommandBar/CloseButtonIcon";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

type AddTodoButtonProps = {
    onAdd: (todo: Todo) => void;
};

export const AddTodoButton: React.FC<AddTodoButtonProps> = ({ onAdd }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
    const [tags, setTags] = useState<string[]>([]);

    const handleAdd = async () => {
        if (!title.trim()) return;

        const isTodayOrTomorrow =
            dueDate &&
            (isToday(dueDate) || isSameDay(dueDate, addDays(new Date(), 1)));

        if (isTodayOrTomorrow && !scheduledAt) {
            toast({
                title: "Time required!",
                description: "Please set a time for tasks scheduled for today or tomorrow.",
                status: "warning",
                duration: 2500,
                isClosable: true,
            });
            return;
        }

        //Construct the todo object
        let todo: Todo = {
            id: "",
            title: title.trim(),
            description: description.trim(),
            completed: false,
            tags: tags ?? [],
            ...(dueDate ? { dueDate } : {}),
            ...(scheduledAt ? { scheduledAt } : {}),
        };

        // reset form
        setTitle("");
        setDescription("");
        setDueDate(undefined);
        setScheduledAt(undefined);
        setTags(tags);
        onClose();


        //update database
        try {
            const docRef = await addDoc(collection(db, "BrainBurrowTodos"), todo);
            console.log("Added document with ID:", docRef.id);
            const newTododocRef = doc(db, "BrainBurrowTodos", docRef.id);
            const document = await getDoc(newTododocRef);
            if (document) {
                await updateDoc(docRef, { id: docRef.id });
            }

            const firebaseTodo: Todo = { ...todo, id: docRef.id };
            onAdd(firebaseTodo);
        } catch (err) {
            console.error("Error adding todo:", err);
            toast({
                title: "Error adding todo",
                description: (err as Error).message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            onAdd(todo);
        }
    };

    return (
        <>
            {/* Floating Add Button */}
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

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "lg", lg: "xl" }}>
                <ModalOverlay />
                <ModalContent
                    className="!bg-zinc-600/30 hover:opacity-80 !m-0 !p-2 backdrop-blur-md"
                >
                    <ModalHeader className="!text-white/80 flex">
                        Add a New To-Do
                        <CloseButtonIcon
                            onClick={onClose}
                            wantDark={false}
                        />
                    </ModalHeader>

                    <ModalBody display="flex" flexDir="column" gap={4}>
                        {/* Title */}
                        <FormControl isRequired>
                            <FormLabel className="!text-white/80 flex">Title</FormLabel>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What do you want to do?"
                                bg="rgba(255,255,255,0.1)"
                                border="1px solid rgba(255,255,255,0.2)"
                                _hover={{ borderColor: "whiteAlpha.400" }}
                                _focus={{ borderColor: "whiteAlpha.700" }}
                                className="!text-white/80 flex"
                            />
                        </FormControl>

                        {/* Description */}
                        <FormControl>
                            <FormLabel className="!text-white/80 flex">Description</FormLabel>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add details (optional)"
                                bg="rgba(255,255,255,0.1)"
                                border="1px solid rgba(255,255,255,0.2)"
                                _hover={{ borderColor: "whiteAlpha.400" }}
                                _focus={{ borderColor: "whiteAlpha.700" }}
                                className="!text-white/80 flex"
                            />
                        </FormControl>

                        {/* Date + Time Picker */}
                        <HStack spacing={4}>
                            <FormControl>
                                <FormLabel className="!text-white/80 flex">Scheduled Date</FormLabel>
                                <Box
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.15)"
                                    rounded="xl"
                                    p={2}
                                >
                                    <DatePicker
                                        selected={dueDate}
                                        onChange={(date) => setDueDate(date ?? new Date())}
                                        dateFormat="MMM d, yyyy"
                                        customInput={
                                            <Input
                                                value={dueDate ? dueDate.toLocaleDateString() : ""}
                                                readOnly
                                                color="white"
                                                bg="transparent"
                                                border="none"
                                                className="!text-white/80 flex"
                                            />
                                        }
                                    />
                                </Box>
                            </FormControl>

                            <FormControl>
                                <FormLabel className="!text-white/80 flex">Time</FormLabel>
                                <Box
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.15)"
                                    rounded="xl"
                                    p={2}
                                >
                                    <DatePicker
                                        selected={scheduledAt}
                                        onChange={(date) => setScheduledAt(date ?? undefined)}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        customInput={
                                            <Input
                                                value={
                                                    scheduledAt
                                                        ? scheduledAt.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : ""
                                                }
                                                readOnly
                                                color="white"
                                                bg="transparent"
                                                border="none"
                                                className="!text-white/80 flex"
                                            />
                                        }
                                    />
                                </Box>
                            </FormControl>
                        </HStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            type="submit"
                            className="!bg-transparent !text-white/80 transition-all duration-200 hover:backdrop-blur-md "
                            onClick={handleAdd}
                        >
                            Add
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
