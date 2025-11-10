import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../firebase/firebase";
import type { Role } from "./authService";
export interface Memory {
  id?: string;
  userId: string;
  imageUrl: string;
  description: string;
  createdAt: Timestamp;
  takenBy: "patient" | "caregiver" | "doctor";
  estado: "activo" | "inactivo";
}

export async function uploadMemory(
  file: File,
  userId: string,
  description: string,
  takenBy: "patient" | "caregiver" | "doctor" = "patient"
) {
  //  Subir imagen a Storage
  const fileRef = ref(storage, `memories/${userId}/${file.name}`);
  await uploadBytes(fileRef, file);

  const imageUrl = await getDownloadURL(fileRef);

  //  Guardar metadata en Firestore
  await addDoc(collection(db, "memories"), {
    userId,
    imageUrl,
    description,
    createdAt: Timestamp.now(),
    takenBy,
    estado: "activo",
  });
}

export async function getMemories(userId: string, role: Role) {
  let q;

  if (role === "doctor") {
    //  Doctor puede ver todas las memorias
    q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
  } else {
    //  Paciente solo ve sus recuerdos
    q = query(
      collection(db, "memories"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Memory[];
}
export async function updateMemoryDescription(id: string, description: string) {
  await updateDoc(doc(db, "memories", id), {
    description,
    updatedAt: new Date(),
  });
}