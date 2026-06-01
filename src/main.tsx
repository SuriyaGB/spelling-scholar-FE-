import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: true
});

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
    <SpeedInsights />
  </>
);