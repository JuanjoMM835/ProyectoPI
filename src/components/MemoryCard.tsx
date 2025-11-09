import type { Memory } from "../types/Memory";

type Props = {
  memory: Memory;
};

export default function MemoryCard({ memory }: Props) {
  return (
    <div
      style={{
        width: 200,
        padding: 12,
        margin: 8,
        border: "1px solid #ccc",
        borderRadius: 8
      }}
    >
      <img
        src={memory.imageUrl}
        alt={memory.description}
        style={{ width: "100%", borderRadius: 6 }}
      />

      <p style={{ marginTop: 6 }}>
        {memory.description || "Sin descripción"}
      </p>
    </div>
  );
}
