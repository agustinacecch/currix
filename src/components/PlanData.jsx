import React from "react";

export default function PlanData({ career }) {
  if (!career) return null;

  return (
    <div className="card plan-data" style={{ borderLeft: "4px solid #4338CA", backgroundColor: "#EEF2FF" }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: "#312E81", fontSize: "18px", marginBottom: "16px" }}>
        Datos del Plan de Estudios 🔗
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left" }}>
        <li style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
          <strong>Carrera:</strong> {career.name || "-"}
        </li>
        <li style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
          <strong>Facultad:</strong> {career.faculty || "-"}
        </li>
        <li style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
          <strong>Universidad:</strong> {career.university || "-"}
        </li>
        <li style={{ padding: "12px 0" }}>
          <strong>Duración:</strong> {career.durationYears} años
        </li>
      </ul>
    </div>
  );
}
