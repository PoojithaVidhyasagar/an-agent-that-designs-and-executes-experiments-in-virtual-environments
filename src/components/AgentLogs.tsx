import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { AgentThought } from "../services/geminiService";
import { Brain, Cpu, FlaskConical, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgentLogsProps {
  logs: AgentThought[];
}

export const AgentLogs: React.FC<AgentLogsProps> = ({ logs }) => {
  return (
    <div className="flex flex-col h-full border-l border-zinc-200 bg-zinc-900 text-zinc-100">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-emerald-400" />
        <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Agent Cognition Log</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <Brain className="w-3 h-3" />
                  <span className="text-[10px] font-mono uppercase tracking-tighter">Iteration {i + 1}</span>
                </div>
                <div className="pl-4 border-l border-zinc-800 space-y-3">
                  <div>
                    <div className="text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Action: {log.action}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed italic">
                      "{log.reasoning}"
                    </p>
                  </div>
                  <div className="bg-zinc-800/50 p-2 rounded border border-zinc-700/50">
                    <div className="text-[10px] font-mono text-zinc-400 mb-1 flex items-center gap-1">
                      <FlaskConical className="w-3 h-3" /> Proposed Parameters
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="text-emerald-500">TEMP: {log.parameters.temperature.toFixed(2)}</div>
                      <div className="text-blue-400">PRES: {log.parameters.pressure.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {logs.length === 0 && (
            <div className="text-zinc-600 text-xs font-mono text-center py-10">
              Initializing neural pathways...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
