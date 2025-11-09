import { Link } from "react-router-dom";

export default function PatientDashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard Paciente</h2>
      <p>Bienvenido  Aquí puedes gestionar tus recuerdos.</p>

      <Link to="/patient/gallery">📸 Ver mis recuerdos</Link>
    </div>
  );
}
