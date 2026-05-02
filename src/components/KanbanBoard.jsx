import React from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { isUnlocked } from "../utils";

function DraggableSubject({ s, subjects }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: s.id,
    data: { subject: s }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    padding: "12px",
    margin: "8px 0",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    cursor: "grab",
    userSelect: "none",
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
    position: isDragging ? "relative" : "static"
  };

  const unlocked = isUnlocked(s, subjects);

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", display: "flex", justifyContent: "space-between" }}>
        <span>{s.name}</span>
        {!unlocked && <span style={{ color: "#ef4444" }} title="Correlativas no cumplidas">🔒</span>}
      </div>
      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
        {s.hours} hs | Año {s.year}
      </div>
    </div>
  );
}

function DroppableColumn({ id, title, subjectsInColumn, subjects }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      style={{ 
        flex: 1, 
        minWidth: "220px", 
        backgroundColor: isOver ? "#e0e7ff" : "#f8fafc", 
        padding: "16px", 
        borderRadius: "12px", 
        border: "1px solid",
        borderColor: isOver ? "#818cf8" : "#e2e8f0",
        transition: "background-color 0.2s"
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#334155", textAlign: "center" }}>
        {title} <span style={{ color: "#94a3b8", fontSize: "14px" }}>({subjectsInColumn.length})</span>
      </h3>
      <div style={{ minHeight: "300px" }}>
        {subjectsInColumn.map(s => (
          <DraggableSubject key={s.id} s={s} subjects={subjects} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ subjects, onStatusChange }) {
  const statuses = [
    { id: "no_cursada", title: "Para hacer" },
    { id: "cursando", title: "Cursando" },
    { id: "regular", title: "Regular" },
    { id: "aprobada", title: "Aprobada" }
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; // Dropped outside a column

    const subjectId = active.id;
    const newStatus = over.id; // column id is the status

    const subject = subjects.find(s => s.id === subjectId);
    if (subject && subject.status !== newStatus) {
      // Validate correlatives. If not unlocked, don't allow moving to "cursando", "regular" or "aprobada"
      if (!isUnlocked(subject, subjects) && newStatus !== "no_cursada") {
        alert(`No puedes avanzar "${subject.name}" porque te faltan correlativas.`);
        return;
      }
      onStatusChange(subjectId, newStatus);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px" }}>
          {statuses.map(col => (
            <DroppableColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              subjectsInColumn={subjects.filter(s => s.status === col.id)} 
              subjects={subjects}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
