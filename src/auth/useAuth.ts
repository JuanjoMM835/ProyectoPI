import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useContext } from "react";
import type { Role } from "../api/authService";
import { auth, db } from "../firebase/firebase";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");

  const { user, role, name, photoURL, loading, setUser } = ctx;

  const login = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = res.user;
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
    console.log("📝 [REGISTER] Starting registration...");
    console.log("📝 [REGISTER] Email:", email);
    console.log("📝 [REGISTER] Name:", name);
    console.log("📝 [REGISTER] Role:", role);
    
    try {
      console.log("🔐 [REGISTER] Creating user in Firebase Authentication...");
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = res.user;
      console.log("✅ [REGISTER] User created in Authentication with UID:", firebaseUser.uid);

      console.log("💾 [REGISTER] Creating user document in Firestore...");
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        name,
        email,
        role,
        createdAt: new Date(),
        estado: "activo",
        doctorId: null,
        patientIds: [],
      });
      console.log("✅ [REGISTER] User document created in Firestore");

      return res; // Retornar UserCredential completo
    } catch (error) {
      console.error("❌ [REGISTER] Error during registration:", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  return { user, role, name, photoURL, loading, setUser, login, register, logout };
}
