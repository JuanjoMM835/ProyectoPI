import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";

import ProtectedRoute from "../auth/ProtectedRoute";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../auth/useAuth";

// Paciente
import PatientHome from "../modules/patient/Home";
import PatientProfile from "../modules/patient/Profile";
import Reminders from "../modules/patient/reminders";
import Test from "../modules/patient/Test";
import TakeTest from "../modules/patient/TakeTest";

// Cuidador
import CaregiverHome from "../modules/caregiver/Home";
import CaregiverProfile from "../modules/caregiver/Profile";
import CaregiverMemoryManagement from "../modules/caregiver/MemoryManagement";
import CaregiverFamily from "../modules/caregiver/Family";
import GenerateTest from "../modules/caregiver/GenerateTest";

// Médico
import DoctorHome from "../modules/doctor/Home";
import DoctorPatients from "../modules/doctor/DoctorPatients";
import DoctorGenerateTest from "../modules/doctor/GenerateTest";
import DoctorPatientTests from "../modules/doctor/PatientTests";
import DoctorTestDetails from "../modules/doctor/TestDetails";

function RoleBasedRedirect() {
  const { role } = useAuth();
  
  if (role === "patient") return <Navigate to="/patient/home" replace />;
  if (role === "caregiver") return <Navigate to="/caregiver/home" replace />;
  if (role === "doctor") return <Navigate to="/doctor/home" replace />;
  
  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Paciente */}
        <Route path="/patient/*" element={
          <ProtectedRoute role="patient">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="home" element={<PatientHome />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="test" element={<Test />} />
          <Route path="test/:testId" element={<TakeTest />} />
        </Route>

        {/* Rutas Médico */}
        <Route path="/doctor/*" element={
          <ProtectedRoute role="doctor">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="home" element={<DoctorHome />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="generate-test/:patientId" element={<DoctorGenerateTest />} />
          <Route path="patient-tests/:patientId" element={<DoctorPatientTests />} />
          <Route path="test-details/:testId" element={<DoctorTestDetails />} />
        </Route>

        {/* Rutas Cuidador */}
        <Route path="/caregiver/*" element={
          <ProtectedRoute role="caregiver">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="home" element={<CaregiverHome />} />
          <Route path="profile" element={<CaregiverProfile />} />
          <Route path="gallery" element={<CaregiverMemoryManagement />} />
          <Route path="family" element={<CaregiverFamily />} />
          <Route path="generate-test/:patientId" element={<GenerateTest />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />

      </Routes>
    </BrowserRouter>
  );
}
