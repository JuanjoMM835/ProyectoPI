 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import logoImage from "../../assets/brain-logo.png";
import "./login.css"; // Esto ya está bien

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { role } = await login(email, password);

      switch (role) {
        case "patient":
          navigate("/patient/home");
          break;
        case "doctor":
          navigate("/doctor/home");
          break;
        case "caregiver":
          navigate("/caregiver/home");
          break;
        default:
          navigate("/home");
      }

    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Sección Izquierda - Bienvenida e Información */}
        <div className="login-info-section">
          <div className="login-brand">
            <img src={logoImage} alt="DoRemember Logo" className="brand-logo" />
            <h1 className="brand-name">DoURemember</h1>
          </div>

          <div className="welcome-content">
            <div className="welcome-badge">
              <span className="badge-dot"></span>
              Sistema de Gestión de Memoria
            </div>
            <h2 className="welcome-title">
              Plataforma Digital<br />
              <span className="highlight">DoURemember</span>
            </h2>
            <p className="welcome-description">
              Plataforma integral para el apoyo y gestión de pacientes con Alzheimer
            </p>
            <div className="features">
              <span className="feature-item">Eficiente</span>
              <span className="feature-dot">•</span>
              <span className="feature-item">Transparan</span>
              <span className="feature-dot">•</span>
              <span className="feature-item">Terpercaya</span>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon info-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Quiénes Somos</h3>
                <p className="info-text">Sistema especializado en apoyo a pacientes, cuidadores y médicos</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon info-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Qué Hacemos</h3>
                <p className="info-text">Facilitamos el seguimiento médico y preservación de memorias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Derecha - Formulario de Login */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Bienvenido de Nuevo</h2>
              <p className="form-subtitle">Ingresa tus credenciales para continuar</p>
            </div>

            {error && (
              <div className="login-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label className="login-label">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
              </div>

              <div className="login-form-group">
                <label className="login-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                />
              </div>

              <button type="submit" className="login-btn">
                <span>ENTRAR</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>

            <div className="form-footer">
              <p className="login-register">
                ¿No tienes cuenta?{" "}
                <span onClick={() => navigate("/register")}>Regístrate</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}