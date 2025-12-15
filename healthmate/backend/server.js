import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY не заданий");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  ""
});


const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));;

function isMedical(text = "") {
  const keywords = [
    "бол", "температур", "кашель", "нежить", "горло",
    "симптом", "лікар", "ліки", "таблет",
    "тиск", "серце", "живіт", "нудот",
    "голов", "запамороч",
    "грип", "covid", "вірус", "інфекц",
    "алергі", "висип", "шкіра", "рана"
  ];
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

app.post("/api/ask", async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms  typeof symptoms !== "string") {
      return res.status(400).json({ error: "Вкажи симптоми" });
    }

    if (!isMedical(symptoms)) {
      return res.json({
        advice: "Вибач, я можу відповідати лише на медичні питання."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY не налаштований" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Ти медичний AI-помічник.

- давай практичні медичні поради
- пояснюй просто і спокійно
- не став остаточних діагнозів
- не призначай рецептурні препарати

Якщо симптоми серйозні — порадь звернутися до лікаря.
`
        },
        {
          role: "user",
          content: `Симптоми: ${symptoms}`
        }
      ]
    });

    const advice =
      completion.choices?.[0]?.message?.content 
      "Вибач, я можу відповідати лише на медичні питання.";

    const histPath = path.join(__dirname, "history.json");
    const hist = fs.existsSync(histPath)
      ? JSON.parse(fs.readFileSync(histPath, "utf8"))
      : [];

    hist.push({
      when: new Date().toISOString(),
      symptoms,
      advice
    });

    fs.writeFileSync(histPath, JSON.stringify(hist, null, 2));

    res.json({ advice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Серверна помилка" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(🚀 Backend працює на порту ${port});
});
