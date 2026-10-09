import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { initTheme } from "./utils/theme";
import App from "./App";
import "./index.css";
initTheme();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
