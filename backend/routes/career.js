import express from "express";
import Career from "../models/Career.js";

const router = express.Router();

// 🔥 PRIMERO la ruta raíz
router.get("/", async (req, res) => {
  try {
    const careers = await Career.find({}, "slug name university faculty");
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔥 SMART PATH
router.post("/:slug/smart-path", async (req, res) => {
  try {
    const { slug } = req.params;
    const { completedSubjectIds = [], maxSubjectsPerSemester = 3 } = req.body;

    const career = await Career.findOne({ slug });
    if (!career) return res.status(404).json({ message: "Career not found" });

    const allSubjects = career.subjects;
    
    // Build graph
    const graph = {};
    const inDegree = {};
    const subjectMap = {};
    const outDegree = {};

    allSubjects.forEach(s => {
      subjectMap[s.id] = s;
      if (!completedSubjectIds.includes(s.id)) {
        inDegree[s.id] = 0;
        graph[s.id] = [];
      }
    });

    allSubjects.forEach(s => {
      if (!completedSubjectIds.includes(s.id)) {
        let reqs = s.correlatives || [];
        reqs.forEach(reqId => {
          if (!completedSubjectIds.includes(reqId) && graph[reqId]) {
            graph[reqId].push(s.id);
            inDegree[s.id]++;
          }
        });
      }
    });

    Object.keys(graph).forEach(id => {
      outDegree[id] = graph[id].length;
    });

    const resultSemesters = [];
    let available = Object.keys(inDegree).filter(id => inDegree[id] === 0);

    while (available.length > 0) {
      available.sort((a, b) => outDegree[b] - outDegree[a]);
      
      const currentSemester = available.slice(0, maxSubjectsPerSemester);
      resultSemesters.push(currentSemester.map(id => subjectMap[id]));

      available = available.slice(maxSubjectsPerSemester);

      const nextAvailable = [];
      currentSemester.forEach(id => {
        graph[id].forEach(neighbor => {
          inDegree[neighbor]--;
          if (inDegree[neighbor] === 0) {
            nextAvailable.push(neighbor);
          }
        });
      });

      available.push(...nextAvailable);
    }

    res.json(resultSemesters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 DESPUÉS la dinámica
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const career = await Career.findOne({ slug });

    if (!career) {
      return res.status(404).json({ message: "Career not found" });
    }

    res.json(career);
  } catch (error) {
    console.error("Error getting career:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;