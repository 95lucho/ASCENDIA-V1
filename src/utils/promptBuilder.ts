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

export function formatEvaluationAnswer(
  value: string | undefined,
  question: 1 | 2 | 3
): string {
  if (!value) return "Sin responder";
  if (value === "si") return "Sí";
  if (value === "parcial") return "Parcialmente";
  if (value === "no") return "No";

  if (question === 2) {
    if (value === "ninguno") return "Sin errores detectados (registro previo)";
    if (value === "menores") return "Imprecisiones menores (registro previo)";
    if (value === "graves") return "Alucinaciones / sesgos graves (registro previo)";
  }
  if (question === 3) {
    if (value === "adecuado") return "Adecuado al propósito (registro previo)";
    if (value === "ajustar") return "Requiere ajuste (registro previo)";
  }
  return value;
}

export function exportPortfolioMarkdown(
  state: LabStorageState,
  challenges: ChallengeDefinition[]
): string {
  const studentLabel = state.studentName.trim() || "Estudiante sin identificar";
  const lines: string[] = [
    "# Bitácora de Aprendizaje — ASCENDIA (UAGRM)",
    "",
    `- **Estudiante / Código:** ${studentLabel}`,
    `- **Fecha de exportación:** ${formatDateTimeEs(new Date().toISOString())}`,
    "",
    "---",
    "",
  ];

  for (const ch of challenges) {
    const progress = state.challenges[ch.id];
    const hasVersions = progress && progress.versions.length > 0;
    const hasActivityResult = Boolean(progress?.activityResult);
    const title =
      ch.esLibre && progress?.customMeta?.title
        ? `${ch.orderLabel}: ${progress.customMeta.title}`
        : `${ch.orderLabel}: ${ch.title}`;

    const status = progress?.completed
      ? "Completado"
      : hasVersions || hasActivityResult
      ? "En práctica"
      : "Pendiente";

    lines.push(`## ${title}`);
    lines.push(`- **Nivel:** ${ch.level}`);
    lines.push(`- **Estado:** ${status}`);
    lines.push("");

    if (progress?.activityResult) {
      lines.push("### Resultado de actividad evaluada");
      lines.push(
        `- **Fecha:** ${formatDateTimeEs(progress.activityResult.evaluatedAt)}`
      );
      lines.push(
        `- **Resultado obtenido:** ${progress.activityResult.resultLabel}`
      );
      lines.push(
        `- **Competencia desarrollada:** ${progress.activityResult.competence}`
      );
      lines.push(
        `- **Retroalimentación:** ${progress.activityResult.feedbackSummary}`
      );
      lines.push("");
    }

    if (!hasVersions && !hasActivityResult) {
      lines.push("_Sin pruebas registradas en la bitácora._");
      lines.push("");
      continue;
    }

    if (!hasVersions) {
      continue;
    }

    for (const ver of progress.versions) {
      const promptToShow = ver.executedPrompt?.trim() || ver.assembledPrompt;
      const providerLabel = [ver.aiProvider?.trim(), ver.aiModel?.trim()]
        .filter(Boolean)
        .join(" · ");

      lines.push(`### Prueba ${ver.versionNumber} (${formatDateTimeEs(ver.createdAt)})`);
      lines.push(
        `- **Sistema / IA:** ${
          providerLabel ||
          (ver.sourceMode === "live_gemini" ? "Prueba directa" : "Prueba externa")
        }`
      );
      lines.push("- **Instrucción utilizada:**");
      lines.push("```text");
      lines.push(promptToShow || "(Vacío)");
      lines.push("```");
      lines.push("- **Respuesta obtenida de la IA:**");
      lines.push(
        `> ${(ver.aiResponse || "(Sin respuesta registrada)").replace(/\n/g, "\n> ")}`
      );
      lines.push("- **Evaluación del resultado:**");
      lines.push(
        `  - ¿La IA respondió lo que le pediste?: ${formatEvaluationAnswer(
          ver.evaluation.cumplioRestricciones,
          1
        )}`
      );
      lines.push(
        `  - ¿La respuesta fue clara y fácil de entender?: ${formatEvaluationAnswer(
          ver.evaluation.alucinacionesOSesgos,
          2
        )}`
      );
      lines.push(
        `  - ¿La respuesta incluyó lo que necesitabas?: ${formatEvaluationAnswer(
          ver.evaluation.nivelYFormatoAdecuados,
          3
        )}`
      );
      if (ver.evaluation.cambiosInstruccion?.trim()) {
        lines.push(
          `- **¿Qué cambiarías en tu instrucción?:** ${ver.evaluation.cambiosInstruccion.trim()}`
        );
      }
      if (ver.evaluation.notasReflexion?.trim()) {
        lines.push(
          `- **¿Qué aprendiste de esta prueba?:** ${ver.evaluation.notasReflexion.trim()}`
        );
      }
      if (ver.evaluation.aspectosPositivos?.trim()) {
        lines.push(
          `- **Aspectos positivos (registro previo):** ${ver.evaluation.aspectosPositivos.trim()}`
        );
      }
      if (ver.evaluation.erroresOLimitaciones?.trim()) {
        lines.push(
          `- **Errores o limitaciones (registro previo):** ${ver.evaluation.erroresOLimitaciones.trim()}`
        );
      }
      if (ver.evaluation.informacionAVerificar?.trim()) {
        lines.push(
          `- **Información a verificar (registro previo):** ${ver.evaluation.informacionAVerificar.trim()}`
        );
      }
      if (ver.evaluation.justificacionModificaciones?.trim()) {
        lines.push(
          `- **Justificación de cambios (registro previo):** ${ver.evaluation.justificacionModificaciones.trim()}`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
