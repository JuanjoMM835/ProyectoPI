import { Timestamp } from "firebase/firestore";

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // índice de la respuesta correcta
  memoryId?: string; // ID de la memoria relacionada
  imageUrl?: string; // URL de la imagen relacionada
}

export interface Test {
  id?: string;
  patientId: string;
  caregiverId?: string;
  doctorId?: string;
  questions: TestQuestion[];
  createdAt: Timestamp;
  completedAt?: Timestamp;
  score?: number;
  totalQuestions: number;
  status: "pending" | "completed";
  title: string;
  description?: string;
  result?: {
    score: number;
    totalQuestions: number;
    totalTime: number;
    aiAnalysis?: string;
  };
}

export interface TestAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent?: number; // segundos que tardó en responder
}

export interface TestResult {
  testId: string;
  patientId: string;
  answers: TestAnswer[];
  score: number;
  completedAt: Timestamp;
  totalTimeSpent: number; // tiempo total en segundos
}
