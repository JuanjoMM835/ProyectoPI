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
  caregiverId?: string; // ← ID del cuidador que subió la foto
  doctorId?: string;    // ← ID del doctor (por si es necesario)
}

export async function uploadMemory(
  file: File,
  userId: string,
  description: string,
  takenBy: "patient" | "caregiver" | "doctor" = "patient",
  uploadedById?: string // ← ID del usuario que sube (cuidador o doctor)
) {
  console.log("📤 Iniciando subida de memoria...");
  console.log("📊 Datos:", { userId, description, takenBy, uploadedById, fileName: file.name });
  
  //  Subir imagen a Storage
  const fileRef = ref(storage, `memories/${userId}/${file.name}`);
  console.log("📁 Ruta de Storage:", `memories/${userId}/${file.name}`);
  
  await uploadBytes(fileRef, file);
  console.log("✅ Imagen subida a Storage");

  const imageUrl = await getDownloadURL(fileRef);
  console.log("🔗 URL obtenida:", imageUrl);

  const memoryData: any = {
    userId,
    imageUrl,
    description,
    createdAt: Timestamp.now(),
    takenBy,
    estado: "activo",
  };
  
  // Agregar el ID del cuidador si la foto fue subida por un cuidador
  if (takenBy === "caregiver" && uploadedById) {
    memoryData.caregiverId = uploadedById;
  }
  
  // Agregar el ID del doctor si la foto fue subida por un doctor
  if (takenBy === "doctor" && uploadedById) {
    memoryData.doctorId = uploadedById;
  }
  
  console.log("💾 Datos a guardar en Firestore:", memoryData);

  //  Guardar metadata en Firestore
  const docRef = await addDoc(collection(db, "memories"), memoryData);
  console.log("✅ Documento creado en Firestore con ID:", docRef.id);
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

// Nueva función: Obtener memorias subidas por un cuidador específico
export async function getMemoriesByCaregiver(caregiverId: string) {
  try {
    // Intentar con índice compuesto (caregiverId + createdAt)
    const q = query(
      collection(db, "memories"),
      where("caregiverId", "==", caregiverId),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Memory[];
  } catch (error: any) {
    // Si el índice no está listo, hacer query simple y ordenar en cliente
    console.log("⚠️ Índice no disponible, filtrando en cliente...");
    const q = query(
      collection(db, "memories"),
      where("caregiverId", "==", caregiverId)
    );

    const snap = await getDocs(q);
    const memories = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Memory[];
    
    // Ordenar en el cliente por fecha
    return memories.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  }
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