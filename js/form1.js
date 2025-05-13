/* Рендер чекбоксов и сбор ответов */

import { sections } from "./questions.js";

const tabs      = document.getElementById("tabs");
const form      = document.getElementById("questionForm");
const info      = document.getElementById("progressInfo");
const finishBtn = document.getElementById("finishBtn");

let active = 0;                     // текущая вкладка
const checkedSet = new Set();       // здесь помним всё «Да»

const renderTabs = () => {
  tabs.innerHTML = "";
  sections.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.textContent = s.title;
    btn.className   = "tab" + (i === active ? " active" : "");
    btn.addEventListener("click", () => {
      active = i;
      renderTabs();
      renderQuestions();
      updateProgress();
    });
    tabs.appendChild(btn);
  });
};

const renderQuestions = () => {
  form.innerHTML = "";

  const offset = sections
    .slice(0, active)
    .reduce((sum, s) => sum + s.questions.length, 0);

  sections[active].questions.forEach((q, idx) => {
    const globalIdx = offset + idx;         // 0‑37
    const div   = document.createElement("div");
    div.className = "question-item";

    // создаём label + checkbox
    const label = document.createElement("label");
    label.innerHTML = `${q.text}
      <input type="checkbox" id="q${globalIdx}" data-id="${globalIdx}" />`;

    const input = label.querySelector("input");
    // если этот id был сохранён — ставим галочку
    input.checked = checkedSet.has(input.id);

    // при изменении → обновляем Set + прогресс
    input.addEventListener("change", (e) => {
      e.target.checked
        ? checkedSet.add(e.target.id)
        : checkedSet.delete(e.target.id);
      updateProgress();
    });

    div.appendChild(label);
    form.appendChild(div);
  });
};

const updateProgress = () => {
  const total   = sections.flatMap(s => s.questions).length;
  const checked = checkedSet.size;
  info.textContent = `Отмечено «Да»: ${checked} / ${total}`;
};

renderTabs();
renderQuestions();
updateProgress();

finishBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const total  = sections.flatMap(s => s.questions).length; // всего вопросов
  const count  = checkedSet.size;      // сколько «Да»

  // массив номеров вопросов, где галочка НЕ стоит
  const missed = [...Array(total).keys()]          // [0,1,2, …]
                 .filter(i => !checkedSet.has(`q${i}`)); // те, которых нет в Set

  localStorage.setItem("result", JSON.stringify({ total, count }));
  localStorage.setItem("missed", JSON.stringify(missed));

  window.location.href = "form3.html";
});
