import { ProjectState } from "../types";

export interface EditorInChiefResult {
  text: string;
  groundingChunks: any[] | null;
}

// Read selected AI engine and model configuration from localStorage
function getAiConfigHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const aiEngine = localStorage.getItem('aura_ai_engine') || 'gemini';
    const groqModel = localStorage.getItem('aura_groq_model') || 'llama-3.3-70b-versatile';
    return {
      "x-ai-engine": aiEngine,
      "x-groq-model": groqModel
    };
  }
  return {};
}

export async function getEditorInChiefResponse(
  chatHistory: any[], 
  userMessage: string, 
  state: ProjectState,
  searchGrounding: boolean = false
): Promise<EditorInChiefResult> {
  const response = await fetch("/api/editor-in-chief", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ chatHistory, userMessage, state, searchGrounding }),
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo en la comunicación con el Editor-en-Jefe");
  }
  
  const data = await response.json();
  return {
    text: data.text,
    groundingChunks: data.groundingChunks
  };
}

export async function runEvaluationLoop(concept: string): Promise<any[]> {
  const response = await fetch("/api/evaluation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ concept }),
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo en la evaluación inicial de los departamentos");
  }
  
  const data = await response.json();
  return data.reports;
}

export async function generateManuscript(concept: string, guidelines: string): Promise<string> {
  const response = await fetch("/api/generate-manuscript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ concept, guidelines }),
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo al redactar el manuscrito preliminar");
  }
  
  const data = await response.json();
  return data.text;
}

export async function humanizeText(text: string): Promise<string> {
  const response = await fetch("/api/humanize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo durante el proceso de humanización de texto");
  }
  
  const data = await response.json();
  return data.text;
}

export async function runMarketAnalysis(manuscript: string, concept: string): Promise<any> {
  const response = await fetch("/api/market-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ manuscript, concept }),
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo en la generación de análisis comercial");
  }
  
  const data = await response.json();
  return data;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ text, targetLanguage }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo en la traducción adaptativa de localización.");
  }

  const data = await response.json();
  return data.text;
}

export interface PublishResult {
  success: boolean;
  platform: string;
  status: string;
  realCallStatus: string;
  publishDate: string;
  slug: string;
  publicUrl: string;
}

export async function publishToCMS(
  title: string, 
  content: string, 
  webhookUrl: string, 
  platform: string
): Promise<PublishResult> {
  const response = await fetch("/api/publish-cms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // No custom headers needed since this is a pure utility CMS request (non-AI)
    },
    body: JSON.stringify({ title, content, webhookUrl, platform }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo al conectar con el servidor CMS de publicación masiva.");
  }

  const data = await response.json();
  return data;
}

export interface CorrectionResult {
  explanation: string;
  correctedManuscript: string;
}

export async function submitEditorialCorrection(
  manuscript: string,
  errorDescription: string,
  chatHistory: any[]
): Promise<CorrectionResult> {
  const response = await fetch("/api/editorial-correction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ manuscript, errorDescription, chatHistory }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo en la canalización técnica con la Mesa de Enmiendas.");
  }

  const data = await response.json();
  return data;
}

export async function runEditorialAudit(text: string, agentId: string): Promise<any> {
  const response = await fetch("/api/editorial-audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAiConfigHeaders()
    },
    body: JSON.stringify({ text, agentId }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Fallo durante la ejecución de la auditoría.");
  }

  return response.json();
}
