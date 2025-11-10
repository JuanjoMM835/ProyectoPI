import { useState } from "react";
import { updateUserName, uploadProfilePhoto } from "../../api/userService";
import { useAuth } from "../../auth/useAuth";
import "./Profile.css";

export default function CaregiverProfile() {
  const { user, name, photoURL, setUser } = useAuth();
  const [newName, setNewName] = useState(name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) return <p>Cargando usuario...</p>;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const url = await uploadProfilePhoto(user.uid, file);

      // ✅ Actualiza el contexto
      setUser(prev =>
        prev ? { ...prev, photoURL: url } : prev
      );

      setMessage("✅ Foto actualizada");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al subir la foto");
    }
    setSaving(false);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);

    try {
      await updateUserName(user.uid, newName.trim());

      // ✅ Actualiza el contexto
      setUser(prev =>
        prev ? { ...prev, name: newName.trim() } : prev
      );

      setMessage("✅ Nombre actualizado");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al actualizar el nombre");
    }
    setSaving(false);
  };

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>

      <div className="photo-section">
        <img
          src={photoURL || "https://via.placeholder.com/120"}
          alt="Profile"
          className="profile-photo"
        />
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      <label>Nombre</label>
      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />

      <button onClick={handleSaveName} disabled={saving}>
        {saving ? "Guardando..." : "Guardar Cambios"}
      </button>

      {message && <p className="msg">{message}</p>}
    </div>
  );
}