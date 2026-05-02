import React, { useState } from "react";

export default function SmartPath({ subjects, careerSlug }) {
  const [maxMaterias, setMaxMaterias] = useState(3);
  const [rutas, setRutas] = useState(null);
  const [loading, setLoading] = useState(false);

  const generarRuta = async () => {
    setLoading(true);
    try {
      const completedIds = subjects.filter(s => s.status === "aprobada").map(s => s.id);
      const res = await fetch(`http://localhost:3000/career/${careerSlug}/smart-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedSubjectIds: completedIds,
          maxSubjectsPerSemester: maxMaterias
        })
      });
      const data = await res.json();
      setRutas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <h2 style={{ margin: "0 0 16px 0", fontSize: "24px", color: "#1e293b" }}>Generador Automático de Rutas 🧠</h2>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        Ingresá cuántas materias podés cursar por cuatrimestre. El algoritmo calculará la ruta óptima para que te recibas lo antes posible, priorizando materias que destraban más correlativas a futuro.
      </p>

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", marginBottom: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Materias por cuatrimestre</label>
          <input 
            type="number" 
            min={1} 
            max={8} 
            value={maxMaterias} 
            onChange={(e) => setMaxMaterias(parseInt(e.target.value) || 1)} 
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "120px" }}
          />
        </div>
        <button 
          onClick={generarRuta} 
          disabled={loading}
          style={{ padding: "12px 24px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
        >
          {loading ? "Calculando..." : "Generar Ruta Óptima ✨"}
        </button>
      </div>

      {rutas && rutas.length === 0 && (
        <div style={{ padding: "24px", backgroundColor: "#f0fdf4", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0", textAlign: "center", fontWeight: "bold" }}>
          ¡Felicitaciones! Ya tenés todas las materias aprobadas. 🎉
        </div>
      )}

      {rutas && rutas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#334155" }}>Ruta Sugerida ({rutas.length} cuatrimestres restantes)</h3>
          {rutas.map((cuatri, i) => (
            <div key={i} style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#6366f1" }}>Cuatrimestre {i + 1}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {cuatri.map(s => (
                  <div key={s.id} style={{ padding: "12px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>{s.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{s.hours} hs | Año {s.year}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
