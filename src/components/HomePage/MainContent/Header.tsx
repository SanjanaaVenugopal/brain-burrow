import React from "react";
import { Welcome } from "../../../Data/constants";

type Props = {};

export const Header: React.FC<Props> = () => {
  return (
    <div className="w-full flex justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-3xl w-full py-8">
        <h1 className="text-4xl md:text-5xl font-bold">{Welcome.headline}</h1>
        <p className="text-base md:text-lg mt-4 text-muted-foreground">
          {Welcome.tagline}
        </p>
      </div>
    </div>
  );
};
