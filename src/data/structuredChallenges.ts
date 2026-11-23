// Datos pedagógicos estructurados para los 6 retos diferenciados de ASCENDIA.
// Los casos y respuestas simuladas se identifican explícitamente como ejemplos didácticos.

export type PromptPartCategory = "proposito" | "contexto" | "tarea" | "formato";

export interface Challenge1Fragment {
  id: string;
  label: string;
  text: string;
  correctCategory: PromptPartCategory;
  explanation: string;
}

export const PROMPT_PART_CATEGORIES: {
  id: PromptPartCategory;
  label: string;
  hint: string;
}[] = [
  {
    id: "proposito",
    label: "Propósito",
    hint: "Para qué se solicita la respuesta",
  },
  {
    id: "contexto",
    label: "Contexto",
    hint: "Nivel, asignatura, grupo o situación",
  },
  {
    id: "tarea",
    label: "Tarea",
    hint: "Acción concreta que ejecutará la IA",
  },
  {
    id: "formato",
    label: "Formato",
    hint: "Estructura o presentación de salida",
  },
];

export const CHALLENGE_1_DATA = {
  fullInstruction:
    "En un taller de Didáctica con estudiantes de tercer semestre de Ciencias de la Educación, necesito elaborar una guía práctica de aula sobre evaluación formativa. Redacta tres actividades breves de retroalimentación entre pares explicando su aplicación paso a paso. Presenta el resultado en una tabla comparativa con columnas para actividad, duración y criterio de evaluación.",
  fragments: [
    {
      id: "frag-contexto",
      label: "Fragmento A",
      text: "En un taller de Didáctica con estudiantes de tercer semestre de Ciencias de la Educación.",
      correctCategory: "contexto",
      explanation:
        "Describe quiénes participarán, el nivel formativo (tercer semestre) y la asignatura (Didáctica).",
    },
    {
      id: "frag-proposito",
      label: "Fragmento B",
      text: "Necesito elaborar una guía práctica de aula sobre evaluación formativa.",
      correctCategory: "proposito",
      explanation:
        "Expresa la finalidad pedagógica por la cual se realiza la consulta a la IA.",
    },
    {
      id: "frag-tarea",
      label: "Fragmento C",
      text: "Redacta tres actividades breves de retroalimentación entre pares explicando su aplicación paso a paso.",
      correctCategory: "tarea",
      explanation:
        "Indica la acción exacta y delimitada que debe producir la inteligencia artificial.",
    },
    {
      id: "frag-formato",
      label: "Fragmento D",
      text: "Presenta el resultado en una tabla comparativa con columnas para actividad, duración y criterio de evaluación.",
      correctCategory: "formato",
      explanation:
        "Define la organización visual y las columnas específicas que debe tener la salida.",
    },
  ] as Challenge1Fragment[],
};

export interface Challenge2Option {
  id: "A" | "B" | "C";
  title: string;
  promptText: string;
  isEffective: boolean;
  feedback: string;
}

export interface Challenge2Criterion {
  id: string;
  label: string;
  isValid: boolean;
  explanation: string;
}

export const CHALLENGE_2_DATA = {
  situation:
    "Un estudiante de Ciencias de la Educación debe diseñar una dinámica diagnóstica de 20 minutos sobre estrategias de aprendizaje para ingresantes de primer año universitario, con el fin de identificar qué dificultades de estudio presentan al iniciar la carrera.",
  options: [
    {
      id: "A",
      title: "Instrucción A",
      promptText:
        "Dame ideas de actividades sobre estrategias de aprendizaje para estudiantes.",
      isEffective: false,
      feedback:
        "Es demasiado vaga: no indica el nivel universitario, el propósito diagnóstico, el tiempo disponible ni cómo debe estructurarse la respuesta.",
    },
    {
      id: "B",
      title: "Instrucción B",
      promptText:
        "Soy estudiante de primer año y quiero una actividad sobre estrategias de aprendizaje para hacer en clase. Escríbela con objetivos y pasos.",
      isEffective: false,
      feedback:
        "Mejora ligeramente al pedir objetivos y pasos, pero omite el propósito diagnóstico, la duración de 20 minutos y el contexto de la carrera.",
    },
    {
      id: "C",
      title: "Instrucción C",
      promptText:
        "Actúa como especialista en didáctica universitaria. Para diagnosticar dificultades iniciales en hábitos de estudio con estudiantes de primer año de Ciencias de la Educación, diseña una dinámica grupal participativa de 20 minutos sobre estrategias de aprendizaje. Organiza la respuesta en cuatro apartados: objetivo diagnóstico, materiales simples, secuencia minuto a minuto y dos preguntas de cierre.",
      isEffective: true,
      feedback:
        "Es la más efectiva porque integra propósito diagnóstico, contexto de primer año, tarea delimitada en 20 minutos y un formato claro con cuatro apartados.",
    },
  ] as Challenge2Option[],
  criteria: [
    {
      id: "proposito-claro",
      label: "Propósito claro",
      isValid: true,
      explanation:
        "Explicita que la dinámica busca diagnosticar dificultades iniciales en hábitos de estudio.",
    },
    {
      id: "contexto-suficiente",
      label: "Contexto suficiente",
      isValid: true,
      explanation:
        "Precisa el nivel (primer año), la carrera (Ciencias de la Educación) y la restricción de 20 minutos.",
    },
    {
      id: "tarea-especifica",
      label: "Tarea específica",
      isValid: true,
      explanation:
        "Solicita diseñar una dinámica grupal participativa concreta en lugar de 'ideas generales'.",
    },
    {
      id: "formato-definido",
      label: "Formato definido",
      isValid: true,
      explanation:
        "Organiza la salida en cuatro apartados claros (objetivo, materiales, secuencia y preguntas).",
    },
    {
      id: "sin-limites",
      label: "Ausencia de límites de tiempo",
      isValid: false,
      explanation:
        "Incorrecto: precisamente definir el límite de 20 minutos vuelve viable la propuesta.",
    },
    {
      id: "jerga-compleja",
      label: "Uso de terminología innecesariamente compleja",
      isValid: false,
      explanation:
        "Incorrecto: la efectividad proviene de la claridad estructural, no de palabras rebuscadas.",
    },
  ] as Challenge2Criterion[],
};

export type ErrorCategoryId =
  | "falta_contexto"
  | "tarea_ambigua"
  | "ausencia_restricciones"
  | "falta_formato";

export const ERROR_CATEGORIES: {
  id: ErrorCategoryId;
  label: string;
}[] = [
  { id: "falta_contexto", label: "Falta de contexto" },
  { id: "tarea_ambigua", label: "Tarea ambigua" },
  {
    id: "ausencia_restricciones",
    label: "Ausencia de restricciones o criterios importantes",
  },
  {
    id: "falta_formato",
    label: "Falta de formato cuando sea necesario",
  },
];

export interface Challenge3Item {
  id: string;
  label: string;
  promptText: string;
  correctCategory: ErrorCategoryId;
  whyItMatters: string;
  howToFix: string;
}

export const CHALLENGE_3_DATA = {
  items: [
    {
      id: "err-1",
      label: "Instrucción 1",
      promptText: "Explícame la teoría de Piaget.",
      correctCategory: "falta_contexto",
      whyItMatters:
        "Sin indicar si es para primaria, pregrado o investigación ni para qué actividad se usará, la IA entrega un texto enciclopédico sin ajuste pedagógico.",
      howToFix:
        "Añade nivel académico, asignatura y propósito: ej. 'Para una exposición de segundo semestre de Ciencias de la Educación...'.",
    },
    {
      id: "err-2",
      label: "Instrucción 2",
      promptText:
        "Para un curso de orientación vocacional de sexto de secundaria, ayúdame con algo útil sobre toma de decisiones.",
      correctCategory: "tarea_ambigua",
      whyItMatters:
        "La expresión 'ayúdame con algo útil' es imprecisa: la IA no sabe si redactar una guía, una dinámica, preguntas de entrevista o un estudio de caso.",
      howToFix:
        "Sustituye frases vagas por un verbo de acción y entregable concreto: ej. 'Diseña dos estudios de caso breves con tres preguntas guía'.",
    },
    {
      id: "err-3",
      label: "Instrucción 3",
      promptText:
        "Para estudiantes de cuarto de primaria, elabora una guía de lectura comprensiva sobre ecosistemas locales en una lista de cinco actividades.",
      correctCategory: "ausencia_restricciones",
      whyItMatters:
        "Aunque incluye contexto, tarea y formato, omite restricciones clave como duración disponible, materiales accesibles o nivel de vocabulario infantil.",
      howToFix:
        "Incorpora límites concretos: ej. 'Actividades de máximo 15 minutos usando solo cuaderno y pizarra, con lenguaje adecuado para 9 a 10 años'.",
    },
    {
      id: "err-4",
      label: "Instrucción 4",
      promptText:
        "Como especialista en evaluación educativa para segundo semestre universitario, compara la evaluación diagnóstica, formativa y sumativa considerando función, momento de aplicación y un ejemplo real, sin superar 180 palabras.",
      correctCategory: "falta_formato",
      whyItMatters:
        "Cuando se comparan tres conceptos bajo múltiples criterios sin pedir tabla o matriz, la IA suele redactar párrafos corridos difíciles de contrastar.",
      howToFix:
        "Especifica el formato necesario: ej. 'Presenta la comparación en una tabla de 4 columnas (Criterio | Diagnóstica | Formativa | Sumativa)'.",
    },
  ] as Challenge3Item[],
};

export type ResponseAuditCategory =
  | "cumplido"
  | "omitido"
  | "no_correspondiente"
  | "necesita_verificacion";

export const RESPONSE_AUDIT_CATEGORIES: {
  id: ResponseAuditCategory;
  label: string;
}[] = [
  { id: "cumplido", label: "Cumplido" },
  { id: "omitido", label: "Omitido / Incompleto" },
  { id: "no_correspondiente", label: "No correspondiente" },
  { id: "necesita_verificacion", label: "Necesita verificación" },
];

export interface Challenge4CriterionItem {
  id: string;
  aspect: string;
  requestedSnippet: string;
  deliveredSnippet: string;
  correctCategory: ResponseAuditCategory;
  explanation: string;
}

export const CHALLENGE_4_DATA = {
  instruction:
    "Diseña una actividad de comprensión lectora para quinto de primaria, de 30 minutos, con objetivo, materiales y tres pasos de desarrollo.",
  simulatedResponseSections: [
    {
      heading: "Actividad de comprensión lectora (5.° de primaria)",
      body: "Propuesta orientada a trabajar un texto narrativo breve en clase.",
    },
    {
      heading: "Objetivo",
      body: "Identificar la idea principal y dos ideas secundarias en una lectura narrativa corta.",
    },
    {
      heading: "Materiales",
      body: "Copias impresas del texto breve, lápices de colores y fichas de trabajo.",
    },
    {
      heading: "Desarrollo",
      body: "Paso 1: Lectura silenciosa individual y subrayado de ideas clave. Paso 2: Socialización oral en plenaria para comentar lo subrayado.",
    },
    {
      heading: "Cierre y nota adicional",
      body: "Según el informe regional de lectura escolar de 2024, esta secuencia garantiza un 92% de comprensión inmediata. Se recomienda aplicar además un cuestionario escrito formal de 45 minutos al finalizar.",
    },
  ],
  criteriaItems: [
    {
      id: "c4-obj-mat",
      aspect: "Objetivo y materiales para quinto de primaria",
      requestedSnippet:
        "Actividad de comprensión lectora para quinto de primaria con objetivo y materiales",
      deliveredSnippet:
        "Incluye grado (5.°), objetivo de identificación de ideas y lista de materiales sencillos.",
      correctCategory: "cumplido",
      explanation:
        "Tanto el objetivo pedagógico como los materiales responden fielmente a lo solicitado en la instrucción.",
    },
    {
      id: "c4-tiempo-pasos",
      aspect: "Duración de 30 minutos y tres pasos de desarrollo",
      requestedSnippet: "Duración de 30 minutos y tres pasos de desarrollo",
      deliveredSnippet:
        "No indica ningún tiempo para la actividad y solamente presenta 2 pasos en el desarrollo.",
      correctCategory: "omitido",
      explanation:
        "La respuesta omitió el parámetro de 30 minutos y dejó incompleto el desarrollo al entregar solo dos pasos en lugar de tres.",
    },
    {
      id: "c4-examen-extra",
      aspect: "Cuestionario formal adicional de 45 minutos",
      requestedSnippet:
        "Actividad única de 30 minutos centrada en comprensión lectora",
      deliveredSnippet:
        "Agrega la recomendación de aplicar un examen escrito formal de 45 minutos que no fue pedido.",
      correctCategory: "no_correspondiente",
      explanation:
        "Introduce una tarea no solicitada de 45 minutos que contradice el alcance y la duración del pedido original.",
    },
    {
      id: "c4-dato-92",
      aspect: "Cifra estadística sobre '92% de comprensión según informe 2024'",
      requestedSnippet:
        "Diseño de actividad práctica (sin solicitud de estadísticas inventadas)",
      deliveredSnippet:
        "Cita un porcentaje exacto (92%) y un informe genérico de 2024 sin referencia comprobable.",
      correctCategory: "necesita_verificacion",
      explanation:
        "Las cifras estadísticas y reportes mencionados sin autor, institución ni fuente verificable pueden ser datos fabricados por la IA.",
    },
  ] as Challenge4CriterionItem[],
};

export interface Challenge5Alternative {
  id: "A" | "B" | "C";
  title: string;
  summary: string;
  isAppropriate: boolean;
  feedback: string;
}

export interface Challenge5DimensionOption {
  id: string;
  dimension: string;
  label: string;
  isValid: boolean;
  explanation: string;
}

export const CHALLENGE_5_DATA = {
  caseDescription:
    "Una docente de primaria debe organizar una actividad de aprendizaje sobre el cuidado del agua. Tiene 30 estudiantes, dispone de 40 minutos y cuenta con materiales sencillos. Necesita una actividad participativa que permita comprobar si los estudiantes comprendieron el tema.",
  needs: [
    "Grupo de 30 estudiantes de nivel primario",
    "Tiempo total disponible: 40 minutos",
    "Solo materiales sencillos (sin tecnología compleja)",
    "Metodología participativa",
    "Evidencia para comprobar si comprendieron el tema",
  ],
  alternatives: [
    {
      id: "A",
      title: "Propuesta simulada A — Investigación digital individual",
      summary:
        "Cada estudiante usa una tableta con internet durante 50 minutos para buscar videos sobre el agua, editar una presentación digital y enviar un ensayo escrito la semana siguiente.",
      isAppropriate: false,
      feedback:
        "Inviable para el caso: exige 30 tabletas e internet (no materiales sencillos), supera los 40 minutos (50 min + tarea posterior) y no es participativa.",
    },
    {
      id: "B",
      title: "Propuesta simulada B — Exposición magistral con copia",
      summary:
        "La docente expone durante 35 minutos las causas del desperdicio del agua mientras los 30 estudiantes escuchan en silencio, y en los últimos 5 minutos copian un resumen del pizarrón.",
      isAppropriate: false,
      feedback:
        "Aunque cabe en 40 minutos y usa recursos simples, no es participativa ni permite comprobar si los estudiantes comprendieron (solo copian un resumen).",
    },
    {
      id: "C",
      title: "Propuesta simulada C — Taller «Detectives del Agua» en equipos",
      summary:
        "Trabajo en 6 equipos de 5 estudiantes (40 minutos totales) usando cartulinas recicladas y tarjetas de casos: 8 min de activación grupal, 18 min para analizar un caso cotidiano de desperdicio y proponer 2 acciones de cuidado, y 14 min para socialización breve más un ticket de salida individual con 2 preguntas aplicadas de comprobación.",
      isAppropriate: true,
      feedback:
        "Coherente con todas las condiciones: organiza a los 30 estudiantes de forma participativa, respeta los 40 minutos, usa materiales sencillos e incluye comprobación aplicada del aprendizaje.",
    },
  ] as Challenge5Alternative[],
  justifications: [
    {
      id: "dim-pertinencia",
      dimension: "Pertinencia pedagógica",
      label:
        "Pertinencia pedagógica: conecta el cuidado del agua con casos cotidianos mediante trabajo activo en equipos acorde a primaria.",
      isValid: true,
      explanation:
        "Responde al enfoque participativo y significativo adecuado para estudiantes de nivel primario.",
    },
    {
      id: "dim-viabilidad",
      dimension: "Viabilidad",
      label:
        "Viabilidad: permite trabajar con 30 estudiantes en 6 grupos utilizando únicamente cartulinas recicladas y tarjetas simples.",
      isValid: true,
      explanation:
        "Se adapta a los recursos reales del aula sin depender de dispositivos o internet.",
    },
    {
      id: "dim-tiempo",
      dimension: "Adecuación al tiempo",
      label:
        "Adecuación al tiempo: distribuye las fases (8 + 18 + 14 min) para ajustarse exactamente a los 40 minutos disponibles.",
      isValid: true,
      explanation:
        "Planifica la gestión del tiempo dentro del bloque real de 40 minutos.",
    },
    {
      id: "dim-comprobacion",
      dimension: "Comprobación del aprendizaje",
      label:
        "Comprobación del aprendizaje: incorpora un ticket de salida con preguntas aplicadas para verificar la comprensión individual.",
      isValid: true,
      explanation:
        "Aporta evidencia concreta de lo que comprendió cada estudiante al cerrar la sesión.",
    },
    {
      id: "dim-distractor-tech",
      dimension: "Criterio incompatible",
      label:
        "Uso intensivo de dispositivos digitales individuales para garantizar la atención del grupo.",
      isValid: false,
      explanation:
        "Incorrecto: el caso especifica expresamente que solo se cuenta con materiales sencillos.",
    },
    {
      id: "dim-distractor-copia",
      dimension: "Criterio incompatible",
      label:
        "Copia literal de la pizarra como evidencia suficiente de comprensión conceptual.",
      isValid: false,
      explanation:
        "Incorrecto: copiar mecánicamente no demuestra si el estudiante comprendió ni aplica lo aprendido.",
    },
  ] as Challenge5DimensionOption[],
};

export interface Challenge6AuditQuestion {
  id: string;
  number: number;
  question: string;
  correctAnswer: "si" | "no";
  explanation: string;
}

export interface Challenge6ChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export const CHALLENGE_6_DATA = {
  dossier: {
    teacherNeed:
      "Un docente de cuarto de primaria en una escuela rural sin conexión a internet necesita una guía de 35 minutos para trabajar lectura inferencial sobre el cuidado del entorno con 28 estudiantes, utilizando únicamente pizarra y copias impresas.",
    usedPrompt:
      "Hazme una clase divertida de lectura para cuarto grado sobre ecología.",
    simulatedResponse:
      "Propuesta generada: (1) Proyecta un video interactivo en YouTube durante 15 minutos y realiza un cuestionario en línea con celulares; (2) Pide a los estudiantes buscar en internet tres noticias de 2025 sobre el río cercano; (3) Según la Ley Nacional de Educación Ecológica de 2024, artículo 88, aplica el formato de rúbrica digital oficial. (No incluye el texto de lectura, preguntas inferenciales ni tiempos ajustados a 35 minutos).",
    identifiedProblems:
      "Al intentar aplicarla en clase, el docente no cuenta con proyector, internet ni celulares; no dispone de un texto ni preguntas de lectura inferencial; la secuencia no se ajusta a 35 minutos; y la supuesta 'Ley Nacional de Educación Ecológica de 2024, artículo 88' no existe en la normativa oficial.",
  },
  auditQuestions: [
    {
      id: "q1",
      number: 1,
      question: "¿La instrucción contenía el contexto necesario?",
      correctAnswer: "no",
      explanation:
        "No: omitió mencionar que es un aula rural sin internet ni dispositivos, con 28 estudiantes, 35 minutos y materiales limitados a pizarra y copias.",
    },
    {
      id: "q2",
      number: 2,
      question: "¿La tarea estaba claramente definida?",
      correctAnswer: "no",
      explanation:
        "No: pedir 'una clase divertida de lectura' es ambiguo y no precisa trabajar lectura inferencial ni entregar un texto con preguntas guía.",
    },
    {
      id: "q3",
      number: 3,
      question: "¿La respuesta cumplió lo solicitado?",
      correctAnswer: "no",
      explanation:
        "No: no entregó materiales ni actividades prácticas de lectura inferencial que el docente pudiera aplicar directamente.",
    },
    {
      id: "q4",
      number: 4,
      question: "¿Se respetaron las condiciones del caso?",
      correctAnswer: "no",
      explanation:
        "No: propuso YouTube, búsquedas web y herramientas digitales inviables sin internet ni proyector, e ignoró los 35 minutos.",
    },
    {
      id: "q5",
      number: 5,
      question: "¿Hay información que debe verificarse?",
      correctAnswer: "si",
      explanation:
        "Sí: cita una supuesta 'Ley Nacional de Educación Ecológica de 2024, artículo 88' sin respaldo verificable, un caso típico de alucinación normativa.",
    },
    {
      id: "q6",
      number: 6,
      question:
        "¿La respuesta es adecuada para utilizarse en esa situación educativa?",
      correctAnswer: "no",
      explanation:
        "No: resulta pedagógica y operativamente inviable para ese grupo y contiene una referencia legal no confirmada.",
    },
  ] as Challenge6AuditQuestion[],
  mainProblems: [
    {
      id: "prob-contexto-restricciones",
      label:
        "La instrucción omitió el contexto real, las restricciones técnicas y la tarea específica, produciendo una propuesta inviable y con referencias legales dudosas.",
      isCorrect: true,
      explanation:
        "Resume con precisión la causa raíz del fallo tanto en la formulación inicial como en la respuesta no verificada.",
    },
    {
      id: "prob-extension",
      label:
        "El único problema es que la respuesta de la IA debió incluir más enlaces web para el docente.",
      isCorrect: false,
      explanation:
        "El entorno rural no tiene internet, por lo que más enlaces agravarían la inviabilidad.",
    },
    {
      id: "prob-tono",
      label:
        "La respuesta falló únicamente porque no usó un tono suficientemente formal.",
      isCorrect: false,
      explanation:
        "El problema central no es el tono, sino la falta de contexto/restricciones y la alucinación normativa.",
    },
  ] as Challenge6ChoiceOption[],
  improvements: [
    {
      id: "imp-reformular",
      label:
        "Reformular la instrucción detallando aula rural sin internet, 28 estudiantes, 35 minutos, solo pizarra y copias impresas, tarea de lectura inferencial con texto breve y prohibición de inventar leyes o citas.",
      isCorrect: true,
      explanation:
        "Corrige todos los vacíos detectados: contextualiza, delimita recursos y tiempo, precisa la tarea e incorpora control anti-alucinaciones.",
    },
    {
      id: "imp-repetir",
      label:
        "Volver a enviar exactamente la misma instrucción esperando que la IA genere una clase mejor al azar.",
      isCorrect: false,
      explanation:
        "Repetir una instrucción ambigua sin añadir contexto ni restricciones no garantiza mejores resultados.",
    },
    {
      id: "imp-aceptar",
      label:
        "Usar la respuesta tal como salió e incluir la ley citada sin comprobarla.",
      isCorrect: false,
      explanation:
        "Es inviable en el aula y reproduciría una referencia normativa probablemente inventada.",
    },
  ] as Challenge6ChoiceOption[],
};
