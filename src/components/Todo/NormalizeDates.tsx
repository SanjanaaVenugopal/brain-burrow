import { Timestamp } from "firebase/firestore";

// Convert Firestore Timestamps → JS Dates safely
export const normalizeDate = (value: any): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    return undefined;
};
