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
  deleteDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
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

export async function deleteMemory(memoryId: string, imageUrl: string) {
  // Eliminar la imagen de Storage
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (err) {
    console.error("Error al eliminar imagen de Storage:", err);
  }

  // Eliminar el documento de Firestore
  await deleteDoc(doc(db, "memories", memoryId));
}

export async function updateMemory(
  memoryId: string,
  description: string,
  file?: File,
  userId?: string
) {
  const updates: any = {
    description,
    updatedAt: Timestamp.now(),
  };

  // Si hay una nueva imagen, subirla
  if (file && userId) {
    const fileRef = ref(storage, `memories/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);
    updates.imageUrl = imageUrl;
  }

  await updateDoc(doc(db, "memories", memoryId), updates);
}