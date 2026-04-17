import { useState, useEffect } from "react";
import { career } from "./data/career";

export default function App() {

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem("subjects");
    if (saved) return JSON.parse(saved);
    return career.map(s => ({ ...s, status: "no_cursada" }));
  });

  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  // ========================
  // LOGICA
  // ========================
  const isUnlocked = (subject) => {
    if (!subject.correlatives.length) return true;

    return subject.correlatives.every(id => {
      const correlative = subjects.find(s => s.id === id);
      return correlative && correlative.status === "aprobada";
    });
  };

  const getUnlocks = (subject) => {
    return subjects.filter(s => s.correlatives.includes(subject.id));
  };

  const handleChangeStatus = (id) => {
    const updated = subjects.map(s => {
      if (s.id === id) {
        if (!isUnlocked(s)) return s;

        let newStatus = s.status;

        if (s.status === "no_cursada") newStatus = "cursando";
        else if (s.status === "cursando") newStatus = "regular";
        else if (s.status === "regular") newStatus = "aprobada";
        else newStatus = "no_cursada";

        return { ...s, status: newStatus };
      }
      return s;
    });

    setSubjects(updated);
  };

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // ========================
  // ESTILOS
  // ========================
  const getStyles = (subject) => {
    const unlocked = isUnlocked(subject);

    if (!unlocked) return { bg: "#f0f0f0", btn: "#aaa", text: "#888" };

    if (subject.status === "no_cursada")
      return { bg: "#c9c9c9", btn: "#545454", text: "#333" };

    if (subject.status === "cursando")
      return { bg: "#85baf2", btn: "#1772d4", text: "#0b3d6e" };

    if (subject.status === "regular")
      return { bg: "#ebc588", btn: "#de9116", text: "#6b3e00" };

    if (subject.status === "aprobada")
      return { bg: "#88eba2", btn: "#15c243", text: "#0f5e2a" };
  };

  const formatStatus = (subject) => {
    if (!isUnlocked(subject)) return "Bloqueada";

    return {
      no_cursada: "No cursada",
      cursando: "En curso",
      regular: "Regular",
      aprobada: "Aprobada"
    }[subject.status];
  };

  // ========================
  // PROGRESO
  // ========================
  const approved = subjects.filter(s => s.status === "aprobada").length;
  const total = subjects.length;
  const progress = Math.round((approved / total) * 100);

  const radius = 40;
  const stroke = 8;
  const normalized = 2 * Math.PI * radius;
  const offset = normalized - (progress / 100) * normalized;

  // ========================
  // COMPONENTE
  // ========================
  const SubjectCard = ({ s }) => {
    const styles = getStyles(s);
    const isOpen = openId === s.id;
    const unlocks = getUnlocks(s);

    return (
      <div style={{
        marginBottom: "16px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        width: "100%",
        backgroundColor: "white",
      }}>

        {/* CABECERA */}
        <div
          onClick={() => toggleOpen(s.id)}
          style={{
            backgroundColor: styles.bg,
            padding: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: styles.text,
            cursor: "pointer"
          }}
        >

          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{
              marginRight: "10px",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "0.2s"
            }}>
              ▶
            </span>

            <strong>{s.name}</strong>
            <span style={{ marginLeft: "8px", fontSize: "12px" }}>
              {s.hours || 6} hs
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleChangeStatus(s.id);
            }}
            style={{
              backgroundColor: styles.btn,
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            {formatStatus(s)}
          </button>
        </div>

        {/* 👇 CLAVE: SIEMPRE RENDERIZA (NO CAMBIA ALTURA) */}
        <div style={{
          backgroundColor: "#f7f7f7",
          padding: "16px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          opacity: isOpen ? 1 : 0,
          height: isOpen ? "auto" : "0px",
          overflow: "hidden",
          transition: "all 0.3s ease"
        }}>

          <p><b>Carga horaria:</b> {s.hours || 6} horas semanales</p>

          <p><b>Materias que desbloquea</b></p>

          <div style={{ marginLeft: "10px" }}>
            {unlocks.map(u => (
              <div key={u.id} style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px"
              }}>
                <span style={{ marginRight: "6px" }}>✔</span>

                <span>
                  <b style={{ color: "#1a5cff" }}>{u.name}</b> ({u.year}° año)
                </span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: "10px", fontSize: "13px" }}>
            Total: {unlocks.length}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "800px",
      margin: "auto",
      fontFamily: "sans-serif"
    }}>

      <h1>Currix</h1>

      {/* 🔥 PROGRESO CIRCULAR */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "30px"
      }}>
        <svg width="100" height="100">
          <circle
            stroke="#eee"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            stroke="#15c243"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx="50"
            cy="50"
            strokeDasharray={normalized}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "0.5s" }}
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="16"
          >
            {progress}%
          </text>
        </svg>
      </div>

      {[1,2,3,4,5].map(year => (
        <div key={year}>
          <h2>{year}° Año</h2>

          {subjects
            .filter(s => s.year === year)
            .map(s => <SubjectCard key={s.id} s={s} />)}
        </div>
      ))}
    </div>
  );
}