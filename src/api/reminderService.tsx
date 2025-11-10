import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface Reminder {
  id?: string;
  userId: string;
  message: string;
  dateTime: Timestamp;
  type: "push" | "sound";
  active: boolean;
  createdAt: Timestamp;
}

// ✅ Crear recordatorio
export async function addReminder(reminder: Omit<Reminder, "id">) {
  const docRef = await addDoc(collection(db, "reminders"), reminder);
  return docRef.id;
}

// ✅ Obtener recordatorios del paciente
export async function getReminders(userId: string) {
  const q = query(
    collection(db, "reminders"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Reminder[];
}

// ✅ Actualizar
export async function updateReminder(id: string, data: Partial<Reminder>) {
  await updateDoc(doc(db, "reminders", id), data);
}

// ✅ Eliminar
export async function deleteReminder(id: string) {
  await deleteDoc(doc(db, "reminders", id));
}
