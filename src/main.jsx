import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { V3App } from "./V3App.jsx";
import { Light3App } from "./Light3App.jsx";
import "./styles.css";
import "./v3.css";
import "./v3-fidelity.css";
import "./light3.css";

const design = new URLSearchParams(window.location.search).get("design");

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {design === "v3" ? <V3App /> : design === "current" ? <App /> : <Light3App />}
  </React.StrictMode>,
);
