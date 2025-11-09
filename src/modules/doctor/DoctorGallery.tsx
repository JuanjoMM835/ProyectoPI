import { useEffect, useState } from "react";
import { getMemories } from "../../api/memoryService";
import { useAuth } from "../../auth/useAuth";
import MemoryCard from "../../components/MemoryCard";
import type { Memory } from "../../types/Memory";


export default function DoctorGallery() {
  const { user, role, logout } = useAuth();
 const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    if (!user || !role) return;
    getMemories(user.uid, role).then((res) => setMemories(res));
  }, [user, role]);

  return (
    <div>
      <h2>Galería de todos los pacientes</h2>
      <button onClick={() => logout()}>Cerrar sesión</button>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {memories.map((m) => (
          <MemoryCard key={m.id} memory={m} />
        ))}
      </div>
    </div>
  );
}
