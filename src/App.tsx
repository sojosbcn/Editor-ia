import { motion, AnimatePresence } from "motion/react";
import { Send, FileText, Layout, TrendingUp, CheckCircle2, AlertCircle, Loader2, Download, Plus, Menu, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { ProjectPhase, ProjectState, Message, ProjectPhase as Phase, DEPARTMENTS } from "./types";
import { getEditorInChiefResponse, runEvaluationLoop, generateManuscript, humanizeText, runMarketAnalysis } from "./lib/gemini";
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
  manuscript: ""
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

const INITIAL_STATE = COMPLETED_DEMO_STATE;

export default function App() {
  const [state, setState] = useState<ProjectState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_editorial_history');
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    }
    return INITIAL_STATE;
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('aura_editorial_history', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { ...message, id: Date.now().toString(), timestamp: Date.now() }]
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    addMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      // Logic for Phase Transitions
      if (state.currentPhase === Phase.EVALUATION && !state.title) {
        // Automatically detect title and concept if first message
        const response = await getEditorInChiefResponse(state.messages, userMessage, state);
        addMessage({ role: 'assistant', content: response });
        
        // Transition to evaluation
        const reports = await runEvaluationLoop(userMessage);
        const titleMatch = response.match(/["'](.*?)["']/); // Simple heuristic to pick a title if model suggested one
        setState(prev => ({ 
          ...prev, 
          title: titleMatch ? titleMatch[1] : "La Obra Maestra Comercial",
          concept: userMessage, 
          departments: reports,
          currentPhase: Phase.EVALUATION
        }));
        addMessage({ 
          role: 'assistant', 
          content: "Los departamentos han completado la evaluación inicial. Puede revisar la estructura, el diseño y la estrategia de KDP en el panel lateral. ¿Procedemos con la redacción?" 
        });
      } else {
        const response = await getEditorInChiefResponse(state.messages, userMessage, state);
        addMessage({ role: 'assistant', content: response });
      }
    } catch (error) {
      console.error(error);
      addMessage({ role: 'assistant', content: "Mis disculpas, pero mi sistema de inteligencia ha experimentado una breve interrupción. ¿Cómo desea proceder?" });
    } finally {
      setIsLoading(false);
    }
  };

  const startDrafting = async () => {
    setIsLoading(true);
    addMessage({ role: 'assistant', content: "Recibido. El Equipo de Redacción está elaborando el manuscrito completo basado en nuestras directrices comerciales..." });
    
    try {
      const draft = await generateManuscript(state.concept, "Follow agency standards.");
      setState(prev => ({ ...prev, manuscript: draft }));
      
      addMessage({ role: 'assistant', content: "Fase 2 en progreso: El equipo de Análisis de Texto de IA está revisando y humanizando meticulosamente el manuscrito para asegurar una sensación 100% orgánica..." });
      
      const humanized = await humanizeText(draft);
      setState(prev => ({ ...prev, humanizedManuscript: humanized, currentPhase: Phase.FIRST_REVIEW }));
      
      addMessage({ role: 'assistant', content: "Fase 2 Completada. El manuscrito humanizado está listo para nuestra primera revisión editorial. Por favor, examínelo y dígame si cumple con nuestros estándares de excelencia comercial." });
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveManuscript = async () => {
    setIsLoading(true);
    addMessage({ role: 'assistant', content: "Espléndido. Pasando a la Fase 4: Maquetación e Ilustración. Nuestros equipos de arte están generando prompts detallados y estrategias de mercado..." });
    
    try {
      const analysis = await runMarketAnalysis(state.humanizedManuscript, state.concept);
      setState(prev => ({ 
        ...prev, 
        currentPhase: Phase.FINAL_MARKET,
        marketAnalysis: {
          historicalData: analysis.historicalData,
          trends: analysis.trends,
          financialProjections: {
            roi: analysis.roi,
            investmentPlan: analysis.investmentPlan,
            rrp: analysis.rrp
          }
        },
        illustrationPrompts: analysis.illustrationPrompts
      }));
      
      addMessage({ role: 'assistant', content: "La maquetación y la finalización del mercado están completas. Tenemos los entregables finales listos para su revisión definitiva. Esto incluye la estrategia de ventas, las proyecciones financieras y los prompts de ilustración. Si se aprueba, finalizaremos esta obra maestra." });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    setIsLoading(true);
    // Simular retraso de generación
    setTimeout(() => {
      const header = `==================================================\n`;
      const title = `PROYECTO: ${state.title}\n`;
      const separator = `==================================================\n\n`;
      
      const manuscript = `--- MANUSCRITO FINAL ---\n\n${state.humanizedManuscript}\n\n`;
      
      const analysisObj = state.marketAnalysis;
      const market = `--- ANÁLISIS DE MERCADO ---\n\n` +
        `Historial: ${analysisObj?.historicalData}\n` +
        `Tendencias: ${analysisObj?.trends}\n` +
        `ROI Proyectado: ${analysisObj?.financialProjections.roi}\n` +
        `PVP Sugerido: ${analysisObj?.financialProjections.rrp}\n` +
        `Plan de Inversión: ${analysisObj?.financialProjections.investmentPlan}\n\n`;
      
      const prompts = `--- DIRECCIÓN DE ARTE (PROMPTS) ---\n\n` + 
        state.illustrationPrompts.map((p, i) => `LÁMINA ${i+1}: ${p}`).join('\n') + '\n\n';

      const discussion = `--- REGISTRO DE DISCUSIÓN EDITORIAL ---\n\n` +
        state.messages.map(m => {
          const date = new Date(m.timestamp).toLocaleString('es-ES');
          const role = m.role === 'user' ? 'AUTOR' : 'EDITOR-EN-JEFE';
          return `[${date}] ${role}: ${m.content}\n`;
        }).join('\n') + '\n';
      
      const footer = `==================================================\n` +
        `Generado por Aura Inteligencia - Centro de Mando Editorial\n` +
        `ID de Sesión: ${state.id || 'N/A'}\n` +
        `© 2026`;

      // Añadir BOM (Byte Order Mark) para que los lectores móviles identifiquen UTF-8 correctamente
      const content = '\ufeff' + header + title + separator + manuscript + market + prompts + discussion + footer;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.title.replace(/\s+/g, '_')}_ArchivoMaestro.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsLoading(false);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1500);
  };

  const handleReset = () => {
    localStorage.removeItem('aura_editorial_history');
    setState(EMPTY_STATE);
    setIsSidebarOpen(false);
  };

  const finalizeProject = () => {
    setState(prev => ({ ...prev, currentPhase: Phase.COMPLETED }));
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#c5a059', '#1a1a1a', '#f5f2ed']
    });
  };

  return (
    <div id="agency-app-root" className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-main)] overflow-hidden font-sans relative">
      {/* Sidebar - Workflow & Departments */}
      <motion.aside 
        id="sidebar-workflow" 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -320) }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "w-80 border-r border-[var(--border)] flex flex-col h-full bg-[var(--bg-panel)] z-50 fixed lg:static lg:translate-x-0",
          !isSidebarOpen && "pointer-events-none lg:pointer-events-auto"
        )}
      >
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h1 className="text-xl font-serif font-semibold tracking-[2px] text-[var(--accent)] uppercase">
                  Aura <span className="text-[var(--text-main)]">Inteligencia</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] mt-1 font-sans">Central Editor-en-Jefe</p>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-[var(--text-dim)] hover:text-[var(--accent)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h2 className="text-[10px] uppercase tracking-[1.5px] text-[var(--text-dim)] font-bold mb-4">Pipeline de Trabajo</h2>
            <div className="space-y-4">
              {[
                { phase: Phase.EVALUATION, label: "Evaluación", icon: FileText },
                { phase: Phase.DRAFTING, label: "Humanización", icon: Layout },
                { phase: Phase.FIRST_REVIEW, label: "Revisión I", icon: CheckCircle2 },
                { phase: Phase.LAYOUT, label: "Maquetación", icon: Layout },
                { phase: Phase.FINAL_MARKET, label: "Lanzamiento", icon: TrendingUp },
              ].map((p, idx) => (
                <div key={p.phase} className={cn(
                  "flex items-center gap-3 p-2 px-3 rounded-lg transition-all duration-300 text-sm",
                  state.currentPhase === p.phase ? "bg-[var(--bg-surface)] text-[var(--accent)] border-l-2 border-[var(--accent)]" : 
                  state.currentPhase > p.phase ? "text-[var(--accent-dim)]" : "text-[var(--text-dim)] opacity-40"
                )}>
                  <div className={cn(
                    "w-5 h-5 rounded-full border border-[var(--border)] flex items-center justify-center text-[10px]",
                    state.currentPhase === p.phase ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]" : ""
                  )}>
                    {idx + 1}
                  </div>
                  <span className="font-medium">{p.label}</span>
                  {state.currentPhase > p.phase && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                </div>
              ))}
            </div>
          </div>

            <div>
              <h2 className="text-[10px] uppercase tracking-[1.5px] text-[var(--text-dim)] font-bold mb-4">Pulso del Equipo</h2>
              <div className="space-y-3">
                {state.departments.map((dept, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={dept.department} 
                    className="p-3 bg-[var(--bg-surface)] border-l-2 border-[var(--accent)] rounded-r-lg text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-main)] w-full truncate">{dept.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                       <p className="text-[var(--text-dim)] italic leading-relaxed text-[10px]">{dept.status === 'approved' ? 'Resultado Activo' : 'Redactando...'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main id="main-editorial-workspace" className="flex-1 flex flex-col h-full overflow-hidden relative bg-[var(--bg-base)]">
        {/* Header Area */}
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-8 bg-[var(--bg-panel)] z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[var(--text-dim)] hover:text-[var(--accent)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-[var(--accent)] border border-[var(--accent)] px-3 py-1 rounded">Editor-en-Jefe Activo</span>
            <div className="hidden sm:block h-4 w-[1px] bg-[var(--border)]" />
            <span className="text-[10px] lg:text-[12px] font-medium text-[var(--accent)] italic serif truncate max-w-[150px] sm:max-w-none">
              {state.title ? `Proyecto: "${state.title.toUpperCase()}"` : "Objetivo: Excelencia Comercial"}
            </span>
          </div>
          <div className="flex gap-2">
            {state.currentPhase === Phase.EVALUATION && state.departments.length > 0 && (
              <button 
                onClick={startDrafting}
                className="bg-[var(--accent)] text-[var(--bg-base)] px-3 lg:px-4 py-1.5 rounded text-[10px] lg:text-xs font-bold hover:bg-[var(--accent-dim)] hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wider"
              >
                <span className="hidden sm:inline">Pasar a</span> Redacción <Plus className="w-3 h-3" />
              </button>
            )}
            {state.currentPhase === Phase.FIRST_REVIEW && (
              <button 
                onClick={approveManuscript}
                className="bg-[var(--accent)] text-[var(--bg-base)] px-3 lg:px-4 py-1.5 rounded text-[10px] lg:text-xs font-bold hover:bg-[var(--accent-dim)] hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wider"
              >
                Aprobar <CheckCircle2 className="w-3 h-3" />
              </button>
            )}
            {state.currentPhase === Phase.FINAL_MARKET && (
              <button 
                onClick={finalizeProject}
                className="bg-[var(--accent)] text-[var(--bg-base)] px-3 lg:px-4 py-1.5 rounded text-[10px] lg:text-xs font-bold hover:bg-[var(--accent-dim)] hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wider"
              >
                Finalizar <CheckCircle2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </header>

        {/* Chat / View Area */}
        <div id="editorial-content-viewport" className="flex-1 overflow-hidden flex flex-col">
          {/* Chat Interface */}
          <div id="chat-message-stream" ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 scroll-smooth">
            {state.messages.map((m) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={m.id} 
                className={cn(
                  "flex gap-3 lg:gap-4 max-w-4xl",
                  m.role === 'user' ? "ml-auto flex-row-reverse text-right" : ""
                )}
              >
                <div className={cn(
                  "w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-[9px] lg:text-[10px] font-bold shrink-0 shadow-sm border",
                  m.role === 'user' ? "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)]" : "bg-[var(--bg-panel)] text-[var(--accent)] border-[var(--border)]"
                )}>
                  {m.role === 'user' ? "YO" : "EIC"}
                </div>
                <div className={cn(
                  "px-4 lg:px-6 py-3 lg:py-4 rounded-lg text-xs lg:text-sm leading-relaxed",
                  m.role === 'user' ? "bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border)]" : "bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-main)] serif"
                )}>
                  {m.role === 'assistant' && <h3 className="font-serif text-[var(--accent)] mb-1 lg:mb-2 font-bold tracking-wide italic text-[10px] lg:text-xs">Mensaje del Centro de Mando</h3>}
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>
                    {m.content}
                  </ReactMarkdown>
                </div>
                </div>
              </motion.div>
            ))}

            {/* Special Views Based on Phase */}
            {state.humanizedManuscript && (
              <motion.div 
                id="manuscript-viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto mt-6 lg:mt-12 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg overflow-hidden shadow-2xl"
              >
                <div className="bg-[var(--bg-surface)] p-3 lg:p-4 flex items-center justify-between border-b border-[var(--border)]">
                  <h3 className="text-[var(--accent)] text-[10px] lg:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3 lg:w-4 lg:h-4" /> Manuscrito del Proyecto
                  </h3>
                  <button className="text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
                    <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                </div>
                <div className="p-6 lg:p-12 prose prose-invert max-w-none serif text-base lg:text-lg text-[var(--text-main)] leading-loose">
                   <ReactMarkdown>{state.humanizedManuscript}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {state.marketAnalysis && (
              <motion.div 
                id="market-analysis-dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto mt-6 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
              >
                <div className="bg-[var(--bg-panel)] p-6 lg:p-8 rounded-lg text-[var(--text-main)] shadow-xl border border-[var(--border)] border-l-4 border-l-[var(--accent)]">
                  <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--accent)]" />
                    <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-widest">Análisis Económico</h3>
                  </div>
                  <div className="space-y-4 text-xs lg:text-sm">
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div className="p-3 lg:p-4 bg-[var(--bg-surface)] rounded border border-[var(--border)]">
                        <p className="text-[9px] lg:text-[10px] text-[var(--text-dim)] uppercase font-bold mb-1">ROI Proyectado</p>
                        <p className="text-base lg:text-xl font-serif text-[var(--success)]">{state.marketAnalysis.financialProjections.roi}</p>
                      </div>
                      <div className="p-3 lg:p-4 bg-[var(--bg-surface)] rounded border border-[var(--border)]">
                        <p className="text-[9px] lg:text-[10px] text-[var(--text-dim)] uppercase font-bold mb-1">PVP Sugerido</p>
                        <p className="text-base lg:text-xl font-serif text-[var(--accent)]">{state.marketAnalysis.financialProjections.rrp}</p>
                      </div>
                    </div>
                    <div className="p-3 lg:p-4 bg-[var(--bg-surface)] rounded border border-[var(--border)]">
                      <p className="text-[9px] lg:text-[10px] text-[var(--text-dim)] uppercase font-bold mb-1">Historial (5 años)</p>
                      <p className="text-[11px] lg:text-sm opacity-80 leading-relaxed font-sans">{state.marketAnalysis.historicalData}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-panel)] p-6 lg:p-8 rounded-lg border border-[var(--border)] shadow-xl">
                  <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <Layout className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--accent)]" />
                    <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-[var(--text-main)]">Arte y Vistas</h3>
                  </div>
                  <div className="space-y-4">
                    {state.illustrationPrompts.map((prompt, i) => (
                      <div key={i} className="group relative overflow-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                        <img 
                          src={`https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`} 
                          alt={`Concepto ${i+1}`}
                          className="w-full h-32 lg:h-40 object-cover opacity-60 grayscale lg:group-hover:grayscale-0 lg:group-hover:opacity-100 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-2 lg:p-3 border-t border-[var(--border)]">
                          <p className="text-[8px] lg:text-[10px] text-[var(--accent)] font-bold mb-1">LÁMINA {i+1}</p>
                          <p className="text-[8px] lg:text-[10px] text-[var(--text-dim)] italic leading-snug line-clamp-2">"{prompt}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {state.currentPhase === Phase.COMPLETED && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mt-6 lg:mt-12 mb-12 lg:mb-24"
              >
                <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg p-6 lg:p-12 overflow-hidden relative shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 lg:p-8">
                    <div className="w-16 h-16 lg:w-32 lg:h-32 border border-[var(--accent)] rounded-lg rotate-12 flex items-center justify-center opacity-10">
                      <TrendingUp className="w-8 h-8 lg:w-16 lg:h-16 text-[var(--accent)]" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
                    {/* Book Mockup Preview */}
                    <div className="hidden sm:block md:col-span-1">
                      <div className="aspect-[3/4] bg-[var(--bg-surface)] border-4 border-[var(--border)] rounded-l-md rounded-r-3xl shadow-2xl relative overflow-hidden transform hover:-rotate-2 transition-transform duration-500">
                         <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-transparent" />
                         <div className="p-4 lg:p-6 h-full flex flex-col justify-between relative z-10">
                            <div>
                              <p className="text-[6px] lg:text-[8px] uppercase tracking-widest text-[var(--accent)] font-bold mb-2">Prensa Aura Inteligencia</p>
                              <h4 className="text-base lg:text-xl font-serif font-bold leading-tight text-[var(--text-main)]">{state.title}</h4>
                            </div>
                            <div>
                               <p className="text-[8px] lg:text-[10px] serif italic text-[var(--text-dim)]">La Leyenda Oficial</p>
                               <div className="h-1 w-6 lg:w-8 bg-[var(--accent)] mt-2" />
                            </div>
                         </div>
                      </div>
                      <p className="text-center mt-4 text-[8px] lg:text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Prueba de Maqueta Digital</p>
                    </div>

                    <div className="md:col-span-2 space-y-4 lg:space-y-6">
                      <h3 className="text-lg lg:text-2xl font-serif font-bold text-[var(--accent)] tracking-wide italic">"Paquete Maestro de Entrega Listo"</h3>
                      <p className="text-[var(--text-dim)] text-xs lg:text-sm leading-relaxed serif">
                        Comandante, hemos ensamblado la maqueta digital final. El diseño integra el manuscrito humanizado con la dirección de arte cinemática. El sistema está listo para exportar todos los activos:
                      </p>
                      <ul className="space-y-1 lg:space-y-2 text-[10px] lg:text-xs text-[var(--text-main)] font-mono">
                        <li className="flex items-center gap-2 text-wrap"><CheckCircle2 className="w-3 h-3 text-[var(--success)] shrink-0" /> MANUSCRITO_COMPLETO_H1.DOCX</li>
                        <li className="flex items-center gap-2 text-wrap"><CheckCircle2 className="w-3 h-3 text-[var(--success)] shrink-0" /> ACTIVOS_ILUSTRACION_4K.ZIP</li>
                        <li className="flex items-center gap-2 text-wrap"><CheckCircle2 className="w-3 h-3 text-[var(--success)] shrink-0" /> ESTRATEGIA_MARKETING_ROI.PDF</li>
                        <li className="flex items-center gap-2 text-wrap"><CheckCircle2 className="w-3 h-3 text-[var(--success)] shrink-0" /> DISEÑO_LIBRO_V1.INDD</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isLoading && (
              <div className="flex items-center gap-3 text-[#c5a059] animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] uppercase font-bold tracking-widest">La Agencia está procesando...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div id="editor-input-panel" className="p-4 lg:p-8 border-t border-[var(--border)] bg-[var(--bg-panel)]">
            <div className="max-w-4xl mx-auto relative group">
              <textarea
                id="main-editorial-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Introducir comando... (Alt+S)"
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 lg:p-6 pr-12 lg:pr-16 text-xs lg:text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all min-h-[80px] lg:min-h-[100px] resize-none serif italic text-[var(--text-main)] placeholder:font-sans placeholder:not-italic placeholder:text-[var(--text-dim)]"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-4 lg:right-6 bottom-4 lg:bottom-6 p-2 lg:p-3 bg-[var(--accent)] text-[var(--bg-base)] rounded-lg hover:bg-[var(--accent-dim)] hover:text-white transition-all duration-300 disabled:opacity-30 shadow-lg"
              >
                {isLoading ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <Send className="w-4 h-4 lg:w-5 lg:h-5" />}
              </button>
            </div>
            <p className="text-center mt-3 lg:mt-4 text-[8px] lg:text-[9px] uppercase tracking-[1px] lg:tracking-[1.5px] text-[var(--text-dim)] font-bold">
              Canal Editorial Seguro © 2026
            </p>
          </div>
        </div>

        {/* Global Progress Overlay */}
        {state.currentPhase === Phase.COMPLETED && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[var(--bg-base)]/95 backdrop-blur-xl z-[60] flex items-center justify-center p-6 lg:p-12"
          >
            <div className="max-w-2xl text-center space-y-6 lg:space-y-8">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-[var(--accent)] rounded-lg border border-[var(--border)] flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle2 className="w-8 h-8 lg:w-12 lg:h-12 text-[var(--bg-base)]" />
              </div>
              <div>
                <h2 className="text-3xl lg:text-5xl font-serif font-bold text-[var(--text-main)] mb-2 leading-tight uppercase tracking-widest">Finalizado</h2>
                <p className="text-[var(--accent)] font-mono tracking-widest text-[10px] lg:text-sm uppercase">Excelencia Comercial Alcanzada</p>
              </div>
              <p className="text-sm lg:text-lg serif italic text-[var(--text-dim)] leading-relaxed">
                "La historia está completa. Hemos logrado un flujo humano-orgánico al 100%. Archivos maestros listos."
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-4 flex-wrap">
                <button 
                  onClick={() => setShowLayout(true)}
                  className="bg-transparent text-[var(--text-main)] border border-[var(--border)] px-6 lg:px-8 py-3 lg:py-4 rounded font-bold uppercase tracking-widest text-[10px] lg:text-xs hover:bg-[var(--bg-surface)] transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Ver Libro Maquetado
                </button>
                <button 
                 onClick={handleDownload}
                 disabled={isLoading}
                 className="bg-[var(--accent)] text-[var(--bg-base)] px-6 lg:px-8 py-3 lg:py-4 rounded font-bold uppercase tracking-widest text-[10px] lg:text-xs hover:bg-[var(--accent-dim)] hover:text-white transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  {isLoading ? "Generando..." : "Descargar Paquete"}
                </button>
                <button 
                  onClick={handleReset}
                  className="border border-[var(--border)] text-[var(--text-main)] px-6 lg:px-8 py-3 lg:py-4 rounded font-bold uppercase tracking-widest text-[10px] lg:text-xs hover:bg-[var(--bg-panel)] transition-all"
                >
                  Nuevo Proyecto
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Book Layout Modal */}
        <AnimatePresence>
          {showLayout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[var(--bg-base)] flex items-center justify-center p-2 lg:p-8"
            >
              <button 
                onClick={() => { setShowLayout(false); setCurrentSpread(0); }}
                className="absolute top-4 right-4 lg:top-8 lg:right-8 p-3 bg-[var(--bg-panel)] rounded-full text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors border border-[var(--border)] z-[200] shadow-2xl"
              >
                <X className="w-6 h-6" />
              </button>
              
              {(() => {
                const chapters = state.humanizedManuscript.split('### ').filter(Boolean);
                if (!chapters || chapters.length === 0) return null;
                const totalSpreads = chapters.length;
                const chapter = chapters[currentSpread] || '';
                const lines = chapter.split('\n');
                const title = lines[0];
                const content = lines.slice(1).join('\n').trim();
                const imagePrompt = state.illustrationPrompts[currentSpread % state.illustrationPrompts.length] || state.concept;

                return (
                  <div className="flex flex-col lg:flex-row w-full max-w-6xl h-[90vh] lg:h-[80vh] bg-[var(--bg-panel)] rounded-xl overflow-hidden shadow-2xl relative border border-[var(--border)]">
                    
                    {/* Left Page (Text) */}
                    <div className="w-full lg:w-1/2 p-6 lg:p-16 overflow-y-auto flex flex-col pt-16 relative">
                       <p className="text-[10px] uppercase tracking-[3px] text-[var(--text-dim)] font-bold mb-8 text-center">{state.title}</p>
                       <h2 className="text-2xl lg:text-3xl font-serif font-bold text-[var(--accent)] mb-8 leading-tight">
                         {title}
                       </h2>
                       <div className="prose prose-sm lg:prose-base max-w-none prose-invert font-serif leading-relaxed text-[var(--text-main)] first-letter:text-6xl first-letter:font-bold first-letter:text-[var(--accent)] first-letter:mr-3 first-letter:float-left first-letter:mt-1">
                         <ReactMarkdown>{content}</ReactMarkdown>
                       </div>
                       
                       <div className="mt-8 text-center sticky bottom-0 bg-[var(--bg-panel)] pt-4 pb-12 lg:pb-0">
                         <span className="text-xs font-serif text-[var(--text-dim)]">{currentSpread * 2 + 1}</span>
                       </div>
                    </div>

                    {/* Right Page (Illustration) */}
                    <div className="w-full lg:w-1/2 bg-[var(--bg-surface)] relative overflow-hidden flex flex-col group min-h-[300px] lg:min-h-0 border-t lg:border-t-0 lg:border-l border-[var(--border)]">
                      <img 
                        src={`https://picsum.photos/seed/${encodeURIComponent(title)}/800/1000`} 
                        alt={title}
                        className="w-full h-full object-cover opacity-80 mix-blend-screen transition-all duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-panel)]/80 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-6 left-0 right-0 text-center z-10 pb-16 lg:pb-0">
                         <span className="text-xs font-serif text-[var(--text-main)] bg-[var(--bg-panel)] px-3 py-1 rounded-full shadow-sm border border-[var(--border)]">{currentSpread * 2 + 2}</span>
                       </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 lg:gap-8 z-50 bg-[var(--bg-base)]/80 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-[var(--border)] w-max">
                      <button 
                        onClick={() => setCurrentSpread(p => Math.max(0, p - 1))}
                        disabled={currentSpread === 0}
                        className="p-2 rounded-full hover:bg-[var(--accent)] hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-main)] text-[var(--text-main)]"
                      >
                        <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                      </button>
                      <span className="text-[10px] lg:text-xs uppercase tracking-widest font-bold text-[var(--text-dim)] whitespace-nowrap">
                        Página {currentSpread + 1} de {totalSpreads}
                      </span>
                      <button 
                         onClick={() => setCurrentSpread(p => Math.min(totalSpreads - 1, p + 1))}
                         disabled={currentSpread === totalSpreads - 1}
                         className="p-2 rounded-full hover:bg-[var(--accent)] hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-main)] text-[var(--text-main)]"
                      >
                        <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                      </button>
                    </div>

                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}
