import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "./useAuthState";

interface Props {
  children: React.ReactNode;
  role?: "patient" | "doctor"| "caregiver";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, role: userRole, loading } = useAuthState();

  if (loading) return <p>Cargando...</p>;

  if (!user) return <Navigate to="/login" replace />;

  

  if (role && userRole !== role)
    return <Navigate to="/" replace />;

  return children;
}
