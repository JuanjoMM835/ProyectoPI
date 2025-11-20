import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Role } from "../../api/authService";
import { useAuth } from "../../auth/useAuth";
import { validateInvitationToken, acceptInvitation, type Invitation } from "../../api/invitationService";
import logoImage from "../../assets/brain-logo.png";
import "./Register.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);

  // Validar token de invitación al cargar
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      validateInvitation(token);
    }
  }, [searchParams]);

  const validateInvitation = async (token: string) => {
    setLoadingInvitation(true);
    console.log("🔍 [VALIDATE] Starting validation with token:", token);
    console.log("🔍 [VALIDATE] NO USER SHOULD BE CREATED YET");
    try {
      const validInvitation = await validateInvitationToken(token);
      console.log("✅ [VALIDATE] Validation result:", validInvitation);
      if (validInvitation) {
        setInvitation(validInvitation);
        setEmail(validInvitation.invitedEmail);
        setRole("caregiver");
        console.log("✅ [VALIDATE] Invitation valid, email set to:", validInvitation.invitedEmail);
        console.log("✅ [VALIDATE] Role set to: caregiver");
        console.log("✅ [VALIDATE] User will be created ONLY when clicking REGISTRARME button");
      } else {
        console.log("❌ [VALIDATE] Invitation is invalid or expired");
        setError("La invitación es inválida o ha expirado");
      }
    } catch (err) {
      console.error("❌ [VALIDATE] Error validating invitation:", err);
      setError("Error al validar la invitación");
    } finally {
      setLoadingInvitation(false);
      console.log("🏁 [VALIDATE] Validation process completed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Starting registration...");
      const userCredential = await register(email, password, name, role);
      console.log("User registered:", userCredential.user.uid);

      // Si hay invitación, aceptarla
      if (invitation && invitation.id && userCredential.user) {
        console.log("Accepting invitation:", invitation.id, "for caregiver:", userCredential.user.uid);
        await acceptInvitation(invitation.id, userCredential.user.uid);
        console.log("Invitation accepted successfully");
      } else {
        console.log("No invitation to accept");
      }

      navigate("/login");
    } catch (err: any) {
      console.error("Error en registro:", err);
      
      let msg = "Error al registrarse. Intenta nuevamente.";
      
      // Manejar errores específicos de Firebase
      if (err?.code === "auth/email-already-in-use") {
        msg = `El correo ${email} ya está registrado en Firebase Authentication (pero sin datos en Firestore). Ve a Firebase Console → Authentication → Users y elimina este correo, luego intenta de nuevo.`;
      } else if (err?.code === "auth/weak-password") {
        msg = "La contraseña debe tener al menos 6 caracteres.";
      } else if (err?.code === "auth/invalid-email") {
        msg = "El correo electrónico no es válido.";
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
    }
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">
        {/* Sección Izquierda - Bienvenida e Información */}
        <div className="register-info-section">
          <div className="register-brand">
            <img src={logoImage} alt="DoRemember Logo" className="brand-logo" />
            <h1 className="brand-name">DoURemember</h1>
          </div>

          <div className="welcome-content">
            <div className="welcome-badge">
              <span className="badge-dot"></span>
              Sistema de Gestión de Memoria
            </div>
            <h2 className="welcome-title">
              Comienza tu Viaje<br />
              <span className="highlight">con Nosotros</span>
            </h2>
            <p className="welcome-description">
              Únete a nuestra plataforma integral para el apoyo y gestión de pacientes con Alzheimer
            </p>
            <div className="features">
              <span className="feature-item">Seguro</span>
              <span className="feature-dot">•</span>
              <span className="feature-item">Confiable</span>
              <span className="feature-dot">•</span>
              <span className="feature-item">Fácil de usar</span>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon info-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Registro Seguro</h3>
                <p className="info-text">Tus datos están protegidos con los más altos estándares</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon info-icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="info-content">
                <h3 className="info-title">Acceso Inmediato</h3>
                <p className="info-text">Comienza a usar todas las funciones en minutos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Derecha - Formulario de Registro */}
        <div className="register-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">
                {invitation ? "Completar Registro - Cuidador" : "Crear Cuenta Nueva"}
              </h2>
              <p className="form-subtitle">
                {invitation 
                  ? `Dr. ${invitation.doctorName} te ha invitado a cuidar a ${invitation.patientName}`
                  : "Completa los datos para registrarte"
                }
              </p>
            </div>

            {loadingInvitation && (
              <div className="invitation-loading">
                <p>Validando invitación...</p>
              </div>
            )}

            {error && (
              <div className="register-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-form-group">
                <label className="register-label">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="register-input"
                />
              </div>

              <div className="register-form-group">
                <label className="register-label">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  disabled={!!invitation}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="register-input"
                />
              </div>

              <div className="register-form-group">
                <label className="register-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="register-input"
                />
              </div>

              {!invitation && (
                <div className="register-form-group">
                  <label className="register-label">Selecciona tu Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="register-select"
                  >
                    <option value="patient">Paciente</option>
                    <option value="doctor">Doctor</option>
                    <option value="caregiver">Cuidador</option>
                  </select>
                </div>
              )}

              <button type="submit" className="register-btn" disabled={loadingInvitation}>
                <span>REGISTRARME</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </button>
            </form>

            <div className="form-footer">
              <p className="register-login">
                ¿Ya tienes cuenta?{" "}
                <span onClick={() => navigate("/login")}>Inicia sesión</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
