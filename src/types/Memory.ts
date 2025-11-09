
import type { Timestamp } from "firebase/firestore";

export type TakenBy = "patient" | "caregiver" | "doctor";
export type Estado = "activo" | "inactivo";

export interface Memory {
  id?: string;
  userId: string;
  imageUrl: string;
  description: string;
  createdAt: Timestamp;
  takenBy?: TakenBy;
  estado?: Estado;
}
