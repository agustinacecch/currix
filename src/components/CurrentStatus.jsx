import React from "react";

export default function CurrentStatus({ subjects }) {
  const current = subjects.filter(s => s.status === "cursando");
  
  if (current.length === 0) return null;

  return (
    <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
      <h2 style={{ marginBottom: "16px", color: "#1e3a8a", fontSize: "18px" }}>Cursada Actual 📖</h2>
      
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {current.map(s => (
          <li key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
            <span style={{ fontWeight: "500", color: "#334155" }}>{s.name}</span>
            <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
              {s.hours || 0} hs
            </span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
        <span>Total carga horaria:</span>
        <span style={{ color: "#2563eb" }}>{current.reduce((acc, s) => acc + (s.hours || 0), 0)} hs semanales</span>
      </div>
    </div>
  );
}
