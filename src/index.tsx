import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { HashRouter as Router } from "react-router-dom";
import { App } from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { store } from "./store";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider>
        <Router>
          <App />
        </Router>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
