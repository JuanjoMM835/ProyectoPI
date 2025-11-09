// src/api/authService.ts

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";


export type Role = "patient" | "doctor" | "caregiver";

export async function register(
  email: string,
  password: string,
  role: Role
): Promise<void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    // Guardado en Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      role,
      name: user.email?.split("@")[0] || "",
      doctorId: null,
      patientIds: [],
      estado: "activo",
      createdAt: serverTimestamp()
    });

  }catch (error: unknown) {
  const err = error as Error;
  console.error(" Error en registerUser:", err.message);
  throw err;
}
}

export async function login(
  email: string,
  password: string
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
}
export async function getUserRole(uid: string): Promise<{ role: string }> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Usuario sin rol en Firestore");
  }

  const data = snap.data();
  return { role: data.role || "patient" };
}