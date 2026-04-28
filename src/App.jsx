import { useState, useEffect, useMemo } from "react";
import Login from "./Login";
import "./App.css";

import PlanData from "./components/PlanData";
import StatsDashboard from "./components/StatsDashboard";
import AvailableSubjects from "./components/AvailableSubjects";
import SubjectCard from "./components/SubjectCard";
import CurrentStatus from "./components/CurrentStatus";
import KeySubjects from "./components/KeySubjects";
import UnlockableSoon from "./components/UnlockableSoon";
import Footer from "./components/Footer";
import CareerPicker from "./components/CareerPicker";
import { isUnlocked } from "./utils";

const PHRASES = [
  "¿Cómo te está yendo?",
  "¡Un paso más cerca del título!",
  "¡Sigue así, gran esfuerzo!",
  "¡No bajes los brazos!",
  "La constancia es la clave del éxito."
];

export default function App() {
  const [career, setCareer] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [openYears, setOpenYears] = useState(["1"]);

  // Auth state
  const [user, setUser] = useState(null);        // null = not loaded yet
  const [authLoaded, setAuthLoaded] = useState(false); // true once the token check is done
  const [selectedSlug, setSelectedSlug] = useState(null);

  const randomPhrase = useMemo(() => PHRASES[Math.floor(Math.random() * PHRASES.length)], []);

  // Display name: fall back to email prefix if username was never set
  const displayName = user?.username && user.username !== "Estudiante"
    ? user.username
    : user?.email?.split("@")[0] || "estudiante";

  // ── Adapt raw career subjects → app format ────────────────────────────────
  const adaptCareer = (careerFromDB) => {
    return careerFromDB.subjects.map(s => ({
      id: s.id,
      name: s.name,
      year: s.year,
      cuatri: s.cuatri,
      hours: s.hours,
      correlatives: s.correlatives || [],
      cycle: s.cycle || null,
      status: "no_cursada"
    }));
  };

  // ── Load a career by slug, merging saved progress ────────────────────────
  const loadCareer = async (slug, savedSubjects) => {
    try {
      const res = await fetch(`http://localhost:3000/career/${slug}`);
      if (!res.ok) throw new Error("career not found");
      const careerData = await res.json();
      setCareer(careerData);

      const base = adaptCareer(careerData);
      if (savedSubjects && savedSubjects.length > 0) {
        setSubjects(base.map(c => {
          const saved = savedSubjects.find(s => s.id === c.id);
          return { ...c, status: saved?.status || "no_cursada" };
        }));
      } else {
        setSubjects(base);
      }
      setOpenYears(["1"]);
    } catch (err) {
      console.error("❌ Error cargando carrera:", err);
    }
  };

  // ── On mount: check token, load user + handle browser back ─────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthLoaded(true);
      return;
    }

    fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error("invalid token");
        return r.json();
      })
      .then(userData => {
        setUser(userData);
        // If we landed directly on the page with a token, push picker state
        if (!window.history.state) {
          window.history.replaceState({ screen: "picker" }, "", "/");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => {
        setAuthLoaded(true);
      });
  }, []);

  // ── Browser back/forward button support ────────────────────────────────
  useEffect(() => {
    const handlePopState = (e) => {
      const screen = e.state?.screen;
      if (screen === "picker") {
        setSelectedSlug(null);
        setCareer(null);
        setSubjects([]);
      } else if (screen === "login" || !screen) {
        localStorage.removeItem("token");
        setUser(null);
        setSelectedSlug(null);
        setCareer(null);
        setSubjects([]);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ── Called when user picks a career ──────────────────────────────────────
  const handleCareerSelected = async (slug, userData) => {
    setSelectedSlug(slug);
    window.history.pushState({ screen: "dashboard", slug }, "", "/");
    const careerProgress = (userData || user)?.careers?.find(c => c.slug === slug);
    await loadCareer(slug, careerProgress?.subjects || []);
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSelectedSlug(null);
    setCareer(null);
    setSubjects([]);
    window.history.pushState({ screen: "login" }, "", "/");
  };

  // ── Cascading lock logic ──────────────────────────────────────────────────
  const getAllDependents = (subjectId, allSubs) => {
    let deps = [];
    const directs = allSubs.filter(s => s.correlatives?.includes(subjectId));
    directs.forEach(d => {
      deps.push(d.id);
      deps = deps.concat(getAllDependents(d.id, allSubs));
    });
    return deps;
  };

  const handleChangeStatus = async (id) => {
    let updated = [...subjects];
    const idx = updated.findIndex(s => s.id === id);
    if (idx === -1) return;

    const subject = updated[idx];
    if (!isUnlocked(subject, updated)) return;

    let newStatus = subject.status;
    let becameUnapproved = false;

    if (subject.status === "no_cursada") newStatus = "cursando";
    else if (subject.status === "cursando") newStatus = "regular";
    else if (subject.status === "regular") newStatus = "aprobada";
    else {
      newStatus = "no_cursada";
      becameUnapproved = true;
    }

    updated[idx] = { ...subject, status: newStatus };

    if (becameUnapproved) {
      const depIds = getAllDependents(id, updated);
      updated = updated.map(s =>
        depIds.includes(s.id) ? { ...s, status: "no_cursada" } : s
      );
    }

    setSubjects(updated);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("http://localhost:3000/auth/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subjects: updated, careerSlug: selectedSlug })
      });
    } catch (err) {
      console.error("❌ Error guardando:", err);
    }
  };

  const toggleOpen = (id) => setOpenId(openId === id ? null : id);

  const toggleYear = (key) => {
    setOpenYears(prev =>
      prev.includes(key) ? prev.filter(y => y !== key) : [...prev, key]
    );
  };

  // ── Back to picker (doesn't lose carrer data, just unselects) ────────────
  const goToPicker = () => {
    setSelectedSlug(null);
    setCareer(null);
    setSubjects([]);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER LOGIC
  // ─────────────────────────────────────────────────────────────────────────

  // 1. Still checking token
  if (!authLoaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#F5F3FF" }}>
        <p style={{ color: "#7C3AED", fontSize: "16px" }}>Cargando Currix...</p>
      </div>
    );
  }

  // 2. Not logged in → full-page Login
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F3FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "700",
            letterSpacing: "-2px",
            margin: "0 0 8px 0",
            background: "linear-gradient(135deg, #7C3AED, #2563EB)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Currix
          </h1>
          <p style={{ margin: 0, color: "#64748B", fontSize: "16px" }}>
            Tu planner universitario interactivo 🎓
          </p>
        </div>
        <Login onLogin={() => {
          const token = localStorage.getItem("token");
          fetch("http://localhost:3000/me", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(userData => {
              setUser(userData);
              window.history.pushState({ screen: "picker" }, "", "/");
            });
        }} />
      </div>
    );
  }

  // 3. Logged in, no career selected → CareerPicker
  if (!selectedSlug) {
    return (
      <CareerPicker
        user={{ ...user, displayName }}
        onCareerSelected={(slug) => handleCareerSelected(slug, user)}
        onLogout={handleLogout}
      />
    );
  }

  // 4. Career loaded → Dashboard
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F5F3FF" }}>
      <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", flex: 1, width: "100%", boxSizing: "border-box" }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingBottom: "24px",
          marginBottom: "32px",
          borderBottom: "1px solid #DDD6FE",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <div>
            <h1 style={{
              fontSize: "42px",
              fontWeight: "700",
              letterSpacing: "-1.5px",
              margin: "0 0 8px 0",
              background: "linear-gradient(135deg, #7C3AED, #2563EB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Currix
            </h1>
            <p style={{ margin: 0, fontSize: "16px", color: "#64748B" }}>
              Planner interactivo de la carrera de {career?.name || "…"}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "20px", margin: "0 0 4px 0", color: "#0F172A" }}>
              ¡Hola, <span style={{ color: "#7C3AED" }}>{displayName}</span>! ✨
            </h2>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#64748B" }}>{randomPhrase}</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={goToPicker}
                style={{ fontSize: "12px", color: "#7C3AED", background: "none", border: "1px solid #DDD6FE", borderRadius: "20px", padding: "4px 14px", cursor: "pointer", fontWeight: "500", backgroundColor: "#FAF5FF" }}
              >
                ↩ Cambiar carrera
              </button>
              <button
                onClick={handleLogout}
                style={{ fontSize: "12px", color: "#DC2626", background: "none", border: "1px solid #FECACA", borderRadius: "20px", padding: "4px 14px", cursor: "pointer", fontWeight: "500", backgroundColor: "#FFF1F2" }}
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {subjects.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Cargando plan de estudios...
          </div>
        )}

        {subjects.length > 0 && (
          <div className="layout-grid">
            {/* Main Column */}
            <div>
              <h2 style={{ fontSize: "28px", marginBottom: "24px", color: "#0F172A", fontWeight: "700" }}>Tu Plan de Estudios 🎓</h2>
              {(() => {
                const hasCycle = subjects.some(s => s.cycle);
                const CYCLE_LABELS = { cbc: "CBC", biomedico: "Ciclo Biomédico", clinico: "Ciclo Clínico", internado: "Internado" };
                const CYCLE_ORDER = ["cbc", "biomedico", "clinico", "internado"];

                const groups = hasCycle
                  ? CYCLE_ORDER.map(c => ({ key: c, label: CYCLE_LABELS[c] || c, groupSubjects: subjects.filter(s => s.cycle === c) })).filter(g => g.groupSubjects.length > 0)
                  : Array.from({ length: career?.durationYears || 5 }, (_, i) => i + 1).map(year => ({
                      key: String(year),
                      label: `${year}° Año`,
                      groupSubjects: subjects.filter(s => s.year === year),
                    })).filter(g => g.groupSubjects.length > 0);

                return groups.map(({ key, label, groupSubjects }) => {
                  const isOpen = openYears.includes(key);
                  return (
                    <div key={key} style={{ marginBottom: "24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                      <div
                        onClick={() => toggleYear(key)}
                        style={{ padding: "16px 20px", backgroundColor: "#EDE9FE", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: isOpen ? "1px solid #DDD6FE" : "none", transition: "background-color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#E0E7FF"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#EDE9FE"}
                      >
                        <h2 style={{ fontSize: "20px", margin: 0, color: "#4C1D95", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600" }}>
                          <span style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "14px", color: "#64748B" }}>▶</span>
                          {label}
                        </h2>
                        <span style={{ color: "#64748B", fontSize: "14px", fontWeight: "500" }}>{groupSubjects.length} materias</span>
                      </div>
                      <div style={{ display: isOpen ? "block" : "none", padding: "20px", backgroundColor: "#FFFFFF" }}>
                        {groupSubjects.map(s => (
                          <SubjectCard key={s.id} s={s} subjects={subjects} openId={openId} toggleOpen={toggleOpen} handleChangeStatus={handleChangeStatus} />
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}

              <div style={{ marginTop: "40px" }}>
                <AvailableSubjects subjects={subjects} />
              </div>
              <div style={{ marginTop: "40px" }}>
                <PlanData career={career} />
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <StatsDashboard subjects={subjects} careerDuration={career?.durationYears} />
              <CurrentStatus subjects={subjects} />
              <KeySubjects subjects={subjects} />
              <UnlockableSoon subjects={subjects} />
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}