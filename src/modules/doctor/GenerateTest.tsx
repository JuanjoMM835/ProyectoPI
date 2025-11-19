import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/useAuth";
import "./GenerateTest.css";

interface Patient {
  id: string;
  name: string;
  email: string;
  lastTestDate?: string;
  testsCount?: number;
}

export default function DoctorGenerateTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, statusFilter, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los pacientes
      const usersRef = collection(db, "users");
      const patientsQuery = query(usersRef, where("role", "==", "patient"));
      const patientsSnapshot = await getDocs(patientsQuery);
      
      // Obtener tests para cada paciente
      const testsRef = collection(db, "tests");
      const testsSnapshot = await getDocs(testsRef);
      
      const patientsData: Patient[] = [];
      
      for (const doc of patientsSnapshot.docs) {
        const patientData = doc.data();
        const patientTests = testsSnapshot.docs.filter(
          testDoc => testDoc.data().patientId === doc.id
        );
        
        // Encontrar el último test
        let lastTestDate = undefined;
        if (patientTests.length > 0) {
          const sortedTests = patientTests.sort((a, b) => {
            const dateA = a.data().createdAt?.toDate() || new Date(0);
            const dateB = b.data().createdAt?.toDate() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          const lastTest = sortedTests[0].data();
          if (lastTest.createdAt) {
            lastTestDate = lastTest.createdAt.toDate().toLocaleDateString("es-ES");
          }
        }
        
        patientsData.push({
          id: doc.id,
          name: patientData.name || "Sin nombre",
          email: patientData.email,
          lastTestDate,
          testsCount: patientTests.length
        });
      }
      
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por estado (si implementas estados)
    // Por ahora solo mostramos todos
    
    setFilteredPatients(filtered);
  };

  const handleCreateTest = (patientId: string, patientName: string) => {
    navigate(`/doctor/patients/${patientId}`, {
      state: { patientName }
    });
  };

  if (loading) {
    return (
      <div className="tests-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tests-dashboard-container">
      {/* Header */}
      <div className="tests-header">
        <div className="header-content">
          <h1 className="tests-title">Mis Pacientes</h1>
          <p className="tests-subtitle">Administra y realiza tests a tus pacientes</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar paciente por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="patients-tests-list">
        {filteredPatients.length === 0 ? (
          <div className="no-patients-message">
            <p>No se encontraron pacientes</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="patient-test-card">
              <div className="patient-test-info">
                <div className="patient-icon">👤</div>
                <div className="patient-details">
                  <h3 className="patient-name">{patient.name}</h3>
                  <div className="patient-meta">
                    <span className="patient-email">{patient.email}</span>
                    {patient.lastTestDate && (
                      <>
                        <span className="meta-separator">•</span>
                        <span className="last-test">Último test: {patient.lastTestDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="patient-actions">
                <button 
                  className="btn-view-details"
                  onClick={() => navigate(`/doctor/patient-tests/${patient.id}`)}
                >
                  Ver Detalles
                </button>
                <button 
                  className="btn-start-test"
                  onClick={() => handleCreateTest(patient.id, patient.name)}
                >
                  Iniciar Test
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
