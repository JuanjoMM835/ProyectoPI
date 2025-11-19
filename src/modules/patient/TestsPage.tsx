import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/useAuth";
import type { Test } from "../../types/Test";
import "./TestsPage.css";

export default function PatientTestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadTests();
    }
  }, [user]);

  const loadTests = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const testsRef = collection(db, "tests");
      const testsQuery = query(testsRef, where("patientId", "==", user.uid));
      const testsSnapshot = await getDocs(testsQuery);

      const testsData: Test[] = testsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Test));

      // Ordenar por fecha (más recientes primero)
      testsData.sort((a, b) => {
        const dateA = a.completedAt || a.createdAt;
        const dateB = b.completedAt || b.createdAt;
        return (dateB?.seconds || 0) - (dateA?.seconds || 0);
      });

      setTests(testsData);
    } catch (error) {
      console.error("Error loading tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    if (activeTab === "pending") return !test.completedAt;
    if (activeTab === "completed") return test.completedAt;
    return true;
  });

  const handleTestClick = (test: Test) => {
    if (test.completedAt) {
      // Si está completado, navegar a ver detalles (puedes crear una vista de detalles)
      return;
    } else {
      // Si está pendiente, navegar a tomar el test
      navigate(`/patient/test/${test.id}`);
    }
  };



  const pendingCount = tests.filter(t => !t.completedAt).length;
  const completedCount = tests.filter(t => t.completedAt).length;

  if (loading) {
    return (
      <div className="tests-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tests-page">
      {/* Header */}
      <div className="tests-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="header-text">
            <h1>Mis Tests</h1>
            <p>Visualiza y completa tus tests de memoria</p>
          </div>
        </div>
      </div>

      {/* Tabs de filtrado */}
      <div className="tests-tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Todos
          <span className="tab-badge">{tests.length}</span>
        </button>
        <button
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Pendientes
          <span className="tab-badge pending">{pendingCount}</span>
        </button>
        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Completados
          <span className="tab-badge completed">{completedCount}</span>
        </button>
      </div>

      {/* Lista de tests */}
      <div className="tests-content">
        {filteredTests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3>No hay tests {activeTab === "pending" ? "pendientes" : activeTab === "completed" ? "completados" : "disponibles"}</h3>
            <p>
              {activeTab === "pending" 
                ? "No tienes tests pendientes en este momento" 
                : activeTab === "completed"
                ? "Aún no has completado ningún test"
                : "Tu médico aún no ha creado ningún test"}
            </p>
          </div>
        ) : (
          <div className="tests-list">
            {filteredTests.map((test) => (
              <div 
                key={test.id} 
                className={`test-card ${test.completedAt ? 'completed' : 'pending'}`}
                onClick={() => handleTestClick(test)}
              >
                <div className="test-card-header">
                  <h3 className="test-title">
                    {test.title || "Test de Memoria"}
                  </h3>
                  <span className={`status-badge ${test.completedAt ? 'completed' : 'pending'}`}>
                    {test.completedAt ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Completado
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Pendiente
                      </>
                    )}
                  </span>
                </div>

                <div className="test-info-row">
                  <div className="info-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div>
                      <span className="info-label">Creado</span>
                      <span className="info-value">
                        {test.createdAt.toDate().toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="info-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <div>
                      <span className="info-label">Preguntas</span>
                      <span className="info-value">{test.questions.length}</span>
                    </div>
                  </div>

                  {test.completedAt && (
                    <>
                      <div className="info-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <span className="info-label">Completado</span>
                          <span className="info-value">
                            {test.completedAt.toDate().toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short"
                            })}
                          </span>
                        </div>
                      </div>

                      {test.result && (
                        <div className="info-box">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <div>
                            <span className="info-label">Tiempo</span>
                            <span className="info-value">
                              {Math.floor(test.result.totalTime / 60)}m {test.result.totalTime % 60}s
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {test.result && (
                  <div className="score-section">
                    <span className="score-label">Puntuación</span>
                    <div className="score-content">
                      <span className="score-fraction">
                        {test.result.score}/{test.result.totalQuestions}
                      </span>
                      <span className="score-percentage">
                        {Math.round((test.result.score / test.result.totalQuestions) * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {!test.completedAt && (
                  <div className="action-section">
                    <button className="btn-start-test">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Comenzar Test
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
