import React from "react";
import { isUnlocked, getUnlocks } from "../utils";

export default function AvailableSubjects({ subjects }) {
  if (!subjects.length) return null;

  const available = subjects.filter(s => 
    s.status !== "aprobada" && 
    s.status !== "cursando" && 
    isUnlocked(s, subjects)
  );

  if (available.length === 0) {
    return (
      <div className="card">
        <h2>Qué podés cursar 🔗</h2>
        <p className="text-gray" style={{ marginTop: "10px" }}>No hay materias disponibles para cursar actualmente.</p>
      </div>
    );
  }

  const anual = available.filter(s => s.cuatri === "anual" || s.cuatri === "Anual");
  const cuatrimestral = available.filter(s => s.cuatri !== "anual" && s.cuatri !== "Anual");

  const SubjectRow = ({ s }) => {
    const unlocks = getUnlocks(s, subjects).length;
    return (
      <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" }}>
        <span style={{ color: "#3b82f6" }}>•</span>
        <strong style={{ color: "#2563eb", fontWeight: "500" }}>{s.name}</strong>
        <span className="text-gray" style={{ flexShrink: 0 }}>de {s.year}º año</span>
        {unlocks > 0 && (
          <span style={{ marginLeft: "auto", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
             🔒 {unlocks}
          </span>
        )}
      </li>
    );
  };

  return (
    <div className="card" style={{ borderLeft: "4px solid #7C3AED", padding: "20px", backgroundColor: "#F5F3FF" }}>
      <h2 style={{ marginBottom: "10px", color: "#5B21B6", fontSize: "18px" }}>Qué podés cursar 🔗</h2>
      <p style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.5", color: "#4C1D95" }}>
        En tu situación actual, estas son las {available.length} materias que podés cursar. El número junto al candado indica cuántas materias desbloquea.
      </p>
      
      {anual.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Anual <span className="text-gray" style={{fontWeight: "normal"}}>({anual.length} materia{anual.length !== 1 && 's'})</span></h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, marginLeft: "10px" }}>
            {anual.map(s => <SubjectRow key={s.id} s={s} />)}
          </ul>
        </div>
      )}

      {cuatrimestral.length > 0 && (
        <div>
          <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Cuatrimestral <span className="text-gray" style={{fontWeight: "normal"}}>({cuatrimestral.length} materia{cuatrimestral.length !== 1 && 's'})</span></h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, marginLeft: "10px" }}>
            {cuatrimestral.map(s => <SubjectRow key={s.id} s={s} />)}
          </ul>
        </div>
      )}
    </div>
  );
}
