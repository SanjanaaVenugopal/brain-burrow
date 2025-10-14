// MainContent.tsx
import { Flex, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { NotebookPen, CheckSquare } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { getSections } from "./Sections";

export const MainContent = () => {
    const navigate = useNavigate();
    const sections = getSections(navigate);
    return (
        <Flex
            direction={{ base: "column", md: "row" }}
            justify="center"
            align="center"
            gap={8}
            minH="40vh"
            px={6}
            flexWrap="wrap"
        >
            {sections.map((section) => (
                <DashboardCard key={section.title} {...section} />
            ))}
        </Flex>
    );
};
