import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";


export default function PatientHome() {
  const {  user , name , logout } = useAuth();
  const navigate = useNavigate();
  

  return (
    <div className="patient-home">
      <h2 className="title">¡Hola, {name || "Paciente"}! 👋</h2>

      <p className="subtitle">¿Qué te gustaría hacer hoy?</p>

      <div className="options">
        <button onClick={() => navigate("/patient/gallery")} className="btn">
          🖼 Ver Fotos
        </button>

        <button onClick={() => navigate("/patient/reminders")} className="btn">
          ⏰ Recordatorios
        </button>

        <button onClick={() => navigate("/patient/profile")} className="btn">
          👤 Mi Perfil
        </button>
      </div>

      <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
    </div>
  );
}
