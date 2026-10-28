import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { AssetsPage } from "./pages/AssetsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ReviewsHomePage } from "./pages/ReviewsHomePage";
import { ReviewStartPage } from "./pages/ReviewStartPage";
import { ReviewRunnerPage } from "./pages/ReviewRunnerPage";
import { ReviewReportPage } from "./pages/ReviewReportPage";
import { ReviewIssuesPage } from "./pages/ReviewIssuesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="reviews" element={<ReviewsHomePage />} />
        <Route path="reviews/new" element={<ReviewStartPage />} />
        <Route path="reviews/issues" element={<ReviewIssuesPage />} />
        <Route path="reviews/:reviewId/run" element={<ReviewRunnerPage />} />
        <Route path="reviews/:reviewId/report" element={<ReviewReportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
