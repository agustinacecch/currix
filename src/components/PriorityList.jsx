import React, { useState } from "react";
import { getUnlocks, formatStatus } from "../utils";

export default function PriorityList({ subjects }) {
  const [showApproved, setShowApproved] = useState(true);
  const [showElectives, setShowElectives] = useState(true);

  if (!subjects.length) return null;

  let filtered = subjects.slice();
  
  if (!showApproved) {
    filtered = filtered.filter(s => s.status !== "aprobada");
  }
  
  if (!showElectives) {
    filtered = filtered.filter(s => !(s.name?.toLowerCase().includes("electiva")));
  }

  // Ordenar por cantidad de unlocks descendente
  filtered.sort((a, b) => {
    const unlocksA = getUnlocks(a, subjects).length;
    const unlocksB = getUnlocks(b, subjects).length;
    if (unlocksB !== unlocksA) return unlocksB - unlocksA;
    // Si empatan, priorizamos año más bajo
    return a.year - b.year;
  });

  return (
    <div className="card">
      <h2 style={{ marginBottom: "10px" }}>Orden de prioridad sugerido 🔗</h2>
      <p className="text-gray" style={{ marginBottom: "20px", fontSize: "15px", lineHeight: "1.5" }}>
        Todas las materias ordenadas por cantidad de otras que desbloquean. Las que están más arriba son requisito de más materias, así que conviene priorizarlas.
      </p>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", fontSize: "15px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={showApproved} 
            onChange={(e) => setShowApproved(e.target.checked)} 
            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#2563eb" }}
          />
          <span className="text-gray">Mostrar materias aprobadas</span>
        </label>
        
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={showElectives} 
            onChange={(e) => setShowElectives(e.target.checked)} 
            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#2563eb" }}
          />
          <span className="text-gray">Mostrar materias electivas</span>
        </label>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "8px", fontWeight: "600" }}>#</th>
              <th style={{ padding: "8px", fontWeight: "600" }}>MATERIA</th>
              <th style={{ padding: "8px", fontWeight: "600", textAlign: "center" }}>🔓</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, index) => {
              let badgeBg = "#e2e8f0";
              let badgeText = "#475569";
              if (s.status === "aprobada") { badgeBg = "#dcfce7"; badgeText = "#166534"; }
              else if (s.status === "cursando") { badgeBg = "#dbeafe"; badgeText = "#1e40af"; }
              else if (s.status === "regular") { badgeBg = "#fef3c7"; badgeText = "#92400e"; }

              return (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 8px", color: "#94a3b8" }}>{index + 1}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ color: "#2563eb" }}>{s.name}</span> <span className="text-gray">de {s.year}º año</span>
                    <span style={{ marginLeft: "10px", backgroundColor: badgeBg, color: badgeText, padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                      {formatStatus(s, true)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center", color: "#64748b" }}>
                    {getUnlocks(s, subjects).length}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
