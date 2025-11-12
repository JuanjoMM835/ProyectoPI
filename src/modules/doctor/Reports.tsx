import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/useAuth";
import { getDoctorPatients } from "../../api/patientService";
import { getAllTestsByPatient } from "../../api/testService";
import { generatePatientReport } from "../../api/aiTestService";
import type { Test } from "../../types/Test";
import "./Reports.css";

interface Patient {
  uid: string;
  name: string;
  email: string;
}

interface PatientWithTests extends Patient {
  completedTests: Test[];
  testCount: number;
  canGenerateReport: boolean;
}

export default function DoctorReports() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientWithTests[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<{
    patientName: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    loadPatientsWithTests();
  }, [user]);

  const loadPatientsWithTests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener el documento del doctor para conseguir sus patientIds
      const doctorDoc = await getDoc(doc(db, "users", user.uid));
      const patientIds = doctorDoc.exists() ? (doctorDoc.data().patientIds || []) : [];
      
      console.log("Doctor patientIds:", patientIds);
      
      const doctorPatients = await getDoctorPatients(patientIds);
      console.log("Doctor patients:", doctorPatients);

      // Cargar tests completados de cada paciente
      const patientsWithTests = await Promise.all(
        doctorPatients.map(async (patient) => {
          const allTests = await getAllTestsByPatient(patient.uid);
          const completedTests = allTests.filter((t) => t.status === "completed");

          return {
            ...patient,
            completedTests,
            testCount: completedTests.length,
            canGenerateReport: completedTests.length >= 3,
          };
        })
      );

      // Ordenar por cantidad de tests (descendente)
      patientsWithTests.sort((a, b) => b.testCount - a.testCount);

      console.log("Patients with tests:", patientsWithTests);
      setPatients(patientsWithTests);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (patient: PatientWithTests) => {
    setGeneratingReport(patient.uid);

    try {
      // Preparar datos de los tests
      const testsData = patient.completedTests.map((test) => ({
        title: test.title,
        date: test.completedAt?.toDate() || new Date(),
        score: test.result?.score || test.score || 0,
        totalQuestions: test.result?.totalQuestions || test.totalQuestions,
        totalTime: test.result?.totalTime || 0,
      }));

      // Generar reporte con IA
      const report = await generatePatientReport(patient.name, testsData);

      setSelectedReport({
        patientName: patient.name,
        content: report,
      });
    } catch (error) {
      console.error("Error generando reporte:", error);
      alert("Error al generar el reporte. Inténtalo de nuevo.");
    } finally {
      setGeneratingReport(null);
    }
  };

  const closeReport = () => {
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>📊 Reportes Médicos de Pacientes</h2>
        <p className="subtitle">
          Genera reportes detallados con análisis de IA para pacientes con 3 o más tests completados
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No hay pacientes registrados</h3>
          <p>Agrega pacientes para poder generar reportes.</p>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map((patient) => (
            <div
              key={patient.uid}
              className={`patient-report-card ${!patient.canGenerateReport ? "disabled" : ""}`}
            >
              <div className="card-header">
                <div className="patient-avatar">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div className="patient-info">
                  <h3>{patient.name}</h3>
                  <p className="patient-email">{patient.email}</p>
                </div>
              </div>

              <div className="card-body">
                <div className="stats">
                  <div className="stat-item">
                    <span className="stat-label">Tests Completados:</span>
                    <span className={`stat-value ${patient.canGenerateReport ? "ready" : ""}`}>
                      {patient.testCount}
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Estado:</span>
                    <span className={`status-badge ${patient.canGenerateReport ? "ready" : "pending"}`}>
                      {patient.canGenerateReport
                        ? "✅ Listo para reporte"
                        : `⏳ ${3 - patient.testCount} tests más`}
                    </span>
                  </div>
                </div>

                {patient.canGenerateReport && (
                  <div className="progress-info">
                    <p className="tests-list-label">📝 Tests disponibles para análisis:</p>
                    <ul className="tests-list">
                      {patient.completedTests.slice(0, 3).map((test) => (
                        <li key={test.id}>
                          {test.title} - {test.completedAt?.toDate().toLocaleDateString("es-ES")}
                        </li>
                      ))}
                      {patient.completedTests.length > 3 && (
                        <li className="more">Y {patient.completedTests.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button
                  className="generate-report-btn"
                  onClick={() => handleGenerateReport(patient)}
                  disabled={!patient.canGenerateReport || generatingReport === patient.uid}
                >
                  {generatingReport === patient.uid ? (
                    <>
                      <div className="btn-spinner"></div>
                      Generando reporte con IA...
                    </>
                  ) : patient.canGenerateReport ? (
                    <>🤖 Generar Reporte con IA</>
                  ) : (
                    <>🔒 Requiere 3 tests mínimo</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal del Reporte */}
      {selectedReport && (
        <div className="report-modal-overlay" onClick={closeReport}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Reporte Médico - {selectedReport.patientName}</h2>
              <button className="close-btn" onClick={closeReport}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div
                className="report-content markdown-body"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(selectedReport.content),
                }}
              />
            </div>

            <div className="modal-footer">
              <button className="print-btn" onClick={() => window.print()}>
                🖨️ Imprimir
              </button>
              <button className="close-modal-btn" onClick={closeReport}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Función simple para convertir Markdown a HTML
function formatMarkdown(text: string): string {
  return text
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
}
