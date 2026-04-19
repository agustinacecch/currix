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
  const [openYears, setOpenYears] = useState([1]);
  const [user, setUser] = useState(null);

  // Generate a steady random phrase
  const randomPhrase = useMemo(() => PHRASES[Math.floor(Math.random() * PHRASES.length)], []);

  const adaptCareer = (careerFromDB) => {
    return careerFromDB.subjects.map(s => ({
      id: s.id,
      name: s.name,
      year: s.year,
      cuatri: s.cuatri,
      hours: s.hours,
      correlatives: s.correlatives || [],
      status: "no_cursada"
    }));
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const resCareer = await fetch("http://localhost:3000/career/desarrollo-software");
        if (!resCareer.ok) throw new Error("career backend failed");

        const careerData = await resCareer.json();
        setCareer(careerData);
        
        const baseSubjects = adaptCareer(careerData);
        let finalSubjects = baseSubjects;

        const token = localStorage.getItem("token");
        if (token) {
          const resUser = await fetch("http://localhost:3000/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (resUser.ok) {
            const userData = await resUser.json();
            setUser(userData);
            
            if (userData && userData.subjects) {
              finalSubjects = baseSubjects.map(c => {
                const saved = userData.subjects.find(s => s.id === c.id);
                return { ...c, status: saved?.status || "no_cursada" };
              });
            }
          } else {
             console.warn("Token inválido o expirado. Limpiando sesión local.");
             localStorage.removeItem("token");
             setUser(null);
          }
        }
        
        setSubjects(finalSubjects);

      } catch (error) {
        console.error("❌ Error cargando career:", error);
        setSubjects([]);
      }
    };

    fetchAll();
  }, []);

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
    const subjectIndex = updated.findIndex(s => s.id === id);
    if (subjectIndex === -1) return;
    
    const subject = updated[subjectIndex];
    if (!isUnlocked(subject, updated)) return;

    let newStatus = subject.status;
    let becameUnapproved = false;

    if (subject.status === "no_cursada") newStatus = "cursando";
    else if (subject.status === "cursando") newStatus = "regular";
    else if (subject.status === "regular") newStatus = "aprobada";
    else {
      newStatus = "no_cursada";
      becameUnapproved = true; // pasamos de aprobada a no cursada (o si hubiera otras)
    }

    updated[subjectIndex] = { ...subject, status: newStatus };

    // CASACADING LOCK: Si pierde la aprobación, todas sus dependientes directas/indirectas 
    // caen a "no_cursada" porque ya no cumplen los requisitos correlativos.
    if (becameUnapproved) {
      const dependentIds = getAllDependents(id, updated);
      updated = updated.map(s => {
        if (dependentIds.includes(s.id)) {
          return { ...s, status: "no_cursada" };
        }
        return s;
      });
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
        body: JSON.stringify({ subjects: updated })
      });
    } catch (err) {
      console.error("❌ Error guardando:", err);
    }
  };

  const toggleOpen = (id) => setOpenId(openId === id ? null : id);

  const toggleYear = (year) => {
    setOpenYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F5F3FF" }}>
      <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", flex: 1, width: "100%", boxSizing: "border-box" }}>
        
        {/* HEADER SECTION */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-end", 
          paddingBottom: "24px", 
          marginBottom: "32px", 
          borderBottom: "1px solid #E2E8F0", 
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
              Planner interactivo de la carrera de {career?.name || "Ingeniería"}
            </p>
          </div>
          {user && (
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "20px", margin: "0 0 4px 0", color: "#0F172A" }}>
                ¡Hola, <span style={{ color: "#2563EB" }}>{user.username}</span>! ✨
              </h2>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748B" }}>{randomPhrase}</p>
            </div>
          )}
        </div>

        {!user && subjects.length > 0 && (
          <div style={{ marginBottom: "40px", background: "#f0fdfa", padding: "24px", borderRadius: "12px", border: "1px solid #ccfbf1", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#0f766e", fontWeight: "500", fontSize: "15px" }}>
              Inicia sesión para poder guardar tu progreso permanentemente y personalizar tu experiencia
            </p>
            <Login onLogin={() => window.location.reload()} />
          </div>
        )}

        {subjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Cargando plan de estudios...
          </div>
        )}

        {subjects.length > 0 && (
          <div className="layout-grid">
            {/* Main Content Area */}
            <div>
              <h2 style={{ fontSize: "28px", marginBottom: "24px", color: "#0F172A", fontWeight: "700" }}>Tu Plan de Estudios 🎓</h2>
              {Array.from({ length: career?.durationYears || 5 }, (_, i) => i + 1).map(year => {
                const yearSubjects = subjects.filter(s => s.year === year);
                if (yearSubjects.length === 0) return null;
                const isYearOpen = openYears.includes(year);
                
                return (
                  <div key={year} style={{ marginBottom: "24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                    <div 
                      onClick={() => toggleYear(year)}
                      style={{ 
                        padding: "16px 20px", 
                        backgroundColor: "#EDE9FE", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        cursor: "pointer",
                        borderBottom: isYearOpen ? "1px solid #DDD6FE" : "none",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#E0E7FF"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#EDE9FE"}
                    >
                      <h2 style={{ fontSize: "20px", margin: 0, color: "#4C1D95", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600" }}>
                        <span style={{ 
                          transform: isYearOpen ? "rotate(90deg)" : "rotate(0deg)", 
                          transition: "transform 0.2s", 
                          fontSize: "14px", 
                          color: "#64748B" 
                        }}>
                          ▶
                        </span>
                        {year}° Año
                      </h2>
                      <span style={{ color: "#64748B", fontSize: "14px", fontWeight: "500" }}>{yearSubjects.length} materias</span>
                    </div>

                    <div style={{ display: isYearOpen ? "block" : "none", padding: "20px", backgroundColor: "#FFFFFF" }}>
                      {yearSubjects.map(s => (
                        <SubjectCard 
                          key={s.id} 
                          s={s} 
                          subjects={subjects} 
                          openId={openId} 
                          toggleOpen={toggleOpen} 
                          handleChangeStatus={handleChangeStatus} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              
              <div style={{ marginTop: "40px" }}>
                 <AvailableSubjects subjects={subjects} />
              </div>

              <div style={{ marginTop: "40px" }}>
                 <PlanData career={career} />
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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