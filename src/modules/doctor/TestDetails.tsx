import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTestById } from "../../api/testService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import type { Test } from "../../types/Test";
import "./TestDetails.css";

export default function DoctorTestDetails() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestDetails();
  }, [testId]);

  const loadTestDetails = async () => {
    if (!testId) return;

    try {
      setLoading(true);

      // Cargar test
      const testData = await getTestById(testId);
      if (testData) {
        setTest(testData);

        // Cargar nombre del paciente
        const patientRef = doc(db, "users", testData.patientId);
        const patientSnap = await getDoc(patientRef);
        if (patientSnap.exists()) {
          const patientData = patientSnap.data();
          setPatientName(patientData.name || patientData.email);
        }

        // Cargar resultados del test si está completado
        if (testData.status === "completed") {
          const resultRef = doc(db, "testResults", testId);
          const resultSnap = await getDoc(resultRef);
          if (resultSnap.exists()) {
            setTestResult(resultSnap.data());
          }
        }
      }
    } catch (error) {
      console.error("Error cargando detalles del test:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "score-excellent";
    if (percentage >= 60) return "score-good";
    if (percentage >= 40) return "score-fair";
    return "score-poor";
  };

  if (loading) {
    return (
      <div className="test-details-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando detalles del test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="test-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Test no encontrado</h3>
          <p>No se pudo cargar la información del test.</p>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const percentage = test.result
    ? Math.round((test.result.score / test.result.totalQuestions) * 100)
    : 0;

  return (
    <div className="test-details-container">
      {/* Header */}
      <div className="details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <div className="header-info">
          <h2>📋 Detalles del Test</h2>
          <span className={`status-badge ${test.status}`}>
            {test.status === "pending" ? "⏳ Pendiente" : "✅ Completado"}
          </span>
        </div>
      </div>

      {/* Información del Test */}
      <div className="test-info-card">
        <div className="info-header">
          <div>
            <h3>{test.title || "Test de Memoria"}</h3>
            <p className="patient-name">Paciente: {patientName}</p>
          </div>
          {test.status === "completed" && test.result && (
            <div className={`score-circle ${getScoreColor(test.result.score, test.result.totalQuestions)}`}>
              <div className="score-number">{percentage}%</div>
              <div className="score-label">
                {test.result.score}/{test.result.totalQuestions}
              </div>
            </div>
          )}
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">📅 Creado:</span>
            <span className="info-value">
              {test.createdAt.toDate().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {test.status === "completed" && test.completedAt && (
            <div className="info-item">
              <span className="info-label">✅ Completado:</span>
              <span className="info-value">
                {test.completedAt.toDate().toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          <div className="info-item">
            <span className="info-label">❓ Preguntas:</span>
            <span className="info-value">{test.questions.length}</span>
          </div>

          {test.result && (
            <div className="info-item">
              <span className="info-label">⏱️ Tiempo Total:</span>
              <span className="info-value">
                {Math.floor(test.result.totalTime / 60)}m {test.result.totalTime % 60}s
              </span>
            </div>
          )}
        </div>

        {test.result?.aiAnalysis && (
          <div className="ai-analysis-section">
            <h4>🤖 Análisis de IA</h4>
            <p>{test.result.aiAnalysis}</p>
          </div>
        )}
      </div>

      {/* Preguntas y Respuestas */}
      <div className="questions-section">
        <h3 className="section-title">📝 Preguntas del Test</h3>
        
        {test.questions.map((question, index) => {
          const userAnswer = testResult?.answers?.find(
            (a: any) => a.questionId === question.id
          );

          return (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <span className="question-number">Pregunta {index + 1}</span>
                {test.status === "completed" && (
                  <span className={`result-badge ${userAnswer?.isCorrect ? "correct" : "incorrect"}`}>
                    {userAnswer?.isCorrect ? "✓ Correcta" : "✗ Incorrecta"}
                  </span>
                )}
              </div>

              {question.imageUrl && (
                <div className="question-image">
                  <img src={question.imageUrl} alt="Imagen de la pregunta" />
                </div>
              )}

              <div className="question-text">
                <p>{question.question}</p>
              </div>

              <div className="options-list">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === question.correctAnswer;
                  const isSelected = userAnswer?.selectedAnswer === optionIndex;
                  
                  let optionClass = "option-item";
                  if (test.status === "completed") {
                    if (isCorrect) {
                      optionClass += " correct-option";
                    }
                    if (isSelected && !isCorrect) {
                      optionClass += " wrong-option";
                    }
                    if (isSelected) {
                      optionClass += " selected-option";
                    }
                  }

                  return (
                    <div key={optionIndex} className={optionClass}>
                      <span className="option-letter">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="option-text">{option}</span>
                      {test.status === "completed" && (
                        <>
                          {isCorrect && <span className="option-icon">✓</span>}
                          {isSelected && !isCorrect && <span className="option-icon">✗</span>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {test.status === "completed" && userAnswer?.timeSpent && (
                <div className="question-footer">
                  <span className="time-spent">
                    ⏱️ Tiempo: {userAnswer.timeSpent}s
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      {test.status === "completed" && test.result && (
        <div className="summary-card">
          <h3>📊 Resumen del Rendimiento</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">{test.result.score}</div>
              <div className="stat-label">Correctas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {test.result.totalQuestions - test.result.score}
              </div>
              <div className="stat-label">Incorrectas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{percentage}%</div>
              <div className="stat-label">Aciertos</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {Math.floor(test.result.totalTime / 60)}m
              </div>
              <div className="stat-label">Duración</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
