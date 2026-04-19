import React from "react";
import { getUnlocks } from "../utils";

export default function KeySubjects({ subjects }) {
  if (!subjects.length) return null;

  const notApproved = subjects.filter(s => s.status !== "aprobada");
  
  if (notApproved.length === 0) return null;

  const sorted = notApproved.sort((a, b) => {
    const unlocksA = getUnlocks(a, subjects).length;
    const unlocksB = getUnlocks(b, subjects).length;
    if (unlocksB !== unlocksA) return unlocksB - unlocksA;
    return a.year - b.year;
  });

  const top3 = sorted.slice(0, 3).filter(s => getUnlocks(s, subjects).length > 0);

  if (top3.length === 0) return null;

  return (
    <div className="card" style={{ borderLeft: "4px solid #3B82F6", backgroundColor: "#EFF6FF", padding: "20px" }}>
      <h2 style={{ marginBottom: "16px", color: "#1D4ED8", fontSize: "18px" }}>Materias Clave 🔑</h2>
      <p style={{ marginBottom: "16px", fontSize: "14px", lineHeight: "1.5", color: "#1E3A8A" }}>
        Prioriza la cursada de estas materias para evitar estancarte, ya que desbloquean muchas otras en el futuro.
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {top3.map(s => {
           const unlocksCount = getUnlocks(s, subjects).length;
           return (
             <li key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#DBEAFE", padding: "12px", borderRadius: "8px" }}>
               <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                 <strong style={{ color: "#1E3A8A", fontSize: "14px" }}>{s.name}</strong>
                 <span style={{ fontSize: "12px", color: "#1D4ED8" }}>{s.year}º año</span>
               </div>
               <span style={{ backgroundColor: "#3B82F6", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}>
                  🔓 {unlocksCount} deps
               </span>
             </li>
           );
        })}
      </ul>
    </div>
  );
}
