import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";


export default function PatientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const getDailyPhrase = () => {
    const phrases = [
      "Cada día es una nueva oportunidad para crear recuerdos hermosos",
      "Tu historia es valiosa, tus recuerdos importan",
      "Juntos cuidamos lo que más amas: tus memorias",
      "Hoy es un buen día para sonreír y recordar momentos felices",
      "Cada recuerdo guardado es un tesoro que permanece",
      "El amor y el cuidado hacen la diferencia cada día"
    ];
    const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000);
    return phrases[dayOfYear % phrases.length];
  };

  // Datos de ejemplo - estos vendrían de tu API
  const upcomingReminders = [
    { id: 1, title: "Tomar medicamento", time: "10:00 AM", icon: "", color: "#F4A261" },
    { id: 2, title: "Almorzar", time: "12:30 PM", icon: "🍽️", color: "#52B788" },
    { id: 3, title: "Llamar a la familia", time: "3:00 PM", icon: "", color: "#6B9BD1" }
  ];

  const quickActions = [
    {
      title: "Mis Fotos",
      description: "Ver álbum de recuerdos",
      icon: "",
      color: "#6B9BD1",
      action: () => navigate("/patient/photos")
    },
    {
      title: "Recordatorios",
      description: "Gestionar tareas del día",
      icon: "",
      color: "#F4A261",
      action: () => navigate("/patient/reminders")
    },
    {
      title: "Test Cognitivo",
      description: "Ejercitar la memoria",
      icon: "",
      color: "#E76F51",
      action: () => navigate("/patient/test")
    },
    {
      title: "Mi Perfil",
      description: "Información personal",
      icon: "👤",
      color: "#52B788",
      action: () => navigate("/patient/profile")
    }
  ];

  return (
    <div className="patient-home">
      {/* Hero Section - Bienvenida */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="greeting-container">
            <h1 className="hero-greeting">
              {getGreeting()}, <span className="hero-name">{user?.name || "Amigo"}</span>
            </h1>
          </div>
          
          <div className="daily-phrase">
            <span className="phrase-icon">💙</span>
            <p className="phrase-text">{getDailyPhrase()}</p>
          </div>
        </div>
        
        <div className="hero-decoration">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
        </div>
      </section>

      {/* About DoRemember */}
      <section className="about-section">
        <div className="about-card">
          <div className="about-header">
            <span className="about-icon">🧠</span>
            <h2 className="about-title">Sobre DoRemember</h2>
          </div>
          
          <div className="about-content">
            <p className="about-text">
              <strong>DoRemember</strong> es tu compañero digital diseñado con amor para ayudarte a preservar 
              tus recuerdos más preciados y mantener tu independencia. Creemos que cada persona merece 
              vivir con dignidad, amor y apoyo.
            </p>
            
            <div className="mission-grid">
              <div className="mission-item">
                <span className="mission-icon">💙</span>
                <div className="mission-text">
                  <h3>Nuestra Misión</h3>
                  <p>Mejorar la calidad de vida de personas con Alzheimer y sus familias</p>
                </div>
              </div>
              
              <div className="mission-item">
                <span className="mission-icon">🤝</span>
                <div className="mission-text">
                  <h3>Nuestro Compromiso</h3>
                  <p>Brindar herramientas accesibles y cariñosas para el día a día</p>
                </div>
              </div>
              
              <div className="mission-item">
                <span className="mission-icon">✨</span>
                <div className="mission-text">
                  <h3>Nuestra Visión</h3>
                  <p>Un mundo donde cada recuerdo cuenta y cada persona importa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Reminders */}
      <section className="reminders-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">⏰</span>
            Próximos Recordatorios
          </h2>
          <button 
            className="view-all-btn"
            onClick={() => navigate("/patient/reminders")}
          >
            Ver todos
          </button>
        </div>
        
        <div className="reminders-grid">
          {upcomingReminders.map((reminder) => (
            <div key={reminder.id} className="reminder-card" style={{ borderLeftColor: reminder.color }}>
              <span className="reminder-icon" style={{ background: reminder.color }}>
                {reminder.icon}
              </span>
              <div className="reminder-content">
                <h3 className="reminder-title">{reminder.title}</h3>
                <p className="reminder-time">{reminder.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">⚡</span>
            Accesos Rápidos
          </h2>
        </div>
        
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className="action-card"
              onClick={action.action}
              style={{ "--card-color": action.color } as React.CSSProperties}
            >
              <div className="action-icon-wrapper" style={{ background: action.color }}>
                <span className="action-icon">{action.icon}</span>
              </div>
              <h3 className="action-title">{action.title}</h3>
              <p className="action-description">{action.description}</p>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* Motivational Footer */}
      <section className="motivation-section">
        <div className="motivation-card">
          <span className="motivation-icon">🌟</span>
          <p className="motivation-text">
            "Los recuerdos son el tesoro que nadie puede quitarnos. Con DoRemember, 
            los mantenemos vivos y brillantes."
          </p>
        </div>
      </section>
    </div>
  );
}