import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "./Home.css";

interface RecentTest {
  id: string;
  title: string;
  patientName: string;
  status: "completed" | "pending";
  completedAt?: any;
  createdAt: any;
}

interface PatientAlert {
  id: string;
  patientName: string;
  message: string;
  timestamp: any;
  type: "warning" | "info";
}

export default function DoctorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    completedTests: 0,
    pendingTests: 0,
    totalMemories: 0
  });

  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);

  useEffect(() => {
    loadStatistics();
    loadRecentTests();
    loadAlerts();
  }, [user]);

  const loadStatistics = async () => {
    if (!user?.uid) {
      console.log("No user ID available");
      return;
    }

    try {
      console.log("Loading statistics for doctor:", user.uid);

      // Obtener todos los pacientes
      const patientsRef = collection(db, "users");
      const patientsQuery = query(patientsRef, where("role", "==", "patient"));
      const patientsSnapshot = await getDocs(patientsQuery);
      console.log("Total patients found:", patientsSnapshot.size);
      
      // Obtener todos los tests (sin filtrar por createdBy primero)
      const testsRef = collection(db, "tests");
      const allTestsSnapshot = await getDocs(testsRef);
      console.log("Total tests in database:", allTestsSnapshot.size);
      
      // Filtrar tests del doctor actual
      const doctorTests = allTestsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.createdBy === user.uid || data.doctorId === user.uid;
      });
      console.log("Doctor's tests found:", doctorTests.length);
      
      // Contar tests completados y pendientes
      const completedTests = doctorTests.filter(doc => doc.data().completedAt).length;
      const pendingTests = doctorTests.filter(doc => !doc.data().completedAt).length;
      console.log("Completed tests:", completedTests, "Pending tests:", pendingTests);

      // Obtener total de recuerdos (memories) de todos los pacientes
      const memoriesRef = collection(db, "memories");
      const memoriesSnapshot = await getDocs(memoriesRef);
      console.log("Total memories found:", memoriesSnapshot.size);

      const newStats = {
        totalPatients: patientsSnapshot.size,
        completedTests: completedTests,
        pendingTests: pendingTests,
        totalMemories: memoriesSnapshot.size
      };
      
      console.log("Setting stats:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadRecentTests = async () => {
    if (!user?.uid) return;

    try {
      // Obtener todos los tests del doctor
      const testsRef = collection(db, "tests");
      const testsSnapshot = await getDocs(testsRef);
      
      // Filtrar tests del doctor y obtener información del paciente
      const testsWithPatients = await Promise.all(
        testsSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.createdBy === user.uid || data.doctorId === user.uid;
          })
          .map(async (doc) => {
            const testData = doc.data();
            
            // Obtener nombre del paciente
            let patientName = "Paciente Desconocido";
            if (testData.patientId) {
              const usersRef = collection(db, "users");
              const userQuery = query(usersRef, where("uid", "==", testData.patientId));
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                patientName = userSnapshot.docs[0].data().name || "Paciente";
              }
            }

            return {
              id: doc.id,
              title: testData.testName || testData.title || "Test sin título",
              patientName,
              status: testData.completedAt ? "completed" as const : "pending" as const,
              completedAt: testData.completedAt,
              createdAt: testData.createdAt
            };
          })
      );

      // Ordenar por fecha (más recientes primero) y limitar a 1
      const sorted = testsWithPatients
        .sort((a, b) => {
          const dateA = a.completedAt || a.createdAt;
          const dateB = b.completedAt || b.createdAt;
          return (dateB?.seconds || 0) - (dateA?.seconds || 0);
        })
        .slice(0, 1);

      setRecentTests(sorted);
    } catch (error) {
      console.error("Error loading recent tests:", error);
    }
  };

  const loadAlerts = async () => {
    if (!user?.uid) return;

    try {
      // Obtener tests pendientes que necesitan atención
      const testsRef = collection(db, "tests");
      const testsSnapshot = await getDocs(testsRef);
      
      const pendingAlerts: PatientAlert[] = [];
      
      for (const doc of testsSnapshot.docs) {
        const testData = doc.data();
        
        // Solo tests del doctor que estén pendientes
        if ((testData.createdBy === user.uid || testData.doctorId === user.uid) && !testData.completedAt) {
          // Obtener nombre del paciente
          let patientName = "Paciente";
          if (testData.patientId) {
            const usersRef = collection(db, "users");
            const userQuery = query(usersRef, where("uid", "==", testData.patientId));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
              patientName = userSnapshot.docs[0].data().name || "Paciente";
            }
          }

          // Calcular hace cuánto tiempo se creó
          const now = Date.now();
          const createdAt = testData.createdAt?.seconds * 1000 || now;
          const hoursDiff = Math.floor((now - createdAt) / (1000 * 60 * 60));

          pendingAlerts.push({
            id: doc.id,
            patientName,
            message: `Test pendiente de revisión`,
            timestamp: testData.createdAt,
            type: hoursDiff > 24 ? "warning" : "info"
          });
        }
      }

      // Ordenar por timestamp y limitar a 3
      const sorted = pendingAlerts
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        .slice(0, 3);

      setAlerts(sorted);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Hace un momento";
    
    const now = Date.now();
    const then = timestamp.seconds * 1000;
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    return `${days} ${days === 1 ? 'día' : 'días'} atrás`;
  };

  return (
    <div className="doctor-dashboard">
      {/* Header con bienvenida */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">Panel Médico</h1>
          <p className="dashboard-subtitle">Sistema de Gestión de Pacientes</p>
        </div>
      </div>

      {/* Banner de bienvenida */}
      <div className="welcome-banner">
        <h2 className="welcome-title">¡Bienvenida de nuevo, Dr. {user?.name || "Doctor"}!</h2>
        <p className="welcome-text">Aquí está un resumen de tu actividad médica.</p>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-section-wrapper">
        <h3 className="section-title">Estadísticas Clave</h3>
        <div className="stats-grid-horizontal">
          <div className="stat-card-horizontal">
            <div className="stat-text-content">
              <div className="stat-label-horizontal">Total Pacientes</div>
              <div className="stat-value-horizontal">{stats.totalPatients}</div>
            </div>
            <div className="stat-icon-horizontal stat-icon-blue">
              <span>👥</span>
            </div>
          </div>

          <div className="stat-card-horizontal">
            <div className="stat-text-content">
              <div className="stat-label-horizontal">Tests Completados</div>
              <div className="stat-value-horizontal">{stats.completedTests}</div>
            </div>
            <div className="stat-icon-horizontal stat-icon-green">
              <span>✅</span>
            </div>
          </div>

          <div className="stat-card-horizontal">
            <div className="stat-text-content">
              <div className="stat-label-horizontal">Pacientes Activos</div>
              <div className="stat-value-horizontal">{stats.totalPatients}</div>
            </div>
            <div className="stat-icon-horizontal stat-icon-purple">
              <span>📊</span>
            </div>
          </div>

          <div className="stat-card-horizontal">
            <div className="stat-text-content">
              <div className="stat-label-horizontal">Tests Pendientes</div>
              <div className="stat-value-horizontal">{stats.pendingTests}</div>
            </div>
            <div className="stat-icon-horizontal stat-icon-orange">
              <span>📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="actions-section">
        <h3 className="section-title">Acciones Rápidas</h3>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate("/doctor/patients")}>
            <div className="action-icon action-blue">
              <span>➕</span>
            </div>
            <div className="action-label">Crear Nuevo Test</div>
          </div>

          <div className="action-card" onClick={() => navigate("/doctor/reports")}>
            <div className="action-icon action-green">
              <span>📊</span>
            </div>
            <div className="action-label">Ver Reportes</div>
          </div>

          <div className="action-card" onClick={() => navigate("/doctor/invite-caregiver")}>
            <div className="action-icon action-purple">
              <span>✉️</span>
            </div>
            <div className="action-label">Invitar Paciente</div>
          </div>
        </div>
      </div>

      {/* Tests recientes y alertas */}
      <div className="bottom-section">
        <div className="recent-tests">
          <div className="section-header">
            <h3 className="section-title">Tests Recientes</h3>
            <span className="badge">{recentTests.length} nuevos</span>
          </div>
          <div className="tests-list">
            {recentTests.length > 0 ? (
              recentTests.map((test) => (
                <div key={test.id} className="test-item" onClick={() => navigate("/doctor/patient-tests")}>
                  <div className={`test-icon status-${test.status}`}>
                    {test.status === "completed" ? "📋" : "⏳"}
                  </div>
                  <div className="test-info">
                    <div className="test-name">{test.title}</div>
                    <div className="test-patient">{test.patientName}</div>
                  </div>
                  <div className="test-meta">
                    <span className={`test-status ${test.status}`}>
                      {test.status === "completed" ? "Completado" : "Pendiente"}
                    </span>
                    <span className="test-time">{getTimeAgo(test.completedAt || test.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No hay tests recientes</p>
              </div>
            )}
          </div>
        </div>

        <div className="alerts-panel">
          <div className="section-header">
            <h3 className="section-title">Alertas de Pacientes</h3>
            <span className="alert-badge">{alerts.length}</span>
          </div>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                  <div className="alert-icon">
                    {alert.type === "warning" ? "⚠️" : "📋"}
                  </div>
                  <div className="alert-info">
                    <div className="alert-title">{alert.message}</div>
                    <div className="alert-patient">{alert.patientName}</div>
                    <div className="alert-time">{getTimeAgo(alert.timestamp)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No hay alertas pendientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
