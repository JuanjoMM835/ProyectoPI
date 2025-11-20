import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "./Home.css";

interface PatientInfo {
  id: string;
  name: string;
  lastActivity?: any;
}

export default function CaregiverHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalFamily: 0,
    totalMemories: 0,
    recentActivities: 0
  });

  const [patients, setPatients] = useState<PatientInfo[]>([]);

  useEffect(() => {
    loadStatistics();
    loadPatients();
  }, [user]);

  const loadStatistics = async () => {
    if (!user?.uid) return;

    try {
      // Obtener documentos donde el cuidador esté vinculado
      const familyRef = collection(db, "family");
      const familyQuery = query(familyRef, where("caregiverId", "==", user.uid));
      const familySnapshot = await getDocs(familyQuery);
      
      // Contar pacientes únicos vinculados a este cuidador
      const uniquePatients = new Set();
      familySnapshot.docs.forEach(doc => {
        const patientId = doc.data().patientId;
        if (patientId) uniquePatients.add(patientId);
      });

      // Obtener recuerdos subidos por este cuidador
      const memoriesRef = collection(db, "memories");
      const memoriesQuery = query(memoriesRef, where("uploadedBy", "==", user.uid));
      const memoriesSnapshot = await getDocs(memoriesQuery);

      // Contar actividades recientes (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentMemories = memoriesSnapshot.docs.filter(doc => {
        const uploadDate = doc.data().uploadedAt?.toDate();
        return uploadDate && uploadDate >= sevenDaysAgo;
      });

      setStats({
        totalFamily: uniquePatients.size,
        totalMemories: memoriesSnapshot.size,
        recentActivities: recentMemories.length
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
      // Valores por defecto en caso de error
      setStats({
        totalFamily: 0,
        totalMemories: 0,
        recentActivities: 0
      });
    }
  };

  const loadPatients = async () => {
    if (!user?.uid) return;

    try {
      const patientsRef = collection(db, "users");
      const patientsQuery = query(patientsRef, where("role", "==", "patient"));
      const patientsSnapshot = await getDocs(patientsQuery);
      
      const patientsList = patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "Paciente",
        lastActivity: doc.data().lastActivity
      })).slice(0, 3);

      setPatients(patientsList);
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  return (
    <div className="caregiver-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">Panel de Cuidador</h1>
          <p className="dashboard-subtitle">Sistema de Gestión de Pacientes</p>
        </div>
      </div>

      {/* Banner de bienvenida */}
      <div className="welcome-banner">
        <h2 className="welcome-title">¡Bienvenid@ de nuevo, {user?.name || "Cuidador"}!</h2>
        <p className="welcome-text">Aquí está un resumen de tu actividad como cuidador.</p>
      </div>

      {/* Acciones rápidas */}
      <div className="actions-section">
        <h3 className="section-title">Acciones Rápidas</h3>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate("/caregiver/upload-memory")}>
            <div className="action-icon action-blue">
              <span>📸</span>
            </div>
            <div className="action-label">Subir Recuerdo</div>
          </div>

          <div className="action-card" onClick={() => navigate("/caregiver/gallery")}>
            <div className="action-icon action-green">
              <span>🖼️</span>
            </div>
            <div className="action-label">Ver Galería</div>
          </div>

          <div className="action-card" onClick={() => navigate("/caregiver/family")}>
            <div className="action-icon action-purple">
              <span>👪</span>
            </div>
            <div className="action-label">Mi Familia</div>
          </div>
        </div>
      </div>

      {/* Estadísticas y actividades */}
      <div className="bottom-section">
        <div className="stats-panel">
          <div className="section-header">
            <h3 className="section-title">Estadísticas</h3>
          </div>
          <div className="stats-cards">
            <div className="mini-stat-card stat-blue">
              <div className="mini-stat-icon">👥</div>
              <div className="mini-stat-info">
                <div className="mini-stat-value">{stats.totalFamily}</div>
                <div className="mini-stat-label">Familia</div>
              </div>
            </div>

            <div className="mini-stat-card stat-green">
              <div className="mini-stat-icon">📸</div>
              <div className="mini-stat-info">
                <div className="mini-stat-value">{stats.totalMemories}</div>
                <div className="mini-stat-label">Recuerdos</div>
              </div>
            </div>

            <div className="mini-stat-card stat-purple">
              <div className="mini-stat-icon">📊</div>
              <div className="mini-stat-info">
                <div className="mini-stat-value">{stats.recentActivities}</div>
                <div className="mini-stat-label">Actividades</div>
              </div>
            </div>
          </div>
        </div>

        <div className="activity-panel">
          <div className="section-header">
            <h3 className="section-title">Actividad Reciente</h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📸</div>
              <div className="activity-info">
                <div className="activity-text">Recuerdo subido</div>
                <div className="activity-time">Hace 2 horas</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-info">
                <div className="activity-text">Perfil actualizado</div>
                <div className="activity-time">Hace 1 día</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-info">
                <div className="activity-text">Actividad registrada</div>
                <div className="activity-time">Hace 2 días</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}