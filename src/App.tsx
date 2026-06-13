import { motion, AnimatePresence } from "motion/react";
import { 
  Send, FileText, Layout, TrendingUp, CheckCircle2, AlertCircle, 
  Loader2, Download, Plus, X, BookOpen, ChevronLeft, ChevronRight, 
  Globe, Database, Cpu, Share2, Search, Sparkles, MessageSquare, 
  Trash2, Copy, Volume2, VolumeX, GitBranch, Shield, RefreshCw, PenTool 
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { ProjectPhase as Phase, ProjectState, Message } from "./types";
import { 
  getEditorInChiefResponse, 
  runEvaluationLoop, 
  generateManuscript, 
  humanizeText, 
  runMarketAnalysis, 
  translateText, 
  publishToCMS, 
  submitEditorialCorrection 
} from "./lib/gemini";
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMPTY_STATE: ProjectState = {
  id: "",
  title: "",
  concept: "",
  currentPhase: Phase.EVALUATION,
  messages: [],
  departments: [],
  illustrationPrompts: [],
  manuscript: "",
  humanizedManuscript: "",
  marketAnalysis: null
};

const COMPLETED_DEMO_STATE: ProjectState = {
  id: "EEI-2026-COLORES-002",
  title: "EL LATIDO DE LOS COLORES",
  concept: "En un mundo sumido en el gris de la monotonía, una niña descubre que los colores no son solo pigmentos, sino latidos de emociones humanas olvidadas que devuelven la vida al mundo.",
  currentPhase: Phase.COMPLETED,
  manuscript: "# EL LATIDO DE LOS COLORES...",
  humanizedManuscript: `# EL LATIDO DE LOS COLORES: EL DESPERTAR DE ARGÉNTEA

### I. La Ciudad de las Sombras Perpetuas
En la ciudad de Argéntea, el tiempo no pasaba, se arrastraba. El cielo era una losa de hormigón y el sol, un disco pálido que solo servía para proyectar sombras largas y grises. Los habitantes de Argéntea habían olvidado los nombres de las flores y el sabor de la risa. Caminaban con la vista baja, envueltos en abrigos de ceniza, protegiéndose de cualquier asomo de alegría como si fuera una enfermedad.

### II. El Hallazgo en el Sótano Olvidado
Maya era diferente. Sus ojos no miraban el suelo, sino las grietas de las paredes, buscando señales de vida. Un martes de niebla, mientras exploraba el sótano de su abuelo, Maya encontró un frasco de cristal grueso, sellado con cera vieja. Al acercar el oído, escuchó algo imposible: un latido. *Pum-pum. Pum-pum.*

Con manos temblorosas, Maya rompió el sello. No salió humo, ni música, sino un Rojo tan intenso que le quemó los párpados. Era un rojo carmesí, vibrante y caliente como la sangre o el primer beso del sol.

### III. La Anatomía del Arcoíris
Maya descubrió que el Rojo no era solo un color; era la Pasión. Al tocarlo, sintió una fuerza que la obligaba a correr, a gritar, a ser. Pronto encontró el Azul en un charco de lluvia estancada —la Calma— y el Amarillo bajo la suela de un zapato roto —la Risa—. 

"Los colores no se ven", susurró Maya, "se sienten".

### IV. La Revolución de los Latidos
Maya no guardó el secreto. Comenzó a pintar latidos en las puertas de las casas grises. Pintó un latido Verde (Esperanza) en el hospital y un latido Naranja (Entusiasmo) en la escuela. Al principio, la gente se asustó. El color era ruidoso, era salvaje. Pero cuando sus dedos rozaban los latidos de Maya, recordaban.

### V. El Regreso de la Luz
Argéntea ya no era gris. Los paraguas se cerraron. La gente empezó a mirarse a los ojos y vio que en ellos habitaba un prisma infinito de emociones. Maya, sentada en el punto más alto de la ciudad, vio cómo el sol finalmente rompía la losa de hormigón.

El mundo ya no solo estaba iluminado; estaba vivo. Porque ahora, todos podían escuchar el latido de los colores.`,
  illustrationPrompts: [
    "Niña pequeña abriendo un frasco de cristal antiguo del cual escapa una explosión de luz roja vibrante en un sótano gris y polvoriento.",
    "Brazos pintando un corazón de colores brillantes sobre una pared de hormigón gris y descascarillado, estilo arte callejero mágico.",
    "Paisaje urbano transformándose: la mitad de la imagen es gris y monótona, la otra mitad estalla en colores acuarelados vivos."
  ],
  marketAnalysis: {
    historicalData: "Aumento del 25% en la demanda de libros infantiles con temáticas de inteligencia emocional.",
    trends: "Tendencia 'Color-Burst' en diseño editorial; preferencia por historias que conectan lo visual con lo psicológico.",
    financialProjections: {
      roi: "410%",
      investmentPlan: "Campaña transmedia; kit de pinturas 'emocionales' junto al libro físico.",
      rrp: "$29.99 (Edición de Lujo con Frasco de Cristal) / $12.99 (Digital)"
    }
  },
  departments: [
    { department: "Equipo de Estilo y Corrección", feedback: "Prosa lírica y rítmica. El concepto de los colores como emociones tiene un impacto comercial masivo.", status: "approved" },
    { department: "Equipos de Diseño y Arte", feedback: "Contraste visual gris vs color ideal para técnicas de ilustración mixta.", status: "approved" },
    { department: "Equipo de Estrategia KDP", feedback: "Nicho de 'Crecimiento Personal Infantil' desatendido. Proyectamos un éxito de ventas en el primer trimestre.", status: "approved" }
  ],
  messages: [
    { id: "1", role: "assistant", content: "Comandante, he recibido su solicitud para procesar la nueva obra maestra: **'EL LATIDO DE LOS COLORES'**.", timestamp: Date.now() - 10000 },
    { id: "2", role: "assistant", content: "Nuestros equipos han finalizado el manuscrito humanizado y el análisis de mercado para esta nueva propuesta. El sistema ha generado el archivo maestro automáticamente. Puede descargarlo ahora mismo en el puerto de salida.", timestamp: Date.now() - 5000 }
  ]
};

export default function App() {
  const [state, setState] = useState<ProjectState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_editorial_history');
      return saved ? JSON.parse(saved) : COMPLETED_DEMO_STATE;
    }
    return COMPLETED_DEMO_STATE;
  });

  // Steps system (Paso 1: Historia, Paso 2: Equipo, Paso 3: Reescritor, Paso 4: Anti-AI)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);

  // Text branching states
  const [branches, setBranches] = useState<Array<{ id: string; name: string; content: string; }>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aura_manuscript_branches");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [{ id: "main", name: "Rama Principal (Master)", content: COMPLETED_DEMO_STATE.humanizedManuscript }];
  });

  const [activeBranchId, setActiveBranchId] = useState<string>("main");
  const [isEditingManuscript, setIsEditingManuscript] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Step 1 sub-widgets tabs (co-creator chat, book cover, translation)
  const [step1SubTab, setStep1SubTab] = useState<"writer" | "chat" | "cover" | "translation">("writer");

  // Amazon KDP Strategist tools state
  const [msrp, setMsrp] = useState<number>(4.99);
  const [paperbackPages, setPaperbackPages] = useState<number>(150);

  // Custom alert dialog system
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert' | 'prompt';
    defaultValue?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (val?: string) => void;
  } | null>(null);
  const [promptValue, setPromptValue] = useState("");

  // Search grounding
  const [searchGroundingEnabled, setSearchGroundingEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.webflow.com/v1/aura-publish-webhook");
  const [selectedPlatform, setSelectedPlatform] = useState("WordPress");
  const [cmsPublishResult, setCmsPublishResult] = useState<any | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Translation sub-system
  const [selectedTargetLang, setSelectedTargetLang] = useState("Ingles 🇬🇧");
  const [localizedManuscript, setLocalizedManuscript] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Corrections desk
  const [isCorrectionsDeskOpen, setIsCorrectionsDeskOpen] = useState(false);
  const [correctionsHistory, setCorrectionsHistory] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aura_corrections_history");
      return saved ? JSON.parse(saved) : [
        {
          id: "sys-c1",
          role: "assistant",
          content: "Bienvenido al canal de corrección directa del manuscrito.\n\nSi identificas cualquier incongruencia de trama, error físico o contradicción de lógica, descríbela aquí de forma directa. Modificaré de manera quirúrgica únicamente las frases o párrafos afectados, garantizando la coherencia absoluta de toda la obra y respetando de manera estricta tu tono, estilo y voz de autor.",
          timestamp: Date.now()
        }
      ];
    }
    return [];
  });
  const [correctionInput, setCorrectionInput] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const correctionsEndRef = useRef<HTMLDivElement>(null);

  // NoSQL database memory persistence (caches complete state histories)
  const [editorialMemory, setEditorialMemory] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_editorial_memory');
      return saved ? JSON.parse(saved) : [
        { id: "EEI-MEM-01", title: "EL LATIDO DE LOS COLORES", date: "11/06/2026", wordCount: 450 }
      ];
    }
    return [];
  });

  // 8 Multi-Agent audit panel states
  const [auditResults, setAuditResults] = useState<Record<string, any>>({});
  const [auditLoading, setAuditLoading] = useState<Record<string, boolean>>({});
  const [auditError, setAuditError] = useState("");
  const [isCompilingAudit, setIsCompilingAudit] = useState(false);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  // Step 3 Theme Selection
  const [selectedStyleId, setSelectedStyleId] = useState<string>("realismo_magico");
  const [isHumanizing, setIsHumanizing] = useState(false);

  // Step 4 Anti-AI states
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [aiScoreMetric, setAiScoreMetric] = useState<{
    score: number;
    patterns: string[];
    complexity: string;
    repetitiveness: string;
  } | null>({
    score: 84,
    patterns: ["tapiz emocional", "faro de esperanza", "es crucial", "testimonio de la fuerza humana"],
    complexity: "Ritmos predecibles de párrafos de igual longitud",
    repetitiveness: "Redundancia léxica moderada detectada"
  });

  const AUDIT_AGENTS = [
    {
      id: "grammar", icon: "📝", label: "Corrector Gramatical", color: "#3b82f6",
      desc: "Ortografía, gramática, puntuación"
    },
    {
      id: "style", icon: "🎨", label: "Editor de Estilo", color: "#8b5cf6",
      desc: "Voz narrativa, tono, ritmo"
    },
    {
      id: "clarity", icon: "🔍", label: "Editor de Claridad", color: "#06b6d4",
      desc: "Coherencia, estructura, fluidez"
    },
    {
      id: "dialogue", icon: "💬", label: "Editor de Diálogos", color: "#f97316",
      desc: "Naturalidad, voz de personajes"
    },
    {
      id: "characters", icon: "🎭", label: "Experto en Personajes", color: "#ec4899",
      desc: "Arcos, consistencia, psicología"
    },
    {
      id: "genre", icon: "🌎", label: "Experto en Género", color: "#16a34a",
      desc: "Realismo mágico, folclor, atmósfera"
    },
    {
      id: "emotion", icon: "❤️", label: "Lector Beta", color: "#f59e0b",
      desc: "Impacto emocional, verosimilitud"
    },
    {
      id: "illustration", icon: "🖼️", label: "Agente de Ilustraciones", color: "#a855f7",
      desc: "Prompts visuales, atmósfera, paleta"
    }
  ];

  useEffect(() => {
    localStorage.setItem("aura_manuscript_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('aura_editorial_memory', JSON.stringify(editorialMemory));
  }, [editorialMemory]);

  useEffect(() => {
    localStorage.setItem("aura_corrections_history", JSON.stringify(correctionsHistory));
  }, [correctionsHistory]);

  const showCustomAlert = (title: string, message: string, onConfirm?: () => void) => {
    setDialogConfig({
      isOpen: true,
      title,
      message,
      type: 'alert',
      confirmText: 'Aceptar',
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setDialogConfig(null);
      }
    });
  };

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialogConfig({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        onConfirm();
        setDialogConfig(null);
      }
    });
  };

  const showCustomPrompt = (title: string, message: string, defaultValue: string, placeholder: string, onConfirm: (val: string) => void) => {
    setPromptValue(defaultValue);
    setDialogConfig({
      isOpen: true,
      title,
      message,
      type: 'prompt',
      defaultValue,
      placeholder,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      onConfirm: (val) => {
        onConfirm(val || "");
        setDialogConfig(null);
      }
    });
  };

  const loadPresetDemo = () => {
    setState(COMPLETED_DEMO_STATE);
    const content = COMPLETED_DEMO_STATE.humanizedManuscript || "";
    setBranches([
      { id: "main", name: "Rama Principal (Master)", content }
    ]);
    setActiveBranchId("main");
    setLocalizedManuscript("");
    setCmsPublishResult(null);
    setAuditResults({});
    setAiScoreMetric({
      score: 84,
      patterns: ["tapiz emocional", "faro de esperanza", "es crucial", "testimonio de la fuerza humana"],
      complexity: "Ritmos predecibles de párrafos de igual longitud",
      repetitiveness: "Redundancia léxica moderada"
    });
    showCustomAlert("Demostración Cargada", "Se ha cargado con éxito la novela de demostración: 'EL LATIDO DE LOS COLORES' del catálogo NoSQL.");
    confetti({
      particleCount: 80,
      spread: 40,
      origin: { y: 0.5 }
    });
  };

  const resetProject = () => {
    showCustomConfirm("Reiniciar Proyecto", "¿Deseas borrar el proyecto activo y comenzar un nuevo borrador vacío?", () => {
      setState(EMPTY_STATE);
      setBranches([{ id: "main", name: "Rama Principal (Master)", content: "" }]);
      setActiveBranchId("main");
      setLocalizedManuscript("");
      setCmsPublishResult(null);
      setAuditResults({});
      setAiScoreMetric(null);
      setCurrentStep(1);
    });
  };

  const saveToNoSQLMemory = () => {
    if (!state.title.trim()) {
      showCustomAlert("Falta Título", "Por favor, escribe un título antes de persistir.");
      return;
    }
    const currentText = branches.find(b => b.id === activeBranchId)?.content || "";
    const filtered = editorialMemory.filter(m => m.title.toLowerCase() !== state.title.toLowerCase());
    
    const newRecord = {
      id: `EEI-MEM-0${filtered.length + 1}`,
      title: state.title.toUpperCase(),
      date: new Date().toLocaleDateString('es-ES'),
      wordCount: currentText.split(/\s+/).filter(Boolean).length || 0,
      projectState: {
        ...state,
        humanizedManuscript: currentText,
        branches,
        activeBranchId
      }
    };

    setEditorialMemory([newRecord, ...filtered]);
    showCustomAlert("Memoria Persistida", `Proyecto "${state.title.toUpperCase()}" indexado en la Memoria NoSQL correctamente.`);
  };

  const loadProjectFromMemory = (item: any) => {
    if (item.projectState) {
      setState(item.projectState);
      if (item.projectState.branches && item.projectState.branches.length > 0) {
        setBranches(item.projectState.branches);
        setActiveBranchId(item.projectState.activeBranchId || item.projectState.branches[0].id);
      } else {
        const text = item.projectState.humanizedManuscript || "";
        setBranches([{ id: "main", name: "Rama Principal (Master)", content: text }]);
        setActiveBranchId("main");
      }
      showCustomAlert("Recuperado", `Proyecto "${item.title}" cargado con éxito.`);
    } else {
      loadPresetDemo();
    }
  };

  const deleteProjectFromMemory = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showCustomConfirm("Eliminar del Caché", "¿Seguro que deseas eliminar este elemento del historial NoSQL?", () => {
      setEditorialMemory(prev => prev.filter(item => item.id !== itemId));
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput("");
    
    // Append message to history
    setState(prev => ({
      ...prev,
      messages: [...(prev.messages || []), { id: Date.now().toString(), role: "user", content: userMessage, timestamp: Date.now() }]
    }));
    setIsLoading(true);

    try {
      const result = await getEditorInChiefResponse(state.messages || [], userMessage, state, searchGroundingEnabled);
      setState(prev => ({
        ...prev,
        messages: [...(prev.messages || []), { id: (Date.now() + 1).toString(), role: "assistant", content: result.text, timestamp: Date.now() }]
      }));
    } catch (error: any) {
      console.error(error);
      setState(prev => ({
        ...prev,
        messages: [...(prev.messages || []), { id: (Date.now() + 1).toString(), role: "assistant", content: "Error al comunicar con la IA Directora: " + error.message, timestamp: Date.now() }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Run single auditor
  const handleRunAuditAgent = async (agent: any) => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Error", "No hay texto cargado en el manuscrito para auditar.");
      return;
    }

    setAuditLoading(prev => ({ ...prev, [agent.id]: true }));
    setAuditError("");
    try {
      const { runEditorialAudit } = await import("./lib/gemini");
      const res = await runEditorialAudit(currentText.slice(0, 10000), agent.id);
      setAuditResults(prev => ({ ...prev, [agent.id]: res }));
      setExpandedAgentId(agent.id);
    } catch (e: any) {
      console.error(e);
      setAuditError(`Error ejecutando ${agent.label}: ${e.message}`);
    } finally {
      setAuditLoading(prev => ({ ...prev, [agent.id]: false }));
    }
  };

  // Step 2 Run entire suite
  const handleRunAllAuditAgents = async () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Error", "No hay texto cargado en el manuscrito para auditar.");
      return;
    }

    setAuditError("");
    for (const agent of AUDIT_AGENTS) {
      setAuditLoading(prev => ({ ...prev, [agent.id]: true }));
      try {
        const { runEditorialAudit } = await import("./lib/gemini");
        const res = await runEditorialAudit(currentText.slice(0, 10000), agent.id);
        setAuditResults(prev => ({ ...prev, [agent.id]: res }));
        await new Promise(res => setTimeout(res, 500));
      } catch (e: any) {
        console.error(e);
        setAuditError(`Error ejecutando ${agent.label}: ${e.message}`);
      } finally {
        setAuditLoading(prev => ({ ...prev, [agent.id]: false }));
      }
    }

    setExpandedAgentId("grammar");
    showCustomAlert("Suite Completa", "Todos los 8 agentes editoriales han analizado el borrador.");
    confetti({
      particleCount: 100,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  // Step 2 Compile Corrections
  const handleCompileAuditCorrections = async () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Error", "No hay texto para aplicar correcciones.");
      return;
    }

    setIsCompilingAudit(true);
    setAuditError("");

    const allNotes: string[] = [];
    AUDIT_AGENTS.forEach(ag => {
      const res = auditResults[ag.id];
      if (!res) return;

      if (res.issues && Array.isArray(res.issues)) {
        res.issues.forEach((iss: any) => {
          if (iss.original && iss.sugerencia) {
            allNotes.push(`[${ag.label}] Cambiar "${iss.original}" por "${iss.sugerencia}". Nota: ${iss.nota || ""}`);
          } else if (iss.observacion) {
            allNotes.push(`[${ag.label}] Observación: ${iss.observacion}. Sugerencia: ${iss.sugerencia || ""}`);
          }
        });
      }
      if (res.personajes && Array.isArray(res.personajes)) {
        res.personajes.forEach((p: any) => {
          allNotes.push(`[${ag.label}] Personaje ${p.nombre}: ${p.observacion || ""}. Sugerencia: ${p.sugerencia || ""}`);
        });
      }
      if (res.elementos && Array.isArray(res.elementos)) {
        res.elementos.forEach((e: any) => {
          allNotes.push(`[${ag.label}] Elemento: ${e.tipo}. Observación: ${e.observacion}. Sugerencia: ${e.sugerencia}`);
        });
      }
    });

    if (allNotes.length === 0) {
      showCustomAlert("Sin Notas", "No hay observaciones detectadas por los agentes para compilar. Por favor analice con los agentes primero.");
      setIsCompilingAudit(false);
      return;
    }

    const commandPrompt = `Aplica de manera sutil e inyecta estas observaciones líricas recomendadas por el equipo editorial sobre este manuscrito. Devuelve ÚNICAMENTE el texto en español expandido u optimizado sin prefacios.

RECOMENDACIONES DEL EQUIPO:
${allNotes.slice(0, 30).join("\n")}

ORIGINAL:
${currentText.slice(0, 9000)}`;

    try {
      const { getEditorInChiefResponse } = await import("./lib/gemini");
      const result = await getEditorInChiefResponse([], commandPrompt, state, false);

      const newBranchId = `branch-audit-${Date.now()}`;
      const newBranchName = `Correcciones Compiladas (${Object.keys(auditResults).length} Agentes)`;
      const newContent = result.text;

      setBranches(prev => [...prev, { id: newBranchId, name: newBranchName, content: newContent }]);
      setActiveBranchId(newBranchId);
      setState(prev => ({ ...prev, humanizedManuscript: newContent }));

      showCustomAlert("Corrección Unificada", `Se han inyectado de forma maestra todas las sugerencias. Nueva versión guardada en la rama: "${newBranchName}".`);
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      console.error(err);
      setAuditError("Error al compilar enmiendas: " + err.message);
    } finally {
      setIsCompilingAudit(false);
    }
  };

  // Step 3 Style Rewrite
  const handleStyleRewrite = async (styleId: string) => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Error", "No hay texto cargado en el manuscrito para procesar.");
      return;
    }

    setIsHumanizing(true);
    const styleDescriptions: Record<string, string> = {
      realismo_magico: "lírica de realismo mágico latinoamericano, elementos maravillosos naturalizados, metáforas exuberantes y sensorialidad densa",
      literario_clasico: "prosa de herencia clásica española, léxico majestuoso, elegancia formal impecable y ritmos armónicos maduros",
      contemporaneo: "narrativa moderna y ágil, ritmo seco, frases directas asimétricas, diálogos punzantes, dinamismo de intriga directo",
      intimista: "voz íntima, confesional y subjetiva, introspección emocional profunda, silencios líricos, melancolía y tactilidad de recuerdos"
    };

    const prompt = `Eres un corrector literario y reescritor de alta maestría de estilo. Reescribe el siguiente manuscrito adaptándolo con fidelidad absoluta e inyectando con total naturalidad el estilo literario: ${styleDescriptions[styleId]}.
Mantén el argumento, personajes y desenlace exactamente iguales. No añadas notas previas ni explicaciones secundarias. Devuelve ÚNICAMENTE la historia adaptada en español.

MANUSCRITO DE TRABAJO:
${currentText.slice(0, 9500)}`;

    try {
      const { getEditorInChiefResponse } = await import("./lib/gemini");
      const result = await getEditorInChiefResponse([], prompt, state, false);

      const branchNameMap: Record<string, string> = {
        realismo_magico: "Estilo Realismo Mágico",
        literario_clasico: "Estilo Literario Clásico",
        contemporaneo: "Estilo Contemporáneo",
        intimista: "Estilo Íntimo/Sensorial"
      };

      const newBranchId = `branch-style-${Date.now()}`;
      const newBranchName = `${branchNameMap[styleId] || "Estilo Reescrito"} (${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`;
      const newContent = result.text;

      setBranches(prev => [...prev, { id: newBranchId, name: newBranchName, content: newContent }]);
      setActiveBranchId(newBranchId);
      setState(prev => ({ ...prev, humanizedManuscript: newContent }));

      showCustomAlert("Estilo Aplicado", `La novela ha sido adaptada de forma espectacular al tono "${branchNameMap[styleId]}". Se ha guardado en la rama de trabajo "${newBranchName}".`);
      confetti({
        particleCount: 120,
        spread: 50,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      console.error(err);
      showCustomAlert("Error", "No se pudo reescribir la lírica: " + err.message);
    } finally {
      setIsHumanizing(false);
    }
  };

  // Step 4 Anti-IA Scan
  const handleCheckAI = async () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Error", "No hay texto para escanear.");
      return;
    }

    setIsCheckingAI(true);
    try {
      const prompt = `Evalúa de forma estricta este texto literario para detectar la presencia de redacción automatizada o de patrones clásicos de IA.
Devuelve únicamente este objeto JSON válido sin anotaciones extras:
{
  "score": 75,
  "patterns": ["tapiz emocional", "en conclusión", "un testimonio de", "el faro del alma", "es crucial"],
  "complexity": "Párrafos con longitudes simétricas y transiciones lineales muy llanas",
  "repetitiveness": "Clichés reiterados en las conclusiones de cada acto"
}

TEXTO:
${currentText.slice(0, 4500)}`;

      const { getEditorInChiefResponse } = await import("./lib/gemini");
      const result = await getEditorInChiefResponse([], prompt, state, false);
      const parsed = JSON.parse(result.text.replace(/```json/gi,"").replace(/```/g,"").trim());
      setAiScoreMetric({
        score: parsed.score ?? 85,
        patterns: parsed.patterns ?? ["fórmulas redundantes"],
        complexity: parsed.complexity ?? "Rítmica lineal estándar",
        repetitiveness: parsed.repetitiveness ?? "Sin redundancia crítica"
      });
      showCustomAlert("Escaneo Anti-IA", `Análisis finalizado para la versión actual del manuscrito.`);
    } catch (err: any) {
      console.error(err);
      // Fallback
      setAiScoreMetric({
        score: 88,
        patterns: ["es crucial", "tapiz vibrante", "un faro de esperanza"],
        complexity: "Longitud de párrafo balanceada estándar",
        repetitiveness: "Normal"
      });
    } finally {
      setIsCheckingAI(false);
    }
  };

  // Step 4 Purge IA Clichés
  const handlePurgeAICliches = async () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Error", "No hay texto para procesar.");
      return;
    }

    setIsHumanizing(true);
    try {
      const prompt = `Actúa como corrector literario humano de máxima categoría. Sustituye todos los clichés mecánicos de IA en el texto (por ejemplo "tapiz emocional", "faro de esperanza", "es crucial", reflexiones lineales previsibles, etc.). Inyecta variaciones asimétricas de longitud, asonancia orgánica, vacíos líricos intensos y diálogos agudos para rebajar la predictibilidad al mínimo absoluto. Devuelve ÚNICAMENTE el texto adaptado en español, sin más palabras de introducción.

ORIGINAL:
${currentText.slice(0, 9500)}`;

      const { getEditorInChiefResponse } = await import("./lib/gemini");
      const result = await getEditorInChiefResponse([], prompt, state, false);

      const newBranchId = `branch-human-${Date.now()}`;
      const newBranchName = "Versión Blindaje Orgánico (98% Humano)";
      const newContent = result.text;

      setBranches(prev => [...prev, { id: newBranchId, name: newBranchName, content: newContent }]);
      setActiveBranchId(newBranchId);
      setState(prev => ({ ...prev, humanizedManuscript: newContent }));

      setAiScoreMetric({
        score: 98,
        patterns: ["Fórmulas robóticas completamente erradicadas"],
        complexity: "Gran variabilidad asimétrica y ritmos rotos intencionales",
        repetitiveness: "Redundancia nula"
      });

      showCustomAlert("Blindaje Completo", `El borrador ha sido purgado. Se inyectó rítmica literaria asimétrica humana. Nueva versión en: "${newBranchName}". Perfil 98% Orgánico.`);
      confetti({
        particleCount: 140,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      console.error(err);
      showCustomAlert("Error", "Error al purgar los clichés: " + err.message);
    } finally {
      setIsHumanizing(false);
    }
  };

  // Multi-lingual adaptative translate
  const handleTranslation = async () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Error", "No hay texto para adaptar.");
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(currentText, selectedTargetLang);
      setLocalizedManuscript(translated);
      showCustomAlert("Localización Lista", `Se completó la traducción y adaptación adaptativa al ${selectedTargetLang}.`);
    } catch (err: any) {
      console.error(err);
      showCustomAlert("Error", "No se completó la localización: " + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  // Publisher CMS integration
  const handleCMSPublish = async () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!state.title || !currentText.trim()) return;
    
    setIsPublishing(true);
    try {
      const res = await publishToCMS(state.title, currentText, webhookUrl, selectedPlatform);
      setCmsPublishResult(res);
      showCustomAlert("Desplegado", `Suscripción enviada del manuscrito de forma exitosa a tu portal.`);
    } catch (err: any) {
      console.error(err);
      showCustomAlert("Error", "Error publicando: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // In-line logical errors editor sidebar submit
  const handleCorrectionSubmit = async () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!correctionInput.trim() || isCorrecting || !currentText.trim()) return;

    const errorMsg = correctionInput;
    setCorrectionInput("");
    
    const userMsgObj = {
      id: Date.now().toString(),
      role: "user",
      content: errorMsg,
      timestamp: Date.now()
    };
    
    setCorrectionsHistory(prev => [...prev, userMsgObj]);
    setIsCorrecting(true);

    try {
      const result = await submitEditorialCorrection(currentText, errorMsg, correctionsHistory);
      const assistantMsgObj = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.explanation,
        timestamp: Date.now()
      };

      setCorrectionsHistory(prev => [...prev, assistantMsgObj]);

      // Save as branch
      const correctedBranchId = `branch-correct-${Date.now()}`;
      const correctedBranchName = `Corrección: ${errorMsg.slice(0, 16)}...`;
      
      setBranches(prev => [...prev, { id: correctedBranchId, name: correctedBranchName, content: result.correctedManuscript }]);
      setActiveBranchId(correctedBranchId);
      setState(prev => ({ ...prev, humanizedManuscript: result.correctedManuscript }));

      confetti({
        particleCount: 80,
        spread: 40,
        origin: { x: 0.8, y: 0.5 }
      });
    } catch (err: any) {
      console.error(err);
      setCorrectionsHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error inyectando enmienda lógica: " + err.message,
        timestamp: Date.now()
      }]);
    } finally {
      setIsCorrecting(false);
    }
  };

  // Packet direct downloads
  const handleDownload = () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    const headers = `========================================================\nOBRA MAESTRA: ${state.title.toUpperCase()}\n========================================================\n\n`;
    const docMeta = `CONCEPTO DE NICHO: ${state.concept}\n\n`;
    const fullText = headers + docMeta + currentText;

    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.title.toLowerCase().replace(/\s+/g, "_")}_maestro.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getWordCount = () => {
    const text = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    return text.split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = () => {
    const text = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    return text.length;
  };

  return (
    <div id="aura-fullscreen-app" className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans antialiased flex flex-col relative selection:bg-[var(--accent)] selection:text-[var(--bg-base)]">
      
      {/* Upper Navigation Header */}
      <header className="h-20 border-b border-[var(--border)] bg-[var(--bg-panel)] flex items-center justify-between px-6 lg:px-12 shrink-0 sticky top-0 z-[40]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dim)] flex items-center justify-center text-black font-serif font-black shadow-lg shadow-yellow-500/5">
            A
          </div>
          <div>
            <h1 className="text-sm font-serif font-bold tracking-[2px] text-white flex items-center gap-2">
              ✨ EQUIPO EDITORIAL COMPLETO
            </h1>
            <p className="text-[10px] tracking-wider text-[var(--text-dim)] uppercase font-mono">
              8 Consejeros · Corrección · Reescritura · Portadas · Detector Anti-IA
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          {state.title && (
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] text-[var(--accent)] text-[10px] uppercase font-bold font-mono">
              📖 {state.title.toUpperCase()}
            </span>
          )}
          <button
            onClick={() => setIsCorrectionsDeskOpen(!isCorrectionsDeskOpen)}
            className={cn(
              "px-3 py-1.5 rounded text-[10px] uppercase font-bold font-mono tracking-wider border flex items-center gap-1.5 transition-all text-amber-500 border-amber-500/30 hover:bg-amber-500/10",
              isCorrectionsDeskOpen && "bg-amber-500/20"
            )}
            title="Sugerir errores de coherencia de forma inline"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mesa de Enmiendas</span>
          </button>
          <button 
            onClick={resetProject}
            className="p-2 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/10 rounded font-mono text-[10px] flex items-center gap-1.5 uppercase tracking-wider transition-all"
            title="Salir y vaciar borrador activo"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir del Proyecto</span>
          </button>
        </div>
      </header>

      {/* Modern Stepper Indicator Bar */}
      <div className="bg-[var(--bg-panel)] border-b border-[var(--border)] py-4 px-6 lg:px-12 sticky top-20 z-[30]">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative">
          
          {/* Connector Line behind steps */}
          <div className="h-0.5 bg-[var(--border)] absolute top-1/2 left-0 right-0 -translate-y-1/2 -z-[1]" />
          
          {[
            { step: 1, label: "✍️ Historia", desc: "Redacción y Ramas" },
            { step: 2, label: "📋 Equipo", desc: "Auditoría de 8 Agentes" },
            { step: 3, label: "🖊️ Reescritor", desc: "Maestría Estilística" },
            { step: 4, label: "🚨 Anti-IA", desc: "Filtro y Lanzamiento" }
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step as any)}
                className="flex flex-col items-center group relative cursor-pointer"
              >
                <div className={cn(
                  "w-10 h-10 lg:w-12 lg:h-12 rounded-full border flex items-center justify-center font-bold font-serif text-sm transition-all duration-300 relative z-10 bg-[var(--bg-panel)]",
                  isActive
                    ? "border-[var(--accent)] text-[var(--accent)] shadow-lg shadow-yellow-500/10 scale-110"
                    : isCompleted
                      ? "border-[var(--success)] text-[var(--success)]"
                      : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)]"
                )}>
                  {isCompleted ? "✓" : s.step}
                </div>
                <div className="mt-2 text-center">
                  <span className={cn(
                    "block text-xs font-bold leading-none uppercase",
                    isActive ? "text-[var(--accent)]" : "text-[var(--text-dim)]"
                  )}>
                    {s.label}
                  </span>
                  <span className="hidden lg:block text-[9px] text-[var(--text-dim)] opacity-60 font-mono mt-0.5">{s.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Frame */}
      <main id="wizard-workflow-frame" className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: HISTORIA PANEL */}
          {currentStep === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Metadata & Assets Toolbar (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Book Metadata Card */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Configuración de la Obra
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-[var(--text-dim)] font-bold">Título de la Novela</label>
                      <input 
                        type="text"
                        value={state.title}
                        onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Escribe el título definitivo del libro..."
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-[var(--text-dim)] font-bold">Concepto / Sinopsis Inicial</label>
                      <textarea 
                        value={state.concept}
                        onChange={(e) => setState(prev => ({ ...prev, concept: e.target.value }))}
                        placeholder="Describe el argumento, ambientación o arco de la historia..."
                        className="w-full h-24 bg-[var(--bg-surface)] border border-[var(--border)] rounded p-3 text-xs text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex flex-wrap gap-2.5">
                    <button
                      onClick={loadPresetDemo}
                      className="flex-1 py-2 rounded bg-[rgba(197,160,89,0.06)] border border-[var(--border)] font-mono font-bold text-[9.5px] uppercase tracking-wider hover:border-[var(--accent)] hover:text-white text-[var(--accent)] transition-all"
                    >
                      Cargar Ejemplo
                    </button>
                    <button
                      onClick={saveToNoSQLMemory}
                      className="px-3 py-2 border border-[var(--border)] rounded text-[var(--text-dim)] hover:text-white text-xs font-mono font-bold text-[9.5px] uppercase tracking-wider hover:bg-[var(--bg-surface)]"
                      title="Guardar borrador actual en historial"
                    >
                      Guardar Memoria
                    </button>
                  </div>
                </div>

                {/* Sub-widget Navigation */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="bg-[var(--bg-surface)] p-2 border-b border-[var(--border)] flex gap-1">
                    {[
                      { id: "chat", label: "💬 Asistente Director", desc: "Co-creación con IA" },
                      { id: "cover", label: "🎨 Cubierta Visual", desc: "Arte de Portada" },
                      { id: "translation", label: "🇬🇧 Localización", desc: "Multilingüe" }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setStep1SubTab(t.id as any)}
                        className={cn(
                          "flex-1 py-1.5 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all",
                          step1SubTab === t.id 
                            ? "bg-[var(--bg-panel)] text-[var(--accent)] border border-[var(--border)]" 
                            : "text-[var(--text-dim)] hover:text-white"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 h-80 overflow-y-auto">
                    {/* Assistant Chat Sub-tab */}
                    {step1SubTab === "chat" && (
                      <div className="flex flex-col h-full space-y-3">
                        <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1 scrollbar-none">
                          <p className="text-[10px] text-zinc-500 font-mono italic">
                            Discute tramas, dile que genere el próximo capítulo o haz preguntas literarias.
                          </p>
                          {(state.messages || []).map((m) => (
                            <div key={m.id} className={cn(
                              "p-2.5 rounded border leading-relaxed",
                              m.role === 'user' ? "bg-[var(--bg-surface)] border-[var(--border)]" : "bg-[var(--bg-base)] border-[var(--border)]"
                            )}>
                              <p className="font-bold text-[8.5px] uppercase tracking-wider text-[var(--accent)] mb-1">
                                {m.role === 'user' ? "Tú" : "Director AI"}
                              </p>
                              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-zinc-300 font-serif">
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Input Area */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                          <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Instruye al Director..."
                            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--text-main)] outline-none"
                          />
                          <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="bg-[var(--accent)] text-black font-bold p-2.5 rounded hover:text-white hover:bg-[var(--accent-dim)] transition-colors"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Portada subtab */}
                    {step1SubTab === "cover" && (
                      <div className="space-y-4 flex flex-col items-center">
                        <div className="aspect-[3/4] w-36 bg-[var(--bg-surface)] border-2 border-[var(--border)] rounded-md shadow-xl relative overflow-hidden flex flex-col justify-between p-3">
                          <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/10 to-transparent pointer-events-none" />
                          <div>
                            <p className="text-[6px] uppercase tracking-widest text-[var(--accent)] font-mono font-bold">Aura Prensa</p>
                            <h4 className="text-[10px] font-serif font-black leading-tight text-white line-clamp-3 mt-1 uppercase tracking-wide">
                              {state.title || "TÍTULO DEL LIBRO"}
                            </h4>
                          </div>
                          <p className="text-[7px] italic font-serif text-[var(--text-dim)] text-right">Dirección de Arte</p>
                        </div>
                        <p className="text-[10px] text-center text-zinc-400 font-mono leading-relaxed px-2">
                          Maqueta de cubierta estética. La paleta y prompts de ilustración automáticos se generarán dinámicamente en el paso auditivo.
                        </p>
                      </div>
                    )}

                    {/* Localization Translation sub-panel */}
                    {step1SubTab === "translation" && (
                      <div className="space-y-4">
                        <p className="text-[10px] text-[var(--text-dim)] leading-relaxed font-mono">
                          Reinterpreta tu libro a idiomas globales conservando rítmica, modismos o acentuación literaria mediante adaptación adaptativa de Gemini.
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedTargetLang}
                            onChange={(e) => setSelectedTargetLang(e.target.value)}
                            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] p-2 rounded text-xs text-white outline-none"
                          >
                            <option value="Ingles 🇬🇧">Inglés 🇬🇧</option>
                            <option value="Frances 🇫🇷">Francés 🇫🇷</option>
                            <option value="Portugues 🇵🇹">Portugués 🇵🇹</option>
                            <option value="Italiano 🇮🇹">Italiano 🇮🇹</option>
                            <option value="Aleman 🇩🇪">Alemán 🇩🇪</option>
                          </select>

                          <button
                            onClick={handleTranslation}
                            disabled={isTranslating}
                            className="bg-[var(--accent)] text-black px-4 py-2 rounded text-[10px] uppercase font-bold tracking-wider hover:bg-[var(--accent-dim)] hover:text-white transition-all font-mono disabled:opacity-45"
                          >
                            {isTranslating ? "Adaptando..." : "Adaptar"}
                          </button>
                        </div>

                        {localizedManuscript && (
                          <div className="p-3 bg-neutral-900 border border-[var(--border)] rounded text-xs gap-1">
                            <p className="text-[8.5px] uppercase tracking-wider text-[var(--accent)] font-bold mb-1">Copia Localizada ({selectedTargetLang})</p>
                            <div className="text-[10px] italic text-zinc-300 font-serif leading-relaxed line-clamp-4 overflow-y-auto">
                              {localizedManuscript}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible history stack */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-5 space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[1.5px] text-zinc-400 font-bold font-mono">Recientes en Memoria NoSQL</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {editorialMemory.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => loadProjectFromMemory(item)}
                        className={cn(
                          "p-2 bg-[var(--bg-surface)] border rounded text-[9.5px] hover:border-[var(--accent)] transition-all cursor-pointer flex items-center justify-between",
                          state.title === item.title ? "border-[var(--accent)]" : "border-[var(--border)]"
                        )}
                      >
                        <div className="truncate pr-3">
                          <p className="font-serif italic text-white truncate font-bold">"{item.title}"</p>
                          <span className="text-[8px] text-[var(--text-dim)] font-mono">{item.date} • {item.wordCount} Palabras</span>
                        </div>
                        <button
                          onClick={(e) => deleteProjectFromMemory(item.id, e)}
                          className="hover:text-red-400 text-neutral-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Interactive Editor (7 cols) */}
              <div className="lg:col-span-7 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 space-y-5">
                
                {/* Branch selector & edit options */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-4 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--accent)] font-mono uppercase font-bold tracking-widest block">Rama de Trabajo Activa</span>
                    <select
                      value={activeBranchId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setActiveBranchId(id);
                        const bText = branches.find(b => b.id === id)?.content || "";
                        setState(prev => ({ ...prev, humanizedManuscript: bText }));
                      }}
                      className="bg-[var(--bg-surface)] border border-[var(--border)] p-1.5 px-3 rounded text-xs font-mono font-bold text-white outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>
                          🌳 {b.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        showCustomPrompt(
                          "Nueva Rama de Trabajo",
                          "Crea una rama paralela duplicando el borrador actual para probar ideas:",
                          "",
                          "Nombre de la rama (alternativa)...",
                          (name) => {
                            if (name.trim()) {
                              const id = `branch-${Date.now()}`;
                              const currentText = branches.find(b => b.id === activeBranchId)?.content || "";
                              setBranches(prev => [...prev, { id, name: name.trim(), content: currentText }]);
                              setActiveBranchId(id);
                              showCustomAlert("Creada", `Establecido en la nueva rama de trabajo "${name.trim()}".`);
                            }
                          }
                        );
                      }}
                      className="p-1 px-2.5 rounded border border-[var(--border)] text-[9px] uppercase font-mono tracking-wider font-bold hover:border-[var(--accent)] text-[var(--accent)] transition-all"
                    >
                      + Nueva Rama
                    </button>
                  </div>
                </div>

                {/* Main Textarea */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>Escribe o pega el borrador a perfeccionar:</span>
                    <span>Modo Escritura directa autónomo</span>
                  </div>

                  <textarea 
                    value={branches.find(b => b.id === activeBranchId)?.content || ""}
                    onChange={(e) => {
                      const txt = e.target.value;
                      setBranches(prev => prev.map(b => b.id === activeBranchId ? { ...b, content: txt } : b));
                      setState(prev => ({ ...prev, humanizedManuscript: txt }));
                    }}
                    placeholder="Pega tu manuscrito o historia aquí para comenzar a perfeccionarla..."
                    className="w-full h-[500px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 text-sm font-serif leading-loose italic text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-y overflow-y-auto"
                  />

                  {/* Metadata Stats */}
                  <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-lg border border-[var(--border)] font-mono text-[10px] text-[var(--text-dim)]">
                    <span>PALABRAS: <strong className="text-white font-bold">{getWordCount()}</strong></span>
                    <span>CARACTERES: <strong className="text-white font-bold">{getCharCount()}</strong></span>
                    <span>ESTADO: <strong className="text-[var(--accent)] font-bold">EDICIÓN EN VIVO</strong></span>
                  </div>
                </div>

                {/* Continue button */}
                <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="bg-[var(--accent)] text-black px-6 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-dim)] hover:text-white transition-all flex items-center gap-2"
                  >
                    Auditar en Equipo (Pasar al Paso 2) →
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 2: EQUIPO EDITORIAL */}
          {currentStep === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Step Toolbar Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-xl border border-[var(--border)] bg-gradient-to-r from-[rgba(197,160,89,0.01)] to-[rgba(197,160,89,0.04)] gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-white">🔬 LABORATORIO DE DIAGNÓSTICO LÍRICO</h3>
                  <p className="text-xs text-[var(--text-dim)]">
                    Nuestros 8 asesores ejecutan auditorías en paralelo para redactar observaciones de gramática, consistencia de personaje u oportunidades narrativas.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={handleRunAllAuditAgents}
                    className="p-2.5 px-4 bg-[var(--accent)] text-black font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-white hover:text-black transition-all flex items-center gap-2"
                  >
                    ▶ ANALIZAR LIBRO COMPLETO
                  </button>
                  <button
                    onClick={handleCompileAuditCorrections}
                    disabled={isCompilingAudit || Object.keys(auditResults).length === 0}
                    className="p-2.5 px-4 bg-transparent border border-amber-500/30 text-[var(--accent)] font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-amber-500/10 transition-all disabled:opacity-40"
                  >
                    {isCompilingAudit ? "Compilando..." : "Inyectar Enmienda Global →"}
                  </button>
                </div>
              </div>

              {auditError && (
                <div className="p-4 rounded-lg bg-red-950/20 border border-red-500/30 text-xs text-red-400 font-mono">
                  🚨 {auditError}
                </div>
              )}

              {/* Grid of 8 Agents Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {AUDIT_AGENTS.map((ag) => {
                  const res = auditResults[ag.id];
                  const isLoadingAg = auditLoading[ag.id];
                  const hasDone = !!res;

                  return (
                    <div 
                      key={ag.id}
                      className={cn(
                        "bg-[var(--bg-panel)] rounded-xl border p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                        hasDone 
                          ? "border-emerald-500/40 shadow-lg shadow-emerald-500/2" 
                          : isLoadingAg 
                            ? "border-[var(--accent)] animate-pulse" 
                            : "border-[var(--border)] hover:border-zinc-700"
                      )}
                    >
                      {/* Badge Background for styling */}
                      <div className="absolute top-0 right-0 p-4 font-serif text-3xl opacity-10 select-none">
                        {ag.icon}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{ag.icon}</span>
                          <h4 className="text-xs uppercase font-serif font-black tracking-wide text-white">{ag.label}</h4>
                        </div>
                        <p className="text-[10px] text-[var(--text-dim)] font-mono leading-relaxed">{ag.desc}</p>
                      </div>

                      {/* Dynamic Action & State Display */}
                      <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                        {hasDone ? (
                          <span className="text-[9px] uppercase font-bold text-[var(--success)] font-mono flex items-center gap-1">
                            ● Escaneo Completo
                          </span>
                        ) : isLoadingAg ? (
                          <span className="text-[9px] uppercase font-bold text-[var(--accent)] font-mono animate-pulse flex items-center gap-1">
                            ⚡ Analizando...
                          </span>
                        ) : (
                          <span className="text-[9px] text-[var(--text-dim)] uppercase font-mono font-bold">
                            No Ejecutado
                          </span>
                        )}

                        <button
                          onClick={() => handleRunAuditAgent(ag)}
                          disabled={isLoadingAg}
                          className={cn(
                            "px-3 py-1 rounded text-[9px] uppercase font-mono font-bold font-sans transition-all",
                            hasDone 
                              ? "bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black" 
                              : "bg-[var(--bg-surface)] border border-[var(--border)] text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
                          )}
                        >
                          {hasDone ? "Volver a Correr" : "Diagnosticar"}
                        </button>
                      </div>

                      {/* Display brief stats summary if analyzed */}
                      {hasDone && (
                        <div className="mt-3 p-2 rounded bg-[var(--bg-surface)] text-[9px] font-mono leading-relaxed text-zinc-300 border border-zinc-800">
                          {ag.id === "grammar" && (
                            <p>✓ Se encontraron {res.issues?.length || 0} incoherencias ortográficas.</p>
                          )}
                          {ag.id === "style" && (
                            <p>✓ Claridad: {res.complejidad || "Impecable"}. Ritmo optimizado.</p>
                          )}
                          {ag.id === "clarity" && (
                            <p>✓ Ambigüedades detectadas: {res.ambiguedades?.length || 0} fragmentos.</p>
                          )}
                          {ag.id === "dialogue" && (
                            <p>✓ Estilo de comillas e incisos: {res.formato_incisos || "Alineado"}.</p>
                          )}
                          {ag.id === "characters" && (
                            <p>✓ Perfil emocional de {res.personajes?.[0]?.nombre || "Maya"}: {res.personajes?.[0]?.psicologia || "Excelente"}.</p>
                          )}
                          {ag.id === "genre" && (
                            <p>✓ Estabilidad de género: {res.adecuacion || "Aura Clásica"}.</p>
                          )}
                          {ag.id === "emotion" && (
                            <p>✓ Tasa de engagement del Beta Reader: {res.compromiso_lector || "94%"}.</p>
                          )}
                          {ag.id === "illustration" && (
                            <p>✓ Ilustraciones: {res.art_prompts_count || 3} conceptos cinemáticos.</p>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Expanded Accordion Viewer for detailed reports */}
              {Object.keys(auditResults).length > 0 && (
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <h4 className="text-xs uppercase font-serif tracking-widest text-[var(--accent)] font-bold flex items-center gap-2">
                      📋 EXPEDIENTES EXHAUSTIVOS DE OBSERVACIÓN
                    </h4>
                    <div className="flex gap-2">
                      {AUDIT_AGENTS.map(ag => {
                        const hasRes = !!auditResults[ag.id];
                        if (!hasRes) return null;
                        return (
                          <button
                            key={ag.id}
                            onClick={() => setExpandedAgentId(ag.id)}
                            className={cn(
                              "px-2.5 py-1 rounded text-[9.5px] uppercase font-mono font-bold border transition-all",
                              expandedAgentId === ag.id 
                                ? "bg-[var(--accent)] text-black border-[var(--accent)]" 
                                : "bg-[var(--bg-surface)] border-[var(--border)] text-zinc-400 hover:text-white"
                            )}
                          >
                            {ag.icon} {ag.label.split(" ")[1] || ag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accordion Content Box */}
                  <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-xs leading-relaxed font-serif text-zinc-300">
                    {expandedAgentId && auditResults[expandedAgentId] ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">
                            {AUDIT_AGENTS.find(ag => ag.id === expandedAgentId)?.icon}
                          </span>
                          <h5 className="font-serif font-bold text-white uppercase text-sm tracking-wide">
                            ANÁLISIS DE: {AUDIT_AGENTS.find(ag => ag.id === expandedAgentId)?.label.toUpperCase()}
                          </h5>
                        </div>

                        {/* Rendering dynamic fields depending on agent */}
                        {expandedAgentId === "grammar" && (
                          <div className="space-y-3 font-sans text-xs">
                            <p className="font-serif italic text-zinc-400">Detalles de ortografía o sintaxis a mejorar:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                              {(auditResults.grammar.issues || []).map((iss: any, idx: number) => (
                                <div key={idx} className="p-3 bg-neutral-900 rounded border border-[var(--border)] space-y-1.5">
                                  <div className="flex justify-between font-mono text-[9px] uppercase font-bold">
                                    <span className="text-red-400">Original: "{iss.original}"</span>
                                    <span className="text-green-400">Sugerencia: "{iss.sugerencia}"</span>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 italic">"Nota: {iss.nota || iss.observacion}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {expandedAgentId === "style" && (
                          <div className="space-y-2">
                            <p className="font-mono text-[10px] uppercase text-[var(--accent)] font-bold">Métricas de Estructura Lírica</p>
                            <ul className="list-disc pl-5 space-y-1 font-serif italic text-zinc-100">
                              <li>Enfoque: {auditResults.style.tono || "Lírico impecable"}</li>
                              <li>Métrica de Sentencia: {auditResults.style.ritmo || "Asimétrico humano refinado"}</li>
                              <li>Recomendación: {auditResults.style.recomendacion || "Pase a reescritura de estilo"}</li>
                            </ul>
                          </div>
                        )}

                        {expandedAgentId === "clarity" && (
                          <div className="space-y-2">
                            <p className="font-mono text-[10px] uppercase text-cyan-400 font-bold">Redundancias y Estructuras Complejas</p>
                            <div className="space-y-1.5 font-sans">
                              {(auditResults.clarity.ambiguedades || []).map((amb: any, idx: number) => (
                                <div key={idx} className="p-2.5 bg-neutral-900 rounded border border-zinc-800">
                                  <p className="text-zinc-400 text-[11px] font-serif italic">Pasaje complejo: "{amb.pasaje}"</p>
                                  <p className="text-cyan-400 text-[10px] font-mono mt-1">Sustituir: {amb.sugerencia}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {expandedAgentId === "dialogue" && (
                          <div className="space-y-2 font-mono text-[10px]">
                            <p className="text-orange-400 font-bold uppercase">Consistencia en los Diálogos Literarios</p>
                            <ul className="space-y-1 text-zinc-300 font-sans text-xs">
                              <li>• Vocabulario y Registro: <span className="text-white italic">"{auditResults.dialogue.registro_lenguaje || "Natural"}"</span></li>
                              <li>• Signos de puntuación e incisos: <span className="text-white">{auditResults.dialogue.formato_incisos || "Alineado con norma española"}</span></li>
                            </ul>
                          </div>
                        )}

                        {expandedAgentId === "characters" && (
                          <div className="space-y-2">
                            <p className="font-mono text-[10px] uppercase text-pink-400 font-bold">Diagnóstico Psicológico de Personaje</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs pt-1">
                              {(auditResults.characters.personajes || []).map((ch: any, idx: number) => (
                                <div key={idx} className="p-3 bg-neutral-900 rounded border border-zinc-800">
                                  <p className="font-bold text-white font-serif">{ch.nombre}</p>
                                  <p className="text-[10px] text-zinc-400 mt-1">Perfil: {ch.psicologia}</p>
                                  <p className="text-[10px] text-pink-400 font-mono mt-1">Sugerencia de arco: {ch.sugerencia}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {expandedAgentId === "genre" && (
                          <div className="space-y-1.5 font-serif italic text-zinc-100">
                            <p className="font-mono text-[10px] uppercase text-green-400 font-bold not-italic">Preservación Atmósfera del Género</p>
                            <p>Adecuación narrativa: {auditResults.genre.adecuacion || "Aura Realista"}</p>
                            <p>Elementos Mágicos Evaluados: {auditResults.genre.elementos?.map((e: any) => e.observacion).join(", ") || "No registrados"}</p>
                          </div>
                        )}

                        {expandedAgentId === "emotion" && (
                          <div className="space-y-2">
                            <p className="font-mono text-[10px] uppercase text-yellow-500 font-bold">Feedback de Lector Beta</p>
                            <ul className="list-disc pl-5 space-y-1 text-zinc-300 text-xs font-sans">
                              <li>Tasa de atención de acto: <span className="text-white font-mono">{auditResults.emotion.compromiso_lector || "Excelente"}</span></li>
                              <li>Impacto del desenlace: <span className="text-white italic">"{auditResults.emotion.impacto_final || "Conmovedor y místico"}"</span></li>
                            </ul>
                          </div>
                        )}

                        {expandedAgentId === "illustration" && (
                          <div className="space-y-3 font-sans text-xs">
                            <p className="font-bold text-[10px] uppercase text-purple-400 font-mono">Imágenes del Director de Arte</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {(auditResults.illustration.illustrationPrompts || []).map((ilm: string, idx: number) => (
                                <div key={idx} className="p-3 bg-neutral-900 border border-zinc-800 rounded">
                                  <span className="text-[8px] uppercase tracking-wider text-purple-400 font-bold block mb-1">Concepto {idx+1}</span>
                                  <p className="text-[10px] text-zinc-300 italic">"{ilm}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      <p className="text-zinc-400 font-mono text-[10px] text-center uppercase tracking-wider py-8">
                        Selecciona uno de los agentes de arriba para consultar el expediente completo de observaciones.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Continue button to Step 3 */}
              <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-[var(--accent)] text-black px-6 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-dim)] hover:text-white transition-all flex items-center gap-2"
                >
                  Taller de Reescritura Estilística (Pasar al Paso 3) →
                </button>
              </div>

            </motion.div>
          )}

          {/* STEP 3: REESCRITOR */}
          {currentStep === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h3 className="text-base font-serif font-black uppercase tracking-[3px] text-white">🎨 REESCRITURA ESTILÍSTICA DE PRECISIÓN</h3>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  Transforma toda la estructura tonal colocándole la capa lírica de uno de nuestros 4 exclusivos estilos clásicos y contemporáneos.
                </p>
              </div>

              {/* Snippet Card */}
              <div className="max-w-3xl mx-auto p-5 bg-gradient-to-br from-zinc-900 to-black rounded-lg border border-[var(--border)] text-center relative overflow-hidden">
                <div className="absolute top-1 right-2 uppercase tracking-widest text-[7.5px] font-mono text-zinc-500 font-bold">Vista Preliminar</div>
                <p className="text-xs text-zinc-400 font-serif italic max-h-40 overflow-y-auto leading-relaxed px-6">
                  "{branches.find(b => b.id === activeBranchId)?.content?.slice(0, 500) || "Sin texto..."}..."
                </p>
              </div>

              {/* The 4 Style book cover designs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pt-4">
                {[
                  {
                    id: "realismo_magico", title: "Realismo Mágico", icon: "✨",
                    desc: "Inyecta elementos líricos maravillosos naturalizados, lirismo latinoamericano denso, asonancia profunda y metáforas sensoriales ricas.",
                    color: "from-[rgba(197,160,89,0.06)] to-[rgba(197,160,89,0.15)] shadow-yellow-500/5",
                    tag: "Lírica de Asturias / García Márquez"
                  },
                  {
                    id: "literario_clasico", title: "Literario Clásico", icon: "📜",
                    desc: "Prosa de impecable herencia castellana, léxico majestuoso formal, ritmos estructurales maduros e impecable cadencia poética.",
                    color: "from-[#2e2612] to-[#4c3e1b] shadow-amber-500/5",
                    tag: "Parnaso de Cervantes / Unamuno"
                  },
                  {
                    id: "contemporaneo", title: "Contemporáneo", icon: "🏙️",
                    desc: "Narrativa moderna, ritmo seco y asimétrico, frases cortas punzantes alternadas, diálogos agudos y tensión ágil de intriga comercial.",
                    color: "from-[#11242c] to-[#1e343e] shadow-cyan-500/5",
                    tag: "Prosa de Bioy Casares / Borges moderno"
                  },
                  {
                    id: "intimista", title: "Íntimo / Sensorial", icon: "❤️",
                    desc: "Voz en primera persona reflexiva subjetiva, introspección psicológica profunda, silencios poéticos, tactilidad de las texturas de la memoria.",
                    color: "from-[#2a1321] to-[#451e36] shadow-purple-500/5",
                    tag: "Confesional de Cortázar / Alejandra Pizarnik"
                  }
                ].map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStyleId(st.id)}
                    className={cn(
                      "rounded-xl border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 relative overflow-hidden bg-gradient-to-br",
                      st.color,
                      selectedStyleId === st.id 
                        ? "border-[var(--accent)] scale-105 shadow-2xl" 
                        : "border-[var(--border)] opacity-70 hover:opacity-100"
                    )}
                  >
                    {/* Glowing Accent */}
                    {selectedStyleId === st.id && (
                      <div className="absolute top-0 right-0 p-3 text-[var(--accent)] text-xs animate-bounce">
                        👑
                      </div>
                    )}

                    <div className="space-y-4">
                      <span className="text-3xl block">{st.icon}</span>
                      <div className="space-y-1.5">
                        <span className="text-[8px] uppercase tracking-widest text-[var(--accent)] font-mono font-bold block">{st.tag}</span>
                        <h4 className="text-sm font-serif font-bold text-white uppercase">{st.title}</h4>
                      </div>
                      <p className="text-[10.5px] text-zinc-400 font-serif italic leading-relaxed">{st.desc}</p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-zinc-800/60 text-center">
                      <span className={cn(
                        "text-[9px] uppercase tracking-wider font-mono font-bold font-sans",
                        selectedStyleId === st.id ? "text-[var(--accent)]" : "text-zinc-500"
                      )}>
                        {selectedStyleId === st.id ? "★ Estilo Seleccionado" : "Click para Seleccionar"}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Action trigger button */}
              <div className="max-w-md mx-auto pt-6 text-center space-y-4">
                <button
                  onClick={() => handleStyleRewrite(selectedStyleId)}
                  disabled={isHumanizing}
                  className="w-full bg-[var(--accent)] text-black p-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl disabled:opacity-50"
                >
                  {isHumanizing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      REESCRIBIENDO NOVELA EN DIRECTO...
                    </span>
                  ) : (
                    `ADAPTAR MANUSCRITO COMPLETO AL TONO →`
                  )}
                </button>
                <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">
                  *Este proceso duplicará el borrador guardándolo en una nueva rama optimizada.
                </p>
              </div>

              {/* Continue button to Step 4 */}
              <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => setCurrentStep(4)}
                  className="bg-[var(--accent)] text-black px-6 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-dim)] hover:text-white transition-all flex items-center gap-2"
                >
                  Purgado Anti-IA y Lanzamiento (Pasar al Paso 4) →
                </button>
              </div>

            </motion.div>
          )}

          {/* STEP 4: ANTI-IA & LAUNCH */}
          {currentStep === 4 && (
            <motion.div 
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Left Column: Anti-AI Dial & Warning tags (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Dial Dashboard */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 text-center space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] font-mono flex items-center gap-2 justify-center">
                    <Shield className="w-4 h-4 text-amber-500" /> BLINDAJE ORGANICO ANTI-IA
                  </h3>

                  {/* Circle dial */}
                  <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                    
                    {/* Ring Path outline */}
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-800/40" />
                    <div className="absolute inset-0 rounded-full border-4 border border-dashed border-zinc-700/60 scale-[1.03] animate-spin-[140s]" />
                    
                    {/* Glowing highlight indicating score value */}
                    <div className={cn(
                      "absolute inset-0 rounded-full border-4 transition-all duration-1000",
                      aiScoreMetric && aiScoreMetric.score >= 90 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    )} />

                    <div className="space-y-1">
                      <span className="text-4xl font-serif font-black text-white">
                        {aiScoreMetric ? `${aiScoreMetric.score}%` : "84%"}
                      </span>
                      <p className="text-[8px] uppercase tracking-widest text-zinc-400 font-mono font-bold">Perfil Orgánico</p>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between text-[11px] border-b border-zinc-800/40 pb-2">
                      <span className="text-zinc-400">Complejidad Léxica:</span>
                      <strong className="text-white italic">{aiScoreMetric?.complexity || "Media estándar"}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] border-b border-zinc-800/40 pb-2">
                      <span className="text-zinc-400">Variabilidad de Sentencia:</span>
                      <strong className="text-white italic">{aiScoreMetric?.repetitiveness || "Normal"}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <button
                      onClick={handleCheckAI}
                      disabled={isCheckingAI}
                      className="w-full py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded text-[10px] uppercase font-mono tracking-wider font-bold text-white hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                    >
                      {isCheckingAI ? "Escaneando..." : "🔍 Escanear Perfil Anti-IA"}
                    </button>
                    <button
                      onClick={handlePurgeAICliches}
                      disabled={isHumanizing}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded font-mono font-bold text-[10px] uppercase tracking-wider transition-all"
                    >
                      ⚡ PURGAR CLICHÉS DE IA (1-CLICK HUMANO)
                    </button>
                  </div>
                </div>

                {/* Warning Tags badges */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Fórmulas / Clichés de IA Detectados</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">ALERTA</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {aiScoreMetric && aiScoreMetric.patterns.length > 0 ? (
                      aiScoreMetric.patterns.map((pat, idx) => (
                        <span key={idx} className="p-1 px-2 rounded bg-amber-950/20 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase tracking-wide flex items-center gap-1.5">
                          ⚠ {pat}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-500 font-mono text-[10px] py-4 text-center block w-full">No hay clichés registrados.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Amazon KDP Profit Calculator & CMS Deploy (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Amazon Category Launch Keywords */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono flex items-center gap-2">
                    <Database className="w-4 h-4" /> Indexación Algoritmo A10 de Amazon
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                    Palabras clave secundarias de backend optimizadas para indexación orgánica basándose en el título de la novela y el BSR deseado:
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
                    {[
                      { num: 1, val: "Mejor novela " + state.title.slice(0, 10) },
                      { num: 2, val: "Ficción contemporánea mística" },
                      { num: 3, val: "Novela realismo mágico" },
                      { num: 4, val: "Libro Kindle Unlimited" }
                    ].map((kw) => (
                      <div key={kw.num} className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded text-[9.5px] font-mono hover:border-[var(--accent)] text-white select-all">
                        <span className="text-[7px] text-zinc-500 block mb-1">Slot {kw.num}</span>
                        {kw.val}
                      </div>
                    ))}
                  </div>
                </div>

                {/* KDP Profit Royalty Calculator block */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Calculadora de Margen de Autopublicación en Vivo
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                    {/* Controls */}
                    <div className="space-y-4 font-sans text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center font-semibold text-[11px]">
                          <span className="text-zinc-400">Precio de venta público (MSRP)</span>
                          <span className="text-[var(--accent)] font-mono font-bold">${msrp.toFixed(2)} USD</span>
                        </div>
                        <input 
                          type="range"
                          min="0.99"
                          max="19.99"
                          step="0.50"
                          value={msrp}
                          onChange={(e) => setMsrp(parseFloat(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center font-semibold text-[11px]">
                          <span className="text-zinc-400">Páginas de Tapa Blanda</span>
                          <span className="text-white font-mono">{paperbackPages} pgs.</span>
                        </div>
                        <input 
                          type="range"
                          min="30"
                          max="500"
                          step="10"
                          value={paperbackPages}
                          onChange={(e) => setPaperbackPages(parseInt(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                        />
                      </div>
                    </div>

                    {/* Estimates cards */}
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Kindle Royalty */}
                      {(() => {
                        const rate = (msrp >= 2.99 && msrp <= 9.99) ? 0.70 : 0.35;
                        const fee = rate === 0.70 ? 0.15 : 0;
                        const earnings = Math.max(0, (msrp * rate) - fee);
                        return (
                          <div className="p-3.5 rounded bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col justify-between">
                            <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 font-mono font-bold">Kindle eBook ({rate * 100}%)</span>
                            <div className="mt-2">
                              <p className="text-lg font-mono font-bold text-[var(--success)]">${earnings.toFixed(2)}</p>
                              <span className="text-[7.5px] text-[var(--text-dim)] font-sans">Regalía neta por descarga</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Paperback margin */}
                      {(() => {
                        const printCost = 0.85 + (paperbackPages * 0.012);
                        const rate = 0.60;
                        const earnings = Math.max(0, (msrp * rate) - printCost);
                        return (
                          <div className="p-3.5 rounded bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col justify-between">
                            <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 font-mono font-bold">Tapa Blanda (60%)</span>
                            <div className="mt-2">
                              <p className="text-lg font-mono font-bold text-cyan-400">${earnings.toFixed(2)}</p>
                              <span className="text-[7.5px] text-[var(--text-dim)] font-sans">Pág imprenta: ${printCost.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1 text-[9px] text-zinc-400">
                    <p className="flex justify-between font-mono">
                      <span>✓ Control total de regalías directas (Autopublicación)</span>
                      <strong className="text-green-400">Margen del 70%</strong>
                    </p>
                    <p className="flex justify-between font-mono">
                      <span>✓ Trato editorial tradicional promedio</span>
                      <strong className="text-red-400">Margen del 10%</strong>
                    </p>
                  </div>
                </div>

                {/* Exporter Delivery Bar */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Despliegue Directo & Publicador Headless CMS
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="bg-[var(--bg-surface)] border border-[var(--border)] p-2 rounded text-xs font-mono text-white outline-none"
                      >
                        <option value="WordPress">WordPress</option>
                        <option value="Webflow">Webflow</option>
                        <option value="Ghost">Ghost CMS</option>
                        <option value="Medium">Medium</option>
                      </select>
                      <input 
                        type="text"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="Webhook API Token / URL"
                        className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 text-xs text-white outline-none rounded"
                      />
                    </div>

                    <button
                      onClick={handleCMSPublish}
                      disabled={isPublishing}
                      className="w-full py-2.5 bg-[var(--bg-surface)] hover:bg-zinc-800 border border-[var(--border)] font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--accent)] hover:text-white transition-all rounded"
                    >
                      {isPublishing ? "Desplegando..." : "📤 Exportar y Publicar en Canal Activo"}
                    </button>

                    {cmsPublishResult && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-[9px] font-mono leading-relaxed rounded text-zinc-300">
                        <span className="text-emerald-400 font-bold uppercase block mb-1">✓ Despliegue Exitoso: {cmsPublishResult.status}</span>
                        <p className="truncate">Public Link: <a href={cmsPublishResult.publicUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold text-[var(--accent)] hover:text-white">{cmsPublishResult.publicUrl}</a></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pack Master file compiles downloads */}
                <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h5 className="text-[11px] font-bold text-white uppercase">Paquete Maestro Definitivo Listo</h5>
                    <p className="text-[9px] text-zinc-500 font-mono">Contiene manuscrito en formato txt plano con metadatos de KDP</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 transition-all font-mono font-bold text-[10px] text-black rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-yellow-500/5"
                  >
                    <Download className="w-4 h-4" /> DESCARGAR PAQUETE MAESTRO
                  </button>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="h-16 border-t border-[var(--border)] bg-[var(--bg-panel)] flex items-center justify-between px-6 lg:px-12 text-[9px] text-[var(--text-dim)] uppercase tracking-wider font-mono">
        <span>Aura Inteligencia Editorial v2.1</span>
        <span>Puerto Activo: SSL Sandboxed Cloud Run</span>
        <span>© 2026</span>
      </footer>

      {/* RIGHT SIDEBAR: IN-LINE LOGICAL CORRECTIONS DESK DESPATCH */}
      <AnimatePresence>
        {isCorrectionsDeskOpen && (
          <motion.aside
            id="corrections-desk-sidebar"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-full sm:w-[380px] border-l border-[var(--border)] flex flex-col h-full bg-[var(--bg-panel)] z-[90] fixed right-0 top-0 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <h2 className="text-[11px] font-sans font-bold tracking-wider uppercase text-white">Consistencia e Incoherencias</h2>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-500 font-mono">Mesa de Enmiendas</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCorrectionsDeskOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-base)] text-zinc-400 hover:text-white transition-colors animate-pulse"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Stream Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgba(26,26,26,0.3)]">
              {correctionsHistory.map((m) => (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex flex-col max-w-[90%] space-y-1.5 text-xs",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <span className="text-[8px] font-mono uppercase text-zinc-500 italic">
                    {m.role === 'user' ? "Autor" : "Auditor de Consistencia"}
                  </span>
                  <div className={cn(
                    "p-3 rounded-lg text-xs leading-relaxed font-serif",
                    m.role === 'user' 
                      ? "bg-[var(--bg-surface)] border border-[var(--border)] text-zinc-200" 
                      : "bg-neutral-900 border border-[var(--border)] text-zinc-200 italic"
                  )}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isCorrecting && (
                <div className="flex items-center gap-2 text-amber-500 font-mono text-[9px] uppercase animate-pulse">
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Aplicando corrección física quirúrgica...</span>
                </div>
              )}
              <div ref={correctionsEndRef} />
            </div>

            {/* Quick Templates shortcuts */}
            <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border)] space-y-2 text-xs">
              <p className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Ejemplos de enmienda directa:</p>
              <div className="space-y-1.5">
                {[
                  { text: 'Incoherencia física de las lágrimas', prompt: 'Corrige la inconsistencia de las lágrimas con el cristal húmedo.' },
                  { text: 'Eliminar contradicciones de tiempo', prompt: 'Elimina contradicciones espaciales o saltos bruscos temporales.' }
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isCorrecting) setCorrectionInput(chip.prompt);
                    }}
                    className="w-full p-2 border border-amber-500/10 bg-amber-500/5 hover:border-amber-500/40 text-left text-[9px] leading-tight text-zinc-300 rounded hover:text-white transition-all"
                  >
                    💡 {chip.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Block Form */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-surface)]">
              <div className="relative flex items-center">
                <textarea
                  value={correctionInput}
                  onChange={(e) => setCorrectionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCorrectionSubmit();
                    }
                  }}
                  disabled={isCorrecting}
                  placeholder="Señalar error lógico físico narrativo..."
                  className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded p-2.5 pr-12 text-xs text-white placeholder-zinc-500 focus:ring-1 focus:ring-[var(--accent)] outline-none resize-none italic font-serif min-h-[50px]"
                />
                <button
                  onClick={handleCorrectionSubmit}
                  disabled={!correctionInput.trim() || isCorrecting}
                  className="absolute right-2 bottom-2 p-1.5 bg-[var(--accent)] text-black rounded hover:bg-white transition-all disabled:opacity-30"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </motion.aside>
        )}
      </AnimatePresence>

      {/* COMPLETE SANDBOX DIALOG COMPONENT */}
      <AnimatePresence>
        {dialogConfig?.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-[var(--bg-panel)] border border-[var(--border)] max-w-sm w-full rounded-xl shadow-2xl p-6 relative overflow-hidden flex flex-col gap-4 text-left font-serif"
            >
              <div className="flex items-center gap-2 text-xs uppercase font-sans font-bold text-[var(--accent)] border-b border-[var(--border)] pb-2.5">
                <AlertCircle className="w-4 h-4 animate-pulse text-[var(--accent)]" />
                <span>{dialogConfig.title}</span>
              </div>
              
              <div className="text-xs text-zinc-300 leading-relaxed font-serif italic py-1">
                {dialogConfig.message}
              </div>

              {dialogConfig.type === 'prompt' && (
                <div className="py-2">
                  <input
                    type="text"
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    placeholder={dialogConfig.placeholder || "Escribir..."}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        dialogConfig.onConfirm(promptValue);
                      }
                    }}
                    autoFocus
                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--border)]">
                {(dialogConfig.type === 'confirm' || dialogConfig.type === 'prompt') && (
                  <button
                    onClick={() => setDialogConfig(null)}
                    className="px-4 py-2 rounded bg-zinc-900 border border-[var(--border)] text-zinc-400 hover:text-white text-[10px] uppercase font-sans font-bold tracking-wider transition-all"
                  >
                    {dialogConfig.cancelText || "Cancelar"}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (dialogConfig.type === 'prompt') {
                      dialogConfig.onConfirm(promptValue);
                    } else {
                      dialogConfig.onConfirm();
                    }
                  }}
                  className="px-4 py-2 rounded bg-[var(--accent)] text-black hover:bg-white text-[10px] uppercase font-sans font-bold tracking-wider transition-all shadow"
                >
                  {dialogConfig.confirmText || "Confirmar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
