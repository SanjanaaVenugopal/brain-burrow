import {
    IconButton,
    useDisclosure
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { Todo } from "./Todo.type";
import { useTodoForm } from "./useTodoForm";
import { TodoModal } from "./TodoModal";

type AddTodoButtonProps = {
    onAdd: (todo: Todo) => void;
};

export const AddTodoButton: React.FC<AddTodoButtonProps> = ({ onAdd }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const form = useTodoForm({ onSuccess: (todo) => { onAdd(todo); onClose(); } });

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

            <TodoModal isOpen={isOpen} onClose={onClose} form={form} title="Add a new Todo" submitLabel="Add" />
        </>
    );
};
