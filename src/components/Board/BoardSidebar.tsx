import React, { useState } from "react";
import {
    Box, Flex, Text, IconButton, Input, Button, useToast, VStack, Tooltip,
} from "@chakra-ui/react";
import { LayoutDashboard, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { addBoard, deleteBoard } from "./BoardSlice";
import { Board } from "./Board.type";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FirestoreCollections } from "../../Data/constants";

type Props = {
    activeBoardId: string | null; // null = main dashboard
    onSelect: (boardId: string | null) => void;
};

export const BoardSidebar: React.FC<Props> = ({ activeBoardId, onSelect }) => {
    const boards = useSelector((state: RootState) => state.boards.boards);
    const allTasks = useSelector((state: RootState) => state.todos.todos);
    const dispatch = useDispatch<AppDispatch>();
    const toast = useToast();

    const [collapsed, setCollapsed] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");

    const handleAdd = async () => {
        const name = newName.trim();
        if (!name) return;

        const board: Board = { id: "", name, columns: [] };
        try {
            const docRef = await addDoc(collection(db, FirestoreCollections.Boards), board);
            await updateDoc(docRef, { id: docRef.id });
            board.id = docRef.id;
            dispatch(addBoard(board));
            setNewName("");
            setIsAdding(false);
            onSelect(board.id);
        } catch (err) {
            toast({ title: "Error creating board", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
        }
    };

    const handleDelete = async (boardId: string) => {
        try {
            // Delete tasks for this board using Redux state (no extra Firestore read)
            const tasksToDelete = allTasks.filter((t) => t.boardId === boardId);
            await Promise.all(
                tasksToDelete.map((t) => deleteDoc(doc(db, FirestoreCollections.Todos, t.id)))
            );
            await deleteDoc(doc(db, FirestoreCollections.Boards, boardId));
            dispatch(deleteBoard(boardId));
            if (activeBoardId === boardId) onSelect(null);
        } catch (err) {
            toast({ title: "Error deleting board", description: (err as Error).message, status: "error", duration: 3000, isClosable: true });
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
                <Tooltip label="Main Dashboard" placement="right">
                    <IconButton
                        aria-label="Main Dashboard"
                        icon={<LayoutDashboard size={18} />}
                        size="sm"
                        variant="ghost"
                        className={activeBoardId === null ? "!text-purple-600 dark:!text-purple-300" : "!text-purple-700 dark:!text-white/60"}
                        _hover={{ bg: "transparent" }}
                        onClick={() => onSelect(null)}
                    />
                </Tooltip>
                {boards.map((b) => (
                    <Tooltip key={b.id} label={b.name} placement="right">
                        <Box
                            w="32px" h="32px"
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            className={activeBoardId === b.id
                                ? "bg-purple-600 text-white"
                                : "bg-purple-100 dark:bg-white/10 text-purple-700 dark:text-white"}
                            fontSize="xs"
                            fontWeight="bold"
                            _hover={{ bg: "purple.500", color: "white" }}
                            onClick={() => onSelect(b.id)}
                        >
                            {b.name.charAt(0).toUpperCase()}
                        </Box>
                    </Tooltip>
                ))}
                <Tooltip label="New Board" placement="right">
                    <IconButton
                        aria-label="New Board"
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
                    Boards
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
                {/* Main Dashboard */}
                <Flex
                    align="center"
                    gap={2}
                    px={3}
                    py={2}
                    rounded="lg"
                    cursor="pointer"
                    bg={activeBoardId === null ? "purple.600" : "transparent"}
                    className={activeBoardId === null ? "" : "hover:bg-purple-100/60 dark:hover:bg-white/10"}
                    transition="background 0.15s"
                    onClick={() => onSelect(null)}
                >
                    <LayoutDashboard size={16} className={activeBoardId === null ? "text-white" : ""} />
                    <Text fontSize="sm"
                        className={activeBoardId === null ? "!text-white !font-semibold" : "!text-purple-900 dark:!text-white/80"}
                    >
                        Main Dashboard
                    </Text>
                </Flex>

                {/* Board list */}
                {boards.map((board) => (
                    <Flex
                        key={board.id}
                        align="center"
                        gap={2}
                        px={3}
                        py={2}
                        rounded="lg"
                        cursor="pointer"
                        bg={activeBoardId === board.id ? "purple.600" : "transparent"}
                        className={activeBoardId === board.id ? "" : "hover:bg-purple-100/60 dark:hover:bg-white/10"}
                        transition="background 0.15s"
                        onClick={() => onSelect(board.id)}
                        role="group"
                    >
                        <Box
                            w="24px" h="24px" minW="24px"
                            rounded="md"
                            className={activeBoardId === board.id
                                ? "bg-white/20"
                                : "bg-purple-100 dark:bg-white/20"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text className={activeBoardId === board.id ? "!text-white" : "!text-purple-700 dark:!text-white"} fontSize="xs" fontWeight="bold">
                                {board.name.charAt(0).toUpperCase()}
                            </Text>
                        </Box>
                        <Text fontSize="sm" noOfLines={1} flex={1}
                            className={activeBoardId === board.id ? "!text-white !font-semibold" : "!text-purple-900 dark:!text-white/80"}
                        >
                            {board.name}
                        </Text>
                        <IconButton
                            aria-label="Delete board"
                            icon={<Trash2 size={12} />}
                            size="xs"
                            variant="ghost"
                            className="!text-red-500 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-500/20 !border-none transition"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            onClick={(e) => { e.stopPropagation(); handleDelete(board.id); }}
                        />
                    </Flex>
                ))}

                {/* Add board */}
                {isAdding ? (
                    <Flex direction="column" gap={2} px={2} py={2}>
                        <Input
                            placeholder="Board name..."
                            size="sm"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
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
                                onClick={() => { setIsAdding(false); setNewName(""); }}>
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
                            New Board
                        </Text>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};
