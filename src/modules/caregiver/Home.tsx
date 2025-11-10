// CaregiverHome.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./Home.css";

export default function CaregiverHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="caregiver-home">
      <header className="ch-header">
        <div>
          <h1 className="ch-title">Hola, {user?.name || "Cuidador/a"} 👋</h1>
          <p className="ch-sub">Bienvenido — accede rápido a las funciones para tu familia</p>
        </div>
      </header>

      <nav className="ch-grid" aria-label="Acciones principales">
        <button
          className="ch-card"
          onClick={() => navigate("/caregiver/gallery")}
          aria-label="Ver fotos"
        >
          <div className="ch-icon">🖼️</div>
          <div className="ch-text">
            <h2>Ver Fotos</h2>
            <p>Galería de imágenes de pacientes y actividades</p>
          </div>
        </button>

        <button
          className="ch-card"
          onClick={() => navigate("/caregiver/family")}
          aria-label="Mi familia"
        >
          <div className="ch-icon">👪</div>
          <div className="ch-text">
            <h2>Mi Familia</h2>
            <p>Gestiona miembros, contactos y notas importantes</p>
          </div>
        </button>

        <button
          className="ch-card"
          onClick={() => navigate("/caregiver/profile")}
          aria-label="Mi perfil"
        >
          <div className="ch-icon">👤</div>
          <div className="ch-text">
            <h2>Mi Perfil</h2>
            <p>Ver y editar tu información y preferencias</p>
          </div>
        </button>

        <button className="ch-card ch-logout" onClick={logout} aria-label="Cerrar sesión">
          <div className="ch-icon">🔒</div>
          <div className="ch-text">
            <h2>Cerrar Sesión</h2>
            <p>Salir de la cuenta de cuidador</p>
          </div>
        </button>
      </nav>

      <footer className="ch-foot">© {new Date().getFullYear()} — Atención a cuidadores</footer>
    </main>
  );
}