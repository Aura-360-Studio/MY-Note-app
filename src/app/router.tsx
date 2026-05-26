import { createBrowserRouter } from "react-router-dom";
import { WorkspacePage } from "../pages/WorkspacePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WorkspacePage />
  }
]);
