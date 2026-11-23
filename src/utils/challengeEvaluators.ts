import {
  CHALLENGE_1_DATA,
  CHALLENGE_2_DATA,
  CHALLENGE_3_DATA,
  CHALLENGE_4_DATA,
  CHALLENGE_5_DATA,
  CHALLENGE_6_DATA,
  ErrorCategoryId,
  PromptPartCategory,
  ResponseAuditCategory,
} from "../data/structuredChallenges";
import { ChallengeActivityResult } from "../types/lab";

export interface ItemFeedback {
  id: string;
  correct: boolean;
  message: string;
}

export interface ChallengeEvaluationOutcome {
  result: ChallengeActivityResult;
  itemFeedback: ItemFeedback[];
  extraDetails?: Record<string, unknown>;
}

export function evaluateChallenge1(
  assignments: Record<string, PromptPartCategory | "">
): ChallengeEvaluationOutcome {
  const itemFeedback: ItemFeedback[] = CHALLENGE_1_DATA.fragments.map((frag) => {
    const selected = assignments[frag.id];
    const correct = selected === frag.correctCategory;
    return {
      id: frag.id,
      correct,
      message: correct
        ? `Correcto: ${frag.explanation}`
        : `Revisa este fragmento: corresponde a la categoría correspondiente porque ${frag.explanation.charAt(0).toLowerCase()}${frag.explanation.slice(1)}`,
    };
  });

  const score = itemFeedback.filter((f) => f.correct).length;
  const maxScore = CHALLENGE_1_DATA.fragments.length;
  const approved = score >= 3;

  const saoMessage = approved
    ? score === maxScore
      ? "¡Excelente reconocimiento! Identificaste con total precisión los 4 componentes de la instrucción."
      : `¡Buen trabajo! Acertaste ${score} de ${maxScore} asociaciones y comprendiste la estructura base de una instrucción.`
    : `Obtuviste ${score} de ${maxScore} aciertos (se requieren al menos 3). Revisa la diferencia entre propósito (para qué se pide) y contexto (quién y en qué situación), e inténtalo nuevamente.`;

  return {
    result: {
      approved,
      score,
      maxScore,
      resultLabel: `${score} de ${maxScore} asociaciones correctas`,
      competence:
        "Reconocimiento de propósito, contexto, tarea y formato en una instrucción.",
      saoMessage,
      feedbackSummary: approved
        ? `Aprobado con ${score}/${maxScore} asociaciones correctas.`
        : `Requiere mejora (${score}/${maxScore}). Mínimo para aprobar: 3/4.`,
      evaluatedAt: new Date().toISOString(),
    },
    itemFeedback,
  };
}

export function evaluateChallenge2(
  selectedOptionId: "A" | "B" | "C" | "",
  selectedCriteriaIds: string[]
): ChallengeEvaluationOutcome {
  const optionObj = CHALLENGE_2_DATA.options.find(
    (o) => o.id === selectedOptionId
  );
  const optionCorrect = Boolean(optionObj?.isEffective);

  const selectedSet = new Set(selectedCriteriaIds);
  const validSelected = CHALLENGE_2_DATA.criteria.filter(
    (c) => c.isValid && selectedSet.has(c.id)
  );
  const invalidSelected = CHALLENGE_2_DATA.criteria.filter(
    (c) => !c.isValid && selectedSet.has(c.id)
  );

  const criteriaSufficient =
    validSelected.length >= 3 && invalidSelected.length === 0;
  const approved = optionCorrect && criteriaSufficient;

  const totalPoints =
    (optionCorrect ? 1 : 0) +
    Math.min(4, Math.max(0, validSelected.length - invalidSelected.length));
  const maxScore = 5; // 1 selección + 4 criterios válidos

  const itemFeedback: ItemFeedback[] = [
    {
      id: "option-selection",
      correct: optionCorrect,
      message: optionObj
        ? optionObj.feedback
        : "Debes seleccionar una de las tres instrucciones.",
    },
    ...CHALLENGE_2_DATA.criteria
      .filter((c) => selectedSet.has(c.id) || (c.isValid && !criteriaSufficient))
      .map((c) => {
        const wasSelected = selectedSet.has(c.id);
        const correct = c.isValid ? wasSelected : !wasSelected;
        return {
          id: c.id,
          correct,
          message: c.isValid
            ? wasSelected
              ? `Criterio válido: ${c.explanation}`
              : `Criterio omitido (${c.label}): ${c.explanation}`
            : `No corresponde (${c.label}): ${c.explanation}`,
        };
      }),
  ];

  let saoMessage = "";
  if (approved) {
    saoMessage =
      validSelected.length === 4
        ? "¡Excelente discriminación! Elegiste la instrucción más efectiva y justificaste los 4 criterios clave."
        : `¡Muy bien! Identificaste la instrucción efectiva y la justificaste con ${validSelected.length} criterios clave.`;
  } else if (!optionCorrect) {
    saoMessage =
      "La instrucción elegida aún es incompleta para el caso. Compara cuál integra propósito diagnóstico, contexto de primer año, tiempo y formato.";
  } else if (invalidSelected.length > 0) {
    saoMessage =
      "Elegiste la instrucción adecuada, pero incluiste criterios que no favorecen la claridad ni la viabilidad. Revisa tus justificaciones y vuelve a intentarlo.";
  } else {
    saoMessage = `Elegiste la instrucción correcta, pero seleccionaste ${validSelected.length} de 4 criterios válidos (se requieren al menos 3). Revisa qué otros elementos la hacen efectiva.`;
  }

  return {
    result: {
      approved,
      score: totalPoints,
      maxScore,
      resultLabel: optionCorrect
        ? `Instrucción correcta y ${validSelected.length}/4 criterios válidos${
            invalidSelected.length > 0
              ? ` (${invalidSelected.length} incompatible)`
              : ""
          }`
        : `Instrucción por mejorar (${validSelected.length}/4 criterios válidos)`,
      competence:
        "Discriminación de instrucciones efectivas y justificación mediante criterios estructurales.",
      saoMessage,
      feedbackSummary: approved
        ? `Instrucción efectiva seleccionada y justificada (${validSelected.length}/4 criterios válidos).`
        : "Necesita ajustar la selección de instrucción o los criterios que la justifican.",
      evaluatedAt: new Date().toISOString(),
    },
    itemFeedback,
  };
}

export function evaluateChallenge3(
  selectedCategories: Record<string, ErrorCategoryId | "">
): ChallengeEvaluationOutcome {
  const itemFeedback: ItemFeedback[] = CHALLENGE_3_DATA.items.map((item) => {
    const selected = selectedCategories[item.id];
    const correct = selected === item.correctCategory;
    return {
      id: item.id,
      correct,
      message: `${
        correct ? "Diagnóstico correcto." : "Revisa el problema principal."
      } ${item.whyItMatters} Cómo corregir: ${item.howToFix}`,
    };
  });

  const score = itemFeedback.filter((f) => f.correct).length;
  const maxScore = CHALLENGE_3_DATA.items.length;
  const approved = score >= 3;

  const saoMessage = approved
    ? score === maxScore
      ? "¡Diagnóstico impecable! Detectaste los 4 tipos de fallos estructurales y comprendes cómo afectan la respuesta."
      : `¡Buen análisis! Diagnosticaste correctamente ${score} de ${maxScore} instrucciones.`
    : `Diagnosticaste ${score} de ${maxScore} instrucciones (mínimo requerido: 3). Observa con atención si falta el escenario (contexto), la acción precisa (tarea), los límites (restricciones) o la estructura de salida (formato).`;

  return {
    result: {
      approved,
      score,
      maxScore,
      resultLabel: `${score} de ${maxScore} diagnósticos correctos`,
      competence:
        "Diagnóstico de errores en instrucciones para IA y comprensión de su corrección.",
      saoMessage,
      feedbackSummary: approved
        ? `Aprobado con ${score}/${maxScore} diagnósticos correctos.`
        : `Requiere mejora (${score}/${maxScore}). Mínimo para aprobar: 3/4.`,
      evaluatedAt: new Date().toISOString(),
    },
    itemFeedback,
  };
}

export function evaluateChallenge4(
  selectedClassifications: Record<string, ResponseAuditCategory | "">
): ChallengeEvaluationOutcome {
  const itemFeedback: ItemFeedback[] = CHALLENGE_4_DATA.criteriaItems.map(
    (item) => {
      const selected = selectedClassifications[item.id];
      const correct = selected === item.correctCategory;
      return {
        id: item.id,
        correct,
        message: `${correct ? "Análisis correcto:" : "Observa este aspecto:"} ${
          item.explanation
        }`,
      };
    }
  );

  const score = itemFeedback.filter((f) => f.correct).length;
  const maxScore = CHALLENGE_4_DATA.criteriaItems.length;
  const approved = score >= 3;

  const saoMessage = approved
    ? score === maxScore
      ? "¡Excelente contraste crítico! Identificaste con precisión lo cumplido, lo omitido, lo ajeno al pedido y lo que debe verificarse."
      : `¡Buen trabajo de contraste! Evaluaste correctamente ${score} de ${maxScore} criterios entre la instrucción y la respuesta.`
    : `Acertaste ${score} de ${maxScore} criterios (se requieren al menos 3). Contrasta línea por línea lo que pidió la instrucción frente a lo que entregó la IA.`;

  return {
    result: {
      approved,
      score,
      maxScore,
      resultLabel: `${score} de ${maxScore} criterios de análisis correctos`,
      competence:
        "Evaluación crítica de correspondencia, omisiones y necesidades de verificación en respuestas de IA.",
      saoMessage,
      feedbackSummary: approved
        ? `Aprobado con ${score}/${maxScore} criterios correctos.`
        : `Requiere mejora (${score}/${maxScore}). Mínimo para aprobar: 3/4.`,
      evaluatedAt: new Date().toISOString(),
    },
    itemFeedback,
  };
}

export function evaluateChallenge5(
  selectedAlternativeId: "A" | "B" | "C" | "",
  selectedJustificationIds: string[]
): ChallengeEvaluationOutcome {
  const altObj = CHALLENGE_5_DATA.alternatives.find(
    (a) => a.id === selectedAlternativeId
  );
  const altCorrect = Boolean(altObj?.isAppropriate);

  const selectedSet = new Set(selectedJustificationIds);
  const validSelected = CHALLENGE_5_DATA.justifications.filter(
    (j) => j.isValid && selectedSet.has(j.id)
  );
  const invalidSelected = CHALLENGE_5_DATA.justifications.filter(
    (j) => !j.isValid && selectedSet.has(j.id)
  );

  const justificationsOk =
    validSelected.length >= 3 && invalidSelected.length === 0;
  const approved = altCorrect && justificationsOk;
  const score =
    (altCorrect ? 1 : 0) +
    Math.min(4, Math.max(0, validSelected.length - invalidSelected.length));
  const maxScore = 5;

  const itemFeedback: ItemFeedback[] = [
    {
      id: "alt-choice",
      correct: altCorrect,
      message: altObj
        ? altObj.feedback
        : "Selecciona una de las tres alternativas.",
    },
    ...CHALLENGE_5_DATA.justifications
      .filter((j) => selectedSet.has(j.id) || (j.isValid && !justificationsOk))
      .map((j) => {
        const wasSelected = selectedSet.has(j.id);
        const correct = j.isValid ? wasSelected : !wasSelected;
        return {
          id: j.id,
          correct,
          message: j.isValid
            ? wasSelected
              ? `Dimensión bien justificada (${j.dimension}): ${j.explanation}`
              : `Dimensión faltante (${j.dimension}): ${j.explanation}`
            : `No aplica al caso: ${j.explanation}`,
        };
      }),
  ];

  let saoMessage = "";
  if (approved) {
    saoMessage =
      validSelected.length === 4
        ? "¡Decisión pedagógica sobresaliente! Elegiste la alternativa viable y justificaste las 4 dimensiones del caso."
        : `¡Buena resolución! Elegiste la propuesta coherente con el caso y justificaste ${validSelected.length} dimensiones clave.`;
  } else if (!altCorrect) {
    saoMessage =
      "La alternativa seleccionada no cumple todas las condiciones del caso (30 estudiantes, 40 min, materiales sencillos, participación y comprobación). Revisa las necesidades del aula.";
  } else if (invalidSelected.length > 0) {
    saoMessage =
      "Elegiste la alternativa adecuada, pero marcaste justificaciones incompatibles con los recursos o la evaluación formativa del caso.";
  } else {
    saoMessage = `Elegiste la alternativa correcta, pero solo justificaste ${validSelected.length} dimensiones válidas (debes justificar al menos 3 entre pertinencia, viabilidad, tiempo y comprobación).`;
  }

  return {
    result: {
      approved,
      score,
      maxScore,
      resultLabel: altCorrect
        ? `Alternativa coherente y ${validSelected.length}/4 dimensiones justificadas`
        : `Alternativa por revisar (${validSelected.length}/4 dimensiones)`,
      competence:
        "Aplicación de criterios de pertinencia pedagógica, viabilidad, tiempo y evaluación para decidir sobre propuestas de IA.",
      saoMessage,
      feedbackSummary: approved
        ? `Caso resuelto con alternativa coherente y ${validSelected.length}/4 dimensiones justificadas.`
        : "Necesita ajustar la alternativa elegida o ampliar la justificación por dimensiones.",
      evaluatedAt: new Date().toISOString(),
    },
    itemFeedback,
  };
}

export function evaluateChallenge6(
  criteriaAnswers: Record<string, "si" | "no" | "">,
  selectedProblemId: string,
  selectedImprovementId: string
): ChallengeEvaluationOutcome {
  const questionFeedback: ItemFeedback[] = CHALLENGE_6_DATA.auditQuestions.map(
    (q) => {
      const ans = criteriaAnswers[q.id];
      const correct = ans === q.correctAnswer;
      return {
        id: q.id,
        correct,
        message: q.explanation,
      };
    }
  );

  const criteriaScore = questionFeedback.filter((f) => f.correct).length;

  const probObj = CHALLENGE_6_DATA.mainProblems.find(
    (p) => p.id === selectedProblemId
  );
  const probCorrect = Boolean(probObj?.isCorrect);

  const impObj = CHALLENGE_6_DATA.improvements.find(
    (i) => i.id === selectedImprovementId
  );
  const impCorrect = Boolean(impObj?.isCorrect);

  const itemFeedback: ItemFeedback[] = [
    ...questionFeedback,
    {
      id: "main-problem",
      correct: probCorrect,
      message: probObj
        ? probObj.explanation
        : "Selecciona cuál fue el principal problema del expediente.",
    },
    {
      id: "coherent-improvement",
      correct: impCorrect,
      message: impObj
        ? impObj.explanation
        : "Selecciona una mejora coherente para corregir la experiencia.",
    },
  ];

  const approved = criteriaScore >= 5 && probCorrect && impCorrect;
  const score = criteriaScore + (probCorrect ? 1 : 0) + (impCorrect ? 1 : 0);
  const maxScore = 8; // 6 criterios + problema principal + mejora coherente

  let saoMessage = "";
  if (approved) {
    saoMessage =
      criteriaScore === 6
        ? "¡Auditoría integral excelente! Evaluaste con precisión los 6 criterios, detectaste la causa raíz y propusiste una mejora coherente."
        : `¡Auditoría aprobada! Resolviste ${criteriaScore} de 6 criterios, identificaste el problema principal y seleccionaste una mejora coherente.`;
  } else if (criteriaScore < 5) {
    saoMessage = `Obtuviste ${criteriaScore} de 6 criterios correctos (se requieren al menos 5), además de identificar el problema principal y la mejora coherente. Revisa el expediente e inténtalo de nuevo.`;
  } else {
    saoMessage =
      "Tu evaluación de los 6 criterios es sólida, pero el problema principal o la mejora seleccionada no son coherentes con las fallas del caso. Ajusta tu propuesta para completar la auditoría.";
  }

  return {
    result: {
      approved,
      score,
      maxScore,
      resultLabel: `${criteriaScore}/6 criterios · ${
        probCorrect && impCorrect
          ? "problema y mejora coherentes"
          : "mejora por alinear"
      }`,
      competence:
        "Auditoría integral de experiencias con IA y formulación de mejoras metodológicas coherentes.",
      saoMessage,
      feedbackSummary: approved
        ? `Auditoría aprobada (${criteriaScore}/6 criterios, diagnóstico y mejora coherentes).`
        : `Auditoría por reforzar (${criteriaScore}/6 criterios).`,
      evaluatedAt: new Date().toISOString(),
    },
    itemFeedback,
    extraDetails: {
      criteriaScore,
      probCorrect,
      impCorrect,
      selectedProblemLabel: probObj?.label ?? "",
      selectedImprovementLabel: impObj?.label ?? "",
    },
  };
}
