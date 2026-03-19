import React from "react";
import { TodoTexts } from "../../Data/constants";
import { TodoViewToggle } from "./TodoViewToggle";

type ViewMode = "dashboard" | "calendar";
type Props = { mode: ViewMode; onModeChange: (mode: ViewMode) => void };

export const TodoHeader: React.FC<Props> = ({ mode, onModeChange }) => {
    return (
        <div className="w-full flex justify-center">
            <div className="flex flex-col items-center text-center max-w-3xl w-full">
                <h1 className="text-4xl md:text-5xl font-bold italic">{TodoTexts.headline}</h1>
                <p className="text-base md:text-lg mt-4 text-muted-foreground">
                    {TodoTexts.tagline}
                </p>
                <div className="mt-4">
                    <TodoViewToggle mode={mode} onChange={onModeChange} />
                </div>
            </div>
        </div>
    );
};
