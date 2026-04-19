export const getUnlocks = (subject, subjects) => {
  if (!subject?.id) return [];
  return subjects.filter(s => s.correlatives?.includes(subject.id));
};

export const isUnlocked = (subject, subjects) => {
  if (!subject?.correlatives?.length) return true;
  return subject.correlatives.every(id => {
    const correlative = subjects.find(s => s.id === id);
    return correlative && correlative.status === "aprobada";
  });
};

export const getStyles = (subject, unlocked) => {
  if (!subject) return { bg: "#FFFFFF", btn: "#94A3B8", text: "#475569", border: "#E2E8F0" };
  
  if (!unlocked) return { 
    bg: "#FAF5FF", 
    btn: "#CBD5E1", 
    text: "#94A3B8", 
    border: "#EDE9FE" 
  };

  if (subject.status === "no_cursada") return { bg: "#F5F3FF", btn: "#94A3B8", text: "#475569", border: "#DDD6FE" };
  if (subject.status === "cursando") return { bg: "#DBEAFE", btn: "#2563EB", text: "#1E3A8A", border: "#BFDBFE" };
  if (subject.status === "regular") return { bg: "#FEF3C7", btn: "#F59E0B", text: "#92400E", border: "#FDE68A" };
  if (subject.status === "aprobada") return { bg: "#DCFCE7", btn: "#22C55E", text: "#166534", border: "#BBF7D0" };

  return { bg: "#F5F3FF", btn: "#94A3B8", text: "#475569", border: "#DDD6FE" };
};

export const formatStatus = (subject, unlocked) => {
  if (!unlocked) return "Bloqueada";
  return {
    no_cursada: "No cursada",
    cursando: "En curso",
    regular: "Regular",
    aprobada: "Aprobada"
  }[subject.status] || "No cursada";
};
