import { useState } from "react";
import { createInvitation } from "../api/invitationService.ts";
import { useAuth } from "../auth/useAuth.ts";
import "./InviteCaregiverModal.css";

interface InviteCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export default function InviteCaregiverModal({
  isOpen,
  onClose,
  patientId,
  patientName,
}: InviteCaregiverModalProps) {
  const { user, name } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user?.uid || !name) {
        throw new Error("No se pudo obtener la información del doctor");
      }

      await createInvitation(
        user.uid,
        name,
        patientId,
        patientName,
        email
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al enviar la invitación");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Invitar Cuidador</h2>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="invite-info">
            <div className="info-item">
              <span className="info-label">Paciente:</span>
              <span className="info-value">{patientName}</span>
            </div>
            <p className="invite-description">
              Se enviará un correo de invitación al cuidador con un enlace para
              registrarse y quedar asociado a este paciente.
            </p>
          </div>

          {success ? (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <p>¡Invitación enviada exitosamente!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="invite-form">
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Correo Electrónico del Cuidador
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar Invitación"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
