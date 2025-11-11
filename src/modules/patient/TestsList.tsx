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
      <div className="tests-header">
        <h2>Tests Pendientes</h2>
        <p className="tests-count">{tests.length} test(s) disponible(s)</p>
      </div>

      <div className="tests-grid">
        {tests.map((test) => (
          <div key={test.id} className="test-card">
            <div className="test-card-header">
              <div className="test-icon">🧠</div>
              <span className="test-badge">Nuevo</span>
            </div>

            <div className="test-card-body">
              <h3 className="test-title">Test de Memoria</h3>
              <p className="test-description">
                Este test contiene {test.questions.length} pregunta(s) basadas en tus recuerdos.
              </p>

              <div className="test-meta">
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-text">
                    {test.createdAt.toDate().toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">❓</span>
                  <span className="meta-text">{test.questions.length} preguntas</span>
                </div>
              </div>
            </div>

            <div className="test-card-footer">
              <button
                className="start-test-btn"
                onClick={() => handleStartTest(test.id!)}
              >
                Comenzar Test
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
