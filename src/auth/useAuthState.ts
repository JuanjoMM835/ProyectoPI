import { useContext } from "react";
import type { AuthState } from "./AuthContext";
import { AuthContext } from "./AuthContext";


export const useAuthState = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
};
