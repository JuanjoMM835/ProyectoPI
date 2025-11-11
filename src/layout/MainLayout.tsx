import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./MainLayout.css";

export default function MainLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const patientMenuItems = [
    { path: "/patient/home", icon: "🏠", label: "Inicio", color: "#6B9BD1" },
    { path: "/patient/reminders", icon: "⏰", label: "Recordatorios", color: "#F4A261" },
    { path: "/patient/profile", icon: "👤", label: "Perfil", color: "#52B788" },
    { path: "/patient/test", icon: "🧠", label: "Test", color: "#E76F51" },
  ];

  const caregiverMenuItems = [
    { path: "/caregiver/home", icon: "📌", label: "Inicio", color: "#6B9BD1" },
    { path: "/caregiver/patients", icon: "👥", label: "Pacientes", color: "#52B788" },
    { path: "/caregiver/reminders", icon: "🔔", label: "Recordatorios", color: "#F4A261" },
    { path: "/caregiver/reports", icon: "📈", label: "Reportes", color: "#E76F51" },
  ];

  const doctorMenuItems = [
    { path: "/doctor/gallery", icon: "📊", label: "Reportes", color: "#6B9BD1" },
    { path: "/doctor/patients", icon: "🏥", label: "Pacientes", color: "#52B788" },
    { path: "/doctor/analysis", icon: "🔬", label: "Análisis", color: "#F4A261" },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case "patient": return patientMenuItems;
      case "caregiver": return caregiverMenuItems;
      case "doctor": return doctorMenuItems;
      default: return [];
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "patient": return "Paciente";
      case "caregiver": return "Cuidador";
      case "doctor": return "Doctor";
      default: return "Usuario";
    }
  };

  return (
    <div className="layout-container">
      {/* Topbar con información del usuario */}
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="app-title">
            <span className="app-icon">🧠</span>
            <span className="app-name">DoRemember</span>
          </h1>
        </div>
        
        <div className="topbar-center">
          <div className="current-time">
            <span className="time-icon">🕐</span>
            <span className="time-text">
              {currentTime.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="user-info">
            <span className="greeting">{getGreeting()},</span>
            <span className="user-name">{user?.name || "Usuario"}</span>
            <span className="user-badge">{getRoleLabel()}</span>
          </div>
          <div className="user-avatar">
            {user?.role === "patient" && "👤"}
            {user?.role === "caregiver" && "👨‍⚕️"}
            {user?.role === "doctor" && "👨‍⚕️"}
          </div>
        </div>
      </header>

      {/* Sidebar mejorado */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">💙</span>
            <h2 className="logo-text">DoRemember</h2>
          </div>
          <p className="logo-subtitle">Cuidado con amor</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {getMenuItems().map((item) => (
              <li 
                key={item.path}
                className={`menu-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                style={{ "--item-color": item.color } as React.CSSProperties}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {isActive(item.path) && <span className="active-indicator"></span>}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <div className="stat-info">
                <span className="stat-label">Hoy</span>
                <span className="stat-value">
                  {currentTime.toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
              </div>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido dinámico */}
      <main className="content">
        <div className="content-wrapper">
          <Outlet />
        </div>
        
        {/* Footer decorativo */}
        <footer className="content-footer">
          <p className="footer-text">
            <span className="footer-heart">💙</span>
            Hecho con amor para personas especiales
          </p>
        </footer>
      </main>

      {/* Decoración de fondo */}
      <div className="background-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
}