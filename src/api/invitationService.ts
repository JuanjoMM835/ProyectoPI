import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  Timestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import emailjs from '@emailjs/browser';

export interface Invitation {
  id?: string;
  invitedEmail: string;
  invitedBy: string;
  doctorName: string;
  role: "caregiver";
  patientId: string;
  patientName: string;
  status: "pending" | "accepted" | "expired";
  createdAt: Timestamp;
  expiresAt: Timestamp;
  token: string;
}

// Generar token único
const generateToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Crear invitación
export const createInvitation = async (
  doctorUid: string,
  doctorName: string,
  patientId: string,
  patientName: string,
  caregiverEmail: string
): Promise<string> => {
  try {
    // Verificar si ya existe una invitación pendiente
    const invitationsRef = collection(db, "invitations");
    const existingQuery = query(
      invitationsRef,
      where("invitedEmail", "==", caregiverEmail),
      where("patientId", "==", patientId),
      where("status", "==", "pending")
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error("Ya existe una invitación pendiente para este correo y paciente");
    }

    // Crear nueva invitación
    const token = generateToken();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expira en 7 días
    );

    const invitationData: Omit<Invitation, "id"> = {
      invitedEmail: caregiverEmail,
      invitedBy: doctorUid,
      doctorName,
      role: "caregiver",
      patientId,
      patientName,
      status: "pending",
      createdAt: now,
      expiresAt,
      token,
    };

    const docRef = await addDoc(invitationsRef, invitationData);

    // Enviar email de invitación
    await sendInvitationEmail(caregiverEmail, doctorName, patientName, token);

    return docRef.id;
  } catch (error) {
    console.error("Error creating invitation:", error);
    throw error;
  }
};

// Enviar email de invitación
const sendInvitationEmail = async (
  toEmail: string,
  doctorName: string,
  patientName: string,
  token: string
): Promise<void> => {
  try {
    // Configuración de EmailJS (reemplazar con tus credenciales)
    const serviceId = "service_qcis6h3"; // Reemplazar
    const templateId = "template_haqh6ck"; // Reemplazar
    const publicKey = "ldt9_W3oJ26nzjvCJ"; // Reemplazar

    const invitationLink = `${window.location.origin}/register?token=${token}`;

    const templateParams = {
      to_email: toEmail,
      doctor_name: doctorName,
      patient_name: patientName,
      invitation_link: invitationLink,
      expires_in: "7 días",
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log("Invitation email sent successfully");
  } catch (error) {
    console.error("Error sending invitation email:", error);
    // No lanzar error para que la invitación se cree aunque falle el email
  }
};

// Validar token de invitación
export const validateInvitationToken = async (token: string): Promise<Invitation | null> => {
  try {
    const invitationsRef = collection(db, "invitations");
    const q = query(
      invitationsRef,
      where("token", "==", token),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const invitationDoc = snapshot.docs[0];
    const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as Invitation;

    // Verificar si expiró
    const now = new Date();
    const expiresAt = invitation.expiresAt.toDate();

    if (now > expiresAt) {
      // Marcar como expirada
      await updateDoc(doc(db, "invitations", invitationDoc.id), {
        status: "expired",
      });
      return null;
    }

    return invitation;
  } catch (error) {
    console.error("Error validating invitation token:", error);
    return null;
  }
};

// Aceptar invitación
export const acceptInvitation = async (
  invitationId: string,
  caregiverUid: string
): Promise<void> => {
  try {
    // Obtener datos de la invitación
    const invitationRef = doc(db, "invitations", invitationId);
    const invitationSnap = await getDoc(invitationRef);

    if (!invitationSnap.exists()) {
      throw new Error("Invitación no encontrada");
    }

    const invitation = invitationSnap.data() as Invitation;

    console.log("Creating family link...");
    // Crear vínculo en la colección family
    const familyRef = collection(db, "family");
    await addDoc(familyRef, {
      caregiverId: caregiverUid,
      patientId: invitation.patientId,
      doctorId: invitation.invitedBy,
      relationship: "Cuidador",
      createdAt: Timestamp.now(),
    });
    console.log("Family link created successfully");

    console.log("Marking invitation as accepted...");
    // Marcar invitación como aceptada
    await updateDoc(invitationRef, {
      status: "accepted",
    });
    console.log("Invitation marked as accepted");

    console.log("Invitation accepted successfully");
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
};

// Obtener invitaciones del doctor
export const getDoctorInvitations = async (doctorUid: string): Promise<Invitation[]> => {
  try {
    const invitationsRef = collection(db, "invitations");
    const q = query(invitationsRef, where("invitedBy", "==", doctorUid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Invitation[];
  } catch (error) {
    console.error("Error getting doctor invitations:", error);
    return [];
  }
};

// Cancelar invitación
export const cancelInvitation = async (invitationId: string): Promise<void> => {
  try {
    const invitationRef = doc(db, "invitations", invitationId);
    await updateDoc(invitationRef, {
      status: "expired",
    });
  } catch (error) {
    console.error("Error canceling invitation:", error);
    throw error;
  }
};
