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
      <div className="register-container">
        <img src={logoImage} alt="DoRemember Logo" className="register-logo" />
        <h2 className="register-title">DoURemember</h2>
        <p className="register-subtitle">Únete a DoRemember para comenzar</p>
        
        {error && <p className="register-error">{error}</p>}

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
            Registrarme
          </button>
        </form>

        <p className="register-login">
          ¿Ya tienes cuenta?{" "}
          <span onClick={() => navigate("/login")}>
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}
