import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { setTodos } from "../components/Todo/TodoSlice";
import { setEntries } from "../components/Journal/JournalSlice";
import { setBoards, setBoardTasks } from "../components/Board/BoardSlice";
import { normalizeDate } from "../components/Todo/NormalizeDates";
import type { Todo } from "../components/Todo/Todo.type";
import type { JournalEntry } from "../components/Journal/Journal.type";
import type { Board, BoardTask } from "../components/Board/Board.type";
import type { AppDispatch } from "../store";

export const useFirestoreSync = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [todoSnap, journalSnap, boardSnap, taskSnap] = await Promise.all([
                    getDocs(collection(db, "BrainBurrowTodos")),
                    getDocs(collection(db, "BrainBurrowJournals")),
                    getDocs(collection(db, "BrainBurrowBoards")),
                    getDocs(collection(db, "BrainBurrowBoardTasks")),
                ]);

                const todos: Todo[] = todoSnap.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        dueDate: normalizeDate(data.dueDate),
                        scheduledAt: normalizeDate(data.scheduledAt),
                        recurringEndDate: normalizeDate(data.recurringEndDate),
                        completedAt: normalizeDate(data.completedAt),
                        completions: data.completions || {},
                    } as Todo;
                });
                dispatch(setTodos(todos));

                const entries: JournalEntry[] = journalSnap.docs
                    .map((d) => ({ ...d.data(), id: d.id } as JournalEntry))
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
                dispatch(setEntries(entries));

                const boards: Board[] = boardSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Board));
                dispatch(setBoards(boards));

                const tasks: BoardTask[] = taskSnap.docs.map((d) => ({ ...d.data(), id: d.id } as BoardTask));
                dispatch(setBoardTasks(tasks));
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchAll();
    }, [dispatch]);
};
