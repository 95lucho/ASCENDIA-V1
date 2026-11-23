import { jsPDF } from "jspdf";
import {
  CHALLENGE_1_DATA,
  CHALLENGE_2_DATA,
  CHALLENGE_3_DATA,
  CHALLENGE_4_DATA,
  CHALLENGE_5_DATA,
  CHALLENGE_6_DATA,
  ERROR_CATEGORIES,
  PROMPT_PART_CATEGORIES,
  RESPONSE_AUDIT_CATEGORIES,
} from "../data/structuredChallenges";
import {
  ChallengeDefinition,
  ChallengeProgress,
  LabStorageState,
} from "../types/lab";
import {
  FREE_CHALLENGE_ID,
  STRUCTURED_CHALLENGE_IDS,
  isFormativeSequenceCompleted,
} from "./progression";
import { formatDateTimeEs, formatEvaluationAnswer } from "./promptBuilder";

const NAVY: [number, number, number] = [30, 58, 95];
const CRIMSON: [number, number, number] = [139, 30, 36];
const INK: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [71, 85, 105];
const BORDER: [number, number, number] = [203, 213, 225];
const SOFT_BG: [number, number, number] = [245, 247, 250];
const EMERALD: [number, number, number] = [4, 120, 87];
const WHITE: [number, number, number] = [255, 255, 255];

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const TOP_MARGIN = 20;
const BOTTOM_LIMIT = 274;

/**
 * Normaliza texto UTF-8 a caracteres seguros para fuentes estándar PDF (WinAnsi / Latin-1),
 * reemplazando símbolos fuera de rango como flechas Unicode o emojis por equivalentes legibles.
 */
export function normalizePdfText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/•/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g, "");
}

export function canExportPortfolioPdf(
  challenges: Record<string, ChallengeProgress>
): boolean {
  return isFormativeSequenceCompleted(challenges);
}

export function getPortfolioPdfFilename(studentName: string): string {
  const slug = (studentName.trim() || "estudiante")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `bitacora-ascendia-${slug || "estudiante"}.pdf`;
}

function summarizeActivityAnswers(
  challengeId: string,
  progress?: ChallengeProgress
): string[] {
  const state = progress?.activityState;
  if (!state) return [];

  const lines: string[] = [];

  if (challengeId === "reto-1") {
    for (const frag of CHALLENGE_1_DATA.fragments) {
      const selected = state[frag.id];
      const catLabel =
        PROMPT_PART_CATEGORIES.find((c) => c.id === selected)?.label ??
        "Sin responder";
      const ok = selected === frag.correctCategory ? "Correcto" : "Revisado";
      lines.push(`${frag.label}: asignado a "${catLabel}" (${ok}).`);
    }
    return lines;
  }

  if (challengeId === "reto-2") {
    const selectedOption =
      typeof state.selectedOption === "string" ? state.selectedOption : "";
    const optObj = CHALLENGE_2_DATA.options.find(
      (o) => o.id === selectedOption
    );
    if (optObj) {
      lines.push(
        `Instrucción elegida: ${optObj.title} (${
          optObj.isEffective ? "Correcta" : "Por mejorar"
        }).`
      );
    }
    const criteria = Array.isArray(state.selectedCriteria)
      ? state.selectedCriteria.filter((id): id is string => typeof id === "string")
      : [];
    if (criteria.length > 0) {
      const labels = criteria
        .map(
          (id) =>
            CHALLENGE_2_DATA.criteria.find((c) => c.id === id)?.label ?? id
        )
        .join(", ");
      lines.push(`Criterios seleccionados: ${labels}.`);
    }
    return lines;
  }

  if (challengeId === "reto-3") {
    for (const item of CHALLENGE_3_DATA.items) {
      const selected = state[item.id];
      const catLabel =
        ERROR_CATEGORIES.find((c) => c.id === selected)?.label ??
        "Sin diagnosticar";
      const ok = selected === item.correctCategory ? "Correcto" : "Revisado";
      lines.push(`${item.label}: "${catLabel}" (${ok}).`);
    }
    return lines;
  }

  if (challengeId === "reto-4") {
    for (const item of CHALLENGE_4_DATA.criteriaItems) {
      const selected = state[item.id];
      const catLabel =
        RESPONSE_AUDIT_CATEGORIES.find((c) => c.id === selected)?.label ??
        "Sin valorar";
      const ok = selected === item.correctCategory ? "Correcto" : "Revisado";
      lines.push(`${item.aspect}: "${catLabel}" (${ok}).`);
    }
    return lines;
  }

  if (challengeId === "reto-5") {
    const selectedAlt =
      typeof state.selectedAlternative === "string"
        ? state.selectedAlternative
        : "";
    const altObj = CHALLENGE_5_DATA.alternatives.find(
      (a) => a.id === selectedAlt
    );
    if (altObj) {
      lines.push(`Alternativa elegida: ${altObj.title}.`);
    }
    const justs = Array.isArray(state.selectedJustifications)
      ? state.selectedJustifications.filter(
          (id): id is string => typeof id === "string"
        )
      : [];
    if (justs.length > 0) {
      const dims = justs
        .map(
          (id) =>
            CHALLENGE_5_DATA.justifications.find((j) => j.id === id)
              ?.dimension ?? id
        )
        .join(", ");
      lines.push(`Dimensiones justificadas: ${dims}.`);
    }
    return lines;
  }

  if (challengeId === "reto-6") {
    const criteriaAnswers =
      state.criteriaAnswers && typeof state.criteriaAnswers === "object"
        ? (state.criteriaAnswers as Record<string, unknown>)
        : {};
    const answeredCorrect = CHALLENGE_6_DATA.auditQuestions.filter(
      (q) => criteriaAnswers[q.id] === q.correctAnswer
    ).length;
    lines.push(
      `Criterios de auditoría resueltos correctamente: ${answeredCorrect} de 6.`
    );
    const probId =
      typeof state.selectedProblem === "string" ? state.selectedProblem : "";
    const probLabel = CHALLENGE_6_DATA.mainProblems.find(
      (p) => p.id === probId
    )?.label;
    if (probLabel) {
      lines.push(`Problema principal identificado: ${probLabel}`);
    }
    const impId =
      typeof state.selectedImprovement === "string"
        ? state.selectedImprovement
        : "";
    const impLabel = CHALLENGE_6_DATA.improvements.find(
      (i) => i.id === impId
    )?.label;
    if (impLabel) {
      lines.push(`Mejora seleccionada: ${impLabel}`);
    }
    return lines;
  }

  return lines;
}

class PdfCursor {
  doc: jsPDF;
  y: number;

  constructor(doc: jsPDF, initialY = TOP_MARGIN) {
    this.doc = doc;
    this.y = initialY;
  }

  ensureSpace(requiredHeight: number) {
    if (this.y + requiredHeight > BOTTOM_LIMIT) {
      this.doc.addPage();
      this.y = TOP_MARGIN;
    }
  }

  drawWrappedText(
    text: string,
    x: number,
    maxWidth: number,
    options?: {
      fontSize?: number;
      lineHeight?: number;
      bold?: boolean;
      color?: [number, number, number];
      gapAfter?: number;
    }
  ) {
    const fontSize = options?.fontSize ?? 10;
    const lineHeight = options?.lineHeight ?? fontSize * 0.45 + 0.6;
    const bold = options?.bold ?? false;
    const color = options?.color ?? INK;
    const gapAfter = options?.gapAfter ?? 2;

    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color[0], color[1], color[2]);

    const clean = normalizePdfText(text);
    const wrapped = this.doc.splitTextToSize(clean, maxWidth) as string[];

    for (const line of wrapped) {
      this.ensureSpace(lineHeight + 1);
      this.doc.text(line, x, this.y);
      this.y += lineHeight;
    }
    this.y += gapAfter;
  }

  drawLabelValue(
    label: string,
    value: string,
    x = MARGIN_X,
    maxWidth = CONTENT_WIDTH,
    gapAfter = 2
  ) {
    const cleanLabel = normalizePdfText(label);
    const cleanValue = normalizePdfText(value);
    const full = `${cleanLabel}: ${cleanValue}`;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(INK[0], INK[1], INK[2]);
    const wrapped = this.doc.splitTextToSize(full, maxWidth) as string[];
    const lineHeight = 4.6;
    for (let i = 0; i < wrapped.length; i++) {
      this.ensureSpace(lineHeight + 1);
      if (i === 0 && wrapped[0].startsWith(`${cleanLabel}:`)) {
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        const prefix = `${cleanLabel}: `;
        this.doc.text(prefix, x, this.y);
        const prefixW = this.doc.getTextWidth(prefix);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(INK[0], INK[1], INK[2]);
        this.doc.text(wrapped[0].slice(prefix.length), x + prefixW, this.y);
      } else {
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(INK[0], INK[1], INK[2]);
        this.doc.text(wrapped[i], x, this.y);
      }
      this.y += lineHeight;
    }
    this.y += gapAfter;
  }
}

export function buildPortfolioPdfDocument(
  state: LabStorageState,
  challenges: ChallengeDefinition[]
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const studentLabel = normalizePdfText(
    state.studentName.trim() || "Estudiante sin identificar"
  );
  const exportedAt = formatDateTimeEs(new Date().toISOString());

  const structuredChallenges = challenges.filter((c) =>
    STRUCTURED_CHALLENGE_IDS.includes(c.id)
  );
  const freeChallenge = challenges.find((c) => c.id === FREE_CHALLENGE_ID);
  const freeProgress = freeChallenge
    ? state.challenges[freeChallenge.id]
    : undefined;
  const hasFreeActivity = Boolean(
    freeProgress &&
      (freeProgress.completed ||
        freeProgress.versions.length > 0 ||
        freeProgress.draftResponse.trim().length > 0 ||
        freeProgress.customMeta?.title?.trim())
  );

  const completedMandatoryCount = structuredChallenges.filter((c) =>
    Boolean(state.challenges[c.id]?.completed)
  ).length;

  // =========================================================================
  // PORTADA (PÁGINA 1)
  // =========================================================================
  // Bandas institucionales UAGRM
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, PAGE_WIDTH, 24, "F");
  doc.setFillColor(CRIMSON[0], CRIMSON[1], CRIMSON[2]);
  doc.rect(0, 24, PAGE_WIDTH, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text(
    "ASCENDIA · UAGRM · CIENCIAS DE LA EDUCACIÓN",
    MARGIN_X,
    14.5
  );

  let coverY = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("Bitácora de Aprendizaje", MARGIN_X, coverY);

  coverY += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const subtitleLines = doc.splitTextToSize(
    normalizePdfText(
      "Evidencia académica del proceso formativo en formulación, análisis y evaluación crítica de instrucciones para sistemas de inteligencia artificial."
    ),
    CONTENT_WIDTH
  ) as string[];
  for (const line of subtitleLines) {
    doc.text(line, MARGIN_X, coverY);
    coverY += 5.5;
  }

  coverY += 6;
  // Tarjeta de identificación del estudiante
  doc.setFillColor(SOFT_BG[0], SOFT_BG[1], SOFT_BG[2]);
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.roundedRect(MARGIN_X, coverY, CONTENT_WIDTH, 34, 2.5, 2.5, "FD");
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(MARGIN_X, coverY, 2.5, 34, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(CRIMSON[0], CRIMSON[1], CRIMSON[2]);
  doc.text("DATOS DEL ESTUDIANTE Y EMISIÓN", MARGIN_X + 7, coverY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text(studentLabel, MARGIN_X + 7, coverY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(
    normalizePdfText(`Fecha de exportación: ${exportedAt}`),
    MARGIN_X + 7,
    coverY + 23
  );
  doc.text(
    normalizePdfText(
      `Estado formativo: ${completedMandatoryCount} de 6 retos obligatorios completados`
    ),
    MARGIN_X + 7,
    coverY + 29
  );

  coverY += 44;
  // Tira de 3 indicadores en portada
  const cardGap = 4;
  const cardW = (CONTENT_WIDTH - cardGap * 2) / 3;
  const kpis = [
    {
      label: "Retos obligatorios",
      value: `${completedMandatoryCount} / 6`,
      accent: EMERALD,
    },
    {
      label: "Secuencia formativa",
      value:
        completedMandatoryCount === 6 ? "Aprobada (100%)" : "En progreso",
      accent: NAVY,
    },
    {
      label: "Reto Libre (opcional)",
      value: freeProgress?.completed
        ? "Completado"
        : hasFreeActivity
        ? "Con registro"
        : "Opcional no usado",
      accent: CRIMSON,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const cx = MARGIN_X + idx * (cardW + cardGap);
    doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.roundedRect(cx, coverY, cardW, 20, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(normalizePdfText(kpi.label), cx + 4, coverY + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(kpi.accent[0], kpi.accent[1], kpi.accent[2]);
    doc.text(normalizePdfText(kpi.value), cx + 4, coverY + 14.5);
  });

  coverY += 30;
  // Tabla resumen de los 6 retos en portada
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text("Resumen de los seis retos progresivos", MARGIN_X, coverY);
  coverY += 4;

  // Encabezado de tabla
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(MARGIN_X, coverY, CONTENT_WIDTH, 7.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text("Reto", MARGIN_X + 3, coverY + 5);
  doc.text("Nivel", MARGIN_X + 22, coverY + 5);
  doc.text("Título", MARGIN_X + 46, coverY + 5);
  doc.text("Resultado", MARGIN_X + 124, coverY + 5);
  coverY += 7.5;

  structuredChallenges.forEach((ch, idx) => {
    const prog = state.challenges[ch.id];
    const rowH = 10;
    if (idx % 2 === 0) {
      doc.setFillColor(SOFT_BG[0], SOFT_BG[1], SOFT_BG[2]);
      doc.rect(MARGIN_X, coverY, CONTENT_WIDTH, rowH, "F");
    }
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.line(MARGIN_X, coverY + rowH, MARGIN_X + CONTENT_WIDTH, coverY + rowH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(normalizePdfText(ch.orderLabel), MARGIN_X + 3, coverY + 6.2);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(CRIMSON[0], CRIMSON[1], CRIMSON[2]);
    doc.text(normalizePdfText(ch.level), MARGIN_X + 22, coverY + 6.2);

    doc.setTextColor(INK[0], INK[1], INK[2]);
    const shortTitle = doc.splitTextToSize(
      normalizePdfText(ch.title),
      74
    ) as string[];
    doc.text(shortTitle[0] ?? "", MARGIN_X + 46, coverY + 6.2);

    const resText =
      prog?.activityResult?.resultLabel ||
      (prog?.completed ? "Completado" : "Pendiente");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      prog?.completed ? EMERALD[0] : MUTED[0],
      prog?.completed ? EMERALD[1] : MUTED[1],
      prog?.completed ? EMERALD[2] : MUTED[2]
    );
    const shortRes = doc.splitTextToSize(
      normalizePdfText(resText),
      48
    ) as string[];
    doc.text(shortRes[0] ?? "", MARGIN_X + 124, coverY + 6.2);

    coverY += rowH;
  });

  // =========================================================================
  // SECCIÓN I: DETALLE DE LOS SEIS RETOS OBLIGATORIOS
  // =========================================================================
  doc.addPage();
  const cursor = new PdfCursor(doc, TOP_MARGIN);

  cursor.drawWrappedText(
    "Sección I. Evidencia de los Seis Retos Obligatorios",
    MARGIN_X,
    CONTENT_WIDTH,
    { fontSize: 15, lineHeight: 7, bold: true, color: NAVY, gapAfter: 2 }
  );
  doc.setDrawColor(CRIMSON[0], CRIMSON[1], CRIMSON[2]);
  doc.setLineWidth(0.6);
  doc.line(MARGIN_X, cursor.y, MARGIN_X + CONTENT_WIDTH, cursor.y);
  doc.setLineWidth(0.2);
  cursor.y += 6;

  for (const ch of structuredChallenges) {
    const progress = state.challenges[ch.id];

    cursor.ensureSpace(28);
    // Cabecera de bloque del reto
    doc.setFillColor(SOFT_BG[0], SOFT_BG[1], SOFT_BG[2]);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.roundedRect(MARGIN_X, cursor.y, CONTENT_WIDTH, 13, 1.5, 1.5, "FD");
    doc.setFillColor(CRIMSON[0], CRIMSON[1], CRIMSON[2]);
    doc.rect(MARGIN_X, cursor.y, 2, 13, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(
      normalizePdfText(`${ch.orderLabel} (${ch.level}): ${ch.title}`),
      MARGIN_X + 5,
      cursor.y + 5.8
    );

    const statusLine = progress?.completed
      ? `Estado: Completado${
          progress.completedAt
            ? ` el ${formatDateTimeEs(progress.completedAt)}`
            : ""
        }`
      : "Estado: Pendiente";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(
      progress?.completed ? EMERALD[0] : MUTED[0],
      progress?.completed ? EMERALD[1] : MUTED[1],
      progress?.completed ? EMERALD[2] : MUTED[2]
    );
    doc.text(normalizePdfText(statusLine), MARGIN_X + 5, cursor.y + 10.6);
    cursor.y += 17;

    cursor.drawLabelValue("Objetivo formativo", ch.objetivo);
    if (ch.secuencia?.length) {
      cursor.drawLabelValue("Secuencia aplicada", ch.secuencia.join(" -> "));
    }

    if (progress?.activityResult) {
      const ar = progress.activityResult;
      cursor.drawLabelValue("Resultado obtenido", ar.resultLabel);
      cursor.drawLabelValue("Competencia desarrollada", ar.competence);
      cursor.drawLabelValue(
        "Evaluado el",
        formatDateTimeEs(ar.evaluatedAt)
      );
      cursor.drawLabelValue("Retroalimentación", ar.feedbackSummary);
    }

    const answerLines = summarizeActivityAnswers(ch.id, progress);
    if (answerLines.length > 0) {
      cursor.drawWrappedText(
        "Respuestas registradas del estudiante:",
        MARGIN_X,
        CONTENT_WIDTH,
        { fontSize: 9.5, lineHeight: 4.5, bold: true, color: NAVY, gapAfter: 1 }
      );
      for (const ansLine of answerLines) {
        cursor.drawWrappedText(`- ${ansLine}`, MARGIN_X + 3, CONTENT_WIDTH - 3, {
          fontSize: 9,
          lineHeight: 4.3,
          color: INK,
          gapAfter: 1,
        });
      }
      cursor.y += 1;
    }

    // Conservar también cualquier versión histórica previa si existiera
    if (progress && progress.versions.length > 0) {
      cursor.drawWrappedText(
        `Registros históricos conservados (${progress.versions.length}):`,
        MARGIN_X,
        CONTENT_WIDTH,
        { fontSize: 9.5, lineHeight: 4.5, bold: true, color: MUTED, gapAfter: 1 }
      );
      for (const ver of progress.versions) {
        const promptUsed =
          ver.executedPrompt?.trim() || ver.assembledPrompt || "(Vacío)";
        cursor.drawWrappedText(
          `Prueba ${ver.versionNumber} (${formatDateTimeEs(ver.createdAt)}):`,
          MARGIN_X + 3,
          CONTENT_WIDTH - 3,
          { fontSize: 9, lineHeight: 4.3, bold: true, color: INK, gapAfter: 0.5 }
        );
        cursor.drawWrappedText(
          `Instrucción: ${promptUsed}`,
          MARGIN_X + 5,
          CONTENT_WIDTH - 5,
          { fontSize: 8.5, lineHeight: 4, color: MUTED, gapAfter: 1 }
        );
        if (ver.evaluation.notasReflexion?.trim()) {
          cursor.drawWrappedText(
            `Reflexión: ${ver.evaluation.notasReflexion.trim()}`,
            MARGIN_X + 5,
            CONTENT_WIDTH - 5,
            { fontSize: 8.5, lineHeight: 4, color: INK, gapAfter: 1.5 }
          );
        }
      }
    }

    cursor.y += 4;
  }

  // =========================================================================
  // SECCIÓN II: RETO LIBRE (OPCIONAL)
  // =========================================================================
  if (freeChallenge) {
    cursor.ensureSpace(28);
    cursor.drawWrappedText(
      "Sección II. Reto Libre (Actividad Opcional)",
      MARGIN_X,
      CONTENT_WIDTH,
      { fontSize: 14, lineHeight: 6.5, bold: true, color: NAVY, gapAfter: 2 }
    );
    doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.setLineWidth(0.4);
    doc.line(MARGIN_X, cursor.y, MARGIN_X + CONTENT_WIDTH, cursor.y);
    doc.setLineWidth(0.2);
    cursor.y += 5;

    if (!hasFreeActivity) {
      cursor.drawWrappedText(
        "El Reto Libre es opcional para experimentación autónoma y no presenta registros pendientes para la aprobación de la secuencia formativa.",
        MARGIN_X,
        CONTENT_WIDTH,
        { fontSize: 9.5, lineHeight: 4.6, color: MUTED, gapAfter: 3 }
      );
    } else if (freeProgress) {
      const freeTitle =
        freeProgress.customMeta?.title?.trim() || freeChallenge.title;
      const freeObjetivo =
        freeProgress.customMeta?.objetivo?.trim() || freeChallenge.objetivo;
      cursor.drawLabelValue("Título", freeTitle);
      cursor.drawLabelValue("Objetivo", freeObjetivo);
      cursor.drawLabelValue(
        "Estado",
        freeProgress.completed ? "Completado" : "En práctica"
      );

      for (const ver of freeProgress.versions) {
        const promptUsed =
          ver.executedPrompt?.trim() || ver.assembledPrompt || "(Vacío)";
        cursor.drawWrappedText(
          `Prueba ${ver.versionNumber} · ${formatDateTimeEs(ver.createdAt)}`,
          MARGIN_X,
          CONTENT_WIDTH,
          { fontSize: 9.5, lineHeight: 4.6, bold: true, color: CRIMSON, gapAfter: 1 }
        );
        cursor.drawLabelValue(
          "Instrucción utilizada",
          promptUsed,
          MARGIN_X + 2,
          CONTENT_WIDTH - 2
        );
        cursor.drawLabelValue(
          "Respuesta obtenida",
          ver.aiResponse || "(Sin respuesta registrada)",
          MARGIN_X + 2,
          CONTENT_WIDTH - 2
        );
        cursor.drawLabelValue(
          "Evaluación",
          `Cumplió pedido: ${formatEvaluationAnswer(
            ver.evaluation.cumplioRestricciones,
            1
          )} | Claridad: ${formatEvaluationAnswer(
            ver.evaluation.alucinacionesOSesgos,
            2
          )} | Adecuación: ${formatEvaluationAnswer(
            ver.evaluation.nivelYFormatoAdecuados,
            3
          )}`,
          MARGIN_X + 2,
          CONTENT_WIDTH - 2
        );
        if (ver.evaluation.notasReflexion?.trim()) {
          cursor.drawLabelValue(
            "Aprendizaje registrado",
            ver.evaluation.notasReflexion.trim(),
            MARGIN_X + 2,
            CONTENT_WIDTH - 2
          );
        }
        cursor.y += 2;
      }
    }
  }

  // =========================================================================
  // NUMERACIÓN DE PÁGINAS EN TODO EL DOCUMENTO
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.setLineWidth(0.25);
    doc.line(MARGIN_X, 283, MARGIN_X + CONTENT_WIDTH, 283);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(
      normalizePdfText(`ASCENDIA · UAGRM | Estudiante: ${studentLabel}`),
      MARGIN_X,
      288.5
    );

    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    const pageLabel = `Página ${p} de ${totalPages}`;
    const labelWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, MARGIN_X + CONTENT_WIDTH - labelWidth, 288.5);
  }

  return doc;
}

export function downloadPortfolioPdf(
  state: LabStorageState,
  challenges: ChallengeDefinition[]
): { filename: string; pageCount: number; byteLength: number } {
  const doc = buildPortfolioPdfDocument(state, challenges);
  const filename = getPortfolioPdfFilename(state.studentName);
  const pageCount = doc.getNumberOfPages();

  const arrayBuffer = doc.output("arraybuffer");
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Retrasar revocación para compatibilidad con descargas en Safari iOS / Chrome móvil
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 15000);

  return {
    filename,
    pageCount,
    byteLength: arrayBuffer.byteLength,
  };
}
