import { createBrowserRouter } from "react-router-dom";
import { WorkspacePage } from "../pages/WorkspacePage";
import { FloatingEditorPage } from "../pages/FloatingEditorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WorkspacePage />
  },
  {
    path: "/editor",
    element: <FloatingEditorPage />
  }
]);
