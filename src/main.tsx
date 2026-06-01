import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: "https://fce6973a772d1ae9d6be2dab133a8fc9@o4511488773062656.ingest.us.sentry.io/4511488800456704",
  sendDefaultPii: true
});

// Temporary test error to verify Sentry integration
throw new Error("Sentry test error");

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
    <SpeedInsights />
  </>
);