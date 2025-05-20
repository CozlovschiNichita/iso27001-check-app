/* результат + рекомендации + история (универсальная версия) */
import { sections } from "./questions.js";

document.addEventListener("DOMContentLoaded", () => {
  /* данные из localStorage */
  const { total = 0, count = 0 } = JSON.parse(localStorage.getItem("result")  || "{}");
  const missedArr  = JSON.parse(localStorage.getItem("missed")  || "[]");
  const history    = JSON.parse(localStorage.getItem("history") || "[]");
  const lastResult = JSON.parse(localStorage.getItem("lastResult") || "null");

  /* DOM-элементы */
  const company    = "OnlyFans";
  const companyEl  = document.getElementById("companyName");
  const countEl    = document.getElementById("count");
  const totalEl    = document.getElementById("total");
  const resultEl   = document.getElementById("resultText");
  const pctEl      = document.getElementById("percentText");
  const circle     = document.getElementById("circleFg");
  const adviceGrid = document.getElementById("adviceGrid");
  const listEl     = document.getElementById("companyList");
  const adviceSect = document.getElementById("adviceSection");

  const circleLen = 2 * Math.PI * 54;

  /* === 0. вспомогалка для TXT === */
function buildTxtReport({ total, count, missed }) {
  const pct   = total ? Math.round((count / total) * 100) : 0;
  let   text  = 'Отчёт по оценке соответствия ISO/IEC 27001\n\n';
  text += `Всего вопросов: ${total}\n`;
  text += `Да: ${count}  |  Нет / пусто: ${total - count}\n`;
  text += `Процент соответствия: ${pct}%\n\n`;

  /* если есть список missed в формате "A5-3" — выводим их */
  if (missed.length && typeof missed[0] === 'string') {
    text += 'Несоответствующие пункты:\n';
    missed.forEach(code => text += `  • ${code}\n`);
  }
  return text;
}

/* === 1. обработчик кнопки === */
document.getElementById('downloadTxtBtn').onclick = () => {
  const result = JSON.parse(localStorage.getItem('lastResult') ||
                            localStorage.getItem('result')     || '{}');

  const report = buildTxtReport(result);
  const blob   = new Blob([report], { type:'text/plain' });
  const link   = document.createElement('a');
  link.href    = URL.createObjectURL(blob);
  link.download = 'ISO27001_report.txt';
  link.click();
};

  /* ---------- показать результат ---------- */
  function showResult({ total, count, missed }) {
    const pct = total ? ((count / total) * 100).toFixed(2) : "0.00";

    companyEl.textContent = company;
    countEl.textContent   = count;
    totalEl.textContent   = total;
    pctEl.textContent     = `${pct}%`;
    circle.style.strokeDashoffset = circleLen * (1 - pct / 100);

    resultEl.textContent =
    pct >= 80 ? `Успех! Соответствие ${pct}%`
    : pct >= 50 ? `Частично. Соответствие ${pct}%`
    :             `Неудача. Соответствие только ${pct}%`;

    resultEl.classList.remove("success","partial","fail");
    resultEl.classList.add(
      pct >= 80 ? "success" :
      pct >= 50 ? "partial" : "fail"
    );
;

    adviceSect.style.display = pct === "100.00" ? "none" : "";
    renderAdvice(missed);
  }

  /* ---------- советы ---------- */
  function renderAdvice(missed) {
    adviceGrid.innerHTML = "";

    /* старый формат (числа) */
    if (missed.length && typeof missed[0] === "number") {
      let global = 0;
      sections.forEach(sec => {
        const loc = [];
        sec.questions.forEach((q, idx) => {
          if (missed.includes(global)) loc.push({ n: idx + 1, ...q });
          global++;
        });
        if (loc.length) addAdviceColumn(sec.title, loc);
      });
      return;
    }

    /* новый формат "A5-3" */
    const grouped = {};
    missed.forEach(str => {
      const [cat, idx] = str.split("-");
      (grouped[cat] ||= []).push(Number(idx));
    });

    Object.entries(grouped).forEach(([cat, idxArr]) => {
      Promise.all([
        fetch(`questions/${cat}.json`).then(r => r.json()),
        fetch(`advices/${cat}.json`).then(r => r.json())
      ]).then(([qs, ads]) => {
        const loc = idxArr.map(i => {
        const q = qs[i];
        const adv = ads.find(a => a.id === q.id);
        return { n: q.id, text: q.title, advice: adv?.advice || 'Нет совета.' };
      });
        addAdviceColumn(cat, loc);
      });
    });
  }

  function addAdviceColumn(title, items) {
    const col = document.createElement("div");
    col.className = "advice-grid";
    col.innerHTML = `<h4>${title}</h4>`;
    items.forEach(it => {
      const card = document.createElement("div");
      card.className = "advice-card";
      card.innerHTML = `<span>${it.n}</span>`;
      card.onclick = () => openModal(it.text, it.advice);
      col.appendChild(card);
    });
    adviceGrid.appendChild(col);
  }

/* ---------- История ---------- */
function renderHistory() {
  listEl.innerHTML = history.length ? "" : "<li>Список пуст</li>";

  history.slice().reverse().forEach(h => {
    const pct = h.total ? Math.round((h.count / h.total) * 100) : 0;
    const li  = document.createElement("li");

    li.textContent = `${h.time} — ${pct}% (${h.type})`;
    li.style.cursor = "pointer";          // всегда кликабельно
    li.onclick = () => showResult(h);     // просто отрисовываем результат локально

    listEl.appendChild(li);
  });
}

  /* ---------- модалка ---------- */
  const modal      = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText  = document.getElementById("modalText");
  function openModal(t, a) {
    modalTitle.textContent = t;
    modalText.textContent  = a;
    modal.classList.remove("hidden");
  }
  document.getElementById("modalClose").onclick = () => modal.classList.add("hidden");
  modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };

  /* ---------- кнопки ---------- */
  document.getElementById("clearHistoryBtn").onclick = () => {
    localStorage.removeItem("history");
    history.length = 0;
    renderHistory();
  };
  document.getElementById("resetViewBtn").onclick = () => lastResult && showResult(lastResult);
  document.getElementById("retryBtn").onclick     = () => location.href = "index.html";

  /* ---------- старт ---------- */
  showResult({ total, count, missed: missedArr });
  renderHistory();
});