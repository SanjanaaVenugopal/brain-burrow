import { useEffect, useState } from "react";
import { Todo } from "./Todo.type";
import { isToday, isSameDay, addDays } from "date-fns";
import { useToast } from "@chakra-ui/react";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { normalizeDate } from "./NormalizeDates";

type UseTodoFormProps = {
    existingTodo?: Todo; // for editing
    onSuccess: (todo: Todo) => void;
};

export const useTodoForm = ({ existingTodo, onSuccess }: UseTodoFormProps) => {
    const toast = useToast();

    const [title, setTitle] = useState(existingTodo?.title || "");
    const [description, setDescription] = useState(existingTodo?.description || "");
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>(existingTodo?.scheduledAt);
    const [tags, setTags] = useState<string[]>(existingTodo?.tags || []);

    // Reset form whenever the editingTodo changes
    useEffect(() => {
        if (existingTodo) {
            setTitle(existingTodo?.title || "");
            setDescription(existingTodo?.description || "");
            setScheduledAt(normalizeDate(normalizeDate(existingTodo?.scheduledAt)));
            setTags(existingTodo?.tags ?? []);
        }
    }, [existingTodo]);


    const resetForm = () => {
        setTitle("");
        setDescription("");
        setScheduledAt(undefined);
        setTags([]);
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;

        const isTodayOrTomorrow =
            scheduledAt && (isToday(scheduledAt) || isSameDay(scheduledAt, addDays(new Date(), 1)));

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

        const todo: Todo = {
            id: existingTodo?.id || "",
            title: title.trim(),
            description: description.trim(),
            completed: existingTodo?.completed || false,
            tags: tags ?? [],
            ...(scheduledAt ? { scheduledAt } : {}),
        };

        try {
            if (existingTodo) {
                const docRef = doc(db, "BrainBurrowTodos", existingTodo.id);
                await updateDoc(docRef, todo);
            } else {
                const docRef = await addDoc(collection(db, "BrainBurrowTodos"), todo);
                await updateDoc(docRef, { id: docRef.id });
                todo.id = docRef.id;
            }

            onSuccess(todo);
            resetForm();
        } catch (err) {
            toast({
                title: "Error saving todo",
                description: (err as Error).message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return {
        title,
        setTitle,
        description,
        setDescription,
        scheduledAt,
        setScheduledAt,
        tags,
        setTags,
        handleSubmit,
        resetForm,
    };
};
