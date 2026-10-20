
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProjectNotes from "./pages/ProjectNotes.jsx";

import "./styles/Auth.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#17172a",
            color: "#f4f2ff",
            border: "1px solid rgba(167, 139, 250, 0.25)",
          },
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={isLoggedIn ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId/notes"
          element={
            <ProtectedRoute>
              <ProjectNotes />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
