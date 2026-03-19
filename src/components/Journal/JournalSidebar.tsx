import React, { useState } from "react";
import {
    Box, Flex, Text, IconButton, Input, Button, useToast, VStack, Tooltip,
} from "@chakra-ui/react";
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { addEntry, deleteEntry } from "./JournalSlice";
import { JournalEntry } from "./Journal.type";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";

type Props = {
    activeEntryId: string | null;
    onSelect: (entryId: string | null) => void;
};

export const JournalSidebar: React.FC<Props> = ({ activeEntryId, onSelect }) => {
    const entries = useSelector((state: RootState) => state.journal.entries);
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    const [collapsed, setCollapsed] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    const handleAdd = async () => {
        const title = newTitle.trim() || `Entry — ${format(new Date(), "MMM d, yyyy")}`;
        const now = new Date().toISOString();
        const entry: JournalEntry = { id: "", title, content: "", createdAt: now, updatedAt: now };
        try {
            const docRef = await addDoc(collection(db, "BrainBurrowJournals"), entry);
            await updateDoc(docRef, { id: docRef.id });
            entry.id = docRef.id;
            dispatch(addEntry(entry));
            setNewTitle("");
            setIsAdding(false);
            onSelect(entry.id);
        } catch (err) {
            toast({ title: "Error creating entry", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };

    const handleDelete = async (entryId: string) => {
        try {
            await deleteDoc(doc(db, "BrainBurrowJournals", entryId));
            dispatch(deleteEntry(entryId));
            if (activeEntryId === entryId) onSelect(null);
        } catch (err) {
            toast({ title: "Error deleting entry", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };

    if (collapsed) {
        return (
            <Box
                position="fixed"
                left="0"
                top="60px"
                bottom="0"
                w="48px"
                bg="rgba(30, 20, 50, 0.6)"
                backdropFilter="blur(12px)"
                borderRight="1px solid rgba(255,255,255,0.1)"
                zIndex={20}
                display="flex"
                flexDir="column"
                alignItems="center"
                pt={3}
                gap={2}
            >
                <IconButton
                    aria-label="Expand sidebar"
                    icon={<ChevronRight size={16} />}
                    size="xs"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => setCollapsed(false)}
                />
                {entries.map((e) => (
                    <Tooltip key={e.id} label={e.title} placement="right">
                        <Box
                            w="32px" h="32px"
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            bg={activeEntryId === e.id ? "purple.600" : "whiteAlpha.100"}
                            color="white"
                            fontSize="xs"
                            fontWeight="bold"
                            _hover={{ bg: "purple.500" }}
                            onClick={() => onSelect(e.id)}
                        >
                            {e.title.charAt(0).toUpperCase()}
                        </Box>
                    </Tooltip>
                ))}
                <Tooltip label="New Entry" placement="right">
                    <IconButton
                        aria-label="New Entry"
                        icon={<Plus size={16} />}
                        size="sm"
                        variant="ghost"
                        color="whiteAlpha.500"
                        _hover={{ bg: "whiteAlpha.200", color: "white" }}
                        onClick={() => { setCollapsed(false); setIsAdding(true); }}
                    />
                </Tooltip>
            </Box>
        );
    }

    return (
        <Box
            position="fixed"
            left="0"
            top="60px"
            bottom="0"
            w="220px"
            bg="rgba(30, 20, 50, 0.6)"
            backdropFilter="blur(12px)"
            borderRight="1px solid rgba(255,255,255,0.1)"
            zIndex={20}
            display="flex"
            flexDir="column"
            overflowY="auto"
        >
            {/* Header */}
            <Flex align="center" justify="space-between" px={3} pt={3} pb={2}>
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" className="!text-white/40">
                    Journal
                </Text>
                <IconButton
                    aria-label="Collapse sidebar"
                    icon={<ChevronLeft size={16} />}
                    size="xs"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => setCollapsed(true)}
                />
            </Flex>

            <VStack align="stretch" spacing={0} px={2}>
                {/* Entry list */}
                {entries.map((entry) => (
                    <Flex
                        key={entry.id}
                        align="center"
                        gap={2}
                        px={3}
                        py={2}
                        rounded="lg"
                        cursor="pointer"
                        bg={activeEntryId === entry.id ? "purple.600" : "transparent"}
                        _hover={{ bg: activeEntryId === entry.id ? "purple.600" : "whiteAlpha.100" }}
                        transition="background 0.15s"
                        onClick={() => onSelect(entry.id)}
                        role="group"
                    >
                        <FileText size={14} opacity={0.6} style={{ flexShrink: 0 }} />
                        <Box flex={1} minW={0}>
                            <Text fontSize="sm" className="!text-white/80" noOfLines={1}
                                fontWeight={activeEntryId === entry.id ? "semibold" : "normal"}>
                                {entry.title}
                            </Text>
                            <Text fontSize="2xs" className="!text-white/30">
                                {format(new Date(entry.updatedAt), "MMM d")}
                            </Text>
                        </Box>
                        <IconButton
                            aria-label="Delete entry"
                            icon={<Trash2 size={12} />}
                            size="xs"
                            variant="ghost"
                            color="whiteAlpha.400"
                            _hover={{ color: "red.300", bg: "whiteAlpha.200" }}
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                        />
                    </Flex>
                ))}

                {/* Add entry */}
                {isAdding ? (
                    <Flex direction="column" gap={2} px={2} py={2}>
                        <Input
                            placeholder="Entry title (optional)..."
                            size="sm"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            className="!text-white"
                            rounded="lg"
                            autoFocus
                        />
                        <Flex gap={2}>
                            <Button size="xs" colorScheme="purple" onClick={handleAdd} flex={1}>
                                Create
                            </Button>
                            <Button size="xs" variant="ghost" className="!text-white/60"
                                onClick={() => { setIsAdding(false); setNewTitle(""); }}>
                                Cancel
                            </Button>
                        </Flex>
                    </Flex>
                ) : (
                    <Flex
                        align="center"
                        gap={2}
                        px={3}
                        py={2}
                        rounded="lg"
                        cursor="pointer"
                        _hover={{ bg: "whiteAlpha.100" }}
                        transition="background 0.15s"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus size={16} opacity={0.5} />
                        <Text fontSize="sm" className="!text-white/40">
                            New Entry
                        </Text>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};
