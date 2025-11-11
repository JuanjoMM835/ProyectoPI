import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateTestFromMemories } from "../../api/aiTestService";
import { createTest } from "../../api/testService";
import { getMemories } from "../../api/memoryService";
import { getPatientById } from "../../api/patientService";
import { useAuth } from "../../auth/useAuth";
import "./GenerateTest.css";

export default function GenerateTest() {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatientInfo();
    }
  }, [patientId]);

  const loadPatientInfo = async () => {
    try {
      setLoadingPatient(true);
      const patient = await getPatientById(patientId!);
      if (patient) {
        setPatientName(patient.name || patient.email);
      }
    } catch (err) {
      console.error("Error loading patient:", err);
      setError("No se pudo cargar la información del paciente");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleGenerateTest = async () => {
    if (!patientId) {
      setError("ID de paciente inválido");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Obtener memorias del paciente
      console.log("📚 Obteniendo memorias del paciente...");
      const memories = await getMemories(patientId, "caregiver");

      if (memories.length < 3) {
        setError(
          `Se necesitan al menos 3 memorias para generar un test. El paciente solo tiene ${memories.length}.`
        );
        return;
      }

      console.log(`✅ ${memories.length} memorias encontradas`);

      // 2. Generar preguntas con IA
      console.log("🤖 Generando preguntas con IA...");
      const questions = await generateTestFromMemories(
        memories,
        Math.min(numberOfQuestions, memories.length)
      );

      console.log(`✅ ${questions.length} preguntas generadas`);

      // 3. Crear test en Firestore
      console.log("💾 Guardando test...");
      const testId = await createTest(
        patientId,
        questions,
        { id: user!.uid, role: "caregiver" },
        `Test de Memoria - ${new Date().toLocaleDateString("es-ES")}`,
        `Test generado automáticamente con IA basado en las memorias de ${patientName}`
      );

      console.log(`✅ Test creado con ID: ${testId}`);
      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/caregiver/home");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Error generando test:", error);
      setError(
        error.message || "Error generando test. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="generate-test-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!patientId || !patientName) {
    return (
      <div className="generate-test-container">
        <div className="error-message">
          <span>⚠️</span> Paciente no encontrado
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="generate-test-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>¡Test Creado Exitosamente!</h2>
          <p>
            El paciente <strong>{patientName}</strong> ya puede tomar el test.
          </p>
          <p className="redirect-message">Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="generate-test-container">
      <div className="generate-test-card">
        <h2>🤖 Generar Test con IA</h2>
        <p className="subtitle">
          Crear test personalizado para <strong>{patientName}</strong>
        </p>

        <div className="form-section">
          <label htmlFor="questions">
            Número de preguntas:
            <span className="question-count">{numberOfQuestions}</span>
          </label>
          <input
            type="range"
            id="questions"
            min="3"
            max="10"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
            disabled={loading}
          />
          <div className="range-labels">
            <span>3</span>
            <span>5</span>
            <span>7</span>
            <span>10</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="info-box">
          <h4>ℹ️ Información</h4>
          <ul>
            <li>La IA analizará las memorias del paciente</li>
            <li>Se generarán preguntas personalizadas</li>
            <li>El proceso toma aproximadamente 1-2 minutos</li>
            <li>El paciente recibirá una notificación del test</li>
          </ul>
        </div>

        <div className="button-group">
          <button
            onClick={() => navigate(-1)}
            className="cancel-btn"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerateTest}
            className="generate-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generando Test...
              </>
            ) : (
              <>🤖 Generar Test con IA</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
