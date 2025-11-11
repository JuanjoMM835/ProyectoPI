import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTestById, submitTestResults } from "../../api/testService";
import { analyzeTestResults } from "../../api/aiTestService";
import { useAuth } from "../../auth/useAuth";
import type { Test, TestAnswer } from "../../types/Test";
import "./TakeTest.css";

export default function TakeTest() {
  const { testId } = useParams<{ testId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    if (!testId) return;

    try {
      const testData = await getTestById(testId);
      if (!testData) {
        alert("Test no encontrado");
        navigate("/patient/home");
        return;
      }

      if (testData.status === "completed") {
        alert("Este test ya fue completado");
        navigate("/patient/home");
        return;
      }

      setTest(testData);
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error("Error cargando test:", error);
      alert("Error cargando test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = test!.questions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const answer: TestAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
    };

    setAnswers([...answers, answer]);

    if (currentQuestionIndex < test!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      // Último pregunta - mostrar resultados
      finishTest([...answers, answer]);
    }
  };

  const finishTest = async (finalAnswers: TestAnswer[]) => {
    setSubmitting(true);

    try {
      const score = finalAnswers.filter((a) => a.isCorrect).length;
      const totalTime = Math.floor((Date.now() - startTime) / 1000);

      // Obtener análisis con IA primero
      let analysis = "";
      try {
        analysis = await analyzeTestResults(
          score,
          test!.totalQuestions,
          totalTime
        );
        setAiAnalysis(analysis);
      } catch (error) {
        console.error("Error obteniendo análisis:", error);
      }

      // Guardar resultados con el análisis incluido
      await submitTestResults(
        testId!,
        user!.uid,
        finalAnswers,
        score,
        totalTime,
        analysis
      );

      setShowResults(true);
    } catch (error) {
      console.error("Error guardando resultados:", error);
      alert("Error guardando resultados del test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="take-test-container">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Cargando test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="take-test-container">
        <p>Test no encontrado</p>
      </div>
    );
  }

  if (showResults) {
    const score = answers.filter((a) => a.isCorrect).length;
    const percentage = (score / test.totalQuestions) * 100;

    return (
      <div className="take-test-container">
        <div className="results-card">
          <div className="results-icon">
            {percentage >= 70 ? "🎉" : percentage >= 50 ? "👍" : "💪"}
          </div>
          <h2>¡Test Completado!</h2>

          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {test.totalQuestions}</span>
            </div>
            <p className="score-percentage">{percentage.toFixed(0)}%</p>
          </div>

          <div className="results-details">
            <div className="detail-item">
              <span className="detail-label">Correctas:</span>
              <span className="detail-value correct">{score}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Incorrectas:</span>
              <span className="detail-value incorrect">
                {test.totalQuestions - score}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tiempo total:</span>
              <span className="detail-value">
                {Math.floor(
                  answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60
                )}{" "}
                min
              </span>
            </div>
          </div>

          {aiAnalysis && (
            <div className="ai-analysis">
              <h3>📊 Análisis de IA</h3>
              <p>{aiAnalysis}</p>
            </div>
          )}

          <button onClick={() => navigate("/patient/home")} className="home-btn">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.totalQuestions) * 100;

  return (
    <div className="take-test-container">
      <div className="test-header">
        <h2>{test.title}</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="question-counter">
          Pregunta {currentQuestionIndex + 1} de {test.totalQuestions}
        </p>
      </div>

      <div className="question-card">
        {currentQuestion.imageUrl && (
          <div className="question-image">
            <img src={currentQuestion.imageUrl} alt="Memoria" />
          </div>
        )}

        <h3 className="question-text">{currentQuestion.question}</h3>

        <div className="options-list">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                selectedAnswer === index ? "selected" : ""
              }`}
              onClick={() => handleAnswerSelect(index)}
              disabled={submitting}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        <div className="question-actions">
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="back-btn"
              disabled={submitting}
            >
              ← Anterior
            </button>
          )}
          <button
            onClick={handleNextQuestion}
            className="next-btn"
            disabled={selectedAnswer === null || submitting}
          >
            {currentQuestionIndex < test.questions.length - 1
              ? "Siguiente →"
              : submitting
              ? "Finalizando..."
              : "Finalizar ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
