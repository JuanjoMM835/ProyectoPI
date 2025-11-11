import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface Patient {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  estado?: string;
  createdAt?: any;
}

/**
 * ✅ Obtener los datos de un paciente por su UID
 */
export const getPatientById = async (patientId: string): Promise<Patient | null> => {
  try {
    const patientDoc = await getDoc(doc(db, "users", patientId));
    
    if (!patientDoc.exists()) {
      return null;
    }

    const data = patientDoc.data();
    return {
      uid: patientDoc.id,
      name: data.name || "Sin nombre",
      email: data.email || "",
      photoURL: data.photoURL || null,
      estado: data.estado || "activo",
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error("Error obteniendo paciente:", error);
    return null;
  }
};

/**
 * ✅ Obtener todos los pacientes asignados a un doctor
 */
export const getDoctorPatients = async (patientIds: string[]): Promise<Patient[]> => {
  if (!patientIds || patientIds.length === 0) {
    return [];
  }

  try {
    const patients: Patient[] = [];

    // Obtener datos de cada paciente
    for (const patientId of patientIds) {
      const patient = await getPatientById(patientId);
      if (patient) {
        patients.push(patient);
      }
    }

    return patients;
  } catch (error) {
    console.error("Error obteniendo pacientes del doctor:", error);
    return [];
  }
};

/**
 * ✅ Obtener todos los pacientes (para admin o búsqueda)
 */
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "patient"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name || "Sin nombre",
        email: data.email || "",
        photoURL: data.photoURL || null,
        estado: data.estado || "activo",
        createdAt: data.createdAt,
      };
    });
  } catch (error) {
    console.error("Error obteniendo todos los pacientes:", error);
    return [];
  }
};
