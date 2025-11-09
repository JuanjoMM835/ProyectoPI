import type { User, } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useEffect, useState } from "react";
import type { Role } from "../api/authService";
import { auth, db } from "../firebase/firebase";
export interface AuthState {
  user: User | null;
  role: Role | null;
  name: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(userRef, {
            role: "patient",
            name: firebaseUser.displayName || "Sin nombre",
            email: firebaseUser.email,
            createdAt: new Date(),
            estado: "activo",
            patientIds: [],
            doctorId: null,
          });
          setRole("patient");
          setName(firebaseUser.displayName || "Sin nombre");
        } else {
          const data = snap.data();
          setRole(data.role as Role);
          setName(data.name || "Sin nombre");
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, name, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
