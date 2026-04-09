import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ExperimentParams } from "../services/geminiService";

interface SimulationViewProps {
  params: ExperimentParams | null;
  isRunning: boolean;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ params, isRunning }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Draw "Virtual Environment"
    // We'll visualize the reaction chamber as a container with particles
    // Temperature affects particle speed, Pressure affects density/size
    
    const chamber = svg.append("g")
      .attr("transform", `translate(${width/2 - 150}, ${height/2 - 150})`);

    chamber.append("rect")
      .attr("width", 300)
      .attr("height", 300)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .attr("rx", 10);

    if (params) {
      const particleCount = Math.floor(params.pressure * 2) + 20;
      const speed = params.temperature / 10;
      
      const particles = Array.from({ length: particleCount }).map(() => ({
        x: Math.random() * 280 + 10,
        y: Math.random() * 280 + 10,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        color: d3.interpolateReds(params.temperature / 100)
      }));

      const nodes = chamber.selectAll("circle")
        .data(particles)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("fill", d => d.color);

      if (isRunning) {
        d3.timer(() => {
          particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 5 || p.x > 295) p.vx *= -1;
            if (p.y < 5 || p.y > 295) p.vy *= -1;
          });

          nodes
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        });
      } else {
        nodes
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      }
    } else {
      // Empty state
      chamber.append("text")
        .attr("x", 150)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .attr("fill", "#999")
        .text("Awaiting Experiment Parameters...");
    }

  }, [params, isRunning]);

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-50 rounded-xl border border-zinc-200 p-8 shadow-inner overflow-hidden">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            {isRunning ? 'Simulation Active' : 'System Idle'}
          </span>
        </div>
        {params && (
          <div className="text-xs font-mono text-zinc-400">
            T: {params.temperature.toFixed(1)}°C | P: {params.pressure.toFixed(1)} bar
          </div>
        )}
      </div>
      <svg ref={svgRef} width="600" height="400" className="max-w-full h-auto" />
    </div>
  );
};
