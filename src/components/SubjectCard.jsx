import React from "react";
import { isUnlocked, getUnlocks, getStyles, formatStatus } from "../utils";

export default function SubjectCard({ s, subjects, openId, toggleOpen, handleChangeStatus }) {
  const styles = getStyles(s, isUnlocked(s, subjects));
  const isOpen = openId === s.id;
  const unlocks = getUnlocks(s, subjects);

  return (
    <div style={{
      marginBottom: "16px",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      backgroundColor: "white",
      border: `1px solid ${styles.border}`
    }}>
      <div
        onClick={() => toggleOpen(s.id)}
        style={{
          backgroundColor: styles.bg,
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: styles.text,
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!isOpen && isUnlocked(s, subjects)) e.currentTarget.style.filter = "brightness(0.97)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "0.2s",
            opacity: 0.6,
            fontSize: "12px"
          }}>
            ▶
          </span>
          <strong style={{ fontWeight: "500" }}>{s.name}</strong>
          <span className="text-gray" style={{ fontSize: "12px" }}>
            {s.hours || 6} hs
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleChangeStatus(s.id);
          }}
          disabled={!isUnlocked(s, subjects)}
          style={{
            backgroundColor: styles.btn,
            color: "white",
            border: "none",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: isUnlocked(s, subjects) ? "pointer" : "not-allowed",
            transition: "opacity 0.2s",
            opacity: isUnlocked(s, subjects) ? 1 : 0.7
          }}
        >
          {formatStatus(s, isUnlocked(s, subjects))}
        </button>
      </div>

      <div style={{
        backgroundColor: "#f8fafc",
        padding: "20px",
        display: isOpen ? "block" : "none",
        textAlign: "left",
        borderTop: `1px solid ${styles.border}`
      }}>
        <div style={{ fontSize: "14px", color: "#334155" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Carga horaria:</strong> {s.hours || 6} horas cátedra semanales
          </p>
          <p style={{ margin: "0 0 16px 0" }}>
            <strong>Requisitos para cursar y rendir:</strong> {
              s.correlatives?.length 
              ? s.correlatives.map(id => subjects.find(sub => sub.id === id)?.name || id).join(", ")
              : "Ninguno"
            }
          </p>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Materias que desbloquea:</strong>
          </p>
          <div style={{ marginLeft: "14px" }}>
            {unlocks.length === 0 && (
              <p style={{ color: "#94a3b8", margin: 0 }}>Ninguna</p>
            )}
            {unlocks.map((u) => (
              <div key={u.id} style={{ margin: "4px 0" }}>
                <span style={{ color: "#3b82f6" }}>•</span> {u.name} <span className="text-gray">({u.year}° año)</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "12px", fontSize: "13px", color: "#64748b" }}>
            Cantidad total: {unlocks.length}
          </p>
        </div>
      </div>
    </div>
  );
}
