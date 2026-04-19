import React from "react";

export default function Footer() {
  return (
    <footer style={{
      marginTop: "60px",
      padding: "40px 20px",
      background: "linear-gradient(135deg, #6c41acff 0%, #517fe2ff 100%)",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        <h3 style={{
          fontSize: "22px",
          margin: 0,
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #C4B5FD, #93C5FD)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "700"
        }}>Currix</h3>
        <p style={{ margin: 0, color: "#DDD6FE", fontSize: "14px", fontWeight: "500" }}>Planner Universitario Interactivo</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#c8d1ffff" }}>© {new Date().getFullYear()} — Agustina Cecch — Hecho con dedicación 💜</p>
      </div>
    </footer>
  );
}
