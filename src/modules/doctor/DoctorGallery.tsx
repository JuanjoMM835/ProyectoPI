import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMemories } from "../../api/memoryService";
import { useAuth } from "../../auth/useAuth";
import MemoryCard from "../../components/MemoryCard";
import type { Memory } from "../../types/Memory";
import "./DoctorGallery.css";

export default function DoctorGallery() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    if (!user || !role) return;
    getMemories(user.uid, role).then((res) => setMemories(res));
  }, [user, role]);

  return (
    <div className="doctor-gallery">
      <div className="doctor-gallery-header">
        <h2 className="doctor-gallery-title">🖼️ Galería de Pacientes</h2>
        <div className="doctor-gallery-actions">
          <button onClick={() => navigate("/doctor/home")} className="back-btn">
            ← Volver al Inicio
          </button>
          <button onClick={() => logout()} className="logout-gallery-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {memories.length === 0 ? (
        <div className="no-memories">
          <p>No hay memorias de pacientes disponibles.</p>
        </div>
      ) : (
        <div className="memories-grid">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
        </div>
      )}
    </div>
  );
}
