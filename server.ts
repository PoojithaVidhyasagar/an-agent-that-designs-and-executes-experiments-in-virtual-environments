import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Simulation Engine
  // This simulates a complex system (e.g., a chemical reaction or a physical simulation)
  // that the AI agent will try to optimize.
  app.post("/api/simulate", (req, res) => {
    const { parameters, environmentType } = req.body;
    
    // Simulate some processing time
    const delay = Math.random() * 1000 + 500;
    
    setTimeout(() => {
      // Simple mock logic: a hidden "optimal" set of parameters
      // Let's say we are optimizing temperature (0-100) and pressure (0-50)
      // to maximize "yield".
      const temp = parameters.temperature || 0;
      const pressure = parameters.pressure || 0;
      
      // Hidden target: temp=72.5, pressure=34.2
      const dist = Math.sqrt(Math.pow(temp - 72.5, 2) + Math.pow(pressure - 34.2, 2));
      const baseYield = Math.max(0, 100 - dist);
      
      // Add some noise
      const noise = (Math.random() - 0.5) * 5;
      const yieldResult = Math.max(0, baseYield + noise);

      res.json({
        success: true,
        results: {
          yield: yieldResult,
          timestamp: new Date().toISOString(),
          metrics: {
            stability: Math.random() > 0.1 ? "Stable" : "Unstable",
            efficiency: yieldResult / 100,
          }
        }
      });
    }, delay);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
