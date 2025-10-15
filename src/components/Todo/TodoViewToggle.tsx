import { ButtonGroup, Button, Flex, useColorModeValue } from "@chakra-ui/react";

type ViewMode = "dashboard" | "calendar";
type Props = { mode: ViewMode; onChange: (mode: ViewMode) => void };

export const TodoViewToggle: React.FC<Props> = ({ mode, onChange }) => {
    const activeBg = useColorModeValue("purple.500", "purple.600");
    const inactiveBg = useColorModeValue("whiteAlpha.600", "whiteAlpha.100");
    const activeColor = useColorModeValue("white", "white");
    const inactiveColor = useColorModeValue("gray.700", "gray.300");
    const hoverBg = useColorModeValue("purple.400", "purple.500");

    return (
        <Flex justify="center" mb={6}>
            <ButtonGroup isAttached variant="outline" borderRadius="xl" overflow="hidden">
                <Button
                    onClick={() => onChange("dashboard")}
                    bg={mode === "dashboard" ? activeBg : inactiveBg}
                    color={mode === "dashboard" ? activeColor : inactiveColor}
                    _hover={{ bg: hoverBg, color: "white" }}
                    border="1px solid"
                    borderColor={useColorModeValue("purple.300", "purple.700")}
                    transition="all 0.2s ease-in-out"
                >
                    Dashboard
                </Button>
                <Button
                    onClick={() => onChange("calendar")}
                    bg={mode === "calendar" ? activeBg : inactiveBg}
                    color={mode === "calendar" ? activeColor : inactiveColor}
                    _hover={{ bg: hoverBg, color: "white" }}
                    border="1px solid"
                    borderColor={useColorModeValue("purple.300", "purple.700")}
                    transition="all 0.2s ease-in-out"
                >
                    Calendar
                </Button>
            </ButtonGroup>
        </Flex>
    );
};
