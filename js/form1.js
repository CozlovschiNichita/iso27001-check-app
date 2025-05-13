/* Рендер чек‑листов и сохранение результата */
import { sections } from "./questions.js";

const tabs      = document.getElementById("tabs");
const form      = document.getElementById("questionForm");
const info      = document.getElementById("progressInfo");
const finishBtn = document.getElementById("finishBtn");

let active = 0;
const checkedSet = new Set();

/* -------- вкладки -------- */
function renderTabs() {
  tabs.innerHTML = "";
  sections.forEach((s, i) => {
    const b = document.createElement("button");
    b.textContent = s.title;
    b.className   = "tab" + (i === active ? " active" : "");
    b.onclick = () => { active = i; renderTabs(); renderQuestions(); updateProgress(); };
    tabs.appendChild(b);
  });
}

/* -------- вопросы -------- */
function renderQuestions() {
  form.innerHTML = "";

  const offset = sections.slice(0, active)
    .reduce((n, s) => n + s.questions.length, 0);

  sections[active].questions.forEach((q, i) => {
    const id  = `q${offset + i}`;
    const div = document.createElement("div");
    div.className = "question-item";

    div.innerHTML = `
      <label>
        ${q.text}
        <input type="checkbox" id="${id}" data-id="${offset + i}"
               ${checkedSet.has(id) ? "checked" : ""}>
      </label>`;

    div.querySelector("input").onchange = e => {
      e.target.checked ? checkedSet.add(id) : checkedSet.delete(id);
      updateProgress();
    };

    form.appendChild(div);
  });
}

/* -------- прогресс -------- */
function updateProgress() {
  const total = sections.flatMap(s => s.questions).length;
  info.textContent = `Отмечено «Да»: ${checkedSet.size} / ${total}`;
}

/* -------- инициализация -------- */
renderTabs(); renderQuestions(); updateProgress();

/* -------- завершить -------- */
finishBtn.onclick = e => {
  e.preventDefault();

  const total   = sections.flatMap(s => s.questions).length;
  const count   = checkedSet.size;
  const missed  = [...Array(total).keys()].filter(i => !checkedSet.has(`q${i}`));
  const name    = localStorage.getItem("companyName") || "—";

  /* запись результата */
  const entry = { name, total, count, missed };

  localStorage.setItem("result",       JSON.stringify({ total, count }));
  localStorage.setItem("missed",       JSON.stringify(missed));
  localStorage.setItem("lastResult",   JSON.stringify(entry));

  /* добавляем в историю */
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  history.push(entry);
  localStorage.setItem("history", JSON.stringify(history));

  window.location.href = "form3.html";
};