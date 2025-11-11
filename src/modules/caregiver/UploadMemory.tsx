import React, { useState, useEffect } from "react";
import { uploadMemory } from "../../api/memoryService";
import { useAuth } from "../../auth/useAuth";
import { getPatientsForCaregiver, type PatientProfile } from "../../api/familyService";
import "./UploadMemory.css";

type Props = {
  onUpload?: () => void;
};

export default function CaregiverUploadMemory({ onUpload }: Props) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  async function loadPatients() {
    if (!user) return;
    try {
      const data = await getPatientsForCaregiver(user.uid);
      setPatients(data);
      if (data.length > 0) {
        setSelectedPatientId(data[0].uid); // Seleccionar el primer paciente por defecto
      }
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
    }
  }

  function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    
    if (!file) {
      setMessage("❌ Selecciona una imagen");
      return;
    }

    if (!description.trim()) {
      setMessage("❌ La descripción es obligatoria para el test del paciente");
      return;
    }

    if (!selectedPatientId) {
      setMessage("❌ Selecciona un paciente");
      return;
    }

    if (!user) {
      setMessage("❌ Debes estar logueado");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Guardar con el userId del PACIENTE, no del cuidador
      // El 4to parámetro es "caregiver" (takenBy)
      // El 5to parámetro es el ID del cuidador (uploadedById)
      await uploadMemory(file, selectedPatientId, description, "caregiver", user.uid);
      setFile(null);
      setDescription("");
      setPreview(null);
      setMessage("✅ Foto subida correctamente!");
      if (onUpload) onUpload();
    } catch (err) {
      console.error("upload error:", err);
      setMessage("❌ Error al subir la foto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-memory-container">
      <h3 className="upload-title">Subir Nueva Foto</h3>
      <p className="upload-subtitle">Las fotos se usarán para el test del paciente</p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        {/* Selector de paciente */}
        <div className="form-group">
          <label className="form-label">
            Seleccionar Paciente <span className="required">*</span>
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="patient-select"
            disabled={patients.length === 0}
          >
            {patients.length === 0 ? (
              <option value="">No hay pacientes asignados</option>
            ) : (
              patients.map((patient) => (
                <option key={patient.uid} value={patient.uid}>
                  {patient.name}
                </option>
              ))
            )}
          </select>
        </div>

        <label className="image-upload-area">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleSelectFile}
          />
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="preview" className="preview-image" />
              <div className="preview-overlay">
                <p>Clic para cambiar imagen</p>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📸</div>
              <p className="upload-text">Arrastra o haz clic para seleccionar una imagen</p>
            </div>
          )}
        </label>

        <div className="form-group">
          <label className="form-label">
            Descripción de la foto <span className="required">*</span>
          </label>
          <textarea
            placeholder="Describe esta foto para que el paciente pueda identificarla en el test (ej: 'Mamá en la cocina preparando galletas')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="description-textarea"
            rows={4}
          />
          <p className="help-text">
            Esta descripción se usará en el test de memoria del paciente
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading || !file} 
          className="submit-button"
        >
          {loading ? "Subiendo..." : "Subir Foto"}
        </button>
      </form>

      {message && (
        <p className={`message ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
