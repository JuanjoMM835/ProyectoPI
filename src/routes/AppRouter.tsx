import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";
import Profile from "../modules/patient/Profile";
import Reminders from "../modules/patient/reminders";

import ProtectedRoute from "../auth/ProtectedRoute";
import MainLayout from "../layout/MainLayout";

import CaregiverHome from "../modules/caregiver/Home";
import DoctorGallery from "../modules/doctor/DoctorGallery";
import PatientHome from "../modules/patient/Home";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Navigate to="/patient/home" replace />} />

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
  </Route>

  <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
  <Route path="/patient/reminders" element={<Reminders />} />
<Route path="/patient/profile" element={<Profile />} />

</Routes>

    </BrowserRouter>
  );
}
