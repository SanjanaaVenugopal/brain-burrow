import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Heading,
    Text,
    SimpleGrid,
    Button,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { CommandBar } from "./CommandBar/CommandBar";
import { Header } from "./MainContent/Header";

type HomeProps = {};

export const Home: React.FC<HomeProps> = () => {
    return (<>
        <Header />
    </>);
}