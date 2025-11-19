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
      {/* Header Simple */}
      <div className="tests-header">
        <div className="header-content">
          <h1 className="page-title">Evaluaciones Cognitivas</h1>
          <p className="page-subtitle">Visualiza y completa tus tests de memoria personalizados</p>
        </div>
        <div className="header-counters">
          <div className="counter-item pending">
            <div className="counter-number">{pendingCount}</div>
            <div className="counter-label">PENDIENTES</div>
          </div>
          <div className="counter-item completed">
            <div className="counter-number">{completedCount}</div>
            <div className="counter-label">COMPLETADOS</div>
          </div>
        </div>
      </div>

      {/* Tabs Simples */}
      <div className="filter-tabs">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Todos
        </button>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pendientes
        </button>
        <button
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completados
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
                className="test-item"
                onClick={() => handleTestClick(test)}
              >
                <div className="test-info">
                  <h3 className="test-name">
                    {test.title || `Test Médico - ${test.createdAt.toDate().toLocaleDateString("es-ES")}`}
                  </h3>
                  <div className="test-meta">
                    <span className="meta-icon">👤</span>
                    <span className="meta-text">{user?.name || "Paciente"}</span>
                    <span className="meta-separator">•</span>
                    <span className="meta-icon">📅</span>
                    <span className="meta-text">
                      {test.createdAt.toDate().toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      })}
                    </span>
                    {test.result && (
                      <>
                        <span className="meta-separator">•</span>
                        <span className="meta-text">Resultado: {test.result.score}/{test.result.totalQuestions}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="test-actions">
                  {test.completedAt ? (
                    <span className="status-badge completed-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Completado
                    </span>
                  ) : (
                    <span className="status-badge pending-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
