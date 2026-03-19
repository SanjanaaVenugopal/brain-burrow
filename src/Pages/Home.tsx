import React from "react";
import { Header } from "../components/HomePage/MainContent/Header";
import { MainContent } from "../components/HomePage/MainContent/MainContent";

export const HomePage: React.FC = () => {
    return (<>
        <Header />
        <MainContent />
    </>);
}