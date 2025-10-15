import React from "react";
import { TodoTexts } from "../../Data/constants";

type Props = {};

export const TodoHeader: React.FC<Props> = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="flex flex-col items-center text-center max-w-3xl w-full">
                <h1 className="text-4xl md:text-5xl font-bold">{TodoTexts.headline}</h1>
                <p className="text-base md:text-lg mt-4 text-muted-foreground">
                    {TodoTexts.tagline}
                </p>
            </div>
        </div>
    );
};
