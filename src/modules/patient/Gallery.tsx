import { useEffect, useState } from "react";
import { getMemories, type Memory } from "../../api/memoryService";
import UploadMemory from "../../api/uploadMemory";
import { useAuth } from "../../auth/useAuth";
import MemoryCard from "../../components/MemoryCard";

export default function Gallery() {
  const { user, role } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user || !role) return;
    setLoading(true);
    try {
      
      const data = await getMemories(user.uid, role);
      setMemories(data);
    } catch (err) {
      console.error("Error cargando memorias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    
  }, [user, role]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Subir y ver recuerdos</h2>

      <UploadMemory onUpload={load} />

      {loading ? <p>Cargando...</p> : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {memories.map((m) => (
          <MemoryCard key={m.id} memory={m} />
        ))}
      </div>
    </div>
  );
}
