import { useState } from "react";
import CaregiverUploadMemory from "./UploadMemory";
import CaregiverGallery from "./Gallery";
import "./MemoryManagement.css";

export default function MemoryManagement() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUploadSuccess() {
    // Forzar recarga de la galería
    setRefreshKey(prev => prev + 1);
  }

  return (
    <div className="memory-management-page">
      <div className="page-header">
        <h1>Gestión de Fotos para el Test</h1>
        <p className="page-description">
          Sube y administra las fotos que el paciente usará para el test de memoria
        </p>
      </div>

      <CaregiverUploadMemory onUpload={handleUploadSuccess} />
      
      <div className="divider"></div>
      
      <CaregiverGallery key={refreshKey} />
    </div>
  );
}
