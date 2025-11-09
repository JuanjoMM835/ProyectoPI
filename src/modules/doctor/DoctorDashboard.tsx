import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard Doctor</h2>
      <p>Accede a las memorias de tus pacientes.</p>

      <Link to="/doctor/gallery"> Galería de pacientes</Link>
    </div>
  );
}
