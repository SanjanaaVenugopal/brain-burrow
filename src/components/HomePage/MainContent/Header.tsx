import React from "react";
import { Welcome } from "../../../Data/constants";

type props = {};

export const Header: React.FC<props> = () => {

  return (
    <div className="w-full flex justify-center px-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 max-w-5xl w-full py-2">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{Welcome.headline}</h1>
          <p className="text-base md:text-lg mt-4 text-muted-foreground">{Welcome.tagline}</p>
        </div>
      </div>
    </div>
  );
}
