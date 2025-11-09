import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function VerifyEmailNotice() {
  const { logout } = useAuth();

  return (
    <div>
      <h2>Revisa tu correo </h2>
      <p>Debes verificar tu cuenta antes de usar la aplicación.</p>

      <Link to="/login" onClick={() => logout()}>
        Regresar al login
      </Link>
    </div>
  );
}
