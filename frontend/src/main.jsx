/**
 * Application entry point
 *
 * Purpose:
 * Bootstraps the React application
 * and mounts it to the DOM.
 */


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { BudgetProvider } from "./context/BudgetContext";
import App from "./App";
import "./index.css";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

onMessage(messaging, (payload) => {
  alert(payload.notification.title);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((reg) => {
        console.log("Firebase SW registered:", reg.scope);
      })
      .catch((err) => {
        console.error("Firebase SW registration failed:", err);
      });
  });
}


createRoot(document.getElementById("root")).render(
  <StrictMode>
      <BrowserRouter>
        <BudgetProvider>
          <App />
        </BudgetProvider>
      </BrowserRouter>
  </StrictMode>
);
