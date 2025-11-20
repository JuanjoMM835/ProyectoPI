import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import InviteCaregiverModal from "../../components/InviteCaregiverModal.tsx";
import { getDoctorInvitations, type Invitation } from "../../api/invitationService.ts";
import "./InviteCaregiver.css";

interface Patient {
  uid: string;
  name: string;
  email: string;
}

export default function InviteCaregiver() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      // Cargar pacientes
      const patientsRef = collection(db, "users");
      const patientsQuery = query(patientsRef, where("role", "==", "patient"));
      const patientsSnapshot = await getDocs(patientsQuery);
      
      const patientsList = patientsSnapshot.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name || "Paciente",
        email: doc.data().email || "",
      }));

      setPatients(patientsList);

      // Cargar invitaciones del doctor
      const doctorInvitations = await getDoctorInvitations(user.uid);
      setInvitations(doctorInvitations);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteClick = (patientId: string, patientName: string) => {
    setSelectedPatient({ id: patientId, name: patientName });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    // Recargar invitaciones después de crear una nueva
    if (user?.uid) {
      getDoctorInvitations(user.uid).then(setInvitations);
    }
  };

  const getPatientInvitations = (patientId: string) => {
    return invitations.filter(inv => inv.patientId === patientId);
  };

  if (loading) {
    return (
      <div className="invite-caregiver-loading">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="invite-caregiver-page">
      <div className="page-header">
        <h1 className="page-title">Invitar Cuidador</h1>
        <p className="page-subtitle">Selecciona un paciente para invitar a su cuidador</p>
      </div>

      {patients.length === 0 ? (
        <div className="no-patients-message">
          <div className="empty-icon">👥</div>
          <h3>No hay pacientes disponibles</h3>
          <p>Primero debes tener pacientes registrados para invitar cuidadores.</p>
        </div>
      ) : (
        <div className="patients-list">
          {patients.map((patient) => {
            const patientInvitations = getPatientInvitations(patient.uid);
            const pendingInvitations = patientInvitations.filter(inv => inv.status === "pending");
            const acceptedInvitations = patientInvitations.filter(inv => inv.status === "accepted");

            return (
              <div key={patient.uid} className="patient-invite-card">
                <div className="patient-info-section">
                  <div className="patient-avatar">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="patient-details">
                    <h3 className="patient-name">{patient.name}</h3>
                    <p className="patient-email">{patient.email}</p>
                  </div>
                </div>

                <div className="invitations-section">
                  {acceptedInvitations.length > 0 && (
                    <div className="invitation-status accepted">
                      <span className="status-icon">✓</span>
                      <span>{acceptedInvitations.length} cuidador(es) asignado(s)</span>
                    </div>
                  )}
                  {pendingInvitations.length > 0 && (
                    <div className="invitation-status pending">
                      <span className="status-icon">⏳</span>
                      <span>{pendingInvitations.length} invitación(es) pendiente(s)</span>
                    </div>
                  )}
                </div>

                <button
                  className="invite-btn"
                  onClick={() => handleInviteClick(patient.uid, patient.name)}
                >
                  <span className="btn-icon">✉️</span>
                  <span>Invitar Cuidador</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de invitación */}
      {selectedPatient && (
        <InviteCaregiverModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
        />
      )}
    </div>
  );
}
