import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface PatientProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  alzheimerLevel?: string;
  doctorId?: string;
  doctorName?: string;
  caregiverId?: string;
}

export interface Activity {
  id: string;
  patientId: string;
  type: string;
  score: number;
  completedAt: Date;
  description?: string;
}

/**
 * Obtener los pacientes asignados a un cuidador
 */
export async function getPatientsForCaregiver(caregiverId: string): Promise<PatientProfile[]> {
  try {
    console.log("🔍 Buscando pacientes para caregiverId:", caregiverId);
    
    // Primero, obtener el documento del cuidador para ver sus patientIds
    const caregiverDoc = await getDoc(doc(db, "users", caregiverId));
    
    if (!caregiverDoc.exists()) {
      console.log("❌ Cuidador no encontrado");
      return [];
    }

    const caregiverData = caregiverDoc.data();
    const patientIds = caregiverData.patientIds || [];
    
    console.log("📋 Patient IDs encontrados:", patientIds);

    if (patientIds.length === 0) {
      console.log("⚠️ No hay pacientes asignados a este cuidador");
      return [];
    }

    // Obtener los detalles de cada paciente
    const patients: PatientProfile[] = [];

    for (const patientId of patientIds) {
      try {
        const patientDoc = await getDoc(doc(db, "users", patientId));
        
        if (patientDoc.exists()) {
          const data = patientDoc.data();
          console.log("� Paciente encontrado:", {
            id: patientDoc.id,
            name: data.name
          });
          
          const patient: PatientProfile = {
            uid: patientDoc.id,
            name: data.name || "Sin nombre",
            email: data.email || "",
            photoURL: data.photoURL || null,
            alzheimerLevel: data.alzheimerLevel || "No especificado",
            doctorId: data.doctorId,
            doctorName: data.doctorName || "No asignado",
            caregiverId: caregiverId,
          };

          patients.push(patient);
        } else {
          console.log("⚠️ Paciente no encontrado:", patientId);
        }
      } catch (err) {
        console.error("❌ Error al obtener paciente:", patientId, err);
      }
    }

    console.log("✅ Total pacientes cargados:", patients.length);
    return patients;
  } catch (error) {
    console.error("❌ Error al obtener pacientes:", error);
    return [];
  }
}

/**
 * Obtener detalles de un paciente específico
 */
export async function getPatientDetails(patientId: string): Promise<PatientProfile | null> {
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
      alzheimerLevel: data.alzheimerLevel || "No especificado",
      doctorId: data.doctorId,
      doctorName: data.doctorName || "No asignado",
      caregiverId: data.caregiverId,
    };
  } catch (error) {
    console.error("Error al obtener detalles del paciente:", error);
    return null;
  }
}

/**
 * Obtener actividades realizadas por un paciente
 */
export async function getPatientActivities(patientId: string): Promise<Activity[]> {
  try {
    const activitiesQuery = query(
      collection(db, "activities"),
      where("patientId", "==", patientId)
    );

    const snapshot = await getDocs(activitiesQuery);
    const activities: Activity[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        patientId: data.patientId,
        type: data.type || "General",
        score: data.score || 0,
        completedAt: data.completedAt?.toDate() || new Date(),
        description: data.description || "",
      });
    });

    // Ordenar por fecha descendente
    activities.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    return activities;
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [];
  }
}

/**
 * Calcular estadísticas de actividades del paciente
 */
export interface ActivityStats {
  totalActivities: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  recentActivities: Activity[];
  scoreHistory: { date: string; score: number }[];
}

export async function getPatientActivityStats(patientId: string): Promise<ActivityStats> {
  const activities = await getPatientActivities(patientId);

  if (activities.length === 0) {
    return {
      totalActivities: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      recentActivities: [],
      scoreHistory: [],
    };
  }

  const scores = activities.map(a => a.score);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);

  // Tomar las últimas 10 actividades para el historial
  const scoreHistory = activities.slice(0, 10).map(a => ({
    date: a.completedAt.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
    score: a.score,
  })).reverse();

  return {
    totalActivities: activities.length,
    averageScore: Math.round(totalScore / activities.length),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    recentActivities: activities.slice(0, 5),
    scoreHistory,
  };
}
