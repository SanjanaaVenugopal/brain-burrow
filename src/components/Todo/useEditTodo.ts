import { useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { addTodo, updateTodo } from "./TodoSlice";
import { DisplayTodo, Todo } from "./Todo.type";
import { FirestoreCollections } from "../../Data/constants";

/** Update all future instances of a recurring todo (edits the base document). */
export const useEditAllInstances = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();
    const todos = useSelector((state: RootState) => state.todos.todos);

    return async (todo: Todo, editingTodo: DisplayTodo) => {
        if (!editingTodo._baseId) return;
        const baseId = editingTodo._baseId;
        const baseTodo = todos.find((t) => t.id === baseId);
        if (!baseTodo) return;

        const updatedBase: Todo = {
            ...baseTodo,
            title: todo.title,
            description: todo.description,
            tags: todo.tags,
            scheduledAt: todo.scheduledAt,
            recurring: todo.recurring,
            recurringEndDate: todo.recurringEndDate,
        };
        try {
            await updateDoc(doc(db, FirestoreCollections.Todos, baseId), {
                title: todo.title,
                description: todo.description || "",
                tags: todo.tags || [],
                scheduledAt: todo.scheduledAt || null,
                recurring: todo.recurring,
                ...(todo.recurringEndDate ? { recurringEndDate: todo.recurringEndDate } : {}),
            });
            dispatch(updateTodo(updatedBase));
        } catch (err) {
            toast({ title: "Error updating", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };
};

/** Create an override document for a single day of a recurring todo. */
export const useEditJustToday = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    return async (todo: Todo, editingTodo: DisplayTodo) => {
        if (!editingTodo._virtualDate || !editingTodo._baseId) return;
        const { recurringEndDate: _re, completions: _c, ...rest } = todo;
        const overrideDoc: Todo = {
            ...rest,
            id: "",
            overrideOf: editingTodo._baseId,
            overrideDate: editingTodo._virtualDate,
            completed: editingTodo.completed,
            recurring: { type: "none" },
        };
        try {
            const docRef = await addDoc(collection(db, FirestoreCollections.Todos), overrideDoc);
            await updateDoc(docRef, { id: docRef.id });
            overrideDoc.id = docRef.id;
            dispatch(addTodo(overrideDoc));
        } catch (err) {
            toast({ title: "Error creating override", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };
};

/** Update a regular (non-recurring, non-board) todo. */
export const useUpdateTodo = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    return async (todo: Todo, editingTodo: DisplayTodo) => {
        const updatedTodo = { ...todo, id: editingTodo.id };
        try {
            await updateDoc(doc(db, FirestoreCollections.Todos, editingTodo.id), {
                title: todo.title,
                description: todo.description || "",
                tags: todo.tags || [],
                scheduledAt: todo.scheduledAt || null,
                recurring: todo.recurring,
                ...(todo.recurringEndDate ? { recurringEndDate: todo.recurringEndDate } : {}),
            });
        } catch (err) {
            toast({ title: "Error updating", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
        dispatch(updateTodo(updatedTodo));
    };
};

/** Update a board task. */
export const useUpdateBoardTask = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    return async (todo: Todo, editingTodo: DisplayTodo) => {
        const updatedTodo = { ...todo, id: editingTodo.id, boardId: editingTodo.boardId, columnId: editingTodo.columnId, order: editingTodo.order };
        try {
            await updateDoc(doc(db, FirestoreCollections.Todos, editingTodo.id), {
                title: todo.title,
                description: todo.description || "",
                tags: todo.tags || [],
                scheduledAt: todo.scheduledAt || null,
            });
            dispatch(updateTodo(updatedTodo));
        } catch (err) {
            toast({ title: "Error updating", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };
};
