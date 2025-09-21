import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import CustomThemeProvider from "./contexts/ThemeContext.jsx";
import "./index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <CustomThemeProvider>
          <AuthProvider>
            <CartProvider>
              <App />
              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1e293b",
                    color: "#f1f5f9",
                    borderRadius: "12px",
                    maxWidth: "500px",
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: "#10b981",
                      color: "#ffffff",
                    },
                  },
                  error: {
                    style: {
                      background: "#ef4444",
                      color: "#ffffff",
                    },
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </CustomThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
