import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toggleRecurringCompletion, toggleTodo } from "./TodoSlice";
import { DisplayTodo } from "./Todo.type";
import { FirestoreCollections } from "../../Data/constants";

export const useToggleTodo = () => {
    const dispatch = useDispatch<AppDispatch>();
    const todos = useSelector((state: RootState) => state.todos.todos);

    return async (todo: DisplayTodo) => {
        // Recurring virtual instance
        if (todo._virtualDate && todo._baseId) {
            const baseId = todo._baseId;
            const dateStr = todo._virtualDate;
            const baseTodo = todos.find((t) => t.id === baseId);
            const wasCompleted = !!baseTodo?.completions?.[dateStr];
            dispatch(toggleRecurringCompletion({ baseId, dateStr }));
            try {
                const baseDocRef = doc(db, FirestoreCollections.Todos, baseId);
                if (wasCompleted) {
                    await updateDoc(baseDocRef, { [`completions.${dateStr}`]: null });
                } else {
                    await updateDoc(baseDocRef, { [`completions.${dateStr}`]: { completedAt: new Date().toISOString() } });
                }
            } catch (err) { console.error("Error toggling recurring completion:", err); }
            return;
        }

        // Regular todo
        dispatch(toggleTodo(todo.id));
        try {
            const newCompleted = !todo.completed;
            await updateDoc(doc(db, FirestoreCollections.Todos, todo.id), {
                completed: newCompleted,
                completedAt: newCompleted ? new Date() : null,
            });
        } catch (err) { console.error("Error updating Firestore:", err); }
    };
};
