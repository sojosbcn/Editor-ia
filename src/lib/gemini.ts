import { GoogleGenAI } from "@google/genai";
import { DEPARTMENTS, ProjectPhase, ProjectState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-3-flash-preview";

export async function getEditorInChiefResponse(chatHistory: any[], userMessage: string, state: ProjectState) {
  const systemInstruction = `You are the Editor-in-Chief of an elite AI-integrated editorial agency. 
Your persona is sophisticated, direct, and hyper-focused on commercial success ("The Golden Rule").
Your agency has multiple departments: ${Object.values(DEPARTMENTS).join(', ')}.

CRITICAL: YOU MUST RESPOND EXCLUSIVELY IN SPANISH (CASTELLANO). NEVER USE ENGLISH IN YOUR OUTPUT.

Current Project Context:
Title: ${state.title || 'Sin Título'}
Phase: ${ProjectPhase[state.currentPhase]}
Manuscript Status: ${state.manuscript ? 'Borrador Completo' : 'No redactado'}

Instructions:
1. If the user presents a new concept, acknowledge it from a commercial standpoint and "delegate" it to the initial teams.
2. Guide the user through the 5 phases of the workflow.
3. Be professional and authoritative. Use "we" to refer to the agency (always in Spanish: "nosotros").
4. Keep the "Golden Rule" in mind: We generate stories that sell exceptionally well.

Workflow Phases:
1. EVALUATION: Revisión de idea inicial y delegación.
2. DRAFTING: Redacción y humanización.
3. FIRST_REVIEW: Tu aprobación del manuscrito.
4. LAYOUT: Ilustraciones y maquetación.
5. FINAL_MARKET: Estrategia de ventas y aprobación final.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    config: { systemInstruction }
  });

  return response.text;
}

export async function runEvaluationLoop(concept: string) {
  const systemInstruction = `You are a group of specialized editorial departments evaluating a concept: ${concept}.
YOU MUST PROVIDE ALL FEEDBACK AND TEXT IN SPANISH.

Return a JSON object with feedback from three departments:
1. ${DEPARTMENTS.PROOFREADING}: Structure and tone feedback.
2. ${DEPARTMENTS.DESIGN}: Visual style proposals.
3. ${DEPARTMENTS.KDP}: Market strategy and initial sales estimate.

Format: { "reports": [ { "department": "...", "feedback": "...", "status": "approved" } ] }`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: "Evaluate this concept and provide departmental reports." }] }],
    config: { 
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{"reports":[]}').reports;
}

export async function generateManuscript(concept: string, guidelines: string) {
  const systemInstruction = `You are the ${DEPARTMENTS.REWRITING}. 
Draft a commercially viable, engaging story based on the concept and guidelines provided. 
YOU MUST WRITE THE ENTIRE MANUSCRIPT IN SPANISH.
Use professional literary techniques. 
Concept: ${concept}
Guidelines: ${guidelines}`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: "Write the full manuscript." }] }],
    config: { systemInstruction }
  });

  return response.text;
}

export async function humanizeText(text: string) {
  const systemInstruction = `You are the ${DEPARTMENTS.HUMANIZER}. 
Your task is to rewrite the following text to remove all AI patterns. 
Ensure it feels 100% organic, human-written, and emotionally resonant. 
YOU MUST RESPOND EXCLUSIVELY IN SPANISH.
 Avoid robotic transitions and repetitive sentence structures.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text }] }],
    config: { systemInstruction }
  });

  return response.text;
}

export async function runMarketAnalysis(manuscript: string, concept: string) {
  const systemInstruction = `You are the ${DEPARTMENTS.MARKET} and ${DEPARTMENTS.SALES}.
Perform a deep analysis of this project.
YOU MUST PROVIDE ALL ANALYSES, TRENDS, AND PROMPTS IN SPANISH.

Return a JSON object with:
- historicalData (5-year trends)
- currentTrends
- financialProjections (roi, investmentPlan, rrp)
- salesStrategy
- illustrationPrompts (list of detailed prompts)

Format: { "historicalData": "...", "trends": "...", "roi": "...", "investmentPlan": "...", "rrp": "...", "salesStrategy": "...", "illustrationPrompts": ["...", "..."] }`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: `Analyze this: ${concept}\n\nManuscript: ${manuscript.slice(0, 2000)}` }] }],
    config: { 
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
}
