// frontend/script.js
const askBtn = document.getElementById('askBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const symptomsEl = document.getElementById('symptoms');
const resultEl = document.getElementById('result');
const historyEl = document.getElementById('history');

const API_URL = 'http://localhost:3000/api/ask';

// Завантаження історії
function loadHistory(){
  const h = JSON.parse(localStorage.getItem('hm_history') || '[]');
  historyEl.innerHTML = '';
  if(h.length === 0){
    historyEl.innerHTML = '<li class="small">Історія порожня</li>';
    return;
  }
  h.slice().reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${new Date(item.when).toLocaleString()}</strong><br>
      <em>${escapeHtml(item.symptoms)}</em><br>
      <div>${escapeHtml(item.advice)}</div>`;
    historyEl.appendChild(li);
  });
}

// Збереження в історію
function saveToHistory(symptoms, advice){
  const h = JSON.parse(localStorage.getItem('hm_history') || '[]');
  h.push({when: Date.now(), symptoms, advice});
  localStorage.setItem('hm_history', JSON.stringify(h));
  loadHistory(); // оновлюємо історію
}

// Функція безпечного виведення HTML
function escapeHtml(text){
  if(!text) return '';
  return text.replaceAll('&', '&amp;')
             .replaceAll('<','&lt;')
             .replaceAll('>','&gt;');
}

// Натискання кнопки "Отримати пораду"
askBtn.addEventListener('click', async () => {
  const symptoms = symptomsEl.value.trim();
  if(!symptoms){
    alert('Опиши симптоми, будь ласка.');
    return;
  }

  askBtn.disabled = true;
  askBtn.textContent = 'Думаю...';

  try{
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({symptoms})
    });

    if(!resp.ok){
      const err = await resp.json().catch(()=>({error:'невідома помилка'}));
      throw new Error(err.error || 'Помилка від сервера');
    }

    const data = await resp.json();

    // Показуємо результат
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `<strong>Порада від ШІ:</strong><div style="margin-top:8px;white-space:pre-wrap;">${escapeHtml(data.advice)}</div>`;

    // Зберігаємо в історію
    saveToHistory(symptoms, data.advice);

  }catch(err){
    console.error(err);
    alert('Щось пішло не так: ' + err.message);
  }finally{
    askBtn.disabled = false;
    askBtn.textContent = 'Отримати пораду';
  }
});

// Натискання кнопки "Очистити історію"
clearHistoryBtn.addEventListener('click', ()=>{
  if(confirm('Очистити історію?')) {
    localStorage.removeItem('hm_history');
    loadHistory();
  }
});

// Початкове завантаження історії
loadHistory();
