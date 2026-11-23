import {
  ChallengeDefinition,
  CompletenessCheck,
  LabStorageState,
  PromptBlocks,
} from "../types/lab";

const MIN_MEANINGFUL_LENGTH = 6;

function clean(value: string): string {
  return value.trim();
}

export function assemblePrompt(blocks: PromptBlocks): string {
  const parts: string[] = [];

  if (clean(blocks.rol)) {
    parts.push(`Rol y perspectiva:\n${clean(blocks.rol)}`);
  }
  if (clean(blocks.contexto)) {
    parts.push(`Propósito y contexto académico:\n${clean(blocks.contexto)}`);
  }
  if (clean(blocks.tarea)) {
    parts.push(`Tarea específica:\n${clean(blocks.tarea)}`);
  }
  if (clean(blocks.restricciones)) {
    parts.push(`Restricciones y límites:\n${clean(blocks.restricciones)}`);
  }
  if (clean(blocks.formato)) {
    parts.push(`Formato de salida esperado:\n${clean(blocks.formato)}`);
  }

  return parts.join("\n\n");
}

export function evaluateCompleteness(blocks: PromptBlocks): CompletenessCheck {
  const filledRol = clean(blocks.rol).length >= MIN_MEANINGFUL_LENGTH;
  const filledContexto = clean(blocks.contexto).length >= MIN_MEANINGFUL_LENGTH;
  const filledTarea = clean(blocks.tarea).length >= MIN_MEANINGFUL_LENGTH;
  const filledRestricciones =
    clean(blocks.restricciones).length >= MIN_MEANINGFUL_LENGTH;
  const filledFormato = clean(blocks.formato).length >= MIN_MEANINGFUL_LENGTH;

  const filledCount = [
    filledRol,
    filledContexto,
    filledTarea,
    filledRestricciones,
    filledFormato,
  ].filter(Boolean).length;

  const missingEssentials: string[] = [];
  if (!filledContexto) missingEssentials.push("Propósito y Contexto Académico");
  if (!filledTarea) missingEssentials.push("Tarea Específica");
  if (!filledRestricciones) missingEssentials.push("Restricciones y Límites");

  if (filledCount === 0 || (!filledContexto && !filledTarea)) {
    return {
      state: "incompleto",
      label: "Estructura incompleta",
      detail:
        "Completa al menos el contexto académico, la tarea específica y las restricciones para construir una instrucción verificable.",
      filledCount,
      missingEssentials,
    };
  }

  if (missingEssentials.length > 0) {
    return {
      state: "parcial",
      label: "Faltan bloques esenciales",
      detail: `Falta definir: ${missingEssentials.join(", ")}.`,
      filledCount,
      missingEssentials,
    };
  }

  const missingOptional: string[] = [];
  if (!filledRol) missingOptional.push("Rol / Perspectiva");
  if (!filledFormato) missingOptional.push("Formato de Salida");

  return {
    state: "completo",
    label:
      filledCount === 5
        ? "Estructura completa (5/5 bloques)"
        : "Estructura esencial completa",
    detail:
      missingOptional.length === 0
        ? "Todos los bloques estructurales están definidos. Listo para probar y auditar."
        : `Los bloques esenciales están listos. Opcional: puedes precisar ${missingOptional.join(" y ")}.`,
    filledCount,
    missingEssentials: [],
  };
}

export function formatDateTimeEs(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function exportPortfolioMarkdown(
  state: LabStorageState,
  challenges: ChallengeDefinition[]
): string {
  const studentLabel = state.studentName.trim() || "Estudiante sin identificar";
  const lines: string[] = [
    "# Portafolio Metacognitivo — ASCENDIA (UAGRM)",
    "",
    `- **Estudiante / Código:** ${studentLabel}`,
    `- **Diagnóstico inicial:** ${
      state.diagnostic.isPerfect
        ? "Completado con éxito"
        : state.diagnostic.validated
        ? "Validado parcialmente"
        : "Pendiente"
    }`,
    `- **Fecha de exportación:** ${formatDateTimeEs(new Date().toISOString())}`,
    "",
    "---",
    "",
  ];

  for (const ch of challenges) {
    const progress = state.challenges[ch.id];
    const hasVersions = progress && progress.versions.length > 0;
    const title =
      ch.esLibre && progress?.customMeta?.title
        ? `${ch.orderLabel}: ${progress.customMeta.title}`
        : `${ch.orderLabel}: ${ch.title}`;

    const status = progress?.completed
      ? "Completado"
      : hasVersions
      ? "En iteración"
      : "Pendiente";

    lines.push(`## ${title}`);
    lines.push(`- **Nivel:** ${ch.level}`);
    lines.push(`- **Estado:** ${status}`);
    lines.push(
      `- **Objetivo:** ${
        ch.esLibre && progress?.customMeta?.objetivo
          ? progress.customMeta.objetivo
          : ch.objetivo
      }`
    );
    lines.push("");

    if (!hasVersions) {
      lines.push("_Sin iteraciones registradas en bitácora._");
      lines.push("");
      continue;
    }

    for (const ver of progress.versions) {
      lines.push(`### Versión ${ver.versionNumber} (${formatDateTimeEs(ver.createdAt)})`);
      lines.push(
        `- **Modo de prueba:** ${
          ver.sourceMode === "live_gemini" ? "IA en vivo" : "Pegado manual"
        }`
      );
      lines.push("- **Prompt ensamblado:**");
      lines.push("```text");
      lines.push(ver.assembledPrompt || "(Vacío)");
      lines.push("```");
      lines.push("- **Respuesta analizada (extracto):**");
      lines.push(
        `> ${(ver.aiResponse || "(Sin respuesta registrada)").replace(/\n/g, "\n> ")}`
      );
      lines.push("- **Evaluación crítica:**");
      lines.push(
        `  - Cumplimiento de restricciones: ${ver.evaluation.cumplioRestricciones || "N/A"}`
      );
      lines.push(
        `  - Alucinaciones o sesgos: ${ver.evaluation.alucinacionesOSesgos || "N/A"}`
      );
      lines.push(
        `  - Nivel y formato adecuados: ${ver.evaluation.nivelYFormatoAdecuados || "N/A"}`
      );
      lines.push(
        `  - Reflexión metacognitiva: ${ver.evaluation.notasReflexion || "Sin notas"}`
      );
      lines.push("");
    }
  }

  return lines.join("\n");
}
