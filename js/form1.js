/* Рендер чекбоксов и сбор ответов */

import { questions } from "./questions.js";

document.addEventListener("DOMContentLoaded", () => {
  const form   = document.getElementById("questionForm");
  const submit = document.getElementById("submitBtn");
  const bar    = document.getElementById("progressBar");

questions.forEach((q, i) => {
  const div = document.createElement("div");
  div.classList.add("question-item"); 

  const label = document.createElement("label");
  label.innerHTML = `${q} <input type="checkbox" id="q${i}" />`;

  div.appendChild(label);
  form.appendChild(div);
});

  const updateProgress = () => {
    const checked = form.querySelectorAll("input:checked").length;
    bar.innerText = `Отмечено «Да»: ${checked} / ${questions.length}`;
  };
  form.addEventListener("change", updateProgress);
  updateProgress();

  submit.addEventListener("click", (e) => {
    e.preventDefault();
    const count = form.querySelectorAll("input:checked").length;
    localStorage.setItem("result",
      JSON.stringify({ total: questions.length, count })
    );
    window.location.href = "form3.html";
  });
});