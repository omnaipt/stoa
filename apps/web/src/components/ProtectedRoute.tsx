import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">A carregar...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
