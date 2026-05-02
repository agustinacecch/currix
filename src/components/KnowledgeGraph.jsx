import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function KnowledgeGraph({ subjects }) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const yearCounts = {};
    const nodes = [];
    const edges = [];

    subjects.forEach(s => {
      const year = s.year || 1;
      const yIndex = yearCounts[year] || 0;
      yearCounts[year] = yIndex + 1;

      // Color mapping
      let bg = "#f8fafc";
      let border = "#e2e8f0";
      
      if (s.status === "aprobada") { bg = "#dcfce7"; border = "#22c55e"; }
      if (s.status === "regular") { bg = "#e0f2fe"; border = "#3b82f6"; }
      if (s.status === "cursando") { bg = "#fef9c3"; border = "#eab308"; }

      nodes.push({
        id: s.id.toString(),
        data: { label: s.name },
        position: { x: (year - 1) * 300, y: yIndex * 80 },
        style: {
          background: bg,
          border: `2px solid ${border}`,
          borderRadius: "8px",
          padding: "10px",
          width: 220,
          fontSize: "12px",
          fontWeight: "600",
          color: "#0f172a",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }
      });

      if (s.correlatives) {
        s.correlatives.forEach(corrId => {
          edges.push({
            id: `e${corrId}-${s.id}`,
            source: corrId.toString(),
            target: s.id.toString(),
            animated: s.status === "cursando",
            style: { stroke: "#94a3b8", strokeWidth: 2 }
          });
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [subjects]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when subjects change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div style={{ height: '600px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
