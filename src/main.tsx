import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router";
import { DemoDataProvider } from "./state/DemoDataProvider";
import "./styles.css";

// Commit URL-driven form updates immediately, including consecutive filter changes.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter useTransitions={false}>
      <DemoDataProvider>
        <App />
      </DemoDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
