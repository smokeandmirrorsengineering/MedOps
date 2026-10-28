import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router";
import { DemoDataProvider } from "./state/DemoDataProvider";
import { ReviewProvider } from "./reviews/ReviewProvider";
import "./styles.css";
import "./reviews/reviews.css";
import "./reviews/report.css";

// Commit URL-driven form updates immediately, including consecutive filter changes.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter useTransitions={false}>
      <DemoDataProvider>
        <ReviewProvider>
          <App />
        </ReviewProvider>
      </DemoDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
