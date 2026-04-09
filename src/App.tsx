import React, { useState, useEffect } from "react";
import { SimulationView } from "./components/SimulationView";
import { AgentLogs } from "./components/AgentLogs";
import { geminiService, ExperimentParams, ExperimentResult, AgentThought } from "./services/geminiService";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Beaker, Brain, Play, RotateCcw, Save, Search, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [history, setHistory] = useState<{ params: ExperimentParams; result: ExperimentResult }[]>([]);
  const [logs, setLogs] = useState<AgentThought[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentParams, setCurrentParams] = useState<ExperimentParams | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runExperiment = async () => {
    setIsSimulating(true);
    
    // 1. Agent designs the experiment
    const thought = await geminiService.designNextExperiment(history);
    setLogs(prev => [...prev, thought]);
    setCurrentParams(thought.parameters);

    // 2. Execute simulation via backend
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parameters: thought.parameters, environmentType: "chemical-reaction" })
      });
      const data = await response.json();
      
      if (data.success) {
        setHistory(prev => [...prev, { params: thought.parameters, result: data.results }]);
      }
    } catch (error) {
      console.error("Simulation failed", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetExperiments = () => {
    setHistory([]);
    setLogs([]);
    setCurrentParams(null);
    setAnalysis(null);
  };

  const generateAnalysis = async () => {
    if (history.length === 0) return;
    setIsAnalyzing(true);
    const result = await geminiService.analyzeResults(history);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const chartData = history.map((h, i) => ({
    iteration: i + 1,
    yield: h.result.yield,
    temp: h.params.temperature,
    press: h.params.pressure
  }));

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* Sidebar - Agent Logs */}
      <div className="w-80 flex-shrink-0 shadow-xl z-10">
        <AgentLogs logs={logs} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">Aetheris</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Autonomous Research Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-zinc-200 text-zinc-500">
              ENV: VIRTUAL-CHEM-01
            </Badge>
            <div className="h-4 w-[1px] bg-zinc-200" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetExperiments}
              className="text-zinc-500 hover:text-zinc-900"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button 
              size="sm" 
              onClick={runExperiment} 
              disabled={isSimulating}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200"
            >
              {isSimulating ? (
                <Zap className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2 fill-current" />
              )}
              {isSimulating ? "Simulating..." : "Run Iteration"}
            </Button>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Simulation View */}
            <Card className="lg:col-span-2 border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Search className="w-4 h-4 text-zinc-400" /> Virtual Environment
                    </CardTitle>
                    <CardDescription className="text-xs">Real-time simulation of the experimental space</CardDescription>
                  </div>
                  {isSimulating && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse">
                      Processing...
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <SimulationView params={currentParams} isRunning={isSimulating} />
              </CardContent>
            </Card>

            {/* Stats & Controls */}
            <div className="space-y-6">
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Max Yield</div>
                      <div className="text-2xl font-bold text-zinc-900">
                        {history.length > 0 ? Math.max(...history.map(h => h.result.yield)).toFixed(2) : "0.00"}%
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Iterations</div>
                      <div className="text-2xl font-bold text-zinc-900">{history.length}</div>
                    </div>
                  </div>
                  
                  {history.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Current Status</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={history[history.length-1].result.metrics.stability === "Stable" ? "default" : "destructive"}>
                          {history[history.length-1].result.metrics.stability}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          Efficiency: {(history[history.length-1].result.metrics.efficiency * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-zinc-200 shadow-sm bg-zinc-900 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" /> Research Synthesis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Aetheris uses Bayesian optimization and LLM-driven reasoning to explore the parameter space efficiently.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={generateAnalysis}
                    disabled={history.length === 0 || isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Generate Final Report"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Area */}
          <Tabs defaultValue="yield" className="w-full">
            <TabsList className="bg-zinc-100 border border-zinc-200">
              <TabsTrigger value="yield" className="text-xs">Yield Progress</TabsTrigger>
              <TabsTrigger value="params" className="text-xs">Parameter Space</TabsTrigger>
              <TabsTrigger value="report" className="text-xs">Final Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="yield" className="mt-4">
              <Card className="border-zinc-200 shadow-sm">
                <CardContent className="pt-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="iteration" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="params" className="mt-4">
              <Card className="border-zinc-200 shadow-sm">
                <CardContent className="pt-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="iteration" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="press" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="mt-4">
              <Card className="border-zinc-200 shadow-sm min-h-[300px]">
                <CardContent className="pt-6">
                  {analysis ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="prose prose-sm max-w-none text-zinc-600"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Save className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-zinc-900 m-0">Autonomous Analysis Report</h3>
                      </div>
                      <div className="whitespace-pre-wrap font-sans leading-relaxed">
                        {analysis}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                      <Search className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-xs">Run experiments and click "Generate Final Report" to see synthesis.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
