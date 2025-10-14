import { Header } from "../components/HomePage/MainContent/Header";
import { MainContent } from "../components/HomePage/MainContent/MainContent";

type HomeProps = {};

export const HomePage: React.FC<HomeProps> = () => {
    return (<>
        <Header />
        <MainContent />
    </>);
}