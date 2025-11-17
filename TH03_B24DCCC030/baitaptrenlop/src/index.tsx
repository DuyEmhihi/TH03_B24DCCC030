import React from "react";
import { createRoot } from "react-dom/client";
import AppRoot from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoot />
    </BrowserRouter>
  </React.StrictMode>
);
