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
          navigate("/");
      }

    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logoImage} alt="DoRemember Logo" className="login-logo" />
        <h2 className="login-title">DoURemember</h2>
        <p className="login-subtitle">Sistema de apoyo para pacientes con Alzheimer</p>
        
        {error && <p className="login-error">{error}</p>}

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

          <button type="submit" className="login-btn">Entrar</button>
        </form>

        <p className="login-register">
          ¿No tienes cuenta?{" "}
          <span onClick={() => navigate("/register")}> 
            Regístrate
          </span>
        </p>
      </div>
    </div>
  );
}