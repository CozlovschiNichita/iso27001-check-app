/*Расчёт результата и показ прогресса*/

import { sections } from "./questions.js";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. Считываем данные из localStorage ---------- */
  const { total = 0, count = 0 } = JSON.parse(localStorage.getItem("result") || "{}");
  const percent                   = total ? ((count / total) * 100).toFixed(2) : "0.00";
  const missedIds                 = JSON.parse(localStorage.getItem("missed") || "[]");
  const company                   = localStorage.getItem("companyName") || "—";

  /* ---------- 2. Выводим основные цифры ---------- */
  document.getElementById("companyName").textContent = company;
  document.getElementById("count").textContent       = count;
  document.getElementById("total").textContent       = total;

  const resultTxt = percent >= 80
    ? `Успех! Соответствие ${percent}%`
    : `Неудача. Соответствие только ${percent}%`;
  document.getElementById("resultText").textContent = resultTxt;

  /* ---------- 3. Круговой индикатор ---------- */
  const circle      = document.getElementById("circleFg");
  const percentText = document.getElementById("percentText");

  const fullLen = 2 * Math.PI * 54;                 // длина окружности (r = 54)
  const offset  = fullLen * (1 - percent / 100);    // сколько «скрыть»

  requestAnimationFrame(() => {
    circle.style.strokeDashoffset = offset;
    percentText.textContent = `${percent}%`;
  });

  /* ---------- 4. Рекомендации ---------- */
const adviceGrid = document.getElementById("adviceGrid");
if (missedIds.length === 0) {
  adviceGrid.innerHTML = "<p>🎉 Все пункты выполнены. Рекомендаций нет!</p>";
} else {
  let global = 0; 	// сквозной индекс 0‑37

  sections.forEach(sec => {
		// собираем «локальные» пропуски этого раздела
    const localMissed = [];

    sec.questions.forEach((q, idx) => {
      if (missedIds.includes(global)) {
        localMissed.push({ num: idx + 1, text: q.text, advice: q.advice });
      }
      global++; 	// двигаем сквозной индекс
    });

    if (localMissed.length > 0) {
      const column = document.createElement("div");
      column.className = "advice-column";

      const title = document.createElement("h4");
      title.textContent = sec.title;
      column.appendChild(title);

      localMissed.forEach(item => {
        const card = document.createElement("div");
        card.className = "advice-card";
        card.innerHTML = `<span>Вопрос ${item.num}</span>`;
        card.onclick = () => openModal(item.text, item.advice);
        column.appendChild(card);
      });

      adviceGrid.appendChild(column);
    }
  });
}

  /* ---------- 5. Модальное окно ---------- */
  const modal       = document.getElementById("modal");
  const modalTitle  = document.getElementById("modalTitle");
  const modalText   = document.getElementById("modalText");
  const modalClose  = document.getElementById("modalClose");

  function openModal(title, txt) {
    modalTitle.textContent = title;
    modalText.textContent  = txt;
    modal.classList.remove("hidden");
  }
  function closeModal() {
    modal.classList.add("hidden");
  }
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  /* ---------- 6. Кнопка «Пройти заново» ---------- */
  document.getElementById("retryBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});