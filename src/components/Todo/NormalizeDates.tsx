import { Timestamp } from "firebase/firestore";

// Convert Firestore Timestamps, ISO strings, or epoch numbers → JS Dates safely
export const normalizeDate = (value: any): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === "string" || typeof value === "number") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? undefined : d;
    }
    // Handle Firestore Timestamp-like objects ({ seconds, nanoseconds })
    if (value.seconds !== undefined) {
        return new Date(value.seconds * 1000);
    }
    return undefined;
};
