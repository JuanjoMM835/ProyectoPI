import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";

import ProtectedRoute from "../auth/ProtectedRoute";
import MainLayout from "../layout/MainLayout";

// Paciente
import PatientHome from "../modules/patient/Home";
import Profile from "../modules/patient/Profile";
import Reminders from "../modules/patient/reminders";
import Test from "../modules/patient/Test";

// Cuidador
import CaregiverHome from "../modules/caregiver/Home";

// Médico
import DoctorGallery from "../modules/doctor/DoctorGallery";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Públicos */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Paciente */}
        <Route path="/patient/*" element={
          <ProtectedRoute role="patient">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="home" element={<PatientHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="test" element={<Test />} />
        </Route>

        {/* Rutas Médico */}
        <Route path="/doctor/*" element={
          <ProtectedRoute role="doctor">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="gallery" element={<DoctorGallery />} />
        </Route>

        {/* Rutas Cuidador */}
        <Route path="/caregiver/*" element={
          <ProtectedRoute role="caregiver">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="home" element={<CaregiverHome />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />

      </Routes>
    </BrowserRouter>
  );
}
