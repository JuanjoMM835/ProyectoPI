
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useEffect, useState } from "react";
import type { Role } from "../api/authService";
import { auth, db } from "../firebase/firebase";

export interface CustomUser {
  uid: string;
  name: string;
  email: string;
  role: Role;
  photoURL: string | null;
}

export interface AuthState {
  user: CustomUser | null;
  role: Role | null;
  name: string | null;
  photoURL: string | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<CustomUser | null>>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setName(null);
        setPhotoURL(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(userRef, {
            role: "patient",
            name: firebaseUser.displayName || "Sin nombre",
            photoURL: firebaseUser.photoURL || null,
            email: firebaseUser.email,
            createdAt: new Date(),
          });

          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "Sin nombre",
            email: firebaseUser.email!,
            role: "patient",
            photoURL: firebaseUser.photoURL || null,
          });

          setRole("patient");
          setName(firebaseUser.displayName || "Sin nombre");
          setPhotoURL(firebaseUser.photoURL || null);
        } else {
          const data = snap.data();
          const customUser: CustomUser = {
            uid: firebaseUser.uid,
            name: data.name,
            email: data.email,
            role: data.role,
            photoURL: data.photoURL || null,
          };

          setUser(customUser);
          setRole(data.role);
          setName(data.name);
          setPhotoURL(data.photoURL || null);
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
    <AuthContext.Provider
      value={{ user, role, name, photoURL, loading, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
