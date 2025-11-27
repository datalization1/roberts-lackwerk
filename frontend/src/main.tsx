console.log("Vite bundle loaded");
import React from "react";
import ReactDOM from "react-dom/client";
import HomeApp from "./HomeApp";
import "./index.css"; // bleibt erstmal leer oder minimal

const root = document.getElementById("home-root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HomeApp />
    </React.StrictMode>
  );
}