import React from "react";
import { MenuComponent } from "./MenuComponent";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { iconSize } from "../../../Data/constants";

type CommandBarProps = {};

export const CommandBar: React.FC<CommandBarProps> = () => {
    const [scrolled, setScrolled] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <>
            <div className={`sticky top-0 z-50 w-full flex justify-between items-center p-4 transition-all duration-500 ${scrolled ? "bg-white/30 dark:bg-black/30 backdrop-blur-md opacity-100" : "bg-transparent"}`} >
                <Home
                    size={20}
                    className="text-purple-950 dark:text-white"
                    onClick={() => navigate("/")}
                    aria-label="Home"
                />
                <div className="flex items-center p-4 bg-transparent">
                    <MenuComponent />
                </div>
            </div >
        </>
    );
};
