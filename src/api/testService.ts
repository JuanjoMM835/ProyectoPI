import {
    addDoc,
    collection,
    getDocs,
    query,
    Timestamp,
    where,
    doc,
    getDoc,
    updateDoc,
    setDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Test, TestResult, TestAnswer } from "../types/Test";

export async function evaluateAnswer(correctDesc: string, patientAnswer: string) {
  const keywords = correctDesc.toLowerCase().split(" ");
  const answerWords = patientAnswer.toLowerCase().split(" ");

  const matched = keywords.filter(word => answerWords.includes(word)).length;
  const keywordScore = (matched / keywords.length) * 60;

  const grammarScore = patientAnswer.length >= 15 ? 25 : 10;
  const fluencyScore = patientAnswer.includes(".") ? 15 : 5;

  const totalScore = Math.min(keywordScore + grammarScore + fluencyScore, 100);
  return Math.round(totalScore);
}

export async function saveTestResult(userId: string, imageId: string, answer: string, score: number) {
  await addDoc(collection(db, "tests"), {
    userId,
    imageId,
    patientAnswer: answer,
    score,
    createdAt: Timestamp.now()
  });
}

export async function checkTestCountAndGenerateReport(userId: string, doctorId: string) {
  const q = query(collection(db, "tests"), where("userId", "==", userId));
  const snap = await getDocs(q);

  if (snap.size < 10) return null;

  let total = 0;
  snap.forEach(doc => total += doc.data().score);
  const average = total / snap.size;

  await addDoc(collection(db, "reports"), {
    patientId: userId,
    doctorId,
    tests: snap.size,
    averageScore: Math.round(average),
    createdAt: Timestamp.now()
  });

  return average;
}

// ====================================
// NUEVAS FUNCIONES PARA TESTS CON IA
// ====================================

/**
 * Crear un nuevo test para un paciente
 */
export async function createTest(
  patientId: string,
  questions: any[],
  createdBy: { id: string; role: "caregiver" | "doctor" },
  title: string,
  description?: string
): Promise<string> {
  try {
    const testData: Omit<Test, "id"> = {
      patientId,
      questions,
      createdAt: Timestamp.now(),
      totalQuestions: questions.length,
      status: "pending",
      title,
      description,
      ...(createdBy.role === "caregiver" 
        ? { caregiverId: createdBy.id } 
        : { doctorId: createdBy.id }),
    };

    const docRef = await addDoc(collection(db, "tests"), testData);
    console.log("✅ Test creado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creando test:", error);
    throw error;
  }
}

/**
 * Obtener tests pendientes de un paciente
 */
export async function getPendingTests(patientId: string): Promise<Test[]> {
  try {
    // Simplificado: solo filtrar por patientId y status
    // Ordenar en memoria en lugar de en Firestore
    const q = query(
      collection(db, "tests"),
      where("patientId", "==", patientId),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);
    const tests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Test));

    // Ordenar por fecha en JavaScript (no en Firestore)
    return tests.sort((a, b) => {
      const dateA = a.createdAt?.toMillis() || 0;
      const dateB = b.createdAt?.toMillis() || 0;
      return dateB - dateA; // Más reciente primero
    });
  } catch (error) {
    console.error("❌ Error obteniendo tests pendientes:", error);
    return [];
  }
}

/**
 * Obtener un test por ID
 */
export async function getTestById(testId: string): Promise<Test | null> {
  try {
    const docRef = doc(db, "tests", testId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Test;
  } catch (error) {
    console.error("❌ Error obteniendo test:", error);
    return null;
  }
}

/**
 * Guardar resultados de un test completado
 */
export async function submitTestResults(
  testId: string,
  patientId: string,
  answers: TestAnswer[],
  score: number,
  totalTimeSpent: number,
  aiAnalysis?: string
): Promise<void> {
  try {
    // Obtener el test para saber el total de preguntas
    const testRef = doc(db, "tests", testId);
    const testSnap = await getDoc(testRef);
    const totalQuestions = testSnap.exists() ? testSnap.data().totalQuestions : answers.length;

    // Actualizar el test con el resultado
    await updateDoc(testRef, {
      status: "completed",
      completedAt: Timestamp.now(),
      score,
      result: {
        score,
        totalQuestions,
        totalTime: totalTimeSpent,
        aiAnalysis: aiAnalysis || "",
      },
    });

    // Guardar resultados detallados usando el testId como ID del documento
    const resultData = {
      testId,
      patientId,
      answers,
      score,
      totalQuestions,
      completedAt: Timestamp.now(),
      totalTimeSpent,
      aiAnalysis: aiAnalysis || "",
    };

    const resultRef = doc(db, "testResults", testId);
    await setDoc(resultRef, resultData);
    
    console.log("✅ Resultados del test guardados");
  } catch (error) {
    console.error("❌ Error guardando resultados:", error);
    throw error;
  }
}

/**
 * Obtener historial de tests completados de un paciente
 */
export async function getCompletedTests(patientId: string): Promise<Test[]> {
  try {
    const q = query(
      collection(db, "tests"),
      where("patientId", "==", patientId),
      where("status", "==", "completed")
    );

    const snapshot = await getDocs(q);
    const tests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Test));

    // Ordenar en memoria
    return tests.sort((a, b) => {
      const dateA = a.completedAt?.toMillis() || 0;
      const dateB = b.completedAt?.toMillis() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("❌ Error obteniendo tests completados:", error);
    return [];
  }
}

/**
 * Obtener todos los tests de un paciente (para doctor/cuidador)
 */
export async function getAllTestsByPatient(patientId: string): Promise<Test[]> {
  try {
    const q = query(
      collection(db, "tests"),
      where("patientId", "==", patientId)
    );

    const snapshot = await getDocs(q);
    const tests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Test));

    // Ordenar en memoria
    return tests.sort((a, b) => {
      const dateA = a.createdAt?.toMillis() || 0;
      const dateB = b.createdAt?.toMillis() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("❌ Error obteniendo tests del paciente:", error);
    return [];
  }
}

/**
 * Obtener estadísticas de tests de un paciente
 */
export async function getTestStatistics(patientId: string) {
  try {
    const tests = await getAllTestsByPatient(patientId);
    const completed = tests.filter((t) => t.status === "completed");
    const pending = tests.filter((t) => t.status === "pending");

    const totalScore = completed.reduce((sum, t) => sum + (t.score || 0), 0);
    const avgScore =
      completed.length > 0 ? totalScore / completed.length : 0;

    return {
      total: tests.length,
      completed: completed.length,
      pending: pending.length,
      averageScore: avgScore,
      lastTestDate: completed[0]?.completedAt || null,
    };
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      averageScore: 0,
      lastTestDate: null,
    };
  }
}
