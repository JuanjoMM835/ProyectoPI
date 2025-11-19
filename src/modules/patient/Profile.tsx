import { useState, useRef } from "react";
import { updateUserName, uploadProfilePhoto } from "../../api/userService";
import { useAuth } from "../../auth/useAuth";
import "./profile.css";

export default function PatientProfile() {
  const { user, name, photoURL, setUser } = useAuth();
  const [isEditing] = useState(true);
  const [newName, setNewName] = useState(name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMessage("");
    
    try {
      const url = await uploadProfilePhoto(user.uid, file);
      setUser(prev => prev ? { ...prev, photoURL: url } : prev);
      setMessage("✅ Foto actualizada correctamente");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al subir la foto");
    }
    setSaving(false);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setMessage("❌ El nombre no puede estar vacío");
      return;
    }
    
    setSaving(true);
    setMessage("");

    try {
      await updateUserName(user.uid, newName.trim());
      setUser(prev => prev ? { ...prev, name: newName.trim() } : prev);
      setMessage("✅ Perfil actualizado correctamente");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al actualizar el perfil");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setNewName(name || "");
    setMessage("");
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
        <p>Administra tu información personal</p>
      </div>

      <div className="profile-content">
        {/* Columna izquierda - Foto de perfil */}
        <div className="profile-photo-card">
          <h2>Foto de Perfil</h2>
          <div className="photo-section">
            <div className="photo-wrapper">
              <img
                src={photoURL || "https://via.placeholder.com/150"}
                alt="Foto de perfil"
                className="profile-photo-large"
              />
              <button
                className="photo-edit-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <h3 className="profile-name">{name || "Usuario"}</h3>
            <p className="profile-role">Paciente</p>
            <button 
              className="btn-change-photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            >
              Cambiar Foto
            </button>
          </div>
        </div>

        {/* Columna derecha - Información personal */}
        <div className="profile-info-card">
          <h2>Información Personal</h2>
          <p className="info-subtitle">Actualiza tu información personal y de contacto</p>

          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="name">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Nombre
              </label>
              <input
                id="name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ingresa tu nombre"
                disabled={!isEditing || saving}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="form-input"
              />
            </div>

            {message && (
              <div className={`message-box ${message.includes("✅") ? "success" : "error"}`}>
                {message}
              </div>
            )}

            {isEditing && (
              <div className="form-actions">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="btn-save"
                >
                  {saving ? (
                    <>
                      <span className="btn-spinner"></span>
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
