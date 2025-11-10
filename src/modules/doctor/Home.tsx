import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./Home.css";

export default function DoctorHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="doctor-home">
      <h2 className="title">¡Hola, Dr. {user?.name || "Doctor"}! 👨‍⚕️</h2>

      <p className="subtitle">¿Qué te gustaría hacer hoy?</p>

      <div className="options">
        <button onClick={() => navigate("/doctor/gallery")} className="btn">
          🖼️ Galería de Pacientes
        </button>

        <button onClick={() => navigate("/doctor/patients")} className="btn">
          👥 Mis Pacientes
        </button>

        <button onClick={() => navigate("/doctor/statistics")} className="btn">
          📊 Estadísticas
        </button>

        <button onClick={() => navigate("/doctor/profile")} className="btn">
          👤 Mi Perfil
        </button>
      </div>

      <button onClick={logout} className="logout-btn btn">
        Cerrar Sesión
      </button>
    </div>
  );
}
