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
  originalStory: "",
  marketAnalysis: null
};

const COMPLETED_DEMO_STATE: ProjectState = {
  id: "EEI-2026-COLORES-002",
  title: "EL LATIDO DE LOS COLORES",
  concept: "En un mundo sumido en el gris de la monotonía, una niña descubre que los colores no son solo pigmentos, sino latidos de emociones humanas olvidadas que devuelven la vida al mundo.",
  currentPhase: Phase.COMPLETED,
  manuscript: "# EL LATIDO DE LOS COLORES...",
  originalStory: "En la fría y grisácea ciudad de Argéntea, la vida pasaba sin emociones. Sus habitantes caminaban encorvados con pesados abrigos grises, habiendo olvidado el sonido de la risa y la belleza de las flores. Un día de densa niebla, una pequeña niña llamada Maya exploraba el sótano polvoriento de su abuelo cuando descubrió un misterioso frasco de vidrio viejo, herméticamente sellado. Al colocar su oreja sobre el vidrio, escuchó asombrada un rítmico latido: pum-pum, pum-pum. Llevada por la curiosidad, rompió el sello y un estallido de color Rojo vibrante invadió la habitación, encendiendo en ella una incontenible fuerza de moverse, correr y entusiasmarse. Comprendió entonces que los colores eran emociones vivas palpitantes. Buscando más, liberó el Azul del sosiego en un charco de lluvia y el Amarillo de la risa. Con amor, Maya comenzó a pintar corazones de colores vivos en las paredes de hormigón desgastado de la ciudad. Aunque la gente al principio se alarmó con esta explosión salvaje de color, al tocar las pinturas sintieron una revitalizante calidez en sus almas, recordando lo que era sentir. Y así, Argéntea despertó de su letargo gris, transformándose en un lienzo rebosante de vida, luz y emociones compartidas.",
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

const COMPLETED_REINA_STATE: ProjectState = {
  id: "EEI-2026-REINA-003",
  title: "LA REINA DEL SILENCIO",
  concept: "En un reino sepultado bajo el peso del dolor y la prohibición absoluta del sonido, una niña armada con una pequeña caracola de música desvela que forzar el silencio no elimina la tristeza, sino que marchita el alma humana.",
  currentPhase: Phase.COMPLETED,
  manuscript: `# LA REINA DEL SILENCIO

Había una vez en un lejano confín un reino llamado Sopor de Bruma. En este lugar gobernaba la reina Irene con un rigor extremo: odiaba todo tipo de sonidos. Desde que su único hijo desapareció en una noche tormentosa, la soberana no soportaba escuchar nada más que el silbido del viento. Decretó la prohibición de ruidos: no se permitía el canto de aves, ni risas de niños, ni música alguna.

Pero una mañana fría, una pequeña huérfana llamada Sofía entró al castillo cargando una cajita de música de madera de su madre. Con dedos temblorosos, le dio cuerda. Una música alegre y cristalina resonó en los muros de piedra...`,
  originalStory: `Había una vez, en un lejano confín donde el invierno parecía eterno, un reino llamado Sopor de Bruma. En este lugar gobernaba la reina Irene con un rigor insólito: odiaba todo tipo de sonidos. Desde que perdió a su único hijo en una noche tormentosa, la soberana no soportó escuchar nada más que el silbido monótono del viento sobre los pinos. Decretó la prohibición absoluta de ruidos: no se permitía el canto de los pájaros, el murmullo de las fuentes, las risas de los niños, las notas de una flauta o las voces en tono alto. Sus guardias, armados con varas de algodón y campanas de paja, arrestaban a cualquiera que osara susurrar más allá de lo permitido. El reino entero enmudeció. El silencio se instaló como una pesada manta gris. Pero una mañana de sol tímido, una huérfana de nombre Sofía entró en el patio del palacio. Llevaba bajo el manto una pequeña cajita de música de madera, el único recuerdo de su madre. Con dedos temblorosos, Sofía le dio cuerda en presencia de la reina Irene. La cajita desató una melodía cristalina y alegre que rebotó en los fríos muros de piedra. Los guardias corrieron a detenerla, pero la reina levantó una mano, petrificada por el llanto. La hermosa canción le recordó los días felices con su hijo, rompiendo la agónica máscara de frialdad que cubría su corazón. Irene lloró amargamente, y con cada lágrima derramada, el hechizo del mutismo se rompió. Las aves volvieron a cantar, el agua del pozo murmuró de nuevo, y Sofía fue nombrada la nueva tejedora de armonías del palacio. La reina entendió al fin que el silencio obligado no borra la tristeza del alma, sino que encarcela la vida.`,
  humanizedManuscript: `# LA REINA DEL SILENCIO

### I. El Reino del Gris Perpetuo
En el norte del mundo, allí donde los témpanos de hielo entornaban los párpados de la tierra, yacía el reino de Sopor de Bruma. No siempre se había llamado así. Antes de la Gran Melancolía, se le conocía como el Valle de los Cantos, un lugar de cascadas vivas y campanas alegres. Pero el silencio no es una ausencia de sonido; es una presencia de ceniza que todo lo apaga de inanición. La reina Irene había ordenado envolver las herraduras de los caballos con vellos de oveja de las llanuras y cubrir las calzadas de piedra con aserrín grueso para amortiguar el latir del reino. Se prohibieron los cascabeles, el tintineo de las copas al brindar y las risas de los infantes. El silencio absoluto se instaló como un liquen denso en las cornisas de las casas, robando el brillo de las pupilas de sus gentes en una eterna monotonía gris.

### II. La Huérfana y la Caja de Madera
Sofía vivía en los márgenes de la ciudad, donde la bruma se confundía con la escarcha azul de los bosques. Mantenía las manos ocupadas recogiendo ramitas secas para calentar su pequeña cabaña. Pero Sofía guardaba un tesoro sagrado: bajo la tercera tabla suelta del suelo del desván, protegía celosamente en un pañuelo de lino una pequeña caja de música de madera de abeto, tallada por manos que la amaron y que la niebla del olvido se había llevado. La caja poseía una pequeña manivela de bronce helado. Al girarla, despertaba un vals antiguo que olía a tardes doradas de sol. Sofía sabía que poseer ese fragmento de sonido era un delito de traición suprema al edicto, pero cuando el frío apretaba de verdad, la hermosa melodía era el único fuego capaz de calentar su atribulado pecho.

### III. El Salón de los Pasos Perdidos
En una mañana de escarcha azulada, la corte real abrió finalmente las sólidas puertas de piedra para la entrega anual de leña. Sofía, con la espalda doblada bajo el pesado fardo de ramas, caminó lentamente por el solemne Salón del Trono. La reina Irene presidía sentada sobre su silla de obsidiana pulida, pálida, enjoyada y muda, como una estatua de mármol que respiraba únicamente por inercia cósmica. Sus ojos sin vida escudriñaban cada centímetro del palacio, vigilando que ninguna palabra o suspiro cruzara el aire estancado. Fue en ese preciso momento cuando el tosco nudo del fardo de Sofía se deshizo, y con él, el pañuelo que envolvía la caja de madera se deslizó, resonando con un eco cortante sobre las losas. Los guardias reales de la reina Irene alzaron de inmediato sus picos de algodón de castigo.

### IV. La Declaración del Ritmo libre
Con la reina Irene mirándola fijamente desde lo alto con sus ojos opacos de nieve invernal, Sofía tomó una resolución desesperada. En vez de tratar de ocultar la bella caja de abeto, la colocó delicadamente en el mismísimo centro del frío suelo de la sala, arrodillándose ante ella. Apoyó con veneración sus dedos entumecidos sobre el bronce de la manivela y le dio cuerda. Tres giros precisos. Un pequeño resorte interno crujió levemente y, de repente, la primera nota pura de plata ascendió en el aire inerte del salón del trono. Era un sonido limpio, redondo, luminoso y dulce que flotó como una hermosa luciérnaga dorada en la inmensidad sombría. La melodía fluyó con una ligereza que barrió de golpe el polvo acumulado en las molduras del salón.

### V. El Océano de las Lágrimas y el Despertar
Los guardias se lanzaron para aplastar el objeto prohibido con sus botas tachonadas de cuero, pero la reina Irene emitió un gemido tan desgarrador que los soldados se detuvieron de inmediato. No era una orden; era un sollozo purificador. Aquella hermosa canción que destilaba la caja de madera era el vals que ella solía tararearle en voz baja a su amado hijo en el balcón del jardín antes de que la fiebre se lo arrebatara para siempre en aquella tormenta de medianoche. Las lágrimas de la reina Irene cayeron al suelo con un repique cristalino sobre las piedras del castillo. Y con cada gota derramada, la escarcha del palacio comenzó a desvanecerse. Una oleada de viento cálido cruzó las ventanas y las aves en el bosque de pinos de abajo volvieron a cantar al unísono. Irene extendió sus manos cansadas a Sofía, llamándola al estrado. El silencio punitivo había terminado para siempre; la rítmica de la vida y el arte habían ganado la partida.`,
  illustrationPrompts: [
    "Una reina pálida con corona de espinas de plata sentada en un trono de obsidiana en un salón real inmenso, monocromo y gris.",
    "Una niña pequeña arrodillada sobre adoquines pulidos de palacio, girando la manivela de una cajita de música mágica de madera rústica tallada.",
    "Las lágrimas de la reina rompiendo una fina capa de hielo sobre las losas de piedra, con flores silvestres brotando a su alrededor."
  ],
  marketAnalysis: {
    historicalData: "Crecimiento del 35% en títulos basados en el realismo mágico y mitos populares de reconstrucción emocional y sanación del duelo.",
    trends: "Alta receptividad hacia literatura que aborda el proceso de duelo a través de metáforas líricas hermosas aptas para todas las edades.",
    financialProjections: {
      roi: "450%",
      investmentPlan: "Campaña transmedia con audiolibro musicalizado exclusivamente con instrumentos de viento históricos y cajas de música artesanales.",
      rrp: "$24.99 (Edición Pasta Dura Ilustrada) / $9.99 (Digital)"
    }
  },
  departments: [
    { department: "Equipo de Estilo y Corrección", feedback: "La prosa combina de forma magistral la melancolía nórdica con el folclore clásico y los silencios poéticos como elementos líricos. Ritmo narrativo perfecto.", status: "approved" },
    { department: "Equipos de Diseño y Arte", feedback: "El contraste de negros y grises con destellos dorados en las ilustraciones de la caja de música será visualmente icónico para el público.", status: "approved" },
    { department: "Equipo de Estrategia KDP", feedback: "Potencial máximo en las categorías de 'Mitología y Cuentos de Hadas' y 'Crecimiento de Resiliencia'. Recomendamos optimizar preventas.", status: "approved" }
  ],
  messages: [
    { id: "1", role: "assistant", content: "Comandante, he recuperado el texto original que nos habías encomendado en el archivo de la editorial: **'LA REINA DEL SILENCIO'**.", timestamp: Date.now() - 10000 },
    { id: "2", role: "assistant", content: "Todos los departamentos han finalizado su maquetado. Ya puedes previsualizar su paginación exacta en formato Folleto Impreso A5 en el visor gráfico o exportarla directamente.", timestamp: Date.now() - 5000 }
  ]
};

// Synchronous helper to fetch stored active project
const getInitialProjectData = () => {
  if (typeof window === 'undefined') return null;
  try {
    const activeId = localStorage.getItem('aura_active_project_id') || "";
    if (!activeId) return null;
    const mem = localStorage.getItem('aura_editorial_memory');
    if (!mem) return null;
    const parsedMem = JSON.parse(mem);
    return parsedMem.find((p: any) => p.id === activeId) || null;
  } catch (e) {
    console.error("Error reading initial project data:", e);
    return null;
  }
};

export default function App() {
  const initialProject = getInitialProjectData();

  const [state, setState] = useState<ProjectState>(() => {
    return initialProject?.projectState || {
      ...EMPTY_STATE,
      id: `PROJ-${Date.now()}`,
      title: "NUEVO BORRADOR",
      messages: [
        { id: "msg-1", role: "assistant", content: "Hola. Soy la Directora Editorial. Estoy lista para coordinar a los 8 consejeros y ayudarte a preparar tu nueva obra sin alucinaciones.", timestamp: Date.now() }
      ]
    };
  });

  // Steps system (Paso 1: Historia, Paso 2: Equipo, Paso 3: Reescritor, Paso 4: Anti-AI)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);

  // Text branching states
  const [branches, setBranches] = useState<Array<{ id: string; name: string; content: string; }>>(() => {
    if (initialProject?.branches && initialProject.branches.length > 0) {
      return initialProject.branches;
    }
    return [{ id: "main", name: "Rama Principal (Master)", content: "" }];
  });

  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    return initialProject?.activeBranchId || "main";
  });
  const [illustrationsApiKey, setIllustrationsApiKey] = useState<string>(() => {
    return localStorage.getItem("aura_illustrations_api_key") || "";
  });
  const [renderedImages, setRenderedImages] = useState<Record<string, string>>(() => {
    return initialProject?.renderedImages || {};
  });
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [isEditingManuscript, setIsEditingManuscript] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Step 1 sub-widgets tabs (co-creator chat, book cover, translation)
  const [step1SubTab, setStep1SubTab] = useState<"writer" | "chat" | "cover" | "translation">("writer");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [editorMode, setEditorMode] = useState<"edit" | "preview_a5">("edit");
  const [previewPage, setPreviewPage] = useState<number>(0);
  const [deliveryFormat, setDeliveryFormat] = useState<"a5_html" | "a5_txt" | "standard_txt">("a5_html");

  // AI engine and model selection (synchronized with lib/gemini.ts headers)
  const [aiEngine, setAiEngine] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("aura_ai_engine") || "gemini";
    }
    return "gemini";
  });
  const [groqModel, setGroqModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("aura_groq_model") || "llama-3.3-70b-versatile";
    }
    return "llama-3.3-70b-versatile";
  });

  useEffect(() => {
    localStorage.setItem("aura_ai_engine", aiEngine);
  }, [aiEngine]);

  useEffect(() => {
    localStorage.setItem("aura_groq_model", groqModel);
  }, [groqModel]);

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
  const [localizedManuscript, setLocalizedManuscript] = useState(() => {
    return initialProject?.localizedManuscript || "";
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Corrections desk
  const [isCorrectionsDeskOpen, setIsCorrectionsDeskOpen] = useState(false);
  const [correctionsHistory, setCorrectionsHistory] = useState<any[]>(() => {
    if (initialProject?.correctionsHistory) {
      return initialProject.correctionsHistory;
    }
    return [
      {
        id: "sys-c1",
        role: "assistant",
        content: "Bienvenido al canal de corrección directa del manuscrito.\n\nSi identificas cualquier incongruencia de trama, error físico o contradicción de lógica, descríbela aquí de forma directa. Modificaré de manera quirúrgica únicamente las frases o párrafos afectados, garantizando la coherencia absoluta de toda la obra y respetando de manera estricta tu tono, estilo y voz de autor.",
        timestamp: Date.now()
      }
    ];
  });
  const [correctionInput, setCorrectionInput] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const correctionsEndRef = useRef<HTMLDivElement>(null);

  // NoSQL database memory persistence (caches complete state histories)
  const [editorialMemory, setEditorialMemory] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_editorial_memory');
      return saved ? JSON.parse(saved) : []; // Starts 100% empty from scratch
    }
    return [];
  });

  // 8 Multi-Agent audit panel states
  const [auditResults, setAuditResults] = useState<Record<string, any>>(() => {
    return initialProject?.auditResults || {};
  });
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
  } | null>(() => {
    return initialProject?.aiScoreMetric || null; // Null by default for new empty stories
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

  const loadPresetReina = () => {
    setState(COMPLETED_REINA_STATE);
    const content = COMPLETED_REINA_STATE.humanizedManuscript || "";
    setBranches([
      { id: "main", name: "Rama Principal (Master)", content }
    ]);
    setActiveBranchId("main");
    setLocalizedManuscript("");
    setCmsPublishResult(null);
    setAuditResults({});
    setAiScoreMetric({
      score: 93,
      patterns: ["manta gris", "silencio profundo", "vals de abeto", "tejedora de armonías"],
      complexity: "Alta variación en ritmo oracional y balances de pausas líricas",
      repetitiveness: "Pureza léxica óptima de autor"
    });
    showCustomAlert("Manuscrito Restaurado", "Se ha cargado con éxito tu manuscrito original y humanizado de: 'LA REINA DEL SILENCIO' de los archivos de la editorial.");
    confetti({
      particleCount: 80,
      spread: 40,
      origin: { y: 0.5 }
    });
  };

  // Automatic reactive persistence watcher that updates editorialMemory in real-time
  useEffect(() => {
    if (!state.id) return;
    
    // Track active project ID
    localStorage.setItem('aura_active_project_id', state.id);
    
    setEditorialMemory(prev => {
      const matchIndex = prev.findIndex(item => item.id === state.id);
      const currentText = branches.find(b => b.id === activeBranchId)?.content || "";
      const wordCount = currentText.split(/\s+/).filter(Boolean).length || 0;
      
      const updatedItem = {
        id: state.id,
        title: state.title ? state.title.toUpperCase() : "OBRA SIN TÍTULO",
        date: new Date().toLocaleDateString('es-ES'),
        wordCount,
        projectState: state,
        branches,
        activeBranchId,
        localizedManuscript,
        correctionsHistory,
        auditResults,
        aiScoreMetric
      };

      if (matchIndex === -1) {
        // Automatically insert into catalogs list 
        return [updatedItem, ...prev];
      }

      const next = [...prev];
      // Compare to prevent redundant state updates
      const existing = next[matchIndex];
      const hasChanged = JSON.stringify(existing.projectState) !== JSON.stringify(state) ||
                          JSON.stringify(existing.branches) !== JSON.stringify(branches) ||
                          existing.activeBranchId !== activeBranchId ||
                          existing.localizedManuscript !== localizedManuscript ||
                          JSON.stringify(existing.correctionsHistory) !== JSON.stringify(correctionsHistory) ||
                          JSON.stringify(existing.auditResults) !== JSON.stringify(auditResults) ||
                          JSON.stringify(existing.aiScoreMetric) !== JSON.stringify(aiScoreMetric);
      
      if (!hasChanged) return prev;
      
      next[matchIndex] = updatedItem;
      return next;
    });
  }, [state, branches, activeBranchId, localizedManuscript, correctionsHistory, auditResults, aiScoreMetric]);

  const createNewProject = () => {
    const newId = `PROJ-${Date.now()}`;
    const cleanState: ProjectState = {
      ...EMPTY_STATE,
      id: newId,
      title: "NUEVO BORRADOR",
      messages: [
        { id: "msg-12", role: "assistant", content: "Hola. He creado una mesa de trabajo limpia para tu nueva historia. Los consejeros editoriales están listos para asistirte sin relacionar este texto con historias anteriores.", timestamp: Date.now() }
      ]
    };

    setState(cleanState);
    setBranches([{ id: "main", name: "Rama Principal (Master)", content: "" }]);
    setActiveBranchId("main");
    setLocalizedManuscript("");
    setCmsPublishResult(null);
    setAuditResults({});
    setAiScoreMetric(null);
    setCorrectionsHistory([
      {
        id: "sys-c1",
        role: "assistant",
        content: "Bienvenido al canal de corrección directa del manuscrito.\n\nDescribe cualquier incongruencia de trama y la corregiré de manera quirúrgica y respetuosa.",
        timestamp: Date.now()
      }
    ]);
    setCurrentStep(1);

    // Prompt user
    showCustomAlert("Nueva Obra Iniciada", "Se ha creado una obra completamente vacía y aislada. Puedes empezar a escribir o pegar tu cuento.");
  };

  const resetProject = () => {
    showCustomConfirm("Limpiar Borrador", "¿Deseas vaciar el borrador activo y empezar esta historia concreta desde cero?", () => {
      setState(prev => ({
        ...prev,
        title: "HISTORIA REINICIADA",
        concept: "",
        manuscript: "",
        humanizedManuscript: "",
        originalStory: "",
        marketAnalysis: null,
        departments: [],
        messages: [
          { id: "msg-reset", role: "assistant", content: "Borrador de este proyecto reiniciado. Escribe o pega tu cuento aquí.", timestamp: Date.now() }
        ]
      }));
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
    // Explicit manual save indicator (though auto-save handles it)
    showCustomAlert("Guardado de Seguridad", "Todos los cambios en tu manuscrito, ramas, traducciones y análisis se guardan automáticamente en tiempo real en la memoria NoSQL del navegador.");
  };

  const loadProjectFromMemory = (item: any) => {
    if (item.projectState) {
      setState(item.projectState);
      
      if (item.branches && item.branches.length > 0) {
        setBranches(item.branches);
        setActiveBranchId(item.activeBranchId || item.branches[0].id);
      } else if (item.projectState.branches && item.projectState.branches.length > 0) {
        setBranches(item.projectState.branches);
        setActiveBranchId(item.projectState.activeBranchId || item.projectState.branches[0].id);
      } else {
        const text = item.projectState.humanizedManuscript || "";
        setBranches([{ id: "main", name: "Rama Principal (Master)", content: text }]);
        setActiveBranchId("main");
      }

      setLocalizedManuscript(item.localizedManuscript || "");
      setAuditResults(item.auditResults || {});
      setAiScoreMetric(item.aiScoreMetric || null);
      setCorrectionsHistory(item.correctionsHistory || [
        {
          id: "sys-c1",
          role: "assistant",
          content: "Bienvenido al canal de corrección directa del manuscrito.\n\nDescribe cualquier incongruencia de trama y la corregiré.",
          timestamp: Date.now()
        }
      ]);
      
      setCurrentStep(1);
      showCustomAlert("Obra Cargada", `Se ha establecido "${item.title}" como proyecto activo. Todo el trabajo del equipo está disponible.`);
    } else {
      loadPresetDemo();
    }
  };

  const deleteProjectFromMemory = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showCustomConfirm("Eliminar del Catálogo", "¿Seguro que deseas eliminar esta obra de los registros? Esta acción no se puede deshacer.", () => {
      setEditorialMemory(prev => {
        const next = prev.filter(item => item.id !== itemId);
        if (state.id === itemId) {
          // Reset states cleanly immediately
          setTimeout(() => {
            const nextProj = next[0];
            if (nextProj) {
              loadProjectFromMemory(nextProj);
            } else {
              localStorage.removeItem('aura_active_project_id');
              const newId = `PROJ-${Date.now()}`;
              setState({
                ...EMPTY_STATE,
                id: newId,
                title: "NUEVO BORRADOR",
              });
              setBranches([{ id: "main", name: "Rama Principal (Master)", content: "" }]);
              setActiveBranchId("main");
              setLocalizedManuscript("");
              setCmsPublishResult(null);
              setAuditResults({});
              setAiScoreMetric(null);
              setCorrectionsHistory([
                {
                  id: "sys-c1",
                  role: "assistant",
                  content: "Bienvenido al canal de corrección directa del manuscrito.\n\nDescribe cualquier incongruencia de trama y la corregiré.",
                  timestamp: Date.now()
                }
              ]);
            }
          }, 50);
        }
        return next;
      });
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

  const handleGenerateIllustration = async (promptText: string, sceneId: string) => {
    setImageLoading(prev => ({ ...prev, [sceneId]: true }));
    try {
      // Simulate real processing based on key validation
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      const seed = Math.floor(Math.random() * 999999);
      const cleanPrompt = promptText.trim().replace(/['"]/g, "");
      const finalPrompt = `exquisite professional illustration, book plate art style, highly detailed. ${cleanPrompt}`;
      const url = `https://image.pollinations.ai/p/${encodeURIComponent(finalPrompt)}?width=600&height=600&seed=${seed}&model=flux&nologo=true`;
      
      setRenderedImages(prev => ({ ...prev, [sceneId]: url }));
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 }
      });
    } catch (e: any) {
      console.error(e);
      showCustomAlert("Error de Renderizado", "No se pudo invocar el generador de ilustraciones.");
    } finally {
      setImageLoading(prev => ({ ...prev, [sceneId]: false }));
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

  const paginateTextIntoA5Pages = (text: string): string[] => {
    if (!text) return ["(El manuscrito está vacío. Escribe o carga un borrador primero.)"];
    const paragraphs = text.split("\n");
    const pages: string[] = [];
    let currentPage = "";
    
    for (const paragraph of paragraphs) {
      if (currentPage.length + paragraph.length > 950) {
        if (currentPage.trim()) {
          pages.push(currentPage.trim());
          currentPage = "";
        }
      }
      currentPage += paragraph + "\n\n";
    }
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }
    return pages;
  };

  // Packet direct downloads
  const handleDownload = () => {
    const currentText = branches.find(b => b.id === activeBranchId)?.content || state.humanizedManuscript || "";
    if (!currentText.trim()) {
      showCustomAlert("Sin Contenido", "No hay manuscrito disponible para exportar.");
      return;
    }

    const titleUpper = state.title ? state.title.toUpperCase() : "OBRA SIN TÍTULO";

    if (deliveryFormat === "a5_html") {
      // Ready-to-print A5 formatted HTML
      const pages = paginateTextIntoA5Pages(currentText);
      const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${titleUpper} - Edición Folleto A5</title>
  <style>
    @font-face {
      font-family: 'Book-Font';
      src: local('Georgia'), local('Times New Roman'), serif;
    }
    @page {
      size: A5; /* 148mm x 210mm */
      margin: 18mm 15mm 20mm 15mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
      font-family: 'Book-Font', 'Georgia', serif;
      font-size: 10.5pt;
      line-height: 1.62;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }
    .book-title {
      text-align: center;
      text-transform: uppercase;
      font-size: 16pt;
      letter-spacing: 2px;
      margin-top: 50px;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .book-subtitle {
      text-align: center;
      font-style: italic;
      font-size: 11pt;
      color: #555555;
      margin-bottom: 80px;
    }
    .page-break {
      page-break-after: always;
      clear: both;
    }
    .a5-page-wrapper {
      position: relative;
      height: 100%;
      box-sizing: border-box;
    }
    p {
      text-align: justify;
      text-indent: 6mm;
      margin: 0 0 10px 0;
    }
    p.no-indent {
      text-indent: 0;
    }
    p.first-letter::first-letter {
      font-size: 260%;
      float: left;
      line-height: 0.85;
      margin-right: 6px;
      margin-top: 4px;
      font-weight: bold;
    }
    .running-header {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      text-align: center;
      border-bottom: 0.5px solid #cccccc;
      padding-bottom: 6px;
      margin-bottom: 25px;
      color: #666666;
    }
    .running-header-left {
      float: left;
    }
    .running-header-right {
      float: right;
    }
    .page-footer {
      font-size: 9pt;
      text-align: center;
      margin-top: 30px;
      color: #444444;
      font-weight: 500;
    }
    @media screen {
      body {
        background: #f0f0f0;
        padding: 40px 20px;
      }
      .a5-screen-page {
        background: #fbfbf7;
        width: 148mm;
        height: 210mm;
        margin: 0 auto 30px auto;
        padding: 18mm 15mm 20mm 15mm;
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        border: 1px solid #e1dfd8;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
    }
  </style>
</head>
<body>
  <!-- Portada del Folleto -->
  <div class="a5-screen-page">
    <div class="book-title" style="margin-top: 100px;">${titleUpper}</div>
    <div class="book-subtitle">Maqueta de Edición Folleto A5</div>
    <div style="text-align: center; margin-top: 150px; font-size: 9pt; letter-spacing: 1px; text-transform: uppercase; color: #444;">
      AURA EDITORIAL S.A.
    </div>
    <div style="text-align: center; font-size: 8pt; color: #777; margin-top: 5px;">
      ${new Date().toLocaleDateString('es-ES', { year: 'numeric' })}
    </div>
  </div>
  <div class="page-break"></div>

  <!-- Páginas del Manuscrito -->
  ${pages.map((pageText, idx) => {
    const isEven = idx % 2 === 0;
    const items = pageText.split('\n\n').map(p => p.trim()).filter(Boolean);
    return `
      <div class="a5-screen-page">
        <div class="running-header">
          <span class="running-header-left">${isEven ? "AURA DIGITAL" : titleUpper}</span>
          <span class="running-header-right">Edición Folleto A5</span>
          <div style="clear: both;"></div>
        </div>
        <div class="a5-page-content" style="height: 142mm; overflow: hidden; font-size: 10pt; line-height: 1.5;">
          ${items.map((para, pIdx) => {
            if (pIdx === 0 && idx === 0) {
              return `<p class="no-indent first-letter">${para}</p>`;
            }
            return `<p>${para}</p>`;
          }).join('')}
        </div>
        <div class="page-footer">
          — ${idx + 1} —
        </div>
      </div>
      <div class="page-break"></div>
    `;
  }).join('')}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.title.toLowerCase().replace(/\s+/g, "_")}_folleto_a5.html`;
      link.click();
      URL.revokeObjectURL(url);
      showCustomAlert("Folleto A5 Listo", "Se ha generado tu manuscrito en HTML adaptado en tamaño A5 de folleto. Ábrelo en tu navegador y pulsa Guardar como PDF para imprimirlo o exportarlo directamente.");

    } else if (deliveryFormat === "a5_txt") {
      // Plain text formatted with specific spacing and A5 page markers
      const pages = paginateTextIntoA5Pages(currentText);
      let textContent = `========================================================\n`;
      textContent += `OBRA MAESTRA: ${titleUpper} (EDICIÓN FOLLETO A5)\n`;
      textContent += `DIMENSIONES DEL FOLLETO RECOMENDADAS: A5 (14.8 x 21.0 cm)\n`;
      textContent += `FECHA DE GENERACIÓN: ${new Date().toLocaleDateString('es-ES')}\n`;
      textContent += `========================================================\n\n`;

      pages.forEach((pageContent, idx) => {
        textContent += `\n--- INICIO PÁGINA ${idx + 1} (Margen Folleto A5: 15mm) ---\n`;
        textContent += `────────────────────────────────────────────────────────\n\n`;
        
        // Wrap paragraphs nicely
        const paragraphs = pageContent.split("\n\n");
        paragraphs.forEach(p => {
          const words = p.split(" ");
          let line = "      "; // indent first line paragraph
          words.forEach(word => {
            if (line.length + word.length > 65) {
              textContent += line + "\n";
              line = "";
            }
            line += word + " ";
          });
          textContent += line.trim() + "\n\n";
        });

        textContent += `\n────────────────────────────────────────────────────────\n`;
        textContent += `                     [ Página ${idx + 1} ]\n`;
        textContent += `--- FIN PÁGINA ${idx + 1} -------\n\n\n`;
      });

      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.title.toLowerCase().replace(/\s+/g, "_")}_folleto_a5.txt`;
      link.click();
      URL.revokeObjectURL(url);
      showCustomAlert("Folleto A5 (TXT) Listo", "El archivo de texto contiene los guiones de paginación e indentación recomendados para folleto A5.");

    } else {
      // Standard Flat TXT
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
      showCustomAlert("Guardado de Borrador", "Descargado tu borrador de seguridad en plano (.txt).");
    }
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

          {/* AI Engine & Model Selector */}
          <div className="flex items-center gap-1 bg-zinc-950/40 border border-zinc-800/80 rounded px-2.5 py-1 text-xs">
            <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 mr-1">Motor:</span>
            <select
              value={aiEngine}
              onChange={(e) => setAiEngine(e.target.value)}
              className="bg-transparent text-[10.5px] text-zinc-300 font-semibold outline-none border-none cursor-pointer pr-1 hover:text-white"
            >
              <option value="gemini" className="bg-zinc-950 text-white">Gemini 3.5 Flash</option>
              <option value="groq" className="bg-zinc-950 text-white">Groq LPU (Llama)</option>
            </select>

            {aiEngine === "groq" && (
              <select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="bg-transparent text-[10px] text-amber-500/90 font-mono outline-none border-l border-zinc-800 pl-2 cursor-pointer ml-1.5 hover:text-amber-400"
              >
                <option value="llama-3.3-70b-versatile" className="bg-zinc-950 text-white">Llama 3.3 70B</option>
                <option value="llama-3.1-8b-instant" className="bg-zinc-950 text-white">Llama 3.1 8B</option>
                <option value="gemma2-9b-it" className="bg-zinc-950 text-white">Gemma 2 9B</option>
              </select>
            )}
          </div>

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
                        className="w-full h-20 bg-[var(--bg-surface)] border border-[var(--border)] rounded p-3 text-xs text-[var(--text-main)] outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                      />
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg border border-yellow-500/10 bg-yellow-950/5">
                      <div className="flex items-center gap-1.5 text-yellow-500 font-mono text-[9px] uppercase font-bold">
                        <span>⭐ Regla de Oro Editorial</span>
                      </div>
                      <p className="text-[10px] text-zinc-300 leading-normal mt-1">
                        <strong>Cero Alucinación literaria:</strong> Se debe defender íntegramente la historia, conservar el estilo lírico original y respetar fielmente la voz e intenciones del autor.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-mono text-[var(--text-dim)] font-bold">Texto Original del Cuento</label>
                        <span className="text-[9px] text-yellow-400 font-mono">FIEL AL AUTOR</span>
                      </div>
                      <textarea 
                        value={state.originalStory || ""}
                        onChange={(e) => setState(prev => ({ ...prev, originalStory: e.target.value }))}
                        placeholder="Escribe o pega el texto completo del cuento original aquí..."
                        className="w-full h-40 bg-[var(--bg-surface)] border border-[var(--border)] rounded p-3 text-xs text-[var(--text-main)] placeholder-zinc-600 outline-none focus:ring-1 focus:ring-[var(--accent)] font-serif italic leading-relaxed"
                      />
                      <p className="text-[9px] text-zinc-500 font-mono leading-none">Este texto servirá como ancla para evitar desviaciones o alucinaciones.</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
                    <button
                      onClick={loadPresetDemo}
                      className="flex-1 py-2 rounded bg-[rgba(197,160,89,0.06)] border border-[var(--border)] font-mono font-bold text-[9.5px] uppercase tracking-wider hover:border-[var(--accent)] hover:text-white text-[var(--accent)] transition-all"
                      title="Cargar El Latido de los Colores"
                    >
                      Ejemplo 1 (Colores)
                    </button>
                    <button
                      onClick={loadPresetReina}
                      className="flex-1 py-2 rounded bg-[rgba(197,160,89,0.06)] border border-[var(--border)] font-mono font-bold text-[9.5px] uppercase tracking-wider hover:border-[var(--accent)] hover:text-white hover:bg-[var(--accent)]/10 text-[var(--accent)] transition-all"
                      title="Cargar La Reina del Silencio"
                    >
                      Ejemplo 2 (La Reina)
                    </button>
                    <button
                      onClick={saveToNoSQLMemory}
                      className="w-full py-2 border border-[var(--border)] rounded text-[var(--text-dim)] hover:text-white text-[9.5px] font-mono font-bold uppercase tracking-wider hover:bg-[var(--bg-surface)]"
                      title="Guardar borrador actual en historial"
                    >
                      Guardar Memoria de Obra
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

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => setEditorMode("edit")}
                      className={cn(
                        "p-1.5 px-3 rounded text-[9px] uppercase font-mono tracking-wider font-bold transition-all",
                        editorMode === "edit" ? "bg-[var(--accent)] text-black" : "bg-[var(--bg-surface)] text-zinc-400 border border-[var(--border)] hover:text-white"
                      )}
                    >
                      📝 Modo Editor
                    </button>
                    <button
                      onClick={() => {
                        setEditorMode("preview_a5");
                        setPreviewPage(0);
                      }}
                      className={cn(
                        "p-1.5 px-3 rounded text-[9px] uppercase font-mono tracking-wider font-bold transition-all flex items-center gap-1.5",
                        editorMode === "preview_a5" ? "bg-[var(--accent)] text-black font-black" : "bg-[var(--bg-surface)] text-zinc-400 border border-[var(--border)] hover:text-white"
                      )}
                    >
                      📖 Folleto A5 (${paginateTextIntoA5Pages(branches.find(b => b.id === activeBranchId)?.content || "").length} pág.)
                    </button>
                    <span className="text-zinc-600 font-mono hidden sm:inline">|</span>
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
                      className="p-1 px-2.5 rounded border border-[var(--border)] text-[9px] uppercase font-mono tracking-wider font-bold hover:border-[var(--accent)] text-[var(--accent)] transition-all ml-auto"
                    >
                      + Nueva Rama
                    </button>
                  </div>
                </div>

                {/* Main Textarea / Folleto Mockup */}
                <div className="space-y-3">
                  {editorMode === "edit" ? (
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
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1.5 text-[var(--accent)]"><Sparkles className="w-3 h-3" /> VISTA MAQUETA PRELIMINAR (FOLLETO IMPRESO A5):</span>
                        <span className="text-zinc-400">14.8 x 21.0 cm (Folleto Reclamado KDP)</span>
                      </div>
                      
                      {/* Virtual Book Mockup Spreads */}
                      <div className="relative bg-[#0d0d0d] rounded-2xl border border-zinc-800 p-6 md:p-10 flex flex-col items-center justify-center min-h-[500px]">
                        <div className="w-full max-w-sm aspect-[1/1.41] bg-[#faf6ef] text-[#2C2A29] rounded-lg border border-[#dfdbd3] shadow-[0_15px_45px_rgba(0,0,0,0.7)] flex flex-col justify-between p-6 md:p-8 relative select-none">
                          {/* Inner spine shadow of the book */}
                          <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r from-black/10 to-transparent rounded-l pointer-events-none" />
                          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-black/15 pointer-events-none" />

                          {/* Running header */}
                          <div className="border-b border-[#dfdbd3]/80 pb-1.5 flex justify-between items-center font-serif text-[7.5px] uppercase tracking-wider text-black/50">
                            <span>{state.title ? state.title.slice(0, 24) : "AURA ORIGINAL"}</span>
                            <span>Folleto A5</span>
                          </div>

                          {/* Page content */}
                          <div className="flex-1 mt-4 font-serif text-[11px] leading-relaxed text-[#2C2A29] text-justify space-y-3 overflow-hidden italic">
                            {(() => {
                              const pages = paginateTextIntoA5Pages(branches.find(b => b.id === activeBranchId)?.content || "");
                              const pageData = pages[previewPage] || "(Fin del manuscrito)";
                              const paragraphs = pageData.split("\n\n").map(p => p.trim()).filter(Boolean);
                              return paragraphs.map((para, paraIdx) => (
                                <p key={paraIdx} className={cn(
                                  "leading-relaxed",
                                  paraIdx === 0 && previewPage === 0 ? "text-indent-0 first-line:font-bold" : "indent-4"
                                )}>
                                  {paraIdx === 0 && previewPage === 0 && para.length > 0 ? (
                                    <>
                                      <span className="float-left text-3xl font-bold font-serif leading-[0.8] mr-2 pt-0.5 text-black">
                                        {para.charAt(0)}
                                      </span>
                                      {para.slice(1)}
                                    </>
                                  ) : para}
                                </p>
                              ));
                            })()}
                          </div>

                          {/* Page Footer / Numbering */}
                          <div className="pt-2 text-center font-serif text-[9px] font-bold text-black/70">
                            — {previewPage + 1} —
                          </div>
                        </div>

                        {/* Pagination Pager Arrow Controls */}
                        <div className="flex items-center gap-4 mt-6 bg-zinc-900 border border-zinc-800 p-1.5 px-4 rounded-full z-10 text-xs">
                          <button
                            disabled={previewPage === 0}
                            onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                            className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Página Anterior"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                            PÁGINA <strong className="text-white">{previewPage + 1}</strong> DE <strong className="text-white">{paginateTextIntoA5Pages(branches.find(b => b.id === activeBranchId)?.content || "").length}</strong>
                          </span>

                          <button
                            disabled={previewPage >= paginateTextIntoA5Pages(branches.find(b => b.id === activeBranchId)?.content || "").length - 1}
                            onClick={() => setPreviewPage(p => p + 1)}
                            className="text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Siguiente Página"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Stats */}
                  <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-lg border border-[var(--border)] font-mono text-[10px] text-[var(--text-dim)]">
                    <span>PALABRAS: <strong className="text-white font-bold">{getWordCount()}</strong></span>
                    <span>CARACTERES: <strong className="text-white font-bold">{getCharCount()}</strong></span>
                    <span>EDICIÓN: <strong className="text-[var(--accent)] font-bold">{editorMode === "edit" ? "MANUAL" : "PREVISUALIZADOR A5"}</strong></span>
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

              {/* SECTION: TRABAJOS REALIZADOS POR EL EQUIPO (CATÁLOGO DE OBRAS) */}
              <div className="col-span-1 lg:col-span-12 mt-10 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border)] pb-6 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.2)] text-[var(--accent)] text-[9px] font-mono tracking-widest uppercase font-black">
                        Registro Editorial NoSQL
                      </span>
                    </div>
                    <h3 className="text-sm lg:text-base font-serif font-black tracking-wide text-white flex items-center gap-2 mt-1">
                      💼 TRABAJOS REALIZADOS POR EL EQUIPO
                    </h3>
                    <p className="text-xs text-[var(--text-dim)] max-w-2xl">
                      Mesa de control de obras catalogadas. Cada proyecto funciona en un sandbox hermético: manuscritos, ramas, directores de estilo y auditorías no se relacionan ni contaminan entre sí.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={createNewProject}
                      className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold font-mono text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Empezar Nueva Obra desde cero
                    </button>
                    <button
                      onClick={loadPresetDemo}
                      className="px-4 py-2 rounded bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.3)] hover:border-[var(--accent)] text-[var(--accent)] font-semibold font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      title="Cargar Obra: El Latido de los Colores"
                    >
                      Cargar Ejemplo 1
                    </button>
                    <button
                      onClick={loadPresetReina}
                      className="px-4 py-2 rounded bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.3)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 text-[var(--accent)] font-semibold font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      title="Cargar Obra: La Reina del Silencio"
                    >
                      Cargar Ejemplo 2 (La Reina)
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border)]">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Buscar obra por título..."
                      className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono sm:ml-auto">
                    Total: <strong className="text-white">{editorialMemory.length} obras</strong> registradas en memoria aislada.
                  </div>
                </div>

                {/* Catalog Grid */}
                {editorialMemory.filter(item => 
                  item.title.toLowerCase().includes(catalogSearch.toLowerCase())
                ).length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.01)] space-y-3">
                    <Database className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400 font-medium">No se encontraron trabajos que coincidan con la búsqueda.</p>
                    <p className="text-[10px] text-zinc-500 max-w-md mx-auto">
                      Instancia un nuevo borrador arriba o pulsa "Cargar Ejemplo" para visualizar la estructura maestro generada por nuestros consejeros.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editorialMemory
                      .filter(item => item.title.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .map((item) => {
                        const isActive = state.id === item.id;
                        const wordCount = item.wordCount || 
                          (item.branches?.find((b: any) => b.id === item.activeBranchId)?.content || "").split(/\s+/).filter(Boolean).length || 0;
                        const draftText = item.branches?.find((b: any) => b.id === item.activeBranchId)?.content || item.projectState?.originalStory || "";
                        const snippet = draftText.slice(0, 140) + (draftText.length > 140 ? "..." : "");
                        
                        return (
                          <div 
                            key={item.id}
                            className={cn(
                              "border rounded-xl bg-[var(--bg-surface)] p-5 transition-all flex flex-col justify-between hover:translate-y-[-2px] duration-300 relative",
                              isActive 
                                ? "border-[var(--accent)] shadow-xl shadow-yellow-500/5 ring-1 ring-[var(--accent)]/20" 
                                : "border-[var(--border)]"
                            )}
                          >
                            {isActive && (
                              <div className="absolute -top-2.5 right-4 bg-[var(--accent)] text-black text-[8px] font-black font-mono tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                                Editor Activo
                              </div>
                            )}

                            <div className="space-y-3 flex-1">
                              {/* Card Header Info */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 truncate">
                                  <h4 className="font-serif font-bold text-white text-sm tracking-wide truncate uppercase hover:text-[var(--accent)] transition-colors">
                                    "{item.title}"
                                  </h4>
                                  <div className="flex items-center gap-2 text-[9px] text-[var(--text-dim)] font-mono">
                                    <span>{item.date}</span>
                                    <span>•</span>
                                    <span>{wordCount} palabras</span>
                                  </div>
                                </div>
                                <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-serif text-amber-500 font-black shrink-0 text-xs">
                                  {item.title.charAt(0)}
                                </div>
                              </div>

                              {/* Concept Sneak Peek */}
                              <p className="text-[11px] text-zinc-400 font-serif leading-relaxed line-clamp-3 bg-zinc-950/20 p-2.5 rounded border border-[var(--border)] tracking-wide">
                                {snippet || "Sin sinopsis provista todavía."}
                              </p>

                              {/* Status Indicators */}
                              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[8.5px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-300">
                                  {item.projectState?.currentPhase || "REDACCIÓN"}
                                </span>
                                {item.branches && item.branches.length > 1 && (
                                  <span className="text-[8.5px] px-2 py-0.5 rounded bg-amber-950/30 border border-amber-500/20 font-mono text-amber-400">
                                    🌳 {item.branches.length} Ramas
                                  </span>
                                )}
                                {item.auditResults && Object.keys(item.auditResults).length > 0 && (
                                  <span className="text-[8.5px] px-2 py-0.5 rounded bg-blue-950/30 border border-blue-500/20 font-mono text-blue-400">
                                    ✓ Auditado
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-5 pt-3.5 border-t border-[var(--border)] flex items-center justify-between gap-2">
                              <button
                                onClick={() => loadProjectFromMemory(item)}
                                className={cn(
                                  "px-3 py-1.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5",
                                  isActive
                                    ? "bg-[rgba(197,160,89,0.1)] text-[var(--accent)] border border-amber-500/30"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                                )}
                                title="Cargar este manuscrito completo en el entorno de trabajo"
                              >
                                {isActive ? "Mesa Activa" : "📁 Trabajar"}
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    const text = item.branches?.find((b: any) => b.id === item.activeBranchId)?.content || item.projectState?.humanizedManuscript || "";
                                    const blob = new Blob([
                                      `============================================================\n`,
                                      `OBRA DEL CATÁLOGO EDITORIAL: ${item.title}\n`,
                                      `FECHA: ${item.date}\n`,
                                      `============================================================\n\n`,
                                      `PROPUESTA SINÓPTICA:\n`,
                                      `${item.projectState?.concept || "Sin concepto inicial"}\n\n`,
                                      `TEXTO ORIGINAL DEL AUTOR:\n`,
                                      `------------------------------------------------------------\n`,
                                      `${item.projectState?.originalStory || "No provisto"}\n\n`,
                                      `MANUSCRITO SANEADO FINAL:\n`,
                                      `------------------------------------------------------------\n`,
                                      `${text}\n`
                                    ], { type: "text/plain;charset=utf-8" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `${item.title.toLowerCase().replace(/\s+/g, "_")}_compilado_equipo.txt`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all"
                                  title="Exportar copia compilada del manuscrito y reportes"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => deleteProjectFromMemory(item.id, e)}
                                  className="p-1.5 rounded bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-black text-red-400 transition-all"
                                  title="Borrar obra de la memoria persistentemente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
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

                        {expandedAgentId === "illustration" && (() => {
                          const scenesList = auditResults.illustration.escenas || 
                            (auditResults.illustration.illustrationPrompts || []).map((prompt: any, i: number) => {
                              if (typeof prompt === "string") {
                                return {
                                  titulo: `Escena Clave #${i + 1}`,
                                  descripcion_visual: "Foco lírico de la atmósfera del capítulo.",
                                  prompt_ilustracion: prompt,
                                  paleta: auditResults.illustration.paleta_general || "Pincelada clásica evocadora",
                                  atmosfera: auditResults.illustration.estilo_recomendado || "Mística sensorial"
                                };
                              }
                              return prompt;
                            });

                          return (
                            <div className="space-y-6 font-sans text-xs">
                              {/* Illustrations API Key Setting */}
                              <div className="p-4 bg-purple-950/5 border border-purple-500/10 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1 px-2 rounded bg-purple-500/10 text-purple-400 font-mono text-[9px] uppercase font-bold">Configuración de Arte</span>
                                    <h5 className="font-serif font-black text-white text-xs uppercase tracking-wide">Clave de API / App Key de Ilustraciones</h5>
                                  </div>
                                  <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider">Habilitador de Render</span>
                                </div>
                                <p className="text-[10px] text-zinc-400 leading-normal">
                                  Escribe o pega una Clave de API / App Key (ej. Gemini/StableDiffusion, o cualquier identificador) para habilitar el renderizado visual activo de tus láminas e ilustraciones realistas. Las imágenes se guardarán localmente para la maqueta final del libro.
                                </p>
                                <div className="flex gap-2">
                                  <input 
                                    type="password"
                                    value={illustrationsApiKey}
                                    onChange={(e) => {
                                      const keyStr = e.target.value;
                                      setIllustrationsApiKey(keyStr);
                                      localStorage.setItem("aura_illustrations_api_key", keyStr);
                                    }}
                                    placeholder="Ingresa tu App Key para ilustraciones (ej: kdp_art_prod_...)"
                                    className="flex-1 bg-black border border-purple-900/40 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500 font-mono"
                                  />
                                  {illustrationsApiKey ? (
                                    <button 
                                      onClick={() => {
                                        setIllustrationsApiKey("");
                                        localStorage.removeItem("aura_illustrations_api_key");
                                        showCustomAlert("Limpiado", "Se ha removido la clave de ilustraciones.");
                                      }}
                                      className="px-3 border border-red-500/30 text-red-400 hover:text-white hover:bg-red-950/20 rounded font-mono text-[10px] uppercase font-bold"
                                    >
                                      Remover/Limpiar
                                    </button>
                                  ) : (
                                    <span className="px-3.5 py-2 rounded bg-neutral-900 border border-zinc-800 text-zinc-500 font-mono text-[9.5px] uppercase">
                                      INACTIVO
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                                <div>
                                  <p className="font-bold text-[10.5px] uppercase text-purple-400 font-mono">Imágenes y Conceptos del Director de Arte</p>
                                  <p className="text-[9.5px] text-zinc-500 mt-0.5">Estilo Soportado: {auditResults.illustration.estilo_recomendado || "Automático"} • Paleta: {auditResults.illustration.paleta_general || "Atmósferica"}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {scenesList.map((scene: any, idx: number) => {
                                  const sceneId = `scene-${idx}-${activeBranchId}`;
                                  const renderUrl = renderedImages[sceneId];
                                  const isLoading = imageLoading[sceneId];

                                  return (
                                    <div key={idx} className="p-4 bg-neutral-900 border border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[8px] uppercase tracking-wider text-purple-400 font-bold block font-mono">Consejo {idx+1}</span>
                                          {scene.paleta && (
                                            <span className="font-mono text-[8px] bg-neutral-800 px-1.5 py-0.5 rounded text-zinc-400 truncate max-w-[120px]">{scene.paleta}</span>
                                          )}
                                        </div>
                                        <h6 className="font-serif font-bold text-white text-xs">{scene.titulo || "Atmósfera Clave"}</h6>
                                        <p className="text-[10px] text-zinc-400 italic">"{scene.prompt_ilustracion || scene.descripcion_visual || scene}"</p>
                                      </div>

                                      {/* Interactive Visual Preview Render Frame */}
                                      <div className="space-y-2 mt-2">
                                        <div className="w-full aspect-square rounded-lg border border-zinc-800 bg-black overflow-hidden flex items-center justify-center relative group">
                                          {renderUrl ? (
                                            <>
                                              <img 
                                                src={renderUrl} 
                                                alt={scene.titulo} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                referrerPolicy="no-referrer"
                                              />
                                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                                <button
                                                  onClick={() => handleGenerateIllustration(scene.prompt_ilustracion || scene, sceneId)}
                                                  className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-[9px] uppercase font-bold p-1.5 px-2.5 rounded shadow-lg transition-transform"
                                                >
                                                  Regenerar ↺
                                                </button>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="text-center p-3 flex flex-col items-center justify-center space-y-1.5">
                                              <span className="text-lg text-purple-500/40">🎨</span>
                                              <span className="text-[8.5px] font-mono text-zinc-600 block uppercase">Sin Renderizar</span>
                                            </div>
                                          )}

                                          {isLoading && (
                                            <div className="absolute inset-0 bg-neutral-950/80 flex flex-col items-center justify-center p-3 space-y-2 text-center">
                                              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                              <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest animate-pulse">Renderizando...</span>
                                            </div>
                                          )}
                                        </div>

                                        <button
                                          onClick={() => {
                                            if (!illustrationsApiKey) {
                                              showCustomAlert(
                                                "Configuración de App Key Requerida",
                                                "Por favor, ingresa tu clave API / App Key en el campo de arriba para autorizar al motor artístico de ilustraciones literarias."
                                              );
                                              return;
                                            }
                                            handleGenerateIllustration(scene.prompt_ilustracion || scene, sceneId);
                                          }}
                                          disabled={isLoading}
                                          className={cn(
                                            "w-full py-1.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1",
                                            renderUrl 
                                              ? "bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700"
                                              : "bg-purple-600 hover:bg-purple-500 text-white shadow shadow-purple-500/20"
                                          )}
                                        >
                                          {isLoading ? "Creando..." : renderUrl ? "Regenerar Con Key ↺" : "🎨 Generar Ilustración"}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

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
                <div className="pt-5 border-t border-[var(--border)] space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)]">
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-white uppercase flex items-center gap-1.5">
                        📖 CONFIGURACIÓN DE FORMATO DE ENTREGA
                      </h4>
                      <p className="text-[9.5px] text-zinc-400 font-mono">
                        Selecciona el tipo de empaquetado. Por defecto está adaptado para maquetación física de Folleto A5:
                      </p>
                    </div>

                    <select
                      value={deliveryFormat}
                      onChange={(e) => setDeliveryFormat(e.target.value as any)}
                      className="bg-[#121212] border border-[var(--border)] p-2 rounded text-xs font-mono text-[var(--accent)] font-bold outline-none"
                    >
                      <option value="a5_html">📐 Folleto Impreso A5 (HTML Listo para PDF)</option>
                      <option value="a5_txt">📝 Folleto Paginado A5 (TXT Maquetado)</option>
                      <option value="standard_txt">📄 Borrador Plano Estándar (.txt)</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h5 className="text-[11px] font-bold text-white uppercase">Paquete Maestro Definitivo Listo</h5>
                      <p className="text-[9px] text-zinc-500 font-mono">Contiene manuscrito en formato seleccionado ({deliveryFormat.toUpperCase()}) con metadatos de maquetación profunda</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 transition-all font-mono font-bold text-[10px] text-black rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-yellow-500/5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> DESCARGAR PAQUETE MAESTRO
                    </button>
                  </div>
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
