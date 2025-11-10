import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    checkTestCountAndGenerateReport,
    evaluateAnswer,
    saveTestResult
} from "../../api/testService";
import { useAuth } from "../../auth/useAuth";
import { db } from "../../firebase/firebase";

import type { TestImage } from "../test/testImage";

export default function Test() {
  const { user } = useAuth();
  const [image, setImage] = useState<TestImage | null>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    loadImage();
  }, [user]);

  const loadImage = async () => {
    const q = query(
      collection(db, "images"),
      where("patientId", "==", user!.uid)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data() as Omit<TestImage, "id">;
      setImage({ id: docSnap.id, ...data });
    }
  };

  const handleSubmit = async () => {
    if (!user || !image) return;

    const resultScore = await evaluateAnswer(image.description, answer);
    setScore(resultScore);

    await saveTestResult(user.uid, image.id, answer, resultScore);

    const report = await checkTestCountAndGenerateReport(
      user.uid,
      image.doctorId
    );

    if (report) {
      alert(" ¡Se completaron 10 tests! Se notificó al médico ");
    }
  };

  if (!image) return <p>No hay pruebas asignadas por ahora.</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2> Test Cognitivo</h2>

      <img
        src={image.url}
        alt="Test"
        style={{
          width: 300,
          borderRadius: "12px",
          margin: "20px auto",
          display: "block"
        }}
      />

      <textarea
        placeholder="Describe lo que ves"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        style={{
          width: "300px",
          height: "120px",
          padding: "10px",
          borderRadius: "10px"
        }}
      />

      <br />
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          borderRadius: "10px",
          backgroundColor: "#4A90E2",
          color: "#fff",
          cursor: "pointer",
          border: "none"
        }}
      >
        Enviar respuesta
      </button>

      {score !== null && (
        <p style={{ marginTop: "20px", fontSize: "18px" }}>
          Puntaje obtenido: <strong>{score}/100</strong>
        </p>
      )}
    </div>
  );
}
