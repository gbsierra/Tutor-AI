// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router/routes";
import "./styles/globals.css";

export default function App() {
  return <RouterProvider router={router} />;
}
