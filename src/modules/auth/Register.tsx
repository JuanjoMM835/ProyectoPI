import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Role } from "../../api/authService";
import { useAuth } from "../../auth/useAuth";

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
    <div style={{ maxWidth: 350, margin: "40px auto" }}>
      <h2>Registro</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <label>Rol</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        >
          <option value="patient">Paciente</option>
          <option value="doctor">Doctor</option>
          <option value="caregiver">Cuidador</option>
        </select>

        <button type="submit" style={{ width: "100%" }}>
          Registrarme
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        ¿Ya tienes cuenta?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Inicia sesión
        </span>
      </p>
    </div>
  );
}
