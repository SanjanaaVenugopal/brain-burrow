import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { App } from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { HomePage } from "./Pages/Home";
import { TodoPage } from "./Pages/Todo";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
