import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ExperimentParams {
  temperature: number;
  pressure: number;
  [key: string]: any;
}

export interface ExperimentResult {
  yield: number;
  timestamp: string;
  metrics: {
    stability: string;
    efficiency: number;
  };
}

export interface AgentThought {
  action: string;
  reasoning: string;
  parameters: ExperimentParams;
}

export const geminiService = {
  /**
   * Designs the next experiment based on previous results.
   * This is the "Bayesian Optimization" / "RL" part simulated by Gemini.
   */
  async designNextExperiment(history: { params: ExperimentParams; result: ExperimentResult }[]): Promise<AgentThought> {
    const historyText = history.length > 0 
      ? history.map((h, i) => `Exp ${i+1}: Params(temp=${h.params.temperature}, press=${h.params.pressure}) -> Yield=${h.result.yield.toFixed(2)}`).join("\n")
      : "No previous experiments.";

    const prompt = `
      You are an Autonomous Research Agent (Aetheris). 
      Your goal is to optimize a virtual chemical reaction to maximize "yield".
      The parameters are:
      - Temperature (0 to 100)
      - Pressure (0 to 50)

      Current History:
      ${historyText}

      Based on this history, design the next experiment to explore or exploit the parameter space.
      If there is no history, start with a reasonable baseline.
      If there is history, use it to refine your guess.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "A brief name for this experimental step" },
            reasoning: { type: Type.STRING, description: "Detailed reasoning for choosing these parameters" },
            parameters: {
              type: Type.OBJECT,
              properties: {
                temperature: { type: Type.NUMBER },
                pressure: { type: Type.NUMBER }
              },
              required: ["temperature", "pressure"]
            }
          },
          required: ["action", "reasoning", "parameters"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}") as AgentThought;
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      // Fallback
      return {
        action: "Baseline Exploration",
        reasoning: "Starting with middle-ground parameters to establish a baseline.",
        parameters: { temperature: 50, pressure: 25 }
      };
    }
  },

  /**
   * Analyzes the final results and provides a summary.
   */
  async analyzeResults(history: { params: ExperimentParams; result: ExperimentResult }[]): Promise<string> {
    const historyText = history.map((h, i) => `Exp ${i+1}: Params(temp=${h.params.temperature}, press=${h.params.pressure}) -> Yield=${h.result.yield.toFixed(2)}`).join("\n");
    
    const prompt = `
      Analyze the following experimental history and summarize the findings.
      Identify the optimal parameters found and suggest future directions for research.
      
      History:
      ${historyText}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text || "Analysis failed.";
  }
};
