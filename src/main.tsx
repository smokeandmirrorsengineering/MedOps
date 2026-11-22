import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router";
import { DemoDataProvider } from "./state/DemoDataProvider";
import { ReviewProvider } from "./reviews/ReviewProvider";
import { FollowUpProvider } from "./followups/FollowUpProvider";
import { GuideProvider } from "./guide/GuideProvider";
import { ServiceProvider } from "./service/ServiceProvider";
import "./styles.css";
import "./reviews/reviews.css";
import "./reviews/report.css";
import "./enterprise.css";
import "./operational.css";
import "./service/service.css";
import "./layout/workspace-navigation.css";

// Commit URL-driven form updates immediately, including consecutive filter changes.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter useTransitions={false}>
      <DemoDataProvider>
        <ReviewProvider>
          <FollowUpProvider>
            <ServiceProvider><GuideProvider>
              <App />
            </GuideProvider></ServiceProvider>
          </FollowUpProvider>
        </ReviewProvider>
      </DemoDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
