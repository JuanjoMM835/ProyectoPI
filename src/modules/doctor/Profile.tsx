import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "./Profile.css";

interface DoctorProfile {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  specialty: string;
  licenseNumber: string;
}

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    specialty: "",
    licenseNumber: "",
  });
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.uid) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          specialty: data.specialty || "",
          licenseNumber: data.licenseNumber || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name: profile.name,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        specialty: profile.specialty,
        licenseNumber: profile.licenseNumber,
      });
      setIsEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar el perfil");
    }
  };

  const handleChange = (field: keyof DoctorProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const getInitials = () => {
    return `${profile.name.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "DG";
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Mi Perfil</h1>
        <p className="profile-subtitle">Administra tu información personal y profesional</p>
      </div>

      <div className="profile-content">
        {/* Foto de Perfil */}
        <div className="profile-photo-card">
          <h3 className="card-title">Foto de Perfil</h3>
          <div className="photo-section">
            <div className="profile-avatar-large">
              <span className="avatar-initials">{getInitials()}</span>
              <button className="change-photo-btn">
                <span className="camera-icon">📷</span>
              </button>
            </div>
            <div className="photo-info">
              <h4 className="doctor-name">
                Dr. {profile.name} {profile.lastName}
              </h4>
              <p className="doctor-specialty">Especialista en {profile.specialty || "Medicina General"}</p>
            </div>
          </div>
          <button className="btn-secondary">Cambiar Foto</button>
        </div>

        {/* Información Personal */}
        <div className="profile-info-card">
          <div className="card-header">
            <h3 className="card-title">Información Personal</h3>
          </div>
          <p className="card-subtitle">Actualiza tu información personal y de contacto</p>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-input"
                value={profile.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  className="form-input with-icon"
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <div className="input-with-icon">
                <span className="input-icon">📞</span>
                <input
                  type="tel"
                  className="form-input with-icon"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Dirección</label>
              <div className="input-with-icon">
                <span className="input-icon">📍</span>
                <input
                  type="text"
                  className="form-input with-icon"
                  value={profile.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Especialidad</label>
              <div className="input-with-icon">
                <span className="input-icon">🏥</span>
                <input
                  type="text"
                  className="form-input with-icon"
                  value={profile.specialty}
                  onChange={(e) => handleChange("specialty", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Colegiado</label>
              <input
                type="text"
                className="form-input"
                value={profile.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSave}>
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
