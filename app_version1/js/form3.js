/* результат + рекомендации + история */
import { sections } from "./questions.js";

document.addEventListener("DOMContentLoaded", () => {
  /* === 1. читаем результат, историю, lastResult === */
  const { total = 0, count = 0 } = JSON.parse(localStorage.getItem("result") || "{}");
  const missedIds = JSON.parse(localStorage.getItem("missed") || "[]");
  const company = localStorage.getItem("companyName") || "—";
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  const lastResult = JSON.parse(localStorage.getItem("lastResult") || "null");

  /* === 2. DOM‑элементы === */
  const companyEl = document.getElementById("companyName");
  const countEl = document.getElementById("count");
  const totalEl = document.getElementById("total");
  const resultEl = document.getElementById("resultText");
  const pctEl = document.getElementById("percentText");
  const circle = document.getElementById("circleFg");
  const adviceGrid = document.getElementById("adviceGrid");
  const listEl = document.getElementById("companyList");
  const adviceSection = document.getElementById("adviceSection");

  const circleLen = 2 * Math.PI * 54;

  function showResult({ name, total, count, missed }) {
    const pct = total ? ((count / total) * 100).toFixed(2) : "0.00";

    companyEl.textContent = name;
    countEl.textContent = count;
    totalEl.textContent = total;
    pctEl.textContent = `${pct}%`;
    circle.style.strokeDashoffset = circleLen * (1 - pct / 100);

    resultEl.textContent = pct >= 80
      ? `Успех! Соответствие ${pct}%`
      : `Неудача. Соответствие только ${pct}%`;

    resultEl.classList.remove("success", "fail");
    resultEl.classList.add(pct >= 80 ? "success" : "fail");

    // Скрытие блока рекомендаций при 100%
    if (pct === "100.00") {
      adviceSection.style.display = "none";
    } else {
      adviceSection.style.display = "";
    }

    renderAdvice(missed);
  }

  /* === 3. рекомендации === */
  function renderAdvice(missedArr) {
    adviceGrid.innerHTML = "";
    let global = 0;

    sections.forEach(sec => {
      const loc = [];

      sec.questions.forEach((q, idx) => {
        if (missedArr.includes(global)) {
          loc.push({ n: idx + 1, ...q });
        }
        global++;
      });

      if (loc.length) {
        const col = document.createElement("div");
        col.className = "advice-grid";
        col.innerHTML = `<h4>${sec.title}</h4>`;

        loc.forEach(it => {
          const card = document.createElement("div");
          card.className = "advice-card";
          card.innerHTML = `<span>Вопрос ${it.n}</span>`;
          card.onclick = () => openModal(it.text, it.advice);
          col.appendChild(card);
        });

        adviceGrid.appendChild(col);
      }
    });
  }

  /* выводим текущий */
  showResult({ name: company, total, count, missed: missedIds });

  /* === 4. история компаний === */
  function renderHistory() {
    listEl.innerHTML = "";

    if (history.length <= 1) {
      listEl.innerHTML = "<li>Список пуст</li>";
      return;
    }

    history.slice(0, -1).forEach(h => {
      const li = document.createElement("li");
      li.textContent = h.name;
      li.onclick = () => showResult(h);
      listEl.appendChild(li);
    });
  }

  renderHistory();

  /* === 5. кнопки истории === */
  document.getElementById("clearHistoryBtn").onclick = () => {
    localStorage.removeItem("history");
    history.length = 0;
    renderHistory();
  };

  document.getElementById("resetViewBtn").onclick = () => {
    if (lastResult) {
      showResult(lastResult);
    }
  };

  /* === 6. модальное окно === */
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");

  function openModal(t, a) {
    modalTitle.textContent = t;
    modalText.textContent = a;
    modal.classList.remove("hidden");
  }

  document.getElementById("modalClose").onclick = () => modal.classList.add("hidden");

  modal.onclick = e => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  };

  /* === 7. пройти заново === */
  document.getElementById("retryBtn").onclick = () => {
    location.href = "index.html";
  };
});