import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { Reminder } from "../../api/reminderService";
import {
    addReminder,
    deleteReminder,
    getReminders,
} from "../../api/reminderService";
import { useAuth } from "../../auth/useAuth";
import "./reminder.css";

export default function PatientReminders() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [success, setSuccess] = useState("");


  useEffect(() => {
    if (!user) return;
    loadReminders();
  }, [user]);

  async function loadReminders() {
    if (!user) return;
    const res = await getReminders(user.uid);
    setReminders(res);
  }

  async function handleAdd() {
    if (!user) return;
    await addReminder({
      userId: user.uid,
      message,
      dateTime: Timestamp.fromDate(new Date(dateTime)),
      type: "push",
      active: true,
      createdAt: Timestamp.now(),
    });
    setSuccess(" Recordatorio guardado correctamente ");
    setMessage("");
    setDateTime("");
    loadReminders();
  }

  async function handleDelete(id: string) {
    await deleteReminder(id);
    loadReminders();
  }

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <div className="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className="header-text">
          <h1>Recordatorios</h1>
          <p>Gestiona tus recordatorios y notificaciones</p>
        </div>
      </div>

      <div className="reminders-content">
        <div className="add-reminder-card">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Nuevo Recordatorio
          </h2>

          <div className="add-form">
            <div className="form-group">
              <label htmlFor="message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Mensaje
              </label>
              <input
                id="message"
                type="text"
                placeholder="Escribe tu recordatorio..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="datetime">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Fecha y Hora
              </label>
              <input
                id="datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="form-input"
              />
            </div>

            <button onClick={handleAdd} className="btn-add" disabled={!message || !dateTime}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Agregar
            </button>

            {success && (
              <div className="success-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {success}
              </div>
            )}
          </div>
        </div>

        <div className="reminders-list-card">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Mis Recordatorios ({reminders.length})
          </h2>

          {reminders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3>No hay recordatorios</h3>
              <p>Agrega tu primer recordatorio para recibir notificaciones</p>
            </div>
          ) : (
            <div className="reminders-list">
              {reminders.map((r) => (
                <div key={r.id} className="reminder-item">
                  <div className="reminder-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <div className="reminder-content">
                    <p className="reminder-message">{r.message}</p>
                    <div className="reminder-datetime">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>
                        {new Date(r.dateTime.seconds * 1000).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(r.id!)} className="btn-delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
