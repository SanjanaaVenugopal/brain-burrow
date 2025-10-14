import { Card, CardBody, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

const MotionCard = motion(Card);

type DashboardCardProps = {
    title: string;
    summary: string;
    icon: LucideIcon;
    onClick: () => void;
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    summary,
    icon: Icon,
    onClick,
}) => {
    // Color system for both modes
    const bgGradient = useColorModeValue(
        "linear-gradient(135deg, rgba(88,28,135,0.7) 0%, rgba(126,34,206,0.7) 100%)", // light mode: dark purple glass
        "linear-gradient(135deg, rgba(30,27,75,0.6) 0%, rgba(88,28,135,0.5) 100%)"    // dark mode: subtle purple-black glass
    );

    const hoverGradient = useColorModeValue(
        "linear-gradient(135deg, rgba(107,33,168,0.9) 0%, rgba(147,51,234,0.9) 100%)",
        "linear-gradient(135deg, rgba(76,29,149,0.6) 0%, rgba(126,34,206,0.6) 100%)"
    );

    const textColor = useColorModeValue("whiteAlpha.900", "purple.100");
    const subTextColor = useColorModeValue("whiteAlpha.800", "purple.200");

    return (
        <MotionCard
            whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.45)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 15 }}
            onClick={onClick}
            cursor="pointer"
            w={{ base: "100%", md: "320px" }}
            h="220px"
            borderRadius="2xl"
            shadow="xl"
            border="1px solid rgba(255,255,255,0.08)"
            bgGradient={bgGradient}
            backdropFilter="blur(12px)"
            _hover={{
                bgGradient: hoverGradient,
            }}
        >
            <CardBody
                display="flex"
                flexDir="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                gap={3}
            >
                <motion.div
                    whileHover={{
                        scale: 1.15,
                        filter: "drop-shadow(0 0 12px rgba(168,85,247,0.7))",
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Icon size={42} color="rgba(233, 213, 255, 0.95)" />
                </motion.div>

                <Heading fontSize="2xl" color={textColor}>
                    {title}
                </Heading>
                <Text fontSize="md" color={subTextColor} opacity={0.9}>
                    {summary}
                </Text>
            </CardBody>
        </MotionCard>
    );
};
