import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import logoImage from "../assets/brain-logo.png";
import "./MainLayout.css";

export default function MainLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const patientMenuItems = [
    { path: "/patient/home", icon: "📊", label: "Dashboard" },
    { path: "/patient/tests", icon: "📋", label: "Tests" },
    { path: "/patient/reminders", icon: "⏰", label: "Recordatorios" },
    { path: "/patient/profile", icon: "👤", label: "Perfil" },
  ];

  const caregiverMenuItems = [
    { path: "/caregiver/home", icon: "📊", label: "Dashboard" },
    { path: "/caregiver/family", icon: "👥", label: "Familia" },
    { path: "/caregiver/gallery", icon: "🖼️", label: "Galería" },
    { path: "/caregiver/upload-memory", icon: "📸", label: "Subir Recuerdo" },
    { path: "/caregiver/profile", icon: "👤", label: "Perfil" },
  ];

  const doctorMenuItems = [
    { path: "/doctor/home", icon: "📊", label: "Dashboard" },
    { path: "/doctor/patients", icon: "👥", label: "Mis Pacientes" },
    { path: "/doctor/reports", icon: "📈", label: "Reportes" },
    { path: "/doctor/invite-caregiver", icon: "✉️", label: "Invitar Cuidador" },
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
      case "doctor": return "Médico";
      default: return "Usuario";
    }
  };

  const getPanelTitle = () => {
    switch (user?.role) {
      case "patient": return "Panel Paciente";
      case "caregiver": return "Panel Cuidador";
      case "doctor": return "Panel Médico";
      default: return "Panel";
    }
  };

  const getSystemSubtitle = () => {
    switch (user?.role) {
      case "patient": return "Sistema de Gestión";
      case "caregiver": return "Sistema de Cuidado";
      case "doctor": return "Sistema Médico";
      default: return "Sistema";
    }
  };

  return (
    <div className="layout-container">
      {/* Sidebar izquierdo */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logoImage} alt="DoRemember" className="sidebar-logo" />
          <div className="sidebar-brand">
            <h2 className="brand-title">DoRemember</h2>
            <p className="brand-subtitle">{getSystemSubtitle()}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {getMenuItems().map((item) => (
              <li 
                key={item.path}
                className={`menu-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <ul className="menu-list">
            <li className="menu-item logout-item" onClick={handleLogout}>
              <span className="menu-icon logout-icon">➜</span>
              <span className="menu-label">Cerrar Sesión</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Top navbar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <h1 className="page-title">{getPanelTitle()}</h1>
          </div>
          
          <div className="navbar-right">
            <div className="user-profile" onClick={() => navigate(`/${user?.role}/profile`)}>
              <div className="user-avatar">
                <span className="avatar-text">
                  {user?.name?.substring(0, 2).toUpperCase() || "U"}
                </span>
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name || "Usuario"}</div>
                <div className="user-role">{getRoleLabel()}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}