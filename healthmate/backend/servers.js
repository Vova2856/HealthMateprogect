// backend/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Не знайдено OPENAI_API_KEY у .env");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.post("/api/ask", async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ error: "Вкажи симптоми" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Ти медичний помічник." },
        { role: "user", content: `Симптоми: ${symptoms}` }
      ]
    });

    const advice = completion.choices?.[0]?.message?.content || "Помилка AI";

    const histPath = path.join(__dirname, "history.json");
    let hist = fs.existsSync(histPath)
      ? JSON.parse(fs.readFileSync(histPath, "utf8"))
      : [];

    hist.push({ when: new Date().toISOString(), symptoms, advice });

    fs.writeFileSync(histPath, JSON.stringify(hist, null, 2));

    res.json({ advice });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Серверна помилка" });
  }
});

app.listen(port, () =>
  console.log(`🚀 Backend працює: http://localhost:${port}`)
);
