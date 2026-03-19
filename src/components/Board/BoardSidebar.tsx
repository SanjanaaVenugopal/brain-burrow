import React, { useState } from "react";
import {
    Box, Flex, Text, IconButton, Input, Button, useToast, VStack, Tooltip,
} from "@chakra-ui/react";
import { LayoutDashboard, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { addBoard, deleteBoard } from "./BoardSlice";
import { Board } from "./Board.type";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

type Props = {
    activeBoardId: string | null; // null = main dashboard
    onSelect: (boardId: string | null) => void;
};

export const BoardSidebar: React.FC<Props> = ({ activeBoardId, onSelect }) => {
    const boards = useSelector((state: RootState) => state.boards.boards);
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
            const docRef = await addDoc(collection(db, "BrainBurrowBoards"), board);
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
            // Delete all tasks for this board
            const tasksSnap = await getDocs(collection(db, "BrainBurrowBoardTasks"));
            const batch: Promise<void>[] = [];
            tasksSnap.docs.forEach((d) => {
                if (d.data().boardId === boardId) {
                    batch.push(deleteDoc(doc(db, "BrainBurrowBoardTasks", d.id)));
                }
            });
            await Promise.all(batch);
            await deleteDoc(doc(db, "BrainBurrowBoards", boardId));
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
                <Tooltip label="Main Dashboard" placement="right">
                    <IconButton
                        aria-label="Main Dashboard"
                        icon={<LayoutDashboard size={18} />}
                        size="sm"
                        variant="ghost"
                        color={activeBoardId === null ? "purple.300" : "whiteAlpha.600"}
                        _hover={{ bg: "whiteAlpha.200" }}
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
                            bg={activeBoardId === b.id ? "purple.600" : "whiteAlpha.100"}
                            color="white"
                            fontSize="xs"
                            fontWeight="bold"
                            _hover={{ bg: "purple.500" }}
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
                    Boards
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
                {/* Main Dashboard */}
                <Flex
                    align="center"
                    gap={2}
                    px={3}
                    py={2}
                    rounded="lg"
                    cursor="pointer"
                    bg={activeBoardId === null ? "purple.600" : "transparent"}
                    _hover={{ bg: activeBoardId === null ? "purple.600" : "whiteAlpha.100" }}
                    transition="background 0.15s"
                    onClick={() => onSelect(null)}
                >
                    <LayoutDashboard size={16} />
                    <Text fontSize="sm" className="!text-white/80" fontWeight={activeBoardId === null ? "semibold" : "normal"}>
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
                        _hover={{ bg: activeBoardId === board.id ? "purple.600" : "whiteAlpha.100" }}
                        transition="background 0.15s"
                        onClick={() => onSelect(board.id)}
                        role="group"
                    >
                        <Box
                            w="24px" h="24px" minW="24px"
                            rounded="md"
                            bg="whiteAlpha.200"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                            color="white"
                        >
                            {board.name.charAt(0).toUpperCase()}
                        </Box>
                        <Text fontSize="sm" className="!text-white/80" noOfLines={1} flex={1}
                            fontWeight={activeBoardId === board.id ? "semibold" : "normal"}>
                            {board.name}
                        </Text>
                        <IconButton
                            aria-label="Delete board"
                            icon={<Trash2 size={12} />}
                            size="xs"
                            variant="ghost"
                            color="whiteAlpha.400"
                            _hover={{ color: "red.300", bg: "whiteAlpha.200" }}
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
                        _hover={{ bg: "whiteAlpha.100" }}
                        transition="background 0.15s"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus size={16} opacity={0.5} />
                        <Text fontSize="sm" className="!text-white/40">
                            New Board
                        </Text>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};
