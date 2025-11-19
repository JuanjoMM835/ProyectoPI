import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllTestsByPatient } from "../../api/testService";
import { getPatientById } from "../../api/patientService";
import type { Test } from "../../types/Test";
import "./PatientTests.css";

export default function DoctorPatientTests() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      
      // Cargar paciente
      const patient = await getPatientById(patientId);
      if (patient) {
        setPatientName(patient.name || patient.email);
      }

      // Cargar tests
      const allTests = await getAllTestsByPatient(patientId);
      setTests(allTests);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    if (filter === "all") return true;
    return test.status === filter;
  });

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "score-excellent";
    if (percentage >= 60) return "score-good";
    if (percentage >= 40) return "score-fair";
    return "score-poor";
  };

  if (loading) {
    return (
      <div className="patient-tests-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-tests-container">
      {/* Header con botón de volver */}
      <button className="back-button-modern" onClick={() => navigate("/doctor/patients")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a Pacientes
      </button>

      {/* Título principal */}
      <div className="page-header-modern">
        <div className="header-left">
          <div className="patient-avatar-small">
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="page-title-modern">Tests de {patientName}</h1>
            <p className="page-subtitle-modern">Gestiona y visualiza todos los tests del paciente</p>
          </div>
        </div>
      </div>

      {/* Tabs de filtro mejorados */}
      <div className="filter-tabs-modern">
        <button
          className={`tab-modern ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          </svg>
          Todos
          <span className="tab-badge">{tests.length}</span>
        </button>
        <button
          className={`tab-modern ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Pendientes
          <span className="tab-badge">{tests.filter((t) => t.status === "pending").length}</span>
        </button>
        <button
          className={`tab-modern ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Completados
          <span className="tab-badge">{tests.filter((t) => t.status === "completed").length}</span>
        </button>
      </div>

      {filteredTests.length === 0 ? (
        <div className="empty-state-modern">
          <div className="empty-icon-modern">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3>No hay tests {filter !== "all" ? filter : ""}</h3>
          <p>
            {filter === "pending"
              ? "Este paciente no tiene tests pendientes."
              : filter === "completed"
              ? "Este paciente aún no ha completado ningún test."
              : "Aún no se han creado tests para este paciente."}
          </p>
          {filter === "all" && (
            <button
              className="btn-generate-modern"
              onClick={() => navigate(`/doctor/patients/${patientId}`, {
                state: { patientName }
              })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Generar Test
            </button>
          )}
        </div>
      ) : (
        <div className="tests-list-simple">
          {filteredTests.map((test) => (
            <div key={test.id} className={`test-card-simple ${test.status}`}>
              {/* Título y estado */}
              <div className="test-header-simple">
                <h3 className="test-title-simple">
                  {test.title || "Test Médico"} - {test.createdAt.toDate().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </h3>
                <span className={`status-badge-simple ${test.status}`}>
                  {test.status === "pending" ? "PENDIENTE" : "COMPLETADO"}
                </span>
              </div>

              {/* Grid de información */}
              <div className="info-row-simple">
                <div className="info-box-simple">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>
                    <span className="info-label-simple">CREADO</span>
                    <span className="info-value-simple">
                      {test.createdAt.toDate().toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="info-box-simple">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <span className="info-label-simple">PREGUNTAS</span>
                    <span className="info-value-simple">{test.questions.length}</span>
                  </div>
                </div>

                {test.status === "completed" && test.result && (
                  <>
                    <div className="info-box-simple">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <div>
                        <span className="info-label-simple">COMPLETADO</span>
                        <span className="info-value-simple">
                          {test.completedAt?.toDate().toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="info-box-simple">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <div>
                        <span className="info-label-simple">TIEMPO</span>
                        <span className="info-value-simple">
                          {Math.floor(test.result.totalTime / 60)}m {test.result.totalTime % 60}s
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Puntuación */}
              {test.status === "completed" && test.result && (
                <div className="score-row-simple">
                  <span className="score-label-simple">PUNTUACIÓN</span>
                  <div className="score-content-simple">
                    <span className="score-numbers-simple">{test.result.score}/{test.result.totalQuestions}</span>
                    <span className="score-percent-simple">
                      {Math.round((test.result.score / test.result.totalQuestions) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Análisis de IA */}
              {test.status === "completed" && test.result?.aiAnalysis && (
                <div className="ai-box-simple">
                  <div className="ai-header-simple">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span>ANÁLISIS DE IA</span>
                  </div>
                  <p className="ai-text-simple">{test.result.aiAnalysis}</p>
                </div>
              )}

              {/* Botón de acción */}
              <div className="test-actions-simple">
                {test.status === "completed" ? (
                  <button
                    className="btn-view-simple"
                    onClick={() => navigate(`/doctor/test-details/${test.id}`)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    VER DETALLES
                  </button>
                ) : (
                  <div className="pending-message-simple">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <span>Esperando que el paciente lo complete</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
