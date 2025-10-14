import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
