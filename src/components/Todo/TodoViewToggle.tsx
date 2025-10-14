import { ButtonGroup, Button, Flex } from "@chakra-ui/react";

type ViewMode = "dashboard" | "calendar";
type Props = { mode: ViewMode; onChange: (mode: ViewMode) => void };

export const TodoViewToggle: React.FC<Props> = ({ mode, onChange }) => (
    <Flex justify="center" mb={6}>
        <ButtonGroup isAttached variant="outline">
            <Button
                onClick={() => onChange("dashboard")}
                bg={mode === "dashboard" ? "purple.600" : "transparent"}
                color={mode === "dashboard" ? "white" : "gray.300"}
                _hover={{ bg: "purple.500" }}
            >
                Dashboard View
            </Button>
            <Button
                onClick={() => onChange("calendar")}
                bg={mode === "calendar" ? "purple.600" : "transparent"}
                color={mode === "calendar" ? "white" : "gray.300"}
                _hover={{ bg: "purple.500" }}
            >
                Calendar View
            </Button>
        </ButtonGroup>
    </Flex>
);
