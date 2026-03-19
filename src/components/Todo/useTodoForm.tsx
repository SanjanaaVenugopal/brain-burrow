import { useEffect, useState } from "react";
import { RecurrencePattern, Todo } from "./Todo.type";
import { isToday, isSameDay, addDays } from "date-fns";
import { useToast } from "@chakra-ui/react";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { normalizeDate } from "./NormalizeDates";

type UseTodoFormProps = {
    existingTodo?: Todo; // for editing
    onSuccess: (todo: Todo) => void;
    skipFirestore?: boolean; // skip writing to BrainBurrowTodos (used by board tasks)
};

export const useTodoForm = ({ existingTodo, onSuccess, skipFirestore }: UseTodoFormProps) => {
    const toast = useToast();

    const [title, setTitle] = useState(existingTodo?.title || "");
    const [description, setDescription] = useState(existingTodo?.description || "");
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>(existingTodo?.scheduledAt);
    const [tags, setTags] = useState<string[]>(existingTodo?.tags || []);
    const [submitted, setSubmitted] = useState(false);
    const [recurring, setRecurring] = useState<RecurrencePattern>(existingTodo?.recurring || { type: "none" });
    const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(
        existingTodo?.recurringEndDate
    );

    // Reset form whenever the editingTodo changes
    useEffect(() => {
        if (existingTodo) {
            setTitle(existingTodo?.title || "");
            setDescription(existingTodo?.description || "");
            setScheduledAt(normalizeDate(existingTodo?.scheduledAt));
            setTags(existingTodo?.tags ?? []);
            setRecurring(existingTodo?.recurring ?? { type: "none" })
            setRecurringEndDate(normalizeDate(existingTodo?.recurringEndDate));
        }
    }, [existingTodo]);


    const resetForm = () => {
        setTitle("");
        setDescription("");
        setScheduledAt(undefined);
        setTags([]);
        setRecurring({ type: "none" });
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        if (!title.trim()) return;

        // Force user to set a time for today/tomorrow tasks
        if (scheduledAt && (isToday(scheduledAt) || isSameDay(scheduledAt, addDays(new Date(), 1)))) {
            const hasTime = scheduledAt.getHours() !== 0 || scheduledAt.getMinutes() !== 0;
            if (!hasTime) {
                toast({
                    title: "Time required!",
                    description: "Please set a time for tasks scheduled for today or tomorrow.",
                    status: "warning",
                    duration: 2500,
                    isClosable: true,
                });
                return;
            }
        }

        const todo: Todo = {
            id: existingTodo?.id || "",
            title: title.trim(),
            description: description.trim(),
            completed: existingTodo?.completed || false,
            tags: tags ?? [],
            recurring: recurring?.type !== "none" ? recurring : { type: "none" },
            ...(recurring?.type !== "none" && recurringEndDate ? { recurringEndDate } : {}),
            ...(scheduledAt ? { scheduledAt } : {}),
            // Preserve completions map if editing
            ...(existingTodo?.completions ? { completions: existingTodo.completions } : {}),
        };

        if (existingTodo || skipFirestore) {
            // For edits or board tasks, let the parent handle Firestore writes
            onSuccess(todo);
            resetForm();
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "BrainBurrowTodos"), todo);
            await updateDoc(docRef, { id: docRef.id });
            todo.id = docRef.id;

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
        recurring,
        setRecurring,
        recurringEndDate,
        setRecurringEndDate,
        handleSubmit,
        resetForm,
        submitted
    };
};
