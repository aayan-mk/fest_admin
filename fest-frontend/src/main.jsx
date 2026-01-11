import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import CursorFollower from "./components/CursorFollower";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CursorFollower />
    <App />
  </React.StrictMode>
);
