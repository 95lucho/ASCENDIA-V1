import { ChallengeDefinition, PromptBlocks } from "../types/lab";

export interface CycleStep {
  number: number;
  title: string;
  shortDesc: string;
  detail: string;
}

export const ITERATIVE_CYCLE_STEPS: CycleStep[] = [
  {
    number: 1,
    title: "Formular",
    shortDesc: "Estructura la instrucción por bloques",
    detail:
      "Define rol, contexto académico, tarea específica, restricciones y formato antes de consultar a la IA.",
  },
  {
    number: 2,
    title: "Probar",
    shortDesc: "Ejecuta en vivo o pega una salida",
    detail:
      "Envía el prompt ensamblado al modelo integrado o utilízalo en una IA externa y registra su respuesta real.",
  },
  {
    number: 3,
    title: "Diagnosticar",
    shortDesc: "Audita omisiones, sesgos y límites",
    detail:
      "Evalúa si el sistema respetó tus restricciones, si inventó datos o si simplificó en exceso el rigor teórico.",
  },
  {
    number: 4,
    title: "Refinar",
    shortDesc: "Itera hacia una Versión 2 superior",
    detail:
      "Documenta en la bitácora qué falló y ajusta los bloques necesarios para corregir las debilidades detectadas.",
  },
  {
    number: 5,
    title: "Verificar",
    shortDesc: "Contrasta contra criterios y fuentes",
    detail:
      "Valida la respuesta frente a bibliografía de clase y marca el reto como completado solo tras comprobar su calidad.",
  },
];

export interface DiagnosticOption {
  id: string;
  label: string;
  explanation: string;
}

export const DIAGNOSTIC_CHALLENGE = {
  badPrompt: "Hazme un resumen de la Revolución Industrial",
  genericResponse:
    "La Revolución Industrial fue un periodo de grandes cambios económicos y tecnológicos que comenzó en Inglaterra a finales del siglo XVIII. Se caracterizó por el uso de la máquina de vapor, el desarrollo de fábricas y la migración del campo a la ciudad. Este proceso transformó la producción artesanal en producción industrial y tuvo un impacto importante en la sociedad moderna.",
  improvedExample:
    "Actúa como docente universitario de Historia Económica. Estoy preparando un seminario introductorio de primer año sobre industrialización europea (Contexto/Nivel) para analizar la transición energética y laboral entre 1760 y 1840 (Propósito). Explica tres factores estructurales del despegue británico en comparación con Europa continental. No incluyas anécdotas biográficas ni generalizaciones sin mecanismo causal (Restricciones). Presenta la respuesta en una tabla comparativa seguida de 3 preguntas de discusión (Formato de salida).",
  options: [
    {
      id: "contexto",
      label: "Contexto / Nivel académico",
      explanation:
        "Sin indicar curso, disciplina o nivel (secundaria vs. pregrado), la IA produce un texto enciclopédico superficial.",
    },
    {
      id: "proposito",
      label: "Propósito",
      explanation:
        "No aclara para qué se usará el resumen (exposición, debate teórico, ensayo comparativo o repaso de examen).",
    },
    {
      id: "restricciones",
      label: "Restricciones",
      explanation:
        "Faltan límites de alcance temporal, enfoque analítico o qué omitir para evitar lugares comunes.",
    },
    {
      id: "formato",
      label: "Formato de salida",
      explanation:
        "No especifica si se espera un cuadro comparativo, esquema jerárquico, extensión máxima o lista con citas.",
    },
  ] as DiagnosticOption[],
};

export const EMPTY_BLOCKS: PromptBlocks = {
  rol: "",
  contexto: "",
  tarea: "",
  restricciones: "",
  formato: "",
};

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "reto-1",
    orderLabel: "Reto 01",
    title: "Identifica las partes de una instrucción",
    level: "Básico",
    contexto:
      "Analiza una instrucción educativa real desglosada en fragmentos para distinguir qué parte cumple cada función.",
    objetivo:
      "Reconocer propósito, contexto, tarea y formato dentro de una instrucción dirigida a un sistema de IA.",
    bloquesClave: ["Propósito", "Contexto", "Tarea", "Formato"],
    secuencia: ["Observar", "Identificar", "Clasificar", "Comprobar"],
    competencia:
      "Reconocimiento de los componentes estructurales de una instrucción educativa.",
    criterios: [
      "Asocia al menos 3 de 4 fragmentos con su componente correcto",
      "Distingue entre para qué se pide (propósito) y en qué escenario (contexto)",
      "Revisa la retroalimentación de cada fragmento",
    ],
    placeholders: { ...EMPTY_BLOCKS },
  },
  {
    id: "reto-2",
    orderLabel: "Reto 02",
    title: "Detecta la instrucción más efectiva",
    level: "Básico",
    contexto:
      "Compara tres formulaciones distintas para resolver una misma necesidad docente en educación superior.",
    objetivo:
      "Distinguir instrucciones claras, contextualizadas y precisas frente a pedidos vagos o incompletos.",
    bloquesClave: [
      "Propósito claro",
      "Contexto suficiente",
      "Tarea específica",
      "Formato definido",
    ],
    secuencia: ["Leer", "Comparar", "Seleccionar", "Justificar"],
    competencia:
      "Discriminación de instrucciones efectivas mediante criterios de claridad, contexto, precisión y formato.",
    criterios: [
      "Selecciona la instrucción más efectiva para el caso",
      "Identifica al menos 3 criterios válidos que justifican su calidad",
      "Evita criterios incompatibles con la formulación precisa",
    ],
    placeholders: { ...EMPTY_BLOCKS },
  },
  {
    id: "reto-3",
    orderLabel: "Reto 03",
    title: "Encuentra los errores",
    level: "Intermedio",
    contexto:
      "Examina cuatro instrucciones defectuosas para diagnosticar el problema principal que limita la respuesta de la IA.",
    objetivo:
      "Diagnosticar problemas en instrucciones dirigidas a sistemas de IA y comprender cómo afectan la calidad del resultado.",
    bloquesClave: [
      "Falta de contexto",
      "Tarea ambigua",
      "Ausencia de restricciones",
      "Falta de formato",
    ],
    secuencia: [
      "Examinar",
      "Detectar",
      "Clasificar",
      "Comprender cómo corregir",
    ],
    competencia:
      "Diagnóstico de fallos frecuentes en instrucciones educativas y comprensión de su impacto en la salida de la IA.",
    criterios: [
      "Clasifica correctamente al menos 3 de las 4 instrucciones",
      "Distingue entre ambigüedad de la tarea y ausencia de contexto o restricciones",
      "Analiza por qué cada error deteriora la respuesta",
    ],
    placeholders: { ...EMPTY_BLOCKS },
  },
  {
    id: "reto-4",
    orderLabel: "Reto 04",
    title: "Analiza la respuesta de la IA",
    level: "Intermedio",
    contexto:
      "Contrasta una instrucción específica de comprensión lectora con una respuesta simulada de IA para detectar aciertos y omisiones.",
    objetivo:
      "Evaluar la correspondencia entre una instrucción y la respuesta obtenida identificando elementos cumplidos, omitidos, no correspondientes y verificables.",
    bloquesClave: [
      "Cumplimiento",
      "Omisiones",
      "No correspondiente",
      "Verificación",
    ],
    secuencia: [
      "Observar",
      "Contrastar",
      "Identificar omisiones",
      "Valorar",
    ],
    competencia:
      "Análisis crítico de correspondencia entre lo solicitado en una instrucción y lo entregado por la IA.",
    criterios: [
      "Resuelve correctamente al menos 3 de los 4 criterios de análisis",
      "Identifica omisiones de tiempo y pasos incompletos",
      "Distingue información ajena y afirmaciones que requieren verificación",
    ],
    placeholders: { ...EMPTY_BLOCKS },
  },
  {
    id: "reto-5",
    orderLabel: "Reto 05",
    title: "Resuelve una situación problemática",
    level: "Avanzado",
    contexto:
      "Una docente de primaria necesita una actividad participativa de 40 minutos sobre el cuidado del agua para 30 estudiantes con materiales sencillos y comprobación del aprendizaje.",
    objetivo:
      "Aplicar criterios de formulación y evaluación para seleccionar y justificar la alternativa más viable en una situación educativa contextualizada.",
    bloquesClave: [
      "Pertinencia pedagógica",
      "Viabilidad",
      "Adecuación al tiempo",
      "Comprobación del aprendizaje",
    ],
    secuencia: [
      "Comprender el caso",
      "Establecer necesidades",
      "Analizar alternativas",
      "Justificar decisiones",
    ],
    competencia:
      "Aplicación integral de criterios pedagógicos, temporales y evaluativos para decidir el uso adecuado de una propuesta de IA.",
    criterios: [
      "Selecciona la alternativa coherente con las condiciones reales del caso",
      "Justifica al menos 3 dimensiones (pertinencia, viabilidad, tiempo y comprobación)",
      "Descarta propuestas tecnológicamente inviables o centradas solo en exposición",
    ],
    placeholders: { ...EMPTY_BLOCKS },
  },
  {
    id: "reto-6",
    orderLabel: "Reto 06",
    title: "Auditoría de una experiencia con IA",
    level: "Avanzado",
    contexto:
      "Revisa un expediente completo con la necesidad de un docente, la instrucción que usó, la respuesta de IA y los problemas que surgieron al aplicarla.",
    objetivo:
      "Evaluar integralmente una experiencia de interacción con IA mediante seis criterios, detectar el problema principal y elegir una mejora coherente.",
    bloquesClave: [
      "Auditoría de 6 criterios",
      "Detección de fallos",
      "Propuesta de mejora",
    ],
    secuencia: [
      "Reconstruir",
      "Verificar",
      "Detectar fallos",
      "Evaluar",
      "Proponer mejoras",
    ],
    competencia:
      "Evaluación crítica integral de experiencias con IA y formulación de mejoras metodológicas coherentes.",
    criterios: [
      "Resuelve correctamente al menos 5 de los 6 criterios de auditoría",
      "Identifica con precisión el problema principal del expediente",
      "Selecciona una mejora coherente con las fallas detectadas",
    ],
    placeholders: { ...EMPTY_BLOCKS },
  },
  {
    id: "reto-libre",
    orderLabel: "Reto Libre",
    title: "Reto Libre (Tarea Propia)",
    level: "Libre",
    esLibre: true,
    contexto:
      "Aplica la metodología de ASCENDIA a una tarea real de tus asignaturas de Ciencias de la Educación (didáctica, evaluación, currículo, orientación vocacional, gestión o tecnología educativa).",
    objetivo:
      "Diseñar, probar y auditar críticamente un prompt propio para resolver una necesidad académica auténtica.",
    bloquesClave: [
      "Contexto real del curso",
      "Restricciones anti-superficialidad",
      "Verificación crítica",
    ],
    competencia:
      "Experimentación autónoma en diseño, ejecución y evaluación crítica de instrucciones propias.",
    criterios: [
      "Define contexto disciplinar y objetivo verificable",
      "Establece restricciones claras y formato de salida",
      "Audita la respuesta y documenta al menos una mejora iterativa",
    ],
    placeholders: {
      rol: "Ej. Especialista en Didáctica, Orientación Vocacional o Gestión Educativa según tu asignatura.",
      contexto:
        "Ej. Describe tu materia, semestre, tema educativo real y el propósito formativo de tu consulta.",
      tarea:
        "Ej. Indica con verbos precisos qué análisis, matriz, guía o revisión crítica debe realizar la IA.",
      restricciones:
        "Ej. Especifica límites claros (no inventar citas, no reescribir tu trabajo, mantener rigor conceptual).",
      formato:
        "Ej. Define la estructura exacta de salida (tabla comparativa, esquema, rúbrica o lista con límites de extensión).",
    },
  },
];
