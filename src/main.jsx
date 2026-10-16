import { createRoot } from "react-dom/client";
import "./layers.css";
import "@thekrystalship/krystal/styles.css";
import "./site.css";
import { App } from "./App.jsx";
import { session } from "./auth.js";
import { loadConfig } from "./config.js";
import { registerServiceWorker } from "./registerSW.js";
import { navigate } from "./router.js";

await loadConfig();

// Coming back from the anchor, the page goes on to where the person was headed, or home when the
// callback carried nowhere; the callback's own address is never left on screen.
const returnTo = await session.restore();
if (returnTo || location.pathname === "/signed-in") navigate(returnTo || "/", { replace: true });

createRoot(document.getElementById("root")).render(<App />);
registerServiceWorker();
