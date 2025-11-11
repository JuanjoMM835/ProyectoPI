import { useEffect, useState } from "react";
import {
  type PatientProfile,
  type ActivityStats,
  getPatientActivityStats,
} from "../api/familyService";
import "./PatientProfileModal.css";

interface Props {
  patient: PatientProfile;
  onClose: () => void;
}

export default function PatientProfileModal({ patient, onClose }: Props) {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    loadStats();
  }, [patient.uid]);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getPatientActivityStats(patient.uid);
      setStats(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
    setLoading(false);
  }

  // Cerrar modal al hacer clic fuera
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <img
            src={patient.photoURL || "https://via.placeholder.com/120"}
            alt={patient.name}
            className="modal-avatar"
          />
          <h2 className="modal-title">{patient.name}</h2>
          <p className="modal-email">{patient.email}</p>
        </div>

        <div className="modal-body">
          <div className="info-section">
            <h3 className="section-title">Información del Paciente</h3>
            <div className="info-grid">
              <div className="info-box">
                <span className="info-box-label">Nivel de Alzheimer</span>
                <span className="info-box-value">{patient.alzheimerLevel}</span>
              </div>
              <div className="info-box">
                <span className="info-box-label">Doctor Encargado</span>
                <span className="info-box-value">{patient.doctorName}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="loading-stats">Cargando estadísticas...</p>
          ) : stats ? (
            <>
              <div className="info-section">
                <h3 className="section-title">Actividades Realizadas</h3>
                {stats.recentActivities.length === 0 ? (
                  <p className="no-activities">No hay actividades registradas</p>
                ) : (
                  <div className="activities-list">
                    {stats.recentActivities.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-info">
                          <span className="activity-type">{activity.type}</span>
                          <span className="activity-date">
                            {activity.completedAt.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="activity-score">
                          <span className="score-value">{activity.score}</span>
                          <span className="score-label">puntos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="info-section">
                <div className="stats-header">
                  <h3 className="section-title">Resumen de Puntuación</h3>
                  <button
                    className="toggle-chart-btn"
                    onClick={() => setShowChart(!showChart)}
                  >
                    {showChart ? "Ocultar" : "Ver"} Gráfica 📊
                  </button>
                </div>

                <div className="stats-summary">
                  <div className="stat-card">
                    <span className="stat-label">Promedio</span>
                    <span className="stat-value">{stats.averageScore}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Más Alta</span>
                    <span className="stat-value success">{stats.highestScore}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Más Baja</span>
                    <span className="stat-value warning">{stats.lowestScore}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{stats.totalActivities}</span>
                  </div>
                </div>

                {showChart && stats.scoreHistory.length > 0 && (
                  <div className="chart-container">
                    <h4 className="chart-title">Evolución de Puntuaciones</h4>
                    <div className="chart">
                      {stats.scoreHistory.map((point, index) => (
                        <div key={index} className="chart-bar-wrapper">
                          <div
                            className="chart-bar"
                            style={{
                              height: `${(point.score / 100) * 100}%`,
                            }}
                          >
                            <span className="bar-value">{point.score}</span>
                          </div>
                          <span className="bar-label">{point.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="error-stats">Error al cargar estadísticas</p>
          )}
        </div>
      </div>
    </div>
  );
}
