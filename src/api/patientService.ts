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
 * ✅ Obtener todos los pacientes asignados a un doctor (usando colección family)
 */
export const getDoctorPatients = async (doctorId: string): Promise<Patient[]> => {
  try {
    console.log("🔍 Buscando pacientes para doctorId:", doctorId);
    
    // Buscar en la colección "family" los vínculos donde este usuario es el doctor
    const familyQuery = query(
      collection(db, "family"),
      where("doctorId", "==", doctorId)
    );
    
    const familySnapshot = await getDocs(familyQuery);
    console.log("📋 Vínculos familiares encontrados:", familySnapshot.size);

    if (familySnapshot.empty) {
      console.log("⚠️ No hay pacientes asignados a este doctor");
      return [];
    }

    const patients: Patient[] = [];
    
    // Obtener datos de cada paciente
    for (const familyDoc of familySnapshot.docs) {
      const familyData = familyDoc.data();
      const patientId = familyData.patientId;
      
      const patient = await getPatientById(patientId);
      if (patient) {
        patients.push(patient);
      }
    }

    console.log("✅ Total pacientes cargados:", patients.length);
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
