/*Расчёт результата и показ прогресса*/

document.addEventListener("DOMContentLoaded", () => {
  // Безопасно читаем данные из localStorage
  const stored = JSON.parse(localStorage.getItem("result") || "{}");
  const { total = 0, count = 0 } = stored;

  const company = localStorage.getItem("companyName") || "—";

  const percent = total ? ((count / total) * 100).toFixed(2) : "0.00";

  // Заполняем DOM
  document.getElementById("companyName").textContent = company;
  document.getElementById("count").textContent       = count;
  document.getElementById("total").textContent       = total;

  const bar = document.getElementById("progressBar");  
  bar.max   = total;
  bar.value = count;

  document.getElementById("resultText").textContent =
    percent >= 80
      ? ` Успех! Компания прошла ISO 27001 на ${percent}%`
      : ` Неудача. Компания прошла ISO 27001 только на ${percent}%`;

  document.getElementById("retryBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});