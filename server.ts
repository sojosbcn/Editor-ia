import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup Gemini API Client with Telemetry User-Agent
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("CRITICAL: GEMINI_API_KEY is not defined in the environment. Server is starting but AI requests will fail.");
}

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.warn("WARNING: GROQ_API_KEY is not defined in the environment. Groq model options will not be functional until configured.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// We prefer gemini-3.5-flash for balanced quick and highly creative text response, as recommended by gemini-api skill guidelines
const MODEL_NAME = "gemini-3.5-flash";

// Helper to convert Gemini contents schema to Groq chat completions messages
function formatGeminiContentsToGroq(contents: any[], systemInstruction?: string) {
  const messages: Array<{ role: string; content: string }> = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  for (const item of contents) {
    const role = item.role === "model" ? "assistant" : (item.role || "user");
    let contentText = "";
    if (item.parts && Array.isArray(item.parts)) {
      contentText = item.parts.map((p: any) => p.text || "").join("\n");
    } else if (typeof item.content === "string") {
      contentText = item.content;
    } else if (Array.isArray(item.content)) {
      contentText = item.content.map((p: any) => p.text || "").join("\n");
    } else {
      contentText = String(item.content || "");
    }
    messages.push({ role, content: contentText });
  }
  return messages;
}

// Helper to call Groq LPU Chat completions API using native fetch
async function generateGroqContent(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  jsonMode?: boolean;
}) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error("La clave de API de Groq (GROQ_API_KEY) no está definida. Configúrala en la barra de Ajustes > Secretos.");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: 0.7,
        ...(params.jsonMode ? { response_format: { type: "json_object" } } : {})
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Servicio de Groq devolvió estado ${response.status}: ${errorBody || response.statusText}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { text: content };
  } catch (err: any) {
    console.error("[Groq Execution Error]", err);
    throw new Error(`Fallo en la consulta de Groq: ${err.message || err}`);
  }
}

// Router to direct calls to either Gemini or Groq based on custom request headers
async function generateUniversalContent(params: {
  systemInstruction?: string;
  contents: any[];
  responseMimeType?: string;
  responseSchema?: any;
  reqHeaders?: Record<string, any>;
  tools?: any[];
}) {
  const aiEngine = params.reqHeaders?.['x-ai-engine'] || 'gemini';
  const groqModelSelected = params.reqHeaders?.['x-groq-model'] || 'llama-3.3-70b-versatile';

  if (aiEngine === 'groq') {
    const jsonMode = params.responseMimeType === 'application/json';
    let finalSystemInstruction = params.systemInstruction || "";
    
    if (jsonMode && params.responseSchema) {
      finalSystemInstruction += `\n\nCRITICAL: You must return a valid JSON object. Do not include markdown formatting like \`\`\`json or any conversational prefix/suffix. The JSON must match this structure:\n${JSON.stringify(params.responseSchema, null, 2)}`;
    }
    
    const messages = formatGeminiContentsToGroq(params.contents, finalSystemInstruction);
    const result = await generateGroqContent({
      model: groqModelSelected,
      messages,
      jsonMode
    });
    
    // In case the model still wraps JSON in markdown backticks (fallback)
    let cleanText = result.text || "";
    if (cleanText.includes("```")) {
      const match = cleanText.match(/```(?:json)?([\s\S]*?)```/);
      if (match) {
        cleanText = match[1].trim();
      }
    }
    return { text: cleanText };
  } else {
    // Default to Gemini API
    const config: any = {};
    if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
    if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
    if (params.responseSchema) config.responseSchema = params.responseSchema;
    if (params.tools) config.tools = params.tools;

    return await generateContentWithRetry({
      model: MODEL_NAME,
      contents: params.contents,
      config
    });
  }
}

// Wrapper function to execute Gemini requests with automatic retry and user-friendly error formatting
async function generateContentWithRetry(params: {
  model: string;
  contents: any;
  config?: any;
}) {
  const maxAttempts = 3;
  let delay = 600; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const errMsg = String(error.message || "");
      const isTransient = 
        errMsg.includes("503") || 
        errMsg.includes("UNAVAILABLE") || 
        errMsg.includes("502") || 
        errMsg.includes("429") || 
        errMsg.includes("high demand") || 
        errMsg.includes("RESOURCE_EXHAUSTED") || 
        errMsg.includes("rate limit") || 
        errMsg.includes("overloaded") ||
        error.status === 503 ||
        error.status === 429;

      if (isTransient && attempt < maxAttempts) {
        console.warn(`[Gemini Retry] Intento ${attempt} de ${maxAttempts} fallido debido a alta demanda o saturación temporal de la API (${errMsg.slice(0, 150)}). Esperando ${delay}ms para reintentar...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        console.error(`[Gemini Error] Petición fallida definitivamente.`, error);
        
        let friendlyMessage = errMsg;
        
        if (errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("overloaded")) {
          friendlyMessage = "El servidor de lenguaje de Google (Gemini) está experimentando una demanda extremadamente alta en este momento (pico de demanda temporal). Inténtalo de nuevo en unos segundos.";
        } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("rate limit")) {
          friendlyMessage = "Se ha superado el límite temporal de peticiones permitido para el servicio de inteligencia editorial. Por favor, realiza la acción de nuevo en unos instantes.";
        } else if (errMsg.includes("API key not valid")) {
          friendlyMessage = "La credencial o clave de API configurada no es válida. Por favor, confírmala en la barra de Ajustes.";
        }
        
        throw new Error(friendlyMessage);
      }
    }
  }
  throw new Error("Error desconocido al ejecutar la petición tras reintentos.");
}

const DEPARTMENTS = {
  PROOFREADING: 'Equipo de Estilo y Corrección Editorial',
  DESIGN: 'Dirección de Arte y Diseño de Portadas KDP',
  KDP: 'Analistas del Algoritmo de Amazon KDP',
  REWRITING: 'Redacción Literaria de Alta Conversión',
  HUMANIZER: 'Analizadores de Texto Humano (Zero-AI Editor)',
  SALES: 'Estrategas de Publicidad y Lanzamiento Amazon Ads',
  MARKET: 'Estrategas de Nicho y Palabras Clave KDP'
};

app.use(express.json({ limit: "50mb" }));

// Endpoint for Editor-In-Chief Conversational Thread
app.post("/api/editor-in-chief", async (req, res) => {
  try {
    const { chatHistory, userMessage, state, searchGrounding } = req.body;
    
    if (!userMessage) {
      return res.status(400).json({ error: "Missing userMessage parameter" });
    }

    const systemInstruction = `Eres el Editor-en-Jefe y Estratega Principal de una agencia de élite especializada en Amazon KDP (Kindle Direct Publishing).
Tus analistas son investigadores de mercado y estrategas comerciales del ecosistema de autopublicación de Amazon.
Tu meta absoluta y el "Regla de Oro" de tu agencia es encontrar los mejores nichos (baja competencia, alta demanda), optimizar palabras clave rentables, analizar el BSR (Best Seller Rank) promedio y maximizar de forma agresiva las ventas orgánicas y patrocinadas del libro en formatos eBook Kindle, Tapa Blanda y Tapa Dura.

REQUISITO CRÍTICO: DEBES RESPONDER EXCLUSIVAMENTE EN ESPAÑOL (CASTELLANO). NUNCA UTILICES INGLÉS EN TUS RESPUESTAS.

Contexto actual del proyecto:
Título: ${state?.title || 'Sin Título'}
Fase: ${state?.currentPhase || 'EVALUATION'}
Estado del Manuscrito: ${state?.manuscript ? 'Borrador Completo' : 'No redactado'}

Instrucciones:
1. Si el usuario presenta una nueva idea o concepto, evalúala inmediatamente desde el prisma de viabilidad en Amazon KDP, identificando posibles nichos rentables, estimando el BSR inicial de referencia y delegándolo a los equipos de análisis.
2. Guía al usuario rigurosamente a través de las 5 fases de publicación con entusiasmo estratégico.
3. Sé profesional, analítico y autoritario. Habla en nombre de la red de expertos usando "nosotros".
4. Pon énfasis en cómo maximizaremos las regalías (70% de royalties en rango $2.99 - $9.99), optimizaremos el posicionamiento SEO y ganaremos el listón de "Best Seller".

Fases del Flujo de Trabajo:
1. EVALUATION: Análisis de viabilidad de nicho inicial en KDP y delegación técnica.
2. DRAFTING: Redacción de la historia enfocada al lector objetivo y humanización orgánica total.
3. FIRST_REVIEW: Tu exhaustiva aprobación editorial y estética de la obra.
4. LAYOUT: Dirección de arte de cubierta atractiva para conversión de clics (CTR) y maquetación de spreads.
5. FINAL_MARKET: Despliegue de los entregables estratégicos de KDP (Estrategia de Nicho, 7 slots de Keywords, PVP óptimo, Plan de Tráfico Amazon Ads y Lanzamiento en KDP Select).`;

    const contents = [
      ...(chatHistory || []).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    // Determine tools based on searchGrounding preference (Gemini only)
    const tools = (searchGrounding && req.headers['x-ai-engine'] !== 'groq') ? [{ googleSearch: {} }] : undefined;

    const response = await generateUniversalContent({
      systemInstruction,
      contents,
      reqHeaders: req.headers,
      tools
    });

    // Extract grounding metadata chunks if available (Gemini only)
    const groundingChunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks || null;

    res.json({ 
      text: response.text,
      groundingChunks 
    });
  } catch (error: any) {
    console.error("Error in /api/editor-in-chief:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint for Multi-Departmental Evaluation Loop
app.post("/api/evaluation", async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Missing concept parameter" });
    }

    const systemInstruction = `Eres un comité de analistas de mercado y estrategas comerciales del ecosistema Amazon KDP de la agencia evaluando la viabilidad comercial del concepto de libro: "${concept}".
DEBES PROPORCIONAR TODOS LOS ANÁLISIS, TEXTOS Y RETROALIMENTACIÓN EN ESPAÑOL (CASTELLANO).

Debes generar comentarios detallados y profesionales de tres departamentos estratégicos:
1. ${DEPARTMENTS.PROOFREADING}: Estructura literaria, tono narrativo y coherencia del formato para triunfar entre el público objetivo de Amazon.
2. ${DEPARTMENTS.DESIGN}: Propuesta de diseño visual de portada (CTR optimizado), paleta de colores para capturar la atención en los resultados de búsqueda de la tienda Kindle.
3. ${DEPARTMENTS.KDP}: Viabilidad de Nicho de Amazon KDP (Puntaje de nicho de 1 a 100), sugerencia de 3 palabras clave secundarias de largo rabo (long-tail keywords) con competencia media/baja y volumen estimado, estimación de BSR (Best Seller Rank) objetivo y potencial de regalías bajo suscripción Kindle Unlimited (KENP).

Devuelve EXCLUSIVAMENTE un objeto JSON puro con la estructura del esquema dado. En "feedback", utiliza viñetas markdown para estructurar los puntos con claridad elegante.

Formato esperado: { "reports": [ { "department": "...", "feedback": "...", "status": "approved" } ] }`;

    const response = await generateUniversalContent({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text: `Evaluate this concept and provide departmental reports in raw JSON format.` }] }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reports: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                department: { type: Type.STRING },
                feedback: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ["department", "feedback", "status"]
            }
          }
        },
        required: ["reports"]
      },
      reqHeaders: req.headers
    });

    const parsedData = JSON.parse(response.text || '{"reports":[]}');
    res.json({ reports: parsedData.reports });
  } catch (error: any) {
    console.error("Error in /api/evaluation:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint for Draft Manuscript Writing
app.post("/api/generate-manuscript", async (req, res) => {
  try {
    const { concept, guidelines } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Missing concept parameter" });
    }

    const systemInstruction = `You are the ${DEPARTMENTS.REWRITING}. 
Draft a commercially viable, engaging story based on the concept and guidelines provided. 
YOU MUST WRITE THE ENTIRE MANUSCRIPT IN SPANISH.
Use professional literary techniques. 
Concept: ${concept}
Guidelines: ${guidelines || 'Sigue los estándares editoriales de la agencia.'}`;

    const response = await generateUniversalContent({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text: "Escribe el manuscrito literario completo estructurado por capítulos detallados con títulos rítmicos." }] }],
      reqHeaders: req.headers
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/generate-manuscript:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint for Manuscript Humanization (Zero AI Enforcement)
app.post("/api/humanize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text parameter for humanization" });
    }

    const systemInstruction = `You are the ${DEPARTMENTS.HUMANIZER}. 
Your task is to rewrite the following text to remove all AI patterns or generic structures. 
Ensure it feels 100% organic, human-written, rich in sensory language, and emotionally resonant. 
YOU MUST RESPOND EXCLUSIVELY IN SPANISH. 
Avoid robotic transitions, typical clichés, and repetitive sentence structures.`;

    const response = await generateUniversalContent({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text }] }],
      reqHeaders: req.headers
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/humanize:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint for Market Analysis and Illustration Prompts Generation
app.post("/api/market-analysis", async (req, res) => {
  try {
    const { manuscript, concept } = req.body;
    if (!manuscript || !concept) {
      return res.status(400).json({ error: "Missing manuscript or concept parameter" });
    }

    const systemInstruction = `Eres el equipo de Estrategia de Nichos y Analistas del Algoritmo de Amazon KDP junto con los Estrategas de Publicidad de la agencia.
Realiza un análisis integral del manuscrito y del concepto del libro para definir la estrategia de ventas perfecta en autopublicación de Amazon.

DEBES PROPORCIONAR TODOS LOS ANÁLISIS, DATOS, PALABRAS CLAVE Y PLANES EN ESPAÑOL (CASTELLANO).

El objeto de respuesta JSON debe contener obligatoriamente estos campos en base a este análisis KDP:
1. historicalData: Análisis histórico (5 años) del nicho en Amazon, evolución del BSR (Best Seller Rank) promedio en las categorías clave, estacionalidad del nicho y estimación de regalías acumuladas en Kindle Unlimited de competidores líderes.
2. trends: Estudio de Tendencias KDP, incluyendo las Categorías y Subcategorías óptimas (ej. Literatura y Ficción > Ficción Contemporánea), y los 7 Slots de Palabras Clave de Fondo (Backend Keywords) ideales que se ingresan en el panel de autor para maximizar el SEO y la indexación orgánica.
3. roi: Porcentaje de ROI de inversión proyectado en campañas de Amazon Ads (AMS) y promociones de KDP Select.
4. investmentPlan: Plan de Inversión y Estrategia de Lanzamiento. Configuración paso a paso del plan inicial (Semana 1-4) alternando promociones gratuitas (Kindle Free Book Days) o de cuenta regresiva (Kindle Countdown Deals), segmentación recomendada para Amazon Ads (Palabras clave exactas de competidores, ASINs de libros relacionados, categorías segmentadas) e inversión diaria sugerida.
5. rrp: PVP Sugerido y Estrategia de Royalties. Precios optimizados para eBook (Kindle) a fin de conservar regalías del 70% ($2.99 - $9.99 USD) y precios para Tapa Blanda/Papel (considerando costo de impresión por página del calculador de Amazon KDP).
6. salesStrategy: Guía maestra para Maximizador de Ventas de KDP, incluyendo estrategias de A+ Content, embudo de captación de suscriptores al boletín (Lead Magnet) con enlace en las solapas del libro, y protocolos para la captación sistemática de reseñas honestas (Reviews) durante la semana de lanzamiento.
7. illustrationPrompts: Array con mínimo 3 prompts detallados y creativos de ilustraciones para las láminas del libro o sugerencias detalladas para los mockups de cubierta.

Formato esperado: { "historicalData": "...", "trends": "...", "roi": "...", "investmentPlan": "...", "rrp": "...", "salesStrategy": "...", "illustrationPrompts": ["...", "..."] }`;

    const response = await generateUniversalContent({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text: `Analyze this concept: ${concept}\n\nManuscript: ${manuscript.slice(0, 2000)}` }] }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          historicalData: { type: Type.STRING },
          trends: { type: Type.STRING },
          roi: { type: Type.STRING },
          investmentPlan: { type: Type.STRING },
          rrp: { type: Type.STRING },
          salesStrategy: { type: Type.STRING },
          illustrationPrompts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["historicalData", "trends", "roi", "investmentPlan", "rrp", "salesStrategy", "illustrationPrompts"]
      },
      reqHeaders: req.headers
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/market-analysis:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint for Direct Editorial Correction and Inconsistency Desk
app.post("/api/editorial-correction", async (req, res) => {
  try {
    const { manuscript, errorDescription, chatHistory } = req.body;
    if (!manuscript || !errorDescription) {
      return res.status(400).json({ error: "Missing manuscript or errorDescription parameters." });
    }

    const systemInstruction = `You are the Director Editorial (Editor-in-Chief), a highly professional, direct, and rigorous literary editor.
An author is communicating a specific narrative inconsistency, a physical impossibility, or a logical error in a part of the manuscript.

Your task:
1. Speak DIRECTLY, with maximum brevity and professional respect. Absolutely avoid any flowery praised statements, filler greetings, sycophantic praise, or calling the user "Comandante".
2. Confirm the exact correction made to solve the contradiction in 1 or 2 concise, clear sentences. Explain precisely how the physical/logical contradiction was resolved.
3. SURGICAL COHERENCE REQUIREMENT: You MUST maintain 100% coherence with the existing plot, characters, and overall story. You are strictly forbidden from rewriting the story or inventing any new plotlines, subplots, characters, or scenes. Inspect the manuscript and rewrite ONLY the specific sentence or paragraph that contains the inconsistency. Keep all other text intact and unaltered. Ensure the replacement matches the exact tone, style, and author voice of the surrounding text perfectly.
4. YOU MUST RESPOND IN SPANISH (CASTELLANO).

Return a JSON with precisely:
- explanation: A concise, direct, professional response in Spanish explaining the physical or logical adjustment made.
- correctedManuscript: The complete updated manuscript where ONLY the affected scene is surgically corrected and the rest is kept 100% identical and coherent.

Format: { "explanation": "Confirmada la incoherencia física... He modificado el pasaje de Julia para que abra el ventanal antes de llorar, así las lágrimas caen al exterior donde la nube las recoge. He conservado el resto de la obra intacta.", "correctedManuscript": "El texto completo..." }`;

    const response = await generateUniversalContent({
      systemInstruction,
      contents: [
        {
          role: 'user',
          parts: [{
            text: `CURRENT MANUSCRIPT:\n${manuscript}\n\nERROR DESCRIBED:\n${errorDescription}\n\nCHAT HISTORY:\n${JSON.stringify(chatHistory || [])}`
          }]
        }
      ],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          correctedManuscript: { type: Type.STRING }
        },
        required: ["explanation", "correctedManuscript"]
      },
      reqHeaders: req.headers
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Error in /api/editorial-correction:", error);
    res.status(500).json({ error: error.message || "Internal Server Error in corrections department" });
  }
});

// Endpoint for multi-agent editorial audit
app.post("/api/editorial-audit", async (req, res) => {
  try {
    const { text, agentId } = req.body;
    if (!text || !agentId) {
      return res.status(400).json({ error: "Missing text or agentId parameter" });
    }

    let systemInstruction = "";
    let schema: any = {};

    switch (agentId) {
      case "grammar":
        systemInstruction = "Analiza este texto en español y detecta errores gramaticales, ortográficos y de puntuación. Responde exclusivamente con la estructura JSON indicada.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING },
                  original: { type: Type.STRING },
                  sugerencia: { type: Type.STRING },
                  nota: { type: Type.STRING }
                },
                required: ["tipo", "original", "sugerencia", "nota"]
              }
            }
          },
          required: ["resumen", "issues"]
        };
        break;
        
      case "style":
        systemInstruction = "Analiza el estilo literario de este texto en español: voz narrativa, tono, ritmo y registro. Identifica áreas de mejora estética y responde con el esquema JSON indicado.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING },
                  original: { type: Type.STRING },
                  sugerencia: { type: Type.STRING },
                  nota: { type: Type.STRING }
                },
                required: ["tipo", "original", "sugerencia", "nota"]
              }
            }
          },
          required: ["resumen", "issues"]
        };
        break;

      case "clarity":
        systemInstruction = "Analiza la claridad, estructura y coherencia de este texto en español. Identifica incongruencias o fragmentos confusos y responde con el esquema JSON indicado.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING },
                  original: { type: Type.STRING },
                  sugerencia: { type: Type.STRING },
                  nota: { type: Type.STRING }
                },
                required: ["tipo", "original", "sugerencia", "nota"]
              }
            }
          },
          required: ["resumen", "issues"]
        };
        break;

      case "dialogue":
        systemInstruction = "Analiza los diálogos o estilo indirecto del texto en español: naturalidad, voz y ritmo de alternancias. Responde según el esquema JSON indicado.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING },
                  original: { type: Type.STRING },
                  sugerencia: { type: Type.STRING },
                  nota: { type: Type.STRING }
                },
                required: ["tipo", "original", "sugerencia", "nota"]
              }
            }
          },
          required: ["resumen", "issues"]
        };
        break;

      case "characters":
        systemInstruction = "Analiza la psicología, arcos de desarrollo y consistencia de los personajes de este texto en español. Responde según el esquema de personajes en JSON.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            personajes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING },
                  fortaleza: { type: Type.STRING },
                  observacion: { type: Type.STRING },
                  sugerencia: { type: Type.STRING }
                },
                required: ["nombre", "fortaleza", "observacion", "sugerencia"]
              }
            }
          },
          required: ["resumen", "personajes"]
        };
        break;

      case "genre":
        systemInstruction = "Analiza el texto desde la perspectiva de su género y estilo literario (Realismo mágico, romántico, fantástico, etc.). Identifica elementos clave de identidad estética y responde con el formato JSON indicado.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            genero: { type: Type.STRING },
            elementos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING },
                  observacion: { type: Type.STRING },
                  sugerencia: { type: Type.STRING }
                },
                required: ["tipo", "observacion", "sugerencia"]
              }
            }
          },
          required: ["resumen", "genero", "elementos"]
        };
        break;

      case "emotion":
        systemInstruction = "Eres un lector beta entusiasta y analítico. Evalúa la verosimilitud, resonancia emocional y fuerza dramática del texto en español. Responde en formato JSON.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            impacto_emocional: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING },
                  observacion: { type: Type.STRING },
                  sugerencia: { type: Type.STRING }
                },
                required: ["tipo", "observacion", "sugerencia"]
              }
            }
          },
          required: ["resumen", "impacto_emocional", "issues"]
        };
        break;

      case "illustration":
        systemInstruction = "Eres un director de arte literario analizando la atmósfera visual. Identifica las escenas que merecen ser ilustradas y detalla prompts de alta fidelidad. Responde en JSON.";
        schema = {
          type: Type.OBJECT,
          properties: {
            resumen: { type: Type.STRING },
            estilo_recomendado: { type: Type.STRING },
            paleta_general: { type: Type.STRING },
            escenas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  descripcion_visual: { type: Type.STRING },
                  prompt_ilustracion: { type: Type.STRING },
                  paleta: { type: Type.STRING },
                  atmosfera: { type: Type.STRING }
                },
                required: ["titulo", "descripcion_visual", "prompt_ilustracion", "paleta", "atmosfera"]
              }
            }
          },
          required: ["resumen", "estilo_recomendado", "paleta_general", "escenas"]
        };
        break;

      default:
        return res.status(400).json({ error: "Invalid agentId" });
    }

    const response = await generateUniversalContent({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text }] }],
      responseMimeType: "application/json",
      responseSchema: schema,
      reqHeaders: req.headers
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Error in /api/editorial-audit:", error);
    res.status(500).json({ error: error.message || "Internal Server Error in audit agent" });
  }
});

// Endpoint for Localization / Adaptative Translation Department
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Missing text or targetLanguage parameter" });
    }

    const systemInstruction = `You are the specialized Editorial Localization and Translation Department.
Your task is to translate and adapt the provided literary content into ${targetLanguage}.
CRITICAL: Maintain the exact feeling, rhythm, emotion, tone, and formatting of the story. Ensure it sounds completely natural and professional in the target language.`;

    const response = await generateUniversalContent({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text: `Translate this text: \n\n${text}` }] }],
      reqHeaders: req.headers
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/translate:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint for Web Publishing and CMS Distribution (WordPress / Webflow Integration Simulation)
app.post("/api/publish-cms", async (req, res) => {
  try {
    const { title, content, webhookUrl, platform } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Missing title or content parameter" });
    }

    let realCallStatus = "No se ha proporcionado webhook de producción.";
    if (webhookUrl && webhookUrl.startsWith("http")) {
      try {
        const fetchRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            body: content,
            status: "draft",
            platform: platform || "WordPress"
          }),
          signal: AbortSignal.timeout(4000) // 4 seconds timeout
        });
        realCallStatus = `Conexión exitosa. El servidor de ${platform || "WordPress"} respondió con código de estado HTTP: ${fetchRes.status}`;
      } catch (err: any) {
        realCallStatus = `Intento de conexión del webhook devuelto con error de red local: ${err.message}`;
      }
    }

    const slug = title.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, "-") // non alphanumeric mapping
      .replace(/(^-|-$)+/g, "");

    res.json({
      success: true,
      platform: platform || "WordPress",
      status: "PUBLICADO EN ESTADO DE BORRADOR",
      realCallStatus,
      publishDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      slug,
      publicUrl: `https://${(platform || "WordPress").toLowerCase()}.prensa-aura.com/borradores/${slug}`
    });
  } catch (error: any) {
    console.error("Error in /api/publish-cms:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Serve Frontend using Vite Middleware in Dev, or static production files in Prod
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Editorial Intelligence App is listening on port ${PORT}`);
  });
}

setupVite().catch(err => {
  console.error("Failed to initialize Vite server middleware:", err);
});
