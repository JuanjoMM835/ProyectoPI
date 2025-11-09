import React, { useState } from "react";
import { uploadMemory } from "../api/memoryService";
import { useAuth } from "../auth/useAuth";

type Props = {
  onUpload?: () => void;
};

export default function UploadMemory({ onUpload }: Props) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!file || !user) {
      setMessage("Selecciona una imagen y asegúrate de estar logueado.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await uploadMemory(file, user.uid, description, "patient");
      setFile(null);
      setDescription("");
      setPreview(null);
      setMessage(" Recuerdo subido correctamente!");
      if (onUpload) onUpload();
    } catch (err) {
      console.error("upload error:", err);
      setMessage(" Error al subir el recuerdo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto 20px" }}>
      <form onSubmit={handleSubmit}>
        <label
          style={{
            display: "block",
            height: 200,
            border: "2px dashed #cbd5e1",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 10,
            overflow: "hidden",
            textAlign: "center",
            paddingTop: 60,
          }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleSelectFile}
          />
          {preview ? (
            <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div>📸 Arrastra o haz clic para seleccionar una imagen</div>
          )}
        </label>

        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #e2e8f0" }}
        />

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, borderRadius: 6 }}>
          {loading ? "Subiendo..." : "Subir recuerdo"}
        </button>
      </form>

      {message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
}
