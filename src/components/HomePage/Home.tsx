import { Header } from "./MainContent/Header";
import { MainContent } from "./MainContent/MainContent";

type HomeProps = {};

export const Home: React.FC<HomeProps> = () => {
    return (<>
        <Header />
        <MainContent />
    </>);
}