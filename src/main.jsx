import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";
import ContextShare from "./context/contextShare";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {clientId ? (
      <GoogleOAuthProvider clientId='446796058600-pm0eplkfpvujc47rdeqc8jemqokon7kd.apps.googleusercontent.com'>
        <BrowserRouter>
          <ContextShare><App /></ContextShare>
        </BrowserRouter>
      </GoogleOAuthProvider>
    ) : (
      <BrowserRouter>
        <ContextShare><App /></ContextShare>
      </BrowserRouter>
    )}
  </StrictMode>
);
