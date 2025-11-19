import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "./Home.css";

interface PatientTest {
  id: string;
  title: string;
  status: "completed" | "pending";
  completedAt?: any;
  createdAt: any;
  result?: {
    score: number;
    totalQuestions: number;
  };
}

export default function PatientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    completedTests: 0,
    pendingTests: 0,
    totalMemories: 0,
    reminders: 0
  });

  const [recentTests, setRecentTests] = useState<PatientTest[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadStatistics();
      loadRecentTests();
    }
  }, [user]);

  const loadStatistics = async () => {
    if (!user?.uid) {
      console.log("No user ID available");
      return;
    }

    try {
      console.log("Loading statistics for patient:", user.uid);

      // Obtener tests del paciente
      const testsRef = collection(db, "tests");
      const testsQuery = query(testsRef, where("patientId", "==", user.uid));
      const testsSnapshot = await getDocs(testsQuery);
      
      console.log("Total tests found:", testsSnapshot.size);
      
      const completedTests = testsSnapshot.docs.filter(doc => {
        const data = doc.data();
        console.log("Test:", doc.id, "completedAt:", data.completedAt);
        return data.completedAt;
      }).length;
      
      const pendingTests = testsSnapshot.docs.filter(doc => !doc.data().completedAt).length;

      console.log("Completed tests:", completedTests, "Pending tests:", pendingTests);

      let memoriesCount = 0;
      let remindersCount = 0;

      // Intentar obtener memorias del paciente
      try {
        const memoriesRef = collection(db, "memories");
        const memoriesQuery = query(memoriesRef, where("patientId", "==", user.uid));
        const memoriesSnapshot = await getDocs(memoriesQuery);
        memoriesCount = memoriesSnapshot.size;
        console.log("Total memories found:", memoriesCount);
      } catch (memError) {
        console.log("Could not load memories (permissions):", memError);
      }

      // Intentar obtener recordatorios
      try {
        const remindersRef = collection(db, "reminders");
        const remindersQuery = query(remindersRef, where("userId", "==", user.uid));
        const remindersSnapshot = await getDocs(remindersQuery);
        remindersCount = remindersSnapshot.size;
        console.log("Total reminders found:", remindersCount);
      } catch (remError) {
        console.log("Could not load reminders (permissions):", remError);
      }

      const newStats = {
        completedTests,
        pendingTests,
        totalMemories: memoriesCount,
        reminders: remindersCount
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
      const testsRef = collection(db, "tests");
      const testsQuery = query(testsRef, where("patientId", "==", user.uid));
      const testsSnapshot = await getDocs(testsQuery);
      
      const tests: PatientTest[] = testsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().testName || doc.data().title || "Test de Memoria",
        status: doc.data().completedAt ? "completed" : "pending",
        completedAt: doc.data().completedAt,
        createdAt: doc.data().createdAt,
        result: doc.data().result
      }));

      // Ordenar por fecha y limitar a 3
      const sorted = tests
        .sort((a, b) => {
          const dateA = a.completedAt || a.createdAt;
          const dateB = b.completedAt || b.createdAt;
          return (dateB?.seconds || 0) - (dateA?.seconds || 0);
        })
        .slice(0, 3);

      setRecentTests(sorted);
    } catch (error) {
      console.error("Error loading recent tests:", error);
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
    <div className="patient-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">Panel Paciente</h1>
          <p className="dashboard-subtitle">Sistema de Gestión</p>
        </div>
      </div>

      {/* Banner de bienvenida */}
      <div className="welcome-banner">
        <h2 className="welcome-title">¡Bienvenido de nuevo, {user?.name || "Paciente"}!</h2>
        <p className="welcome-text">Aquí está un resumen de tu actividad.</p>
      </div>

      {/* Acciones rápidas */}
      <div className="actions-section">
        <h3 className="section-title">Acciones Rápidas</h3>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate("/patient/tests")}>
            <div className="action-icon action-blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="action-label">Mis Tests</div>
          </div>

          <div className="action-card" onClick={() => navigate("/patient/reminders")}>
            <div className="action-icon action-purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="action-label">Recordatorios</div>
          </div>

          <div className="action-card" onClick={() => navigate("/patient/profile")}>
            <div className="action-icon action-teal">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="action-label">Perfil</div>
          </div>
        </div>
      </div>

      {/* Tests recientes y estadísticas */}
      <div className="bottom-section">
        <div className="recent-tests">
          <div className="section-header">
            <h3 className="section-title">Tests Recientes</h3>
            <span className="badge">{recentTests.length} nuevos</span>
          </div>
          <div className="tests-list">
            {recentTests.length > 0 ? (
              recentTests.map((test) => (
                <div 
                  key={test.id} 
                  className="test-item" 
                  onClick={() => navigate(test.status === "pending" ? "/patient/test" : "/patient/tests")}
                >
                  <div className={`test-icon status-${test.status}`}>
                    {test.status === "completed" ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                  </div>
                  <div className="test-info">
                    <div className="test-name">{test.title}</div>
                    <div className="test-patient">
                      {test.result 
                        ? `${test.result.score}/${test.result.totalQuestions} - ${Math.round((test.result.score / test.result.totalQuestions) * 100)}%`
                        : "Sin completar"
                      }
                    </div>
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
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <p>No hay tests disponibles</p>
              </div>
            )}
          </div>
        </div>

        <div className="alerts-panel">
          <div className="section-header">
            <h3 className="section-title">Resumen</h3>
            <span className="alert-badge">{stats.pendingTests}</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-pending">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.pendingTests}</div>
                <div className="stat-label">Tests Pendientes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-completed">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.completedTests}</div>
                <div className="stat-label">Tests Completados</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-memories">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalMemories}</div>
                <div className="stat-label">Memorias</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-reminders">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.reminders}</div>
                <div className="stat-label">Recordatorios</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
