 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
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
   
    <div className="login-container">
      {}
      <h2 className="login-title">Iniciar Sesión</h2>
      
      {}
      {error && <p className="login-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
         
          className="login-input"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
         
          className="login-input"
        />

        {}
        <button type="submit" className="login-btn">Entrar</button>
      </form>

      {}
      <p className="login-register">
        ¿No tienes cuenta?{" "}
        {}
        <span onClick={() => navigate("/register")}> 
          Regístrate
        </span>
      </p>
    </div>
  );
}