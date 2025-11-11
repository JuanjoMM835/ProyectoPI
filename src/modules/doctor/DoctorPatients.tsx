import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorPatients, type Patient } from "../../api/patientService";
import { useAuth } from "../../auth/useAuth";
import "./DoctorPatients.css";

export default function DoctorPatients() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.patientIds || user.patientIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const patientsData = await getDoctorPatients(user.patientIds);
        setPatients(patientsData);
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  if (loading) {
    return (
      <div className="doctor-patients-loading">
        <p>Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="doctor-patients">
      <div className="doctor-patients-header">
        <h2 className="doctor-patients-title">👥 Mis Pacientes</h2>
        <div className="doctor-patients-actions">
          <button onClick={() => navigate("/doctor/home")} className="back-btn">
            ← Volver al Inicio
          </button>
          <button onClick={() => logout()} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="no-patients">
          <div className="no-patients-icon">👤</div>
          <h3>No tienes pacientes asignados</h3>
          <p>Aún no tienes pacientes bajo tu cuidado.</p>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map((patient) => (
            <div key={patient.uid} className="patient-card">
              <div className="patient-avatar">
                {patient.photoURL ? (
                  <img src={patient.photoURL} alt={patient.name} />
                ) : (
                  <div className="patient-avatar-placeholder">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="patient-info">
                <h3 className="patient-name">{patient.name}</h3>
                <p className="patient-email">{patient.email}</p>
                
                <div className="patient-status">
                  <span className={`status-badge ${patient.estado || 'activo'}`}>
                    {patient.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                  </span>
                </div>
              </div>

              <div className="patient-actions">
                <button 
                  className="view-profile-btn"
                  onClick={() => navigate(`/doctor/patient/${patient.uid}`)}
                >
                  👁️ Ver Perfil
                </button>
                <button 
                  className="view-tests-btn"
                  onClick={() => navigate(`/doctor/patient-tests/${patient.uid}`)}
                >
                  📊 Ver Tests
                </button>
                <button 
                  className="generate-test-btn"
                  onClick={() => navigate(`/doctor/generate-test/${patient.uid}`, {
                    state: { patientName: patient.name }
                  })}
                >
                  🤖 Generar Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="patients-summary">
        <p>Total de pacientes: <strong>{patients.length}</strong></p>
      </div>
    </div>
  );
}
