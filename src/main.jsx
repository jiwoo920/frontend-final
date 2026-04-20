import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";
import "./index.css";

const baseUrl = import.meta.env.BASE_URL || "/";
const redirectUri = new URL(baseUrl, window.location.origin).toString();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: redirectUri,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            }}
            cacheLocation="localstorage"
            useRefreshTokens={true}
            useRefreshTokensFallback={true}
        >
            <BrowserRouter basename={baseUrl}>
                <App />
            </BrowserRouter>
        </Auth0Provider>
    </React.StrictMode>
);
