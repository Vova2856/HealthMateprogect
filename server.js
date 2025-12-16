import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename); 
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) console.error("❌ OPENAI_API_KEY не заданий!");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const frontendPath = path.join(dirname, "../frontend"); 
app.use(express.static(frontendPath));

function isMedical(text = "") {
  const keywords = [
    "бол", "температур", "кашель", "нежить", "горло", "симптом", "лікар", "ліки", "таблет",
    "тиск", "серце", "живіт", "нудот", "голов", "запамороч", "грип", "covid", "вірус",
    "інфекц", "алергі", "висип", "шкіра", "рана"
  ];
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

app.post("/api/ask", async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== "string")
      return res.status(400).json({ error: "Вкажи симптоми" });
    if (!isMedical(symptoms))
      return res.json({ advice: "Вибач, я можу відповідати лише на медичні питання." });

    const completion = await openai.chat.completions.create({
      model: "gpt-4", 
      messages: [
        { role: "system", content: "Ти HealthMate — AI для базових порад зі здоров'я. Давай 3–6 базових порад, проста мова, не став діагнозів, не рекомендуй ліки, не складні терміни, завжди додавай пораду звернутися до лікаря. Дозволено: відпочинок, вода, сон, свіже повітря, зменшення навантаження, комфортне положення тіла, спокійна обстановка. Заборонено: назви хвороб, діагнози, лікування, дозування." },
        { role: "assistant", content: "Я завжди готовий надати базові поради, але не ставлю діагнози і не рекомендую ліки." },
        { role: "user", content: `Симптоми: ${symptoms}` }
      ]
    });

    const advice = completion.choices?.[0]?.message?.content || "Вибач, я можу відповідати лише на медичні питання.";

    const histPath = path.join(dirname, "history.json"); 
    let hist = [];
    try { 
      if (fs.existsSync(histPath)) hist = JSON.parse(fs.readFileSync(histPath,"utf8")); 
    } catch(e){ console.error(e); }
    
    hist.push({ when: new Date().toISOString(), symptoms, advice });
    
    try { 
      fs.writeFileSync(histPath, JSON.stringify(hist, null, 2)); 
    } catch(e){ console.error(e); }

    res.json({ advice });
  } catch(err) {
    console.error("❌ Помилка сервера:", err);
    res.status(500).json({ error: "Серверна помилка" });
  }
});

app.get("*", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));

app.listen(port, "0.0.0.0", () => console.log(`🚀 Backend працює на порту ${port}`)); // Corrected template string
