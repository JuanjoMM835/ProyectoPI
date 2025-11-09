import type { User } from "firebase/auth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useContext } from "react";
import type { Role } from "../api/authService";
import { auth, db } from "../firebase/firebase";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");

  const { user, role, loading } = ctx;

  
  const login = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = res.user as User;
    const userRef = doc(db, "users", firebaseUser.uid);

    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw new Error("Usuario no tiene perfil en Firestore");
    }

    const data = snap.data();
    const role = data.role as Role;

    return { user: firebaseUser, role };
  };

  
  const register = async (email: string, password: string, name: string, role: Role) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = res.user;

    await setDoc(doc(db, "users", firebaseUser.uid), {
      name,
      email,
      role,
      patientIds: [],
      doctorId: null,
      createdAt: new Date(),
      estado: "activo",
    });

    return firebaseUser;
  };

  const logout = () => signOut(auth);

  return { user, role, loading, login, register, logout };
}
