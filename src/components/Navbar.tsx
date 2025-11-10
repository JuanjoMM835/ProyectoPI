import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "10px",
        background: "#222",
        color: "#fff",
      }}
    >
      {role === "patient" && (
        <Link to="/patient/home" style={{ color: "#fff" }}>
          Inicio
        </Link>
      )}

      {role === "doctor" && (
        <Link to="/doctor/home" style={{ color: "#fff" }}>
          Inicio
        </Link>
      )}

      {role === "caregiver" && (
        <Link to="/caregiver/home" style={{ color: "#fff" }}>
          Inicio
        </Link>
      )}

      {role === "patient" && (
        <Link to="/patient/gallery" style={{ color: "#fff" }}>
          Mis recuerdos
        </Link>
      )}

      {role === "doctor" && (
        <Link to="/doctor/gallery" style={{ color: "#fff" }}>
          Pacientes
        </Link>
      )}

      {user ? (
        <button
          style={{ marginLeft: "auto", background: "none", color: "white" }}
          onClick={logout}
        >
          Cerrar sesión
        </button>
      ) : (
        <Link to="/login" style={{ marginLeft: "auto", color: "#fff" }}>
          Login
        </Link>
      )}
    </nav>
  );
}
