import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";
import PatientProfile from "../modules/patient/Profile";
import CaregiverProfile from "../modules/caregiver/Profile";
import CaregiverMemoryManagement from "../modules/caregiver/MemoryManagement";
import CaregiverFamily from "../modules/caregiver/Family";
import Reminders from "../modules/patient/reminders";

import ProtectedRoute from "../auth/ProtectedRoute";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../auth/useAuth";

import CaregiverHome from "../modules/caregiver/Home";
import DoctorGallery from "../modules/doctor/DoctorGallery";
import PatientHome from "../modules/patient/Home";

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
  <Route path="/" element={<RoleBasedRedirect />} />

  {}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
 

  {}
  <Route path="/patient/*" element={
    <ProtectedRoute role="patient">
      <MainLayout />
    </ProtectedRoute>
  }>
    <Route path="home" element={<PatientHome />} />
    <Route path="reminders" element={<Reminders />} />
    <Route path="profile" element={<PatientProfile />} />
  </Route>

  {}
  <Route path="/doctor/*" element={
    <ProtectedRoute role="doctor">
      <MainLayout />
    </ProtectedRoute>
  }>
    <Route path="gallery" element={<DoctorGallery />} />
  </Route>

  {}
  <Route path="/caregiver/*" element={
    <ProtectedRoute role="caregiver">
      <MainLayout />
    </ProtectedRoute>
  }>
    <Route path="home" element={<CaregiverHome />} />
    <Route path="profile" element={<CaregiverProfile />} />
    <Route path="gallery" element={<CaregiverMemoryManagement />} />
    <Route path="family" element={<CaregiverFamily />} />
  </Route>

  <Route path="*" element={<h2>404 - Página no encontrada</h2>} />

</Routes>

    </BrowserRouter>
  );
}
