import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
	if (import.meta.env.PROD) {
		window.addEventListener("load", () => {
			navigator.serviceWorker.register("/sw.js").catch(() => {
				// Service worker registration failures should not block app startup.
			});
		});
	} else {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			registrations.forEach((registration) => registration.unregister());
		});
	}
}
