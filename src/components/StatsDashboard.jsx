import React from "react";

export default function StatsDashboard({ subjects, careerDuration }) {
  if (!subjects.length) return null;

  const total = subjects.length;
  const approved = subjects.filter(s => s.status === "aprobada").length;
  const progress = total === 0 ? 0 : Math.round((approved / total) * 100);

  const statusCount = {
    no_cursada: subjects.filter(s => s.status === "no_cursada").length,
    cursando: subjects.filter(s => s.status === "cursando").length,
    regular: subjects.filter(s => s.status === "regular").length,
    aprobada: approved
  };

  const currentHours = subjects
    .filter(s => s.status === "cursando")
    .reduce((acc, s) => acc + (s.hours || 0), 0);

  const years = Array.from({ length: careerDuration || 5 }, (_, i) => i + 1);
  const fullyApprovedYears = years.filter(year => {
    const yearSubjects = subjects.filter(s => s.year === year);
    return yearSubjects.length > 0 && yearSubjects.every(s => s.status === "aprobada");
  }).length;

  const yearsProgress = years.map(year => {
    const yearSubjects = subjects.filter(s => s.year === year);
    return {
      year,
      total: yearSubjects.length,
      approved: yearSubjects.filter(s => s.status === "aprobada").length
    };
  }).filter(yp => yp.total > 0);

  const electivesCount = subjects.filter(s => s.type === "electiva");
  const electivesApproved = electivesCount.filter(s => s.status === "aprobada").length;

  const radius = 38;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="stats-dashboard card" style={{ padding: "24px", backgroundColor: "#6D28D9", color: "#FFFFFF", border: "none" }}>
      <h2 style={{ marginBottom: "20px", color: "#FFFFFF", fontSize: "18px", fontWeight: "600" }}>Estadísticas 🔗</h2>
      
      <div className="stats-grid">
        {/* AVANCE CIRCULAR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#6D28D9", fontSize: "14px", marginBottom: "15px", fontWeight: "600", margin: "0 0 10px 0" }}>Avance de carrera</h3>
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle stroke="#EDE9FE" fill="transparent" strokeWidth={stroke} r={radius} cx="50" cy="50" />
            <circle
              stroke="#38BDF8"
              fill="transparent"
              strokeWidth={stroke}
              r={radius}
              cx="50"
              cy="50"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="bold" fill="#6D28D9">
              {progress}%
            </text>
          </svg>
        </div>

        {/* PROGRESS POR AÑO */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#6D28D9", fontSize: "14px", marginBottom: "15px", fontWeight: "600", margin: "0 0 10px 0" }}>Materias aprobadas por año</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {yearsProgress.map(yp => (
              <div key={yp.year} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                <span style={{ color: "#6B21A8", width: "50px", fontWeight: "500" }}>{yp.year}° año</span>
                <div style={{ flex: 1, height: "10px", backgroundColor: "#EDE9FE", borderRadius: "5px", overflow: "hidden", display: "flex" }}>
                   {yp.total > 0 && Array.from({length: yp.total}).map((_, i) => (
                      <div key={i} style={{ 
                        flex: 1, 
                        borderRight: i < yp.total - 1 ? "1px solid #fff" : "none",
                        backgroundColor: i < yp.approved ? "#7C3AED" : "transparent"
                      }} />
                   ))}
                </div>
                <span style={{ width: "45px", textAlign: "right", color: "#7C3AED" }}>
                   <strong>{yp.approved}</strong> <span style={{ color: "#9333EA", fontSize: "12px" }}>de {yp.total}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DISTRIBUTION BAR */}
      <div style={{ marginTop: "24px", backgroundColor: "#7C3AED", borderRadius: "12px", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontSize: "14px" }}>
          <h3 style={{ color: "#FFFFFF", margin: 0, fontWeight: "600" }}>Distribución de estados</h3>
          <span style={{ color: "#DDD6FE" }}>{total} materias</span>
        </div>
        <div style={{ display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", gap: "2px", marginBottom: "15px" }}>
           <div style={{ width: `${(statusCount.no_cursada/total)*100}%`, backgroundColor: "#94A3B8" }}></div>
           <div style={{ width: `${(statusCount.cursando/total)*100}%`, backgroundColor: "#38BDF8" }}></div>
           <div style={{ width: `${(statusCount.regular/total)*100}%`, backgroundColor: "#F59E0B" }}></div>
           <div style={{ width: `${(statusCount.aprobada/total)*100}%`, backgroundColor: "#22C55E" }}></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", fontSize: "13px", justifyContent: "space-between", color: "#FFFFFF" }}>
           <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: "500"}}><span className="dot" style={{backgroundColor: '#94A3B8'}}></span> No cursada ({statusCount.no_cursada})</span>
           <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: "500"}}><span className="dot" style={{backgroundColor: '#38BDF8'}}></span> En curso ({statusCount.cursando})</span>
           <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: "500"}}><span className="dot" style={{backgroundColor: '#F59E0B'}}></span> Regular ({statusCount.regular})</span>
           <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: "500"}}><span className="dot" style={{backgroundColor: '#22C55E'}}></span> Aprobada ({statusCount.aprobada})</span>
        </div>
      </div>

      {/* METRICS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #7C3AED", paddingBottom: "10px", fontSize: "14px" }}>
           <span style={{ color: "#FFFFFF", fontWeight: "500" }}>Materias aprobadas</span>
           <span style={{ color: "#FFFFFF" }}><strong>{approved}</strong> <span style={{ color: "#DDD6FE", fontWeight: "normal" }}>de {total} mat.</span></span>
        </div>
        {electivesCount.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #7C3AED", paddingBottom: "10px", fontSize: "14px" }}>
             <span style={{ color: "#FFFFFF", fontWeight: "500" }}>Materias electivas aprobadas</span>
             <span style={{ color: "#FFFFFF" }}><strong>{electivesApproved}</strong> <span style={{ color: "#DDD6FE", fontWeight: "normal" }}>de {electivesCount.length} mat.</span></span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #7C3AED", paddingBottom: "10px", fontSize: "14px" }}>
           <span style={{ color: "#FFFFFF", fontWeight: "500" }}>Años aprobados</span>
           <span style={{ color: "#FFFFFF" }}><strong>{fullyApprovedYears}</strong> <span style={{ color: "#DDD6FE", fontWeight: "normal" }}>de {years.length} años</span></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px", fontSize: "14px" }}>
           <span style={{ color: "#FFFFFF", fontWeight: "500" }}>Horas cátedra semanales en curso</span>
           <span style={{ color: "#FFFFFF" }}><strong>{currentHours}</strong> <span style={{ color: "#DDD6FE", fontWeight: "normal" }}>hs.</span></span>
        </div>
      </div>

    </div>
  );
}
