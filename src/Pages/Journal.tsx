import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Text, Flex } from "@chakra-ui/react";
import { NotebookPen } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { setEntries } from "../components/Journal/JournalSlice";
import { JournalEntry } from "../components/Journal/Journal.type";
import { JournalSidebar } from "../components/Journal/JournalSidebar";
import { JournalEditor } from "../components/Journal/JournalEditor";
import type { AppDispatch } from "../store";

export const JournalPage = () => {
    const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const snap = await getDocs(collection(db, "BrainBurrowJournals"));
                const entries: JournalEntry[] = snap.docs
                    .map((d) => ({ ...d.data(), id: d.id } as JournalEntry))
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
                dispatch(setEntries(entries));
            } catch (err) {
                console.error("Error fetching journal entries:", err);
            }
        };
        fetchEntries();
    }, [dispatch]);

    return (
        <>
            <JournalSidebar activeEntryId={activeEntryId} onSelect={setActiveEntryId} />

            <Box ml={{ base: "48px", md: "220px" }} transition="margin 0.2s" minH="100vh" px={4} pt={2}>
                {activeEntryId ? (
                    <JournalEditor entryId={activeEntryId} />
                ) : (
                    /* Empty state */
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        minH="70vh"
                        gap={4}
                    >
                        <NotebookPen size={48} opacity={0.2} />
                        <Text fontSize="lg" className="!text-white/30">
                            Select an entry or create a new one
                        </Text>
                    </Flex>
                )}
            </Box>
        </>
    );
};
