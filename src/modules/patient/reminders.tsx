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
    <div className="reminders-container">
      <h2>📌 Recordatorios</h2>

      <div className="add-box">
        <input
          type="text"
          placeholder="Mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />

        <button onClick={handleAdd}>➕ Agregar</button>
      </div>

      <ul className="reminders-list">
        {reminders.map((r) => (
          <li key={r.id}>
            <span>{r.message}</span>
            <small>{new Date(r.dateTime.seconds * 1000).toLocaleString()}</small>
            <button onClick={() => handleDelete(r.id!)}>🗑</button>
          </li>
        ))}
      </ul>
      {success && (
  <p style={{ color: "green", fontWeight: "bold", marginTop: "10px" }}>
    {success}
  </p>
)}

    </div>
  );
}
