import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { getPatientsForCaregiver, type PatientProfile } from "../../api/familyService";
import PatientProfileModal from "../../components/PatientProfileModal";
import "./Family.css";

export default function CaregiverFamily() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  async function loadPatients() {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getPatientsForCaregiver(user.uid);
      setPatients(data);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
    setLoading(false);
  }

  function handlePatientClick(patient: PatientProfile) {
    setSelectedPatient(patient);
  }

  function handleCloseModal() {
    setSelectedPatient(null);
  }

  if (loading) {
    return (
      <div className="family-container">
        <p className="loading-text">Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="family-container">
      <div className="family-header">
        <h1>Mi Familia</h1>
        <p className="family-subtitle">Pacientes bajo tu cuidado</p>
      </div>

      {patients.length === 0 ? (
        <div className="no-patients">
          <div className="no-patients-icon">👥</div>
          <h3>No hay pacientes asignados</h3>
          <p>Actualmente no tienes pacientes bajo tu cuidado.</p>
        </div>
      ) : (
        <div className="patients-list">
          {patients.map((patient) => (
            <div key={patient.uid} className="patient-card-horizontal">
              <div className="patient-avatar-container">
                <img
                  src={patient.photoURL || "https://via.placeholder.com/80"}
                  alt={patient.name}
                  className="patient-avatar-large"
                />
              </div>
              
              <div className="patient-details">
                <div className="patient-header-info">
                  <h3 className="patient-name">{patient.name}</h3>
                  <p className="patient-email">{patient.email}</p>
                </div>
                
                <div className="patient-stats">
                  <div className="stat-badge">
                    <span className="stat-count">{patient.completedTests || 3}</span>
                    <span className="stat-text">Tests Completados</span>
                  </div>
                  <div className="stat-badge status-badge">
                    <span className="status-icon">✅</span>
                    <span className="stat-text">Listo</span>
                  </div>
                </div>
              </div>

              <div className="patient-meta">
                <div className="meta-item">
                  <span className="meta-label">Nivel:</span>
                  <span className="meta-badge level-badge">{patient.alzheimerLevel || "No especificado"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Doctor:</span>
                  <span className="meta-badge doctor-badge">{patient.doctorName || "No asignado"}</span>
                </div>
              </div>

              <button 
                className="view-profile-btn"
                onClick={() => handlePatientClick(patient)}
              >
                Ver perfil completo →
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPatient && (
        <PatientProfileModal
          patient={selectedPatient}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
