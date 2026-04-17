import { useState, useEffect } from "react";
import { career } from "./data/career";

export default function App() {

  const [subjects, setSubjects] = useState([]);
  const [openId, setOpenId] = useState(null);

  // ========================
  // LOAD USER + SUBJECTS
  // ========================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setSubjects(career.flat());
          return;
        }

        const res = await fetch("http://localhost:3000/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        console.log("USER:", data);

        // merge career + progreso
        const merged = career.flat().map(c => {
          const saved = data.subjects?.find(s => s.id === c.id);

          return {
            ...c,
            status: saved?.status || "no_cursada"
          };
        });

        setSubjects(merged);

      } catch (error) {
        console.log("ERROR:", error);
        setSubjects(career.flat());
      }
    };

    fetchUser();
  }, []);

  // ========================
  // LOGICA
  // ========================
  const isUnlocked = (subject) => {
    if (!subject?.correlatives?.length) return true;

    return subject.correlatives.every(id => {
      const correlative = subjects.find(s => s.id === id);
      return correlative && correlative.status === "aprobada";
    });
  };

  const getUnlocks = (subject) => {
    if (!subject?.id) return [];
    return subjects.filter(s => s.correlatives?.includes(subject.id));
  };

  // ========================
  // SAVE STATUS
  // ========================
  const handleChangeStatus = async (id) => {

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

    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:3000/auth/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subjects: updated
        })
      });

    } catch (err) {
      console.error("❌ Error guardando:", err);
    }
  };

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // ========================
  // ESTILOS
  // ========================
  const getStyles = (subject) => {
    if (!subject) return { bg: "#ddd", btn: "#999", text: "#333" };

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

    return { bg: "#ddd", btn: "#999", text: "#333" };
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
  const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

  const radius = 40;
  const stroke = 8;
  const normalized = 2 * Math.PI * radius;
  const offset = normalized - (progress / 100) * normalized;

  // ========================
  // CARD
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
        backgroundColor: "white"
      }}>

        {/* HEADER */}
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            <span style={{
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "0.2s"
            }}>
              ▶
            </span>

            <strong>{s.name}</strong>

            <span style={{ fontSize: "12px", opacity: 0.7 }}>
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
              fontSize: "12px"
            }}
          >
            {formatStatus(s)}
          </button>

        </div>

        {/* BODY */}
        <div style={{
          backgroundColor: "#f7f7f7",
          padding: "16px",
          display: isOpen ? "block" : "none",
          textAlign: "left"
        }}>

          <p style={{ margin: "6px 0" }}>
            Carga horaria: {s.hours || 6} horas cátedra semanales
          </p>

          <p style={{ margin: "6px 0" }}>
            Requisitos para cursar y rendir: Ninguno
          </p>

          <p style={{ margin: "10px 0 6px 0" }}>
            Materias que desbloquea:
          </p>

          <div style={{ marginLeft: "10px" }}>
            {unlocks.length === 0 && (
              <p style={{ opacity: 0.6 }}>Ninguna</p>
            )}

            {unlocks.map((u, i) => (
              <div key={u.id}>
                • {u.name} ({u.year}° año)
              </div>
            ))}
          </div>

          <p style={{ marginTop: "10px", fontSize: "13px" }}>
            Cantidad total: {unlocks.length}
          </p>

        </div>

      </div>
    );
  };

  // ========================
  // UI
  // ========================
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>

      <h1>Currix</h1>

      {/* PROGRESO */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <svg width="100" height="100">
          <circle stroke="#eee" fill="transparent" strokeWidth={8} r={40} cx="50" cy="50" />
          <circle
            stroke="#15c243"
            fill="transparent"
            strokeWidth={8}
            r={40}
            cx="50"
            cy="50"
            strokeDasharray={normalized}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            {progress}%
          </text>
        </svg>
      </div>

      {/* LISTA */}
      {subjects.length === 0 && (
        <p>Cargando materias...</p>
      )}

      {[1, 2, 3, 4, 5].map(year => (
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