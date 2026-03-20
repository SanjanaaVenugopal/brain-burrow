import React, { useState, useEffect, useRef } from "react";
import {
    Box, Flex, Text, Input, IconButton, useToast,
} from "@chakra-ui/react";
import { Save, Clock } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { updateEntry } from "./JournalSlice";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FirestoreCollections } from "../../Data/constants";
import { format } from "date-fns";

type Props = {
    entryId: string;
};

export const JournalEditor: React.FC<Props> = ({ entryId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    const entry = useSelector((state: RootState) =>
        state.journal.entries.find((e) => e.id === entryId)
    );

    const [title, setTitle] = useState(entry?.title || "");
    const [content, setContent] = useState(entry?.content || "");
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync when entry changes (switching entries)
    useEffect(() => {
        if (entry) {
            setTitle(entry.title);
            setContent(entry.content);
            setLastSaved(new Date(entry.updatedAt));
        }
    }, [entry?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-save after 1.5s of inactivity
    useEffect(() => {
        if (!entry) return;
        if (title === entry.title && content === entry.content) return;

        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            handleSave();
        }, 1500);

        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        };
    }, [title, content]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSave = async () => {
        if (!entry) return;
        setSaving(true);
        const now = new Date().toISOString();
        const updated = { ...entry, title: title.trim() || entry.title, content, updatedAt: now };
        try {
            await updateDoc(doc(db, FirestoreCollections.Journals, entry.id), {
                title: updated.title,
                content: updated.content,
                updatedAt: now,
            });
            dispatch(updateEntry(updated));
            setLastSaved(new Date());
        } catch (err) {
            toast({ title: "Error saving", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
        setSaving(false);
    };

    // Auto-resize textarea
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    };

    // Set initial height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [entry?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!entry) return null;

    return (
        <Box maxW="800px" mx="auto" px={4} pt={4}>
            {/* Header bar */}
            <Flex align="center" justify="space-between" mb={4}>
                <Flex align="center" gap={2} className="!text-purple-700 dark:!text-white/50" fontSize="xs">
                    <Clock size={12} />
                    {lastSaved ? (
                        <Text>Saved {format(lastSaved, "hh:mm a")}</Text>
                    ) : (
                        <Text>Not saved yet</Text>
                    )}
                    {saving && <Text className="!text-purple-500 dark:!text-purple-300">Saving...</Text>}
                </Flex>
                <IconButton
                    aria-label="Save"
                    icon={<Save size={16} />}
                    size="sm"
                    variant="ghost"
                    className="!text-purple-500 dark:!text-white/60"
                    _hover={{ bg: "transparent" }}
                    onClick={handleSave}
                    isLoading={saving}
                />
            </Flex>

            {/* Title */}
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") textareaRef.current?.focus(); }}
                variant="unstyled"
                fontSize="3xl"
                fontWeight="bold"
                className="!text-purple-950 dark:!text-white"
                placeholder="Untitled"
                mb={4}
                _placeholder={{ color: "var(--placeholder-color)" }}
                sx={{ "--placeholder-color": "rgba(88, 28, 135, 0.3)" }}
                _dark={{ sx: { "--placeholder-color": "rgba(255,255,255,0.3)" } }}
            />

            {/* Content area */}
            <Box
                as="textarea"
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing..."
                w="100%"
                minH="60vh"
                bg="transparent"
                border="none"
                outline="none"
                resize="none"
                fontSize="md"
                lineHeight="1.8"
                className="!text-purple-900 dark:!text-white/80"
                sx={{
                    "&::placeholder": { color: "rgba(88, 28, 135, 0.3)" },
                    "&:focus": { outline: "none" },
                    ".dark &::placeholder": { color: "rgba(255,255,255,0.3)" },
                }}
            />

            {/* Word count */}
            <Flex justify="flex-end" py={4}>
                <Text fontSize="xs" className="!text-purple-300 dark:!text-white/20">
                    {content.split(/\s+/).filter(Boolean).length} words
                </Text>
            </Flex>
        </Box>
    );
};
