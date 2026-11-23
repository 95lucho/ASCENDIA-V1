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
    title: "Desglose de un concepto académico complejo",
    level: "Básico",
    contexto:
      "Preparar una exposición en una asignatura de Ciencias de la Educación sobre un concepto teórico denso (por ejemplo, zona de desarrollo próximo de Vygotsky, andamiaje pedagógico o evaluación formativa) a partir de bibliografía especializada.",
    objetivo:
      "Obtener una explicación clara para nivel universitario inicial sin perder el rigor conceptual ni pedagógico.",
    bloquesClave: [
      "Propósito",
      "Contexto/Nivel académico",
      "Formato de salida",
    ],
    criterios: [
      "Especifica nivel universitario y propósito formativo",
      "Define un formato estructurado (ej. analogía educativa + 3 ideas clave + ejemplo de aula)",
      "Verifica que no exista distorsión conceptual por simplificación",
    ],
    placeholders: {
      rol: "Ej. Docente universitario de Psicología del Aprendizaje y Didáctica General especializado en formación docente.",
      contexto:
        "Ej. Soy estudiante de segundo semestre de Ciencias de la Educación y debo exponer el concepto de Zona de Desarrollo Próximo de Vygotsky ante compañeros de primer año a partir de nuestra bibliografía base.",
      tarea:
        "Ej. Explica el concepto con claridad académica, formula una analogía educativa pertinente, sintetiza 3 ideas clave y ofrece un ejemplo concreto de aula universitaria o escolar.",
      restricciones:
        "Ej. Evita simplificaciones que reduzcan la teoría a un simple 'trabajo en grupo'; conserva la terminología sociocultural exacta (mediación, andamiaje, nivel real y potencial) en máximo 350 palabras.",
      formato:
        "Ej. Estructura en 4 apartados: (1) Definición conceptual rigurosa, (2) Analogía educativa, (3) 3 ideas clave en viñetas, (4) Ejemplo práctico de aula.",
    },
  },
  {
    id: "reto-2",
    orderLabel: "Reto 02",
    title: "Organización de información en matrices comparativas",
    level: "Básico",
    contexto:
      "Repasar para un examen parcial comparando dos enfoques o modelos educativos (por ejemplo, enfoque conductista vs. constructivista, evaluación diagnóstica vs. sumativa o metodología cuantitativa vs. cualitativa en investigación educativa).",
    objetivo:
      "Organizar la comparación según criterios pedagógicos explícitos definidos por el estudiante.",
    bloquesClave: [
      "Tarea específica",
      "Criterios de comparación",
      "Formato tabular",
    ],
    criterios: [
      "Define categorías exactas de comparación (ej. rol docente, rol estudiantil, tipo de evidencia, limitación)",
      "Solicita tabla con encabezados claros",
      "Contrasta los datos con apuntes o lecturas de la carrera",
    ],
    placeholders: {
      rol: "Ej. Especialista en Teorías del Aprendizaje y Diseño Curricular universitario.",
      contexto:
        "Ej. Estoy preparando un examen parcial de Didáctica y necesito diferenciar con precisión el enfoque conductista frente al enfoque constructivista.",
      tarea:
        "Ej. Compara ambos enfoques exclusivamente según estas 5 categorías: concepción del aprendizaje, rol docente, rol estudiantil, tipo de evidencia evaluativa y principal limitación pedagógica.",
      restricciones:
        "Ej. Redacta celdas breves de máximo 20 palabras por criterio; no añadas categorías no solicitadas ni recomendaciones genéricas.",
      formato:
        "Ej. Tabla Markdown con encabezados claros (Criterio | Enfoque Conductista | Enfoque Constructivista) seguida de una síntesis de 3 líneas para el repaso.",
    },
  },
  {
    id: "reto-3",
    orderLabel: "Reto 03",
    title: "Tutor socrático para preparación de exámenes",
    level: "Intermedio",
    contexto:
      "Preparar una evaluación o defensa oral sobre teorías del aprendizaje, planificación curricular o diseño instruccional mediante recuperación activa.",
    objetivo:
      "Configurar a la IA con un rol de tutor/evaluador pedagógico que formule una pregunta a la vez, analice la respuesta del estudiante y no entregue la solución directa antes de que intente responder.",
    bloquesClave: ["Rol", "Reglas por turnos", "Restricciones estrictas"],
    criterios: [
      "Asigna rol pedagógico y regla de una pregunta por turno",
      "Exige retroalimentación sobre aciertos y vacíos conceptuales",
      "Ajusta la instrucción si la IA adelanta la respuesta",
    ],
    placeholders: {
      rol: "Ej. Tutor socrático exigente de Planificación Curricular y Diseño Instruccional en Ciencias de la Educación.",
      contexto:
        "Ej. Debo rendir una defensa oral sobre alineación constructiva, objetivos de aprendizaje y evaluación auténtica, y quiero entrenarme mediante recuperación activa.",
      tarea:
        "Ej. Formula únicamente una primera pregunta situacional de dificultad intermedia y espera mi respuesta. Cuando responda, evalúa mis aciertos, señala vacíos conceptuales y formula la siguiente pregunta.",
      restricciones:
        "Ej. PROHIBIDO entregar la solución directa o dar respuestas modelo antes de que yo intente responder. Realiza estrictamente UNA pregunta por turno.",
      formato:
        "Ej. Respuesta breve por turno: [Retroalimentación de aciertos y vacíos] + [Siguiente pregunta numerada] en máximo 6 líneas.",
    },
  },
  {
    id: "reto-4",
    orderLabel: "Reto 04",
    title: "Adaptación de un texto académico a guía de estudio",
    level: "Intermedio",
    contexto:
      "Convertir un fragmento real de un artículo o capítulo sobre didáctica, inclusión educativa o tecnología educativa en una guía de estudio para compañeros de curso sin inventar información externa.",
    objetivo:
      "Procesar exclusivamente el texto proporcionado generando esquema conceptual, preguntas de reflexión pedagógica y un caso de aula.",
    bloquesClave: [
      "Delimitación de fuente",
      "Restricción anti-alucinación",
      "Estructura de salida",
    ],
    criterios: [
      "Ordena basarse estrictamente en el texto suministrado",
      "Define los 3 componentes y límites de extensión",
      "Audita que no se incluyan conceptos ajenos al fragmento",
    ],
    placeholders: {
      rol: "Ej. Especialista en elaboración de materiales didácticos con estricta fidelidad documental.",
      contexto:
        "Ej. Necesito adaptar el fragmento adjunto sobre Diseño Universal para el Aprendizaje (DUA) e inclusión educativa en una guía de estudio para mis compañeros de curso.",
      tarea:
        "Ej. Basándote EXCLUSIVAMENTE en el fragmento que incluyo entre comillas triples, elabora: (1) esquema conceptual, (2) 3 preguntas de reflexión pedagógica y (3) 1 caso práctico de aula.",
      restricciones:
        "Ej. Prohibido introducir autores, normativas o conceptos externos al fragmento. Si un dato no figura en el texto, indica literalmente 'No especificado en la fuente'.",
      formato:
        "Ej. Tres secciones delimitadas (Esquema: máx. 120 palabras; Preguntas: 3 ítems; Caso de aula: máx. 100 palabras). Texto fuente: \"\"\"[Pega aquí tu lectura]\"\"\".",
    },
  },
  {
    id: "reto-5",
    orderLabel: "Reto 05",
    title: "Detección de sesgos y vacíos en un borrador propio",
    level: "Avanzado",
    contexto:
      "Revisar el planteamiento de un problema educativo, una justificación o un párrafo argumentativo de un trabajo académico antes de presentarlo, evitando que la IA reescriba el texto por el estudiante.",
    objetivo:
      "Obtener una revisión crítica que señale ambigüedades conceptuales, falta de sustento empírico/teórico y posibles contraargumentos pedagógicos.",
    bloquesClave: [
      "Criterios de calidad",
      "Prohibición de reescritura",
      "Diagnóstico por categorías",
    ],
    criterios: [
      "Prohíbe explícitamente reescribir el texto del estudiante",
      "Establece criterios de coherencia, pertinencia educativa y rigor",
      "Documenta qué críticas acepta o descarta en la bitácora",
    ],
    placeholders: {
      rol: "Ej. Evaluador de proyectos de investigación educativa y metodología pedagógica.",
      contexto:
        "Ej. Redacté el planteamiento del problema y la justificación de mi trabajo sobre deserción estudiantil y orientación vocacional, y quiero auditar su solidez antes de entregarlo.",
      tarea:
        "Ej. Evalúa mi borrador identificando por categorías: (a) ambigüedades conceptuales, (b) afirmaciones sin sustento empírico o teórico, (c) sesgos de confirmación y (d) contraargumentos pedagógicos posibles.",
      restricciones:
        "Ej. PROHIBIDO reescribir, parafrasear o redactar párrafos alternativos por mí. Limítate exclusivamente al diagnóstico crítico sobre el borrador entregado.",
      formato:
        "Ej. Lista de observaciones agrupadas en las 4 categorías, citando la frase exacta del borrador analizado en cada hallazgo. Borrador: \"\"\"[Pega tu texto]\"\"\".",
    },
  },
  {
    id: "reto-6",
    orderLabel: "Reto 06",
    title: "Auditoría crítica y verificación de salida con posibles errores",
    level: "Avanzado",
    contexto:
      "Indagar sobre autores, marcos normativos o antecedentes en Ciencias de la Educación donde los sistemas de IA suelen inventar referencias, mezclar autores o afirmar datos con exceso de seguridad.",
    objetivo:
      "Consultar una temática educativa, contrastar la respuesta con fuentes académicas reales y formular una Versión 2 que exija transparencia epistémica y declaración explícita de incertidumbre.",
    bloquesClave: [
      "Verificación de hechos",
      "Manejo de incertidumbre",
      "Comparación v1 vs v2",
    ],
    criterios: [
      "La v2 exige no fabricar citas ni referencias y declarar incertidumbre",
      "Identifica al menos un punto dudoso o impreciso en la v1",
      "Evidencia mejora verificada entre versiones",
    ],
    placeholders: {
      rol: "Ej. Investigador en Gestión Educativa y Políticas Educativas estricto en trazabilidad bibliográfica.",
      contexto:
        "Ej. Investigo antecedentes teóricos y marcos normativos sobre orientación educativa y gestión curricular en educación superior para mi marco teórico.",
      tarea:
        "Ej. En v1 realiza la consulta sobre autores y normas clave; en v2 exige separar con rigor lo que es consenso documentado de aquello que requiere verificación directa en fuentes oficiales.",
      restricciones:
        "Ej. No fabriques títulos de libros, años, artículos legales ni citas textuales. Cuando no tengas certeza verificable, declara explícitamente '[REQUIERE VERIFICACIÓN EN FUENTE PRIMARIA]'.",
      formato:
        "Ej. Tres bloques: (1) Conceptos teóricos verificables, (2) Afirmaciones marcadas con incertidumbre, (3) Descriptores exactos para buscar en SciELO, Redalyc o normativa oficial.",
    },
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
