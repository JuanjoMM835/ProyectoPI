
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
  patientIds?: string[];
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
          // ❌ NO crear automáticamente el documento
          // Si hay un usuario en Auth pero no en Firestore, eliminarlo completamente
          console.warn("⚠️ User authenticated but no Firestore document found. Deleting user from Authentication...");
          try {
            // Eliminar el usuario de Firebase Authentication
            await firebaseUser.delete();
            console.log("✅ User deleted from Authentication");
          } catch (deleteError) {
            console.error("❌ Error deleting user from Authentication:", deleteError);
            // Si falla la eliminación, al menos cerrar sesión
            await auth.signOut();
          }
          setUser(null);
          setRole(null);
          setName(null);
          setPhotoURL(null);
          setLoading(false);
          return;
        } else {
          const data = snap.data();
          const customUser: CustomUser = {
            uid: firebaseUser.uid,
            name: data.name,
            email: data.email,
            role: data.role,
            photoURL: data.photoURL || null,
            patientIds: data.patientIds || [],
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
