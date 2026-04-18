import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3, borderColor: "var(--fk-blue-light)", borderTopColor: "var(--fk-blue)" }} />
          <p style={{ marginTop: 16, color: "var(--fk-gray-400)", fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
