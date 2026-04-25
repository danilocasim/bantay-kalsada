import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (!isInIframe && !isPreviewHost && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .catch((err) => console.error("SW registration failed", err));
}

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker
    ?.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
