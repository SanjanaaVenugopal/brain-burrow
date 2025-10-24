import { Modal, Input, ModalOverlay, ModalContent, ModalHeader, ModalBody, FormControl, FormLabel, Textarea, HStack, ModalFooter, Button, Box, FormErrorMessage } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import { useTodoForm } from "./useTodoForm";
import { CloseButtonIcon } from "../HomePage/CommandBar/CloseButtonIcon";

type TodoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    form: ReturnType<typeof useTodoForm>;
    title?: string;
    submitLabel?: string;
};

export const TodoModal: React.FC<TodoModalProps> = ({ isOpen, onClose, form, title = "Add a new Todo", submitLabel = "Add" }) => {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "lg", lg: "xl" }}>
                <ModalOverlay />
                <ModalContent
                    className="!bg-zinc-600/30 hover:opacity-80 !m-0 !p-2 backdrop-blur-md"
                >
                    <ModalHeader className="!text-white/80 flex">
                        {title}
                        <CloseButtonIcon
                            onClick={onClose}
                            wantDark={false}
                        />
                    </ModalHeader>

                    <ModalBody display="flex" flexDir="column" gap={4}>
                        {/* Title */}
                        <FormControl isRequired isInvalid={form.submitted && !form.title.trim()}>
                            <FormLabel className="!text-white/80 flex">Title</FormLabel>
                            <Input
                                value={form.title}
                                onChange={(e) => form.setTitle(e.target.value)}
                                placeholder="What do you want to do?"
                                bg="rgba(255,255,255,0.1)"
                                border="1px solid rgba(255,255,255,0.2)"
                                _hover={{ borderColor: "whiteAlpha.400" }}
                                _focus={{ borderColor: "whiteAlpha.700" }}
                                className="!text-white/80 flex"
                            />

                            <FormErrorMessage className="!text-red-400">
                                Title is required.
                            </FormErrorMessage>
                        </FormControl>

                        {/* Description */}
                        <FormControl>
                            <FormLabel className="!text-white/80 flex">Description</FormLabel>
                            <Textarea
                                value={form.description}
                                onChange={(e) => form.setDescription(e.target.value)}
                                placeholder="Add details (optional)"
                                bg="rgba(255,255,255,0.1)"
                                border="1px solid rgba(255,255,255,0.2)"
                                _hover={{ borderColor: "whiteAlpha.400" }}
                                _focus={{ borderColor: "whiteAlpha.700" }}
                                className="!text-white/80 flex"
                            />
                        </FormControl>

                        {/* Date + Time Picker */}
                        <HStack spacing={4}>
                            <FormControl>
                                <FormLabel className="!text-white/80 flex">Scheduled Date</FormLabel>
                                <Box
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.15)"
                                    rounded="xl"
                                    p={2}
                                >
                                    <DatePicker
                                        selected={form.scheduledAt}
                                        onChange={(date) => form?.setScheduledAt(date ?? undefined)}
                                        dateFormat="MMM d, yyyy"
                                        customInput={
                                            <Input
                                                value={form.scheduledAt ? form.scheduledAt?.toLocaleDateString() : ""}
                                                readOnly
                                                color="white"
                                                bg="transparent"
                                                border="none"
                                                className="!text-white/80 flex"
                                            />
                                        }
                                    />
                                </Box>
                            </FormControl>

                            <FormControl>
                                <FormLabel className="!text-white/80 flex">Time</FormLabel>
                                <Box
                                    bg="rgba(255,255,255,0.08)"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255,255,255,0.15)"
                                    rounded="xl"
                                    p={2}
                                >
                                    <DatePicker
                                        selected={form.scheduledAt}
                                        onChange={(date) => form.setScheduledAt(date ?? undefined)}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        customInput={
                                            <Input
                                                value={
                                                    form.scheduledAt
                                                        ? form.scheduledAt?.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : ""
                                                }
                                                readOnly
                                                color="white"
                                                bg="transparent"
                                                border="none"
                                                className="!text-white/80 flex"
                                            />
                                        }
                                    />
                                </Box>
                            </FormControl>
                        </HStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            type="submit"
                            className="!bg-transparent !text-white/80 transition-all duration-200 hover:backdrop-blur-md "
                            onClick={form.handleSubmit}
                        >
                            {submitLabel}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
