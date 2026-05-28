import { createBrowserRouter } from "react-router-dom";
import { WorkspacePage } from "../pages/WorkspacePage";
import { FloatingEditorPage } from "../pages/FloatingEditorPage";
import { ServicesPage } from "../pages/ServicesPage";
import { PrivacyPage } from "../pages/PrivacyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WorkspacePage />
  },
  {
    path: "/editor",
    element: <FloatingEditorPage />
  },
  {
    path: "/services",
    element: <ServicesPage />
  },
  {
    path: "/privacy",
    element: <PrivacyPage />
  }
]);
