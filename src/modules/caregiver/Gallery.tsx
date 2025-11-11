import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { deleteMemory, updateMemory, getMemoriesByCaregiver } from "../../api/memoryService";
import type { Memory } from "../../api/memoryService";
import "./Gallery.css";

export default function CaregiverGallery() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPatientsAndMemories();
    }
  }, [user]);

  async function loadPatientsAndMemories() {
    if (!user) return;
    setLoading(true);
    try {
      console.log("🔍 Cargando fotos del cuidador:", user.uid);
      // Obtener solo las memorias subidas por este cuidador
      const caregiverMemories = await getMemoriesByCaregiver(user.uid);
      console.log("📸 Fotos encontradas:", caregiverMemories.length);
      console.log("📸 Datos de las fotos:", caregiverMemories);
      
      setMemories(caregiverMemories);
    } catch (err: any) {
      console.error("❌ Error al cargar fotos:", err);
      console.error("❌ Código de error:", err.code);
      console.error("❌ Mensaje:", err.message);
      alert("Error al cargar las fotos. Verifica las reglas de Firestore.");
    }
    setLoading(false);
  }

  async function loadMemories() {
    await loadPatientsAndMemories();
  }

  async function handleDelete(memory: Memory) {
    if (!confirm("¿Estás seguro de eliminar esta foto?")) return;
    
    try {
      await deleteMemory(memory.id!, memory.imageUrl);
      setMemories(memories.filter(m => m.id !== memory.id));
      alert("✅ Foto eliminada correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al eliminar la foto");
    }
  }

  function handleEdit(memory: Memory) {
    setEditingId(memory.id!);
    setEditDescription(memory.description);
    setEditFile(null);
    setEditPreview(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditDescription("");
    setEditFile(null);
    setEditPreview(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setEditFile(file);
      setEditPreview(URL.createObjectURL(file));
    }
  }

  async function handleSaveEdit(memoryId: string) {
    if (!editDescription.trim()) {
      alert("❌ La descripción es obligatoria");
      return;
    }

    setSaving(true);
    try {
      await updateMemory(memoryId, editDescription, editFile || undefined, user?.uid);
      await loadMemories();
      handleCancelEdit();
      alert("✅ Foto actualizada correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar la foto");
    }
    setSaving(false);
  }

  if (loading) return <p className="loading">Cargando fotos...</p>;

  return (
    <div className="caregiver-gallery-container">
      <h2>Galería de Fotos del Paciente</h2>
      <p className="gallery-subtitle">Gestiona las fotos para el test del paciente</p>

      {memories.length === 0 ? (
        <p className="no-memories">No hay fotos subidas aún.</p>
      ) : (
        <div className="memories-grid">
          {memories.map((memory) => (
            <div key={memory.id} className="memory-card">
              {editingId === memory.id ? (
                // Modo edición
                <div className="edit-mode">
                  <div className="image-edit-section">
                    <img 
                      src={editPreview || memory.imageUrl} 
                      alt="Foto" 
                      className="memory-image"
                    />
                    <label className="change-image-btn">
                      Cambiar Imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  <label className="edit-label">Descripción *</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Escribe la descripción de la foto"
                    className="edit-textarea"
                    rows={4}
                  />

                  <div className="edit-actions">
                    <button 
                      onClick={() => handleSaveEdit(memory.id!)} 
                      disabled={saving}
                      className="btn-save"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      disabled={saving}
                      className="btn-cancel"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <>
                  <img src={memory.imageUrl} alt="Foto" className="memory-image" />
                  <div className="memory-info">
                    <p className="memory-description">
                      <strong>Descripción:</strong> {memory.description || "Sin descripción"}
                    </p>
                    <p className="memory-date">
                      {memory.createdAt?.toDate().toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div className="memory-actions">
                    <button 
                      onClick={() => handleEdit(memory)} 
                      className="btn-edit"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(memory)} 
                      className="btn-delete"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
