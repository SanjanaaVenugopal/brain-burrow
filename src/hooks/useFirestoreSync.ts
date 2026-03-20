import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { setTodos } from "../components/Todo/TodoSlice";
import { setEntries } from "../components/Journal/JournalSlice";
import { setBoards } from "../components/Board/BoardSlice";
import { normalizeDate } from "../components/Todo/NormalizeDates";
import type { Todo } from "../components/Todo/Todo.type";
import type { JournalEntry } from "../components/Journal/Journal.type";
import type { Board } from "../components/Board/Board.type";
import type { AppDispatch } from "../store";
import { FirestoreCollections } from "../Data/constants";

export const useFirestoreSync = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [todoSnap, journalSnap, boardSnap] = await Promise.all([
                    getDocs(collection(db, FirestoreCollections.Todos)),
                    getDocs(collection(db, FirestoreCollections.Journals)),
                    getDocs(collection(db, FirestoreCollections.Boards)),
                ]);

                const allDocs: Todo[] = todoSnap.docs.map((doc) => {
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

                dispatch(setTodos(allDocs));

                const entries: JournalEntry[] = journalSnap.docs
                    .map((d) => ({ ...d.data(), id: d.id } as JournalEntry))
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
                dispatch(setEntries(entries));

                const boards: Board[] = boardSnap.docs.map((d) => ({ ...d.data(), id: d.id } as Board));
                dispatch(setBoards(boards));
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchAll();
    }, [dispatch]);
};
