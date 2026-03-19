import React, { useState } from "react";
import {
    Box, Flex, Text, IconButton, Input, Button, useToast, VStack, Tooltip,
} from "@chakra-ui/react";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
                top="0"
                bottom="0"
                w="48px"
                className="bg-white/30 dark:bg-[rgba(30,20,50,0.45)] border-r border-white/30 dark:border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.08)]"
                backdropFilter="blur(20px)"
                style={{ WebkitBackdropFilter: "blur(20px)" }}
                zIndex={51}
                display="flex"
                flexDir="column"
                alignItems="center"
                pt="72px"
                gap={2}
            >
                <IconButton
                    aria-label="Expand sidebar"
                    icon={<ChevronRight size={16} />}
                    size="xs"
                    variant="ghost"
                    className="!text-purple-700 dark:!text-white"
                    _hover={{ bg: "transparent" }}
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
                            className={activeEntryId === e.id
                                ? "bg-purple-600 text-white"
                                : "bg-purple-100 dark:bg-white/10 text-purple-700 dark:text-white"}
                            fontSize="xs"
                            fontWeight="bold"
                            _hover={{ bg: "purple.500", color: "white" }}
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
                        className="!text-purple-700 dark:!text-white/50"
                        _hover={{ bg: "transparent" }}
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
            top="0"
            bottom="0"
            w="220px"
            className="bg-white/30 dark:bg-[rgba(30,20,50,0.45)] border-r border-white/30 dark:border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.08)]"
            backdropFilter="blur(20px)"
            style={{ WebkitBackdropFilter: "blur(20px)" }}
            zIndex={51}
            display="flex"
            flexDir="column"
            overflowY="auto"
            pt="60px"
        >
            {/* Header */}
            <Flex align="center" justify="space-between" px={3} pt={3} pb={2}>
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" className="!text-purple-700 dark:!text-white/70">
                    Journal
                </Text>
                <IconButton
                    aria-label="Collapse sidebar"
                    icon={<ChevronLeft size={16} />}
                    size="xs"
                    variant="ghost"
                    className="!text-purple-900 dark:!text-white"
                    _hover={{ bg: "purple.100" }}
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
                        className={activeEntryId === entry.id ? "" : "hover:bg-purple-100/60 dark:hover:bg-white/10"}
                        transition="background 0.15s"
                        onClick={() => onSelect(entry.id)}
                        role="group"
                    >
                        <Box
                            w="24px" h="24px" minW="24px"
                            rounded="md"
                            className={activeEntryId === entry.id
                                ? "bg-white/20"
                                : "bg-purple-200 dark:bg-white/20"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text className={activeEntryId === entry.id ? "!text-white" : "!text-purple-700 dark:!text-white"} fontSize="xs" fontWeight="bold">
                                {entry.title.charAt(0).toUpperCase()}
                            </Text>
                        </Box>
                        <Box flex={1} minW={0}>
                            <Text fontSize="sm" noOfLines={1}
                                className={activeEntryId === entry.id ? "!text-white !font-semibold" : "!text-purple-900 dark:!text-white/80"}
                            >
                                {entry.title}
                            </Text>
                            <Text fontSize="2xs" className={activeEntryId === entry.id ? "!text-white/60" : "!text-purple-400 dark:!text-white/30"}>
                                {format(new Date(entry.updatedAt), "MMM d")}
                            </Text>
                        </Box>
                        <IconButton
                            aria-label="Delete entry"
                            icon={<Trash2 size={14} />}
                            size="xs"
                            variant="ghost"
                            className="!text-red-500 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-500/20 !border-none transition"
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
                            className="!bg-purple-50 dark:!bg-white/10 !text-purple-900 dark:!text-white !border-purple-200 dark:!border-white/20 !placeholder-purple-400 dark:!placeholder-white/40"
                            border="1px solid"
                            rounded="lg"
                            autoFocus
                        />
                        <Flex gap={2}>
                            <Button size="xs" colorScheme="purple" onClick={handleAdd} flex={1}>
                                Create
                            </Button>
                            <Button size="xs" variant="ghost" className="!text-purple-500 dark:!text-white/60"
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
                        className="hover:bg-purple-100/60 dark:hover:bg-white/10"
                        transition="background 0.15s"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus size={16} className="text-purple-600 dark:text-white/70" />
                        <Text fontSize="sm" className="!text-purple-600 dark:!text-white/70">
                            New Entry
                        </Text>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};
