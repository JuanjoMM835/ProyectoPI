import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Navbar() {
  const { user, role, logout } = useAuth();

  const getHomeLink = () => {
    if (role === "patient") return "/patient/home";
    if (role === "caregiver") return "/caregiver/home";
    if (role === "doctor") return "/doctor/home";
    return "/";
  };

  // Para cuidadores, solo mostrar el botón de Inicio
  if (role === "caregiver") {
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
        <Link to={getHomeLink()} style={{ color: "#fff" }}>Inicio</Link>
      </nav>
    );
  }

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
      <Link to={getHomeLink()} style={{ color: "#fff" }}>Inicio</Link>

      {role === "patient" && (
        <>
          <Link to="/patient/gallery" style={{ color: "#fff" }}>
            Mis recuerdos
          </Link>
          <Link to="/patient/profile" style={{ color: "#fff" }}>
            Perfil
          </Link>
        </>
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
