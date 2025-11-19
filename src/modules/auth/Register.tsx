import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Role } from "../../api/authService";
import { useAuth } from "../../auth/useAuth";
import logoImage from "../../assets/brain-logo.png";
import "./Register.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register(email, password, name, role);
      navigate("/login");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al registrarse. Intenta nuevamente.";

      setError(msg);
    }
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">
        {/* Sección Izquierda - Bienvenida e Información */}
        <div className="register-info-section">
          <div className="register-brand">
            <img src={logoImage} alt="DoRemember Logo" className="brand-logo" />
            <h1 className="brand-name">DoURemember</h1>
          </div>

          <div className="welcome-content">
            <div className="welcome-badge">
              <span className="badge-dot"></span>
              Sistema de Gestión de Memoria
            </div>
            <h2 className="welcome-title">
              Comienza tu Viaje<br />
              <span className="highlight">con Nosotros</span>
            </h2>
            <p className="welcome-description">
              Únete a nuestra plataforma integral para el apoyo y gestión de pacientes con Alzheimer
            </p>
            <div className="features">
              <span className="feature-item">Seguro</span>
              <span className="feature-dot">•</span>
              <span className="feature-item">Confiable</span>
              <span className="feature-dot">•</span>
              <span className="feature-item">Fácil de usar</span>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon info-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Registro Seguro</h3>
                <p className="info-text">Tus datos están protegidos con los más altos estándares</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon info-icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Acceso Inmediato</h3>
                <p className="info-text">Comienza a usar todas las funciones en minutos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Derecha - Formulario de Registro */}
        <div className="register-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Crear Cuenta Nueva</h2>
              <p className="form-subtitle">Completa los datos para registrarte</p>
            </div>

            {error && (
              <div className="register-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-form-group">
                <label className="register-label">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="register-input"
                />
              </div>

              <div className="register-form-group">
                <label className="register-label">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="register-input"
                />
              </div>

              <div className="register-form-group">
                <label className="register-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="register-input"
                />
              </div>

              <div className="register-form-group">
                <label className="register-label">Selecciona tu Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="register-select"
                >
                  <option value="patient">Paciente</option>
                  <option value="doctor">Doctor</option>
                  <option value="caregiver">Cuidador</option>
                </select>
              </div>

              <button type="submit" className="register-btn">
                <span>REGISTRARME</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </button>
            </form>

            <div className="form-footer">
              <p className="register-login">
                ¿Ya tienes cuenta?{" "}
                <span onClick={() => navigate("/login")}>Inicia sesión</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
