import { useEffect, useState } from "react";
import { getMemories, updateMemoryDescription } from "../../api/memoryService";
import { useAuth } from "../../auth/useAuth";
import type { Memory } from "../../types/Memory";
import "./Gallery.css";

export default function Gallery() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    getMemories(user.uid, "patient").then(setMemories);
  }, [user]);

  const saveDescription = async () => {
    if (!selected) return;

    await updateMemoryDescription(selected.id!, description);
    setSelected(null);
    setDescription("");
    getMemories(user!.uid, "patient").then(setMemories);
  };

  return (
    <div className="gallery-container">
      <h2 className="title">Mis Recuerdos</h2>

      <div className="grid">
        {memories.map((m) => (
          <img
            key={m.id}
            src={m.imageUrl}
            alt="Memory"
            className="memory-img"
            onClick={() => setSelected(m)}
          />
        ))}
      </div>

      {selected && (
        <div className="modal">
          <img src={selected.imageUrl} className="modal-img" />

          <textarea
            className="description-input"
            placeholder="Describe este recuerdo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button onClick={saveDescription} className="btn">Guardar</button>
          <button onClick={() => setSelected(null)} className="btn cancel">Cerrar</button>
        </div>
      )}
    </div>
  );
}
