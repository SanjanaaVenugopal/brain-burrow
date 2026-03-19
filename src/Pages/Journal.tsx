import React, { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { NotebookPen } from "lucide-react";
import { JournalSidebar } from "../components/Journal/JournalSidebar";
import { JournalEditor } from "../components/Journal/JournalEditor";

export const JournalPage = () => {
    const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

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
