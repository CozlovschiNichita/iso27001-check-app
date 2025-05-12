/* Рендер чекбоксов и сбор ответов */

import { questions } from "./questions.js";

document.addEventListener("DOMContentLoaded", () => {
  const form   = document.getElementById("questionForm");
  const submit = document.getElementById("submitBtn");
  const bar    = document.getElementById("progressBar");

  // 1. рендерим все чек‑боксы
  questions.forEach((q, i) => {
    const wrap   = document.createElement("div");
    const input  = document.createElement("input");
    const label  = document.createElement("label");

    input.type  = "checkbox";
    input.id    = `q${i}`;
    label.htmlFor = input.id;
    label.innerText = q;

    wrap.append(input, label);
    form.appendChild(wrap);
  });

  // 2. обновляем индикатор «сколько отмечено»
  const updateProgress = () => {
    const checked = form.querySelectorAll("input:checked").length;
    bar.innerText = `Отмечено «Да»: ${checked} / ${questions.length}`;
  };
  form.addEventListener("change", updateProgress);
  updateProgress();

  // 3. при клике «Завершить» — сохраняем результат и переходим
  submit.addEventListener("click", (e) => {
    e.preventDefault();
    const count = form.querySelectorAll("input:checked").length;
    localStorage.setItem("result",
      JSON.stringify({ total: questions.length, count })
    );
    window.location.href = "form3.html";
  });
});