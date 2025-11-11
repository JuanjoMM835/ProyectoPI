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
      <div className="tests-header">
        <button className="back-button" onClick={() => navigate("/doctor/patients")}>
          ← Volver a Pacientes
        </button>
        <h2>📊 Tests de {patientName}</h2>
      </div>

      <div className="filter-tabs">
        <button
          className={`tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todos ({tests.length})
        </button>
        <button
          className={`tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pendientes ({tests.filter((t) => t.status === "pending").length})
        </button>
        <button
          className={`tab ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completados ({tests.filter((t) => t.status === "completed").length})
        </button>
      </div>

      {filteredTests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
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
              className="create-test-btn"
              onClick={() => navigate(`/doctor/generate-test/${patientId}`, {
                state: { patientName }
              })}
            >
              🤖 Generar Test
            </button>
          )}
        </div>
      ) : (
        <div className="tests-grid">
          {filteredTests.map((test) => (
            <div key={test.id} className={`test-card ${test.status}`}>
              <div className="test-card-header">
                <div className="test-info">
                  <h3>{test.title || "Test de Memoria"}</h3>
                  <span className={`status-badge ${test.status}`}>
                    {test.status === "pending" ? "⏳ Pendiente" : "✅ Completado"}
                  </span>
                </div>
              </div>

              <div className="test-card-body">
                <div className="test-meta">
                  <div className="meta-item">
                    <span className="meta-label">Creado:</span>
                    <span className="meta-value">
                      {test.createdAt.toDate().toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Preguntas:</span>
                    <span className="meta-value">{test.questions.length}</span>
                  </div>

                  {test.status === "completed" && test.result && (
                    <>
                      <div className="meta-item">
                        <span className="meta-label">Completado:</span>
                        <span className="meta-value">
                          {test.completedAt?.toDate().toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className="meta-item score-item">
                        <span className="meta-label">Puntuación:</span>
                        <span className={`score-badge ${getScoreColor(test.result.score, test.result.totalQuestions)}`}>
                          {test.result.score}/{test.result.totalQuestions}
                          <span className="percentage">
                            {Math.round((test.result.score / test.result.totalQuestions) * 100)}%
                          </span>
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Tiempo:</span>
                        <span className="meta-value">
                          {Math.floor(test.result.totalTime / 60)}m {test.result.totalTime % 60}s
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {test.status === "completed" && test.result?.aiAnalysis && (
                  <div className="ai-analysis">
                    <h4>🤖 Análisis de IA:</h4>
                    <p>{test.result.aiAnalysis}</p>
                  </div>
                )}
              </div>

              <div className="test-card-footer">
                {test.status === "completed" ? (
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/doctor/test-details/${test.id}`)}
                  >
                    Ver Detalles
                  </button>
                ) : (
                  <button className="pending-btn" disabled>
                    Esperando que el paciente lo complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
