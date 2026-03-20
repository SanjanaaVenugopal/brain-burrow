import { useToast } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { deleteTodo } from "./TodoSlice";
import { DisplayTodo } from "./Todo.type";
import { FirestoreCollections } from "../../Data/constants";

export const useDeleteTodo = () => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    return async (todo: DisplayTodo) => {
        // Override doc or regular todo or board task (skip pure virtual instances)
        if ((todo._baseId && todo.overrideOf) || !todo._virtualDate) {
            try {
                await deleteDoc(doc(db, FirestoreCollections.Todos, todo.id));
                dispatch(deleteTodo(todo.id));
            } catch (err) {
                toast({ title: "Error deleting", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
            }
        }
    };
};
