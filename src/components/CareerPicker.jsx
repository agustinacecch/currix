import React, { useEffect, useState } from "react";

export default function CareerPicker({ user, onCareerSelected }) {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null); // slug being confirmed

  useEffect(() => {
    fetch("http://localhost:3000/career")
      .then(r => r.json())
      .then(data => {
        // Sort: first by university, then by career name
        const sorted = [...data].sort((a, b) => {
          const uniCmp = (a.university || "").localeCompare(b.university || "", "es");
          if (uniCmp !== 0) return uniCmp;
          return (a.name || "").localeCompare(b.name || "", "es");
        });
        setCareers(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group by university
  const byUniversity = careers.reduce((acc, c) => {
    const uni = c.university || "Sin Universidad";
    if (!acc[uni]) acc[uni] = [];
    acc[uni].push(c);
    return acc;
  }, {});

  const universities = Object.keys(byUniversity).sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const handleSelect = async (slug) => {
    setSelecting(slug);
    const token = localStorage.getItem("token");
    if (token) {
      await fetch("http://localhost:3000/auth/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ careerSlug: slug }),
      });
    }
    onCareerSelected(slug);
  };

  // Slugs the user already has progress in
  const enrolledSlugs = new Set((user?.careers || []).map(c => c.slug));

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F5F3FF",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "32px 40px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <h1 style={{
          fontSize: "42px",
          fontWeight: "700",
          letterSpacing: "-1.5px",
          margin: "0 0 6px 0",
          background: "linear-gradient(135deg, #7C3AED, #2563EB)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Currix
        </h1>
        <p style={{ margin: "0 0 28px 0", color: "#64748B", fontSize: "16px" }}>
          Planner interactivo universitario
        </p>

        <div style={{
          borderTop: "1px solid #DDD6FE",
          paddingTop: "28px",
        }}>
          <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#1E1B4B", margin: "0 0 6px 0" }}>
            ¡Hola, <span style={{ color: "#7C3AED" }}>{user?.displayName || user?.username || "estudiante"}</span>! 👋
          </h2>
          <p style={{ margin: 0, color: "#64748B", fontSize: "15px" }}>
            Elegí tu carrera para empezar a planificar tu cursada.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 40px 60px",
        width: "100%",
        boxSizing: "border-box",
      }}>
        {loading ? (
          <div style={{ color: "#7C3AED", fontSize: "16px", paddingTop: "40px" }}>
            Cargando carreras disponibles...
          </div>
        ) : (
          universities.map(uni => (
            <div key={uni} style={{ marginBottom: "40px" }}>
              {/* University header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}>
                  🏛️
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1E1B4B",
                  }}>
                    {uni}
                  </h3>
                  <span style={{ fontSize: "13px", color: "#7C3AED" }}>
                    {byUniversity[uni].length} carrera{byUniversity[uni].length !== 1 ? "s" : ""} disponible{byUniversity[uni].length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Career cards grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}>
                {byUniversity[uni].map(career => (
                  <button
                    key={career.slug}
                    onClick={() => handleSelect(career.slug)}
                    disabled={selecting === career.slug}
                    style={{
                      background: enrolledSlugs.has(career.slug) ? "#F5F3FF" : "#FFFFFF",
                      border: `1px solid ${enrolledSlugs.has(career.slug) ? "#A78BFA" : "#DDD6FE"}`,
                      borderLeft: `4px solid ${enrolledSlugs.has(career.slug) ? "#5B21B6" : "#7C3AED"}`,
                      borderRadius: "12px",
                      padding: "20px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: enrolledSlugs.has(career.slug)
                        ? "0 2px 8px rgba(91,33,182,0.12)"
                        : "0 2px 8px rgba(124,58,237,0.06)",
                      opacity: selecting && selecting !== career.slug ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#7C3AED";
                      e.currentTarget.style.borderLeftColor = "#4C1D95";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.18)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#DDD6FE";
                      e.currentTarget.style.borderLeftColor = "#7C3AED";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(124,58,237,0.06)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{
                      fontSize: "13px",
                      color: "#7C3AED",
                      fontWeight: "600",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {career.faculty || uni}
                    </div>
                    <div style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#1E1B4B",
                      lineHeight: "1.4",
                    }}>
                      {career.name}
                    </div>
                    <div style={{
                      marginTop: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#FFFFFF",
                      backgroundColor: enrolledSlugs.has(career.slug) ? "#5B21B6" : "#7C3AED",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontWeight: "600",
                    }}>
                      {selecting === career.slug ? "Cargando..."
                        : enrolledSlugs.has(career.slug) ? "▶ Continuar carrera"
                        : "Elegir carrera →"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer style={{
        padding: "24px 40px",
        background: "linear-gradient(135deg, #6c41acff 0%, #517fe2ff 100%)",
        textAlign: "center",
      }}>
        <p style={{ margin: 0, color: "#DDD6FE", fontSize: "13px" }}>
          © {new Date().getFullYear()} Currix — Agustina Cecch — Hecho con dedicación 💜
        </p>
      </footer>
    </div>
  );
}
