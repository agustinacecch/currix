import React from "react";

// Paleta cíclica de tarjetas — azul/violeta intercalado
const CARD_PALETTE = [
  {
    bg: "#F0F4FF",
    border: "#739AF0",
    title: "#1A3A8A",
    label: "#4A69BD",
    correlativa: "#5758BB",
  },
  {
    bg: "#F8F2FF",
    border: "#C084FC",
    title: "#4B0082",
    label: "#6D28D9",
    correlativa: "#2563EB",
  },
  {
    bg: "#EBFBFF",
    border: "#38BDF8",
    title: "#0369A1",
    label: "#075985",
    correlativa: "#8B5CF6",
  },
  {
    bg: "#F3E8FF",
    border: "#A855F7",
    title: "#581C87",
    label: "#7E22CE",
    correlativa: "#3B82F6",
  },
  {
    bg: "#E0E7FF",
    border: "#6366F1",
    title: "#312E81",
    label: "#4338CA",
    correlativa: "#D946EF",
  },
];

export default function UnlockableSoon({ subjects }) {
  if (!subjects.length) return null;

  // Find subjects that are NOT cursando/aprobada, and have exactly 1 correlative missing.
  const almostUnlocked = subjects.filter(s => {
    if (s.status === "aprobada" || s.status === "cursando" || !s.correlatives?.length) return false;
    
    const missing = s.correlatives.filter(cId => {
      const correlative = subjects.find(sub => sub.id === cId);
      return !correlative || correlative.status !== "aprobada";
    });

    return missing.length === 1;
  });

  // Limitar para principiantes: sólo mostrar materias del año actual o inmediato siguiente.
  const activeYears = subjects.filter(s => s.status === "cursando" || s.status === "aprobada").map(s => s.year);
  const currentActiveYear = activeYears.length > 0 ? Math.max(...activeYears) : 1;
  const limitedUnlocked = almostUnlocked.filter(s => s.year <= currentActiveYear + 1);

  if (limitedUnlocked.length === 0) return null;

  return (
    <div className="card" style={{ borderLeft: "4px solid #9333EA", padding: "20px", backgroundColor: "#FAF5FF" }}>
      <h2 style={{ marginBottom: "16px", color: "#7E22CE", fontSize: "18px" }}>A un paso de desbloquear 🎯</h2>
      <p style={{ marginBottom: "16px", fontSize: "14px", lineHeight: "1.5", color: "#6B21A8" }}>
        Estás a exactamente <strong>una</strong> materia de habilitar estas asignaturas.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {limitedUnlocked.map((s, index) => {
           const palette = CARD_PALETTE[index % CARD_PALETTE.length];

           // Find the missing correlative
           const missingId = s.correlatives.find(cId => {
             const correlative = subjects.find(sub => sub.id === cId);
             return !correlative || correlative.status !== "aprobada";
           });
           const missingSub = subjects.find(sub => sub.id === missingId);

           return (
             <li key={s.id} style={{
               display: "flex",
               flexDirection: "column",
               gap: "4px",
               fontSize: "14px",
               backgroundColor: palette.bg,
               padding: "12px 14px",
               borderRadius: "10px",
               border: `1px solid ${palette.border}`,
               borderLeft: `4px solid ${palette.border}`,
             }}>
               <strong style={{ color: palette.title }}>{s.name}</strong>
               <span style={{ fontSize: "13px", color: palette.label }}>
                 Te falta aprobar: <strong style={{ color: palette.correlativa }}>{missingSub?.name || "Desconocida"}</strong>
               </span>
             </li>
           );
        })}
      </ul>
    </div>
  );
}
