import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { HashRouter as Router } from "react-router-dom";
import { App } from "./App";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <Router>
        <App />
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);
