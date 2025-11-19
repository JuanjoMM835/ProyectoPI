import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getPendingTests } from "../../api/testService";
import type { Test } from "../../types/Test";
import "./TestsList.css";

export const TestsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingTests();
  }, [user]);

  const loadPendingTests = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const pendingTests = await getPendingTests(user.uid);
      setTests(pendingTests);
    } catch (error) {
      console.error("Error loading pending tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId: string) => {
    navigate(`/patient/test/${testId}`);
  };

  if (loading) {
    return (
      <div className="tests-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando tests...</p>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="tests-list-container">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No hay tests pendientes</h3>
          <p>Tu cuidador aún no ha generado ningún test para ti.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tests-list-container">
      <div className="list-header">
        <div className="header-info">
          <h2 className="list-title">Evaluaciones Pendientes</h2>
          <p className="list-subtitle">Completa tus tests para mantener tu progreso actualizado</p>
        </div>
        <div className="tests-badge">
          <span className="badge-number">{tests.length}</span>
          <span className="badge-text">disponible{tests.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="tests-grid">
        {tests.map((test) => (
          <div key={test.id} className="modern-test-card">
            <div className="card-header">
              <div className="card-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <span className="new-badge">Nuevo</span>
            </div>

            <div className="card-content">
              <h3 className="card-title">{test.title || "Test de Memoria Cognitiva"}</h3>
              <p className="card-description">
                Evaluación personalizada con {test.questions.length} {test.questions.length === 1 ? 'pregunta' : 'preguntas'} basadas en tus recuerdos personales.
              </p>

              <div className="card-details">
                <div className="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>
                    {test.createdAt.toDate().toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>{test.questions.length} preguntas</span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button
                className="action-button"
                onClick={() => handleStartTest(test.id!)}
              >
                <span>Comenzar Evaluación</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
