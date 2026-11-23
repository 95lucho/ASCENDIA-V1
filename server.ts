import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function hasConfiguredGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== "MY_GEMINI_API_KEY");
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    const geminiAvailable = hasConfiguredGeminiKey();
    res.json({
      ok: true,
      geminiAvailable,
      provider: geminiAvailable ? "Google Gemini" : undefined,
      model: geminiAvailable ? "gemini-4-hydrogen" : undefined,
    });
  });

  app.post("/api/gemini/test-prompt", async (req, res) => {
    const { prompt } = req.body as { prompt?: unknown };

    if (typeof prompt !== "string" || prompt.trim().length < 5) {
      res.status(400).json({
        error: "El prompt ensamblado debe contener al menos 5 caracteres para ejecutarse.",
      });
      return;
    }

    if (!hasConfiguredGeminiKey()) {
      res.status(503).json({
        error:
          "La clave de Gemini no está configurada en este entorno. Puedes copiar el prompt, probarlo en una IA externa y pegar la respuesta manualmente.",
        code: "API_UNAVAILABLE",
      });
      return;
    }

    try {
      const ai = getGeminiClient();
      const candidateModels = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
      let outputText = "";
      let usedModel = candidateModels[0];
      let lastError: unknown = null;

      for (const candidateModel of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: candidateModel,
            contents: prompt.trim(),
          });
          const text = response.text?.trim() ?? "";
          if (text) {
            outputText = text;
            usedModel = candidateModel;
            lastError = null;
            break;
          }
        } catch (err: unknown) {
          lastError = err;
          const msg = err instanceof Error ? err.message : String(err);
          const isTransientUnavailable =
            msg.includes("503") ||
            msg.toUpperCase().includes("UNAVAILABLE") ||
            msg.toLowerCase().includes("high demand");
          if (!isTransientUnavailable) {
            throw err;
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

      if (!outputText) {
        res.status(502).json({
          error:
            "El modelo devolvió una respuesta vacía. Intenta precisar mejor la tarea o utiliza la Modalidad B (Prueba externa).",
        });
        return;
      }

      res.json({
        text: outputText,
        provider: "Google Gemini",
        model: usedModel,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const lower = message.toLowerCase();

      if (lower.includes("429") || lower.includes("resource_exhausted") || lower.includes("quota")) {
        res.status(429).json({
          error:
            "Se alcanzó el límite temporal de cuota de la API. Puedes continuar inmediatamente pegando la respuesta desde otra IA en el cuadro inferior.",
          code: "QUOTA_EXHAUSTED",
        });
        return;
      }

      if (lower.includes("403") || lower.includes("400") || lower.includes("api_key")) {
        res.status(400).json({
          error:
            "La clave de API configurada en Settings > Secrets no es válida o no tiene permisos. Usa el modo manual pegando una respuesta externa.",
          code: "API_KEY_ERROR",
        });
        return;
      }

      res.status(500).json({
        error: `No fue posible obtener respuesta en vivo (${message}). Puedes continuar en modo manual pegando la salida abajo.`,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ASCENDIA escuchando en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
