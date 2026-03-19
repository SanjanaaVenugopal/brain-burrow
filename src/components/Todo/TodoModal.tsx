import { Modal, Input, ModalOverlay, ModalContent, ModalHeader, ModalBody, FormControl, FormLabel, Textarea, HStack, ModalFooter, Button, Box, FormErrorMessage } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import { useTodoForm } from "./useTodoForm";
import { CloseButtonIcon } from "../HomePage/CommandBar/CloseButtonIcon";
import React from "react";
import { RecurrencePattern } from "./Todo.type";

type TodoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    form: ReturnType<typeof useTodoForm>;
    title?: string;
    submitLabel?: string;
};

export const TodoModal: React.FC<TodoModalProps> = ({ isOpen, onClose, form, title = "Add a new Todo", submitLabel = "Add" }) => {
    const [recurringEnabled, setRecurringEnabled] = React.useState(
        form.recurring?.type !== "none"
    );

    // Sync recurringEnabled when form.recurring changes (e.g., opening edit modal)
    React.useEffect(() => {
        setRecurringEnabled(form.recurring?.type !== "none");
    }, [form.recurring]);

    const handleRecurrenceTypeChange = (newType: RecurrencePattern["type"]) => {
        switch (newType) {
            case "none":
                form?.setRecurring({ type: "none" });
                break;
            case "daily":
                form?.setRecurring({ type: "daily" });
                break;
            case "weekly":
                form?.setRecurring({ type: "weekly", daysOfWeek: [] });
                break;
            case "monthly":
                form?.setRecurring({ type: "monthly", dayOfMonth: 1 });
                break;
            case "yearly":
                form?.setRecurring({ type: "yearly", month: 0, day: 1 });
                break;
            case "custom":
                form?.setRecurring({ type: "custom", intervalDays: 1 });
                break;
        }
    };


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
                        {/* Recurrence Toggle */}
                        <FormControl mt={4}>
                            <HStack justify="space-between">
                                <FormLabel className="!text-white/80">Recurring</FormLabel>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        const newEnabled = !recurringEnabled;
                                        setRecurringEnabled(newEnabled);
                                        if (!newEnabled) {
                                            form?.setRecurring({ type: "none" });
                                            form?.setRecurringEndDate(undefined);
                                        } else {
                                            // Restore existing recurrence type if editing, otherwise default to daily
                                            const existingType = form.recurring?.type;
                                            if (existingType && existingType !== "none") {
                                                form?.setRecurring(form.recurring);
                                            } else {
                                                form?.setRecurring({ type: "daily" });
                                            }
                                        }
                                    }}
                                    className="!text-white/80 !bg-transparent border border-white/30"
                                >
                                    {recurringEnabled ? "On" : "Off"}
                                </Button>
                            </HStack>
                        </FormControl>

                        {recurringEnabled && (
                            <>
                                {/* Recurrence Type */}
                                <FormControl>
                                    <FormLabel className="!text-white/80">Recurrence Type</FormLabel>
                                    <select
                                        className="w-full bg-transparent text-white/80 border border-white/20 p-2 rounded"
                                        value={form?.recurring.type}
                                        onChange={(e) => handleRecurrenceTypeChange(e.target.value as RecurrencePattern["type"])}
                                    >
                                        <option value="daily" className="!bg-zinc-600/70 hover:opacity-80 !m-0 !p-2">Daily</option>
                                        <option value="weekly" className="!bg-zinc-600/70 hover:opacity-80 !m-0 !p-2">Weekly</option>
                                        <option value="monthly" className="!bg-zinc-600/70 hover:opacity-80 !m-0 !p-2">Monthly</option>
                                        <option value="yearly" className="!bg-zinc-600/70 hover:opacity-80 !m-0 !p-2">Yearly</option>
                                        <option value="custom" className="!bg-zinc-600/70 hover:opacity-80 !m-0 !p-2">Custom (every N days)</option>
                                    </select>
                                </FormControl>

                                {/* Weekly Days Selector */}
                                {form?.recurring.type === "weekly" && (
                                    <FormControl mt={3}>
                                        <FormLabel className="!text-white/80">Days of Week</FormLabel>
                                        <HStack wrap="wrap">
                                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                                (label, index) => {
                                                    const selected = (form?.recurring as any).daysOfWeek ?? [];
                                                    const toggle = () => {
                                                        const updated = selected.includes(index)
                                                            ? selected.filter((d: number) => d !== index)
                                                            : [...selected, index];
                                                        form?.setRecurring({ type: "weekly", daysOfWeek: updated });
                                                    };
                                                    return (
                                                        <Button
                                                            key={index}
                                                            size="xs"
                                                            onClick={toggle}
                                                            className={`!border !rounded-md !px-2 !py-1 ${selected.includes(index)
                                                                    ? "!bg-white/30 !border-white !text-black"
                                                                    : "!bg-transparent !border-white/30 !text-white/80"}`}
                                                        >
                                                            {label}
                                                        </Button>
                                                    );
                                                }
                                            )}
                                        </HStack>
                                    </FormControl>
                                )}

                                {/* Custom Interval */}
                                {form?.recurring.type === "custom" && (
                                    <FormControl mt={3}>
                                        <FormLabel className="!text-white/80">Every N days</FormLabel>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={(form?.recurring as any).intervalDays ?? ""}
                                            onChange={(e) =>
                                                form?.setRecurring({
                                                    type: "custom",
                                                    intervalDays: Number(e.target.value),
                                                })
                                            }
                                            className="!text-white bg-transparent border-white/30"
                                        />
                                    </FormControl>
                                )}

                                {/* End Date Picker */}
                                <FormControl mt={4}>
                                    <FormLabel className="!text-white/80">Repeat Until</FormLabel>
                                    <Box
                                        bg="rgba(255,255,255,0.08)"
                                        border="1px solid rgba(255,255,255,0.15)"
                                        p={2}
                                        rounded="lg"
                                    >
                                        <DatePicker
                                            selected={form?.recurringEndDate}
                                            onChange={(date) => form.setRecurringEndDate(date ?? undefined)}
                                            dateFormat="MMM d, yyyy"
                                            customInput={
                                                <Input
                                                    value={form?.recurringEndDate ? form?.recurringEndDate.toLocaleDateString() : ""}
                                                    readOnly
                                                    color="white"
                                                    bg="transparent"
                                                    border="none"
                                                />
                                            }
                                        />
                                    </Box>
                                </FormControl>
                            </>
                        )}
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
