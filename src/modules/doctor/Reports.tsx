import { useEffect, useState } from "react";
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
      
      console.log("Doctor UID:", user.uid);
      
      const doctorPatients = await getDoctorPatients(user.uid);
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
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1 className="reports-title">Reportes Médicos</h1>
          <p className="reports-subtitle">Genera reportes detallados con análisis de IA</p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No hay pacientes registrados</h3>
          <p>Agrega pacientes para poder generar reportes médicos.</p>
        </div>
      ) : (
        <div className="patients-reports-list">
          {patients.map((patient) => (
            <div key={patient.uid} className="patient-report-card">
              <div className="report-card-content">
                <div className="patient-info-section">
                  <div className="patient-avatar-circle">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="patient-details-section">
                    <h3 className="patient-name-text">{patient.name}</h3>
                    <p className="patient-email-text">{patient.email}</p>
                  </div>
                </div>

                <div className="stats-section">
                  <div className="stat-box">
                    <span className="stat-number">{patient.testCount}</span>
                    <span className="stat-text">Tests Completados</span>
                  </div>
                  <div className={`status-indicator ${patient.canGenerateReport ? "ready" : "pending"}`}>
                    {patient.canGenerateReport
                      ? "✓ Listo"
                      : `Faltan ${3 - patient.testCount}`}
                  </div>
                </div>
              </div>

              <div className="report-card-actions">
                <button
                  className={`btn-generate-report ${!patient.canGenerateReport ? "disabled" : ""}`}
                  onClick={() => handleGenerateReport(patient)}
                  disabled={!patient.canGenerateReport || generatingReport === patient.uid}
                >
                  {generatingReport === patient.uid ? (
                    <>
                      <div className="btn-spinner"></div>
                      Generando...
                    </>
                  ) : patient.canGenerateReport ? (
                    "Generar Reporte"
                  ) : (
                    "Requiere 3 tests"
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
