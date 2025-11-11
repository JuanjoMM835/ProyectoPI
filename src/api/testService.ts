import {
    addDoc,
    collection,
    getDocs,
    query,
    Timestamp,
    where
} from "firebase/firestore";
import { db } from "../firebase/firebase";

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
