const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const userInput = document.getElementById("userInput");
const history = document.getElementById("history");
const settingsBtn = document.getElementById("settingsBtn");
const aboutBtn = document.getElementById("aboutBtn");
const chatContainer = document.getElementById("chatContainer");
const tempAiDiv = document.getElementById("aiTempDiv");


let userName = "Ти";
let font = "Segoe UI";


function addMessage(text, sender = "AI") {
  const li = document.createElement("li");
  li.textContent = `${sender}: ${text}`;;
  li.style.fontFamily = font;
  history.appendChild(li);
  li.scrollIntoView({ behavior: "smooth" });
}


function typeText(element, text, callback) {
  element.textContent = "";
  let i = 0;
  function typeChar() {
    element.textContent += text[i];
    i++;
    if (i < text.length) {
      setTimeout(typeChar, 25); 
    } else if (callback) {
      callback();
    }
  }
  typeChar();
}


sendBtn.addEventListener("click", async () => {
  const symptoms = userInput.value.trim();
  if (!symptoms) return;

  
  addMessage(symptoms, userName);
  userInput.value = "";

  
  tempAiDiv.style.fontFamily = font;
  tempAiDiv.style.padding = "10px";
  tempAiDiv.style.borderRadius = "12px";
  tempAiDiv.style.background = "rgba(124, 156, 255, 0.1)";
  tempAiDiv.style.margin = "10px 0";
  tempAiDiv.style.opacity = 0.9;

  tempAiDiv.textContent = "AI пише...";

  try {
    const res = await fetch("http://localhost:3000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });

    const data = await res.json();
    let advice = data.error ? `Помилка: ${data.error}` : data.advice;
    advice = advice.replace(/\*\*/g, ""); 

    typeText(tempAiDiv, advice, () => {
      addMessage(advice, "AI"); 
    });

  } catch (err) {
    console.error(err);
    typeText(tempAiDiv, "Сталася помилка при підключенні до сервера.", () => {
      addMessage("Сталася помилка при підключенні до сервера.", "AI");
    });
  }
});


clearBtn.addEventListener("click", () => userInput.value = "");


copyBtn.addEventListener("click", () => {
  const text = Array.from(history.children).map(li => li.textContent).join("\n");
  navigator.clipboard.writeText(text);
  alert("Історія скопійована!");
});


settingsBtn.addEventListener("click", () => {
  const newName = prompt("Введи своє ім'я:", userName);
  if (newName) userName = newName;

  const newFont = prompt("Введи шрифт (наприклад, Arial, Verdana, 'Segoe UI'):", font);
  if (newFont) {
    font = newFont;
    Array.from(history.children).forEach(li => li.style.fontFamily = font);
    tempAiDiv.style.fontFamily = font;
  }

  alert(`Ім'я змінено на "${userName}", шрифт на "${font}"`);
});


aboutBtn.addEventListener("click", () => {
  alert(
    "HealthMate AI 2025\n\n" +
    "Цей додаток — твій персональний AI-помічник для базових порад зі здоров’я.\n\n" +
    "Функції додатка:\n" +
    "- Введи симптоми та отримай рекомендації від AI.\n" +
    "- Зберігай історію повідомлень.\n" +
    "- Копіюй історію в буфер обміну.\n" +
    "- Налаштовуй своє ім’я та шрифт для комфортного використання.\n" +
    "- Дружній та сучасний інтерфейс із градієнтами та анімаціями.\n\n" +
    "Розробник: Володимир Жехович"
  );
});



























