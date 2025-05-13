/*Расчёт результата и показ прогресса*/

document.addEventListener("DOMContentLoaded", () => {
  const stored = JSON.parse(localStorage.getItem("result") || "{}");
  const { total = 0, count = 0 } = stored;
  const percent = total ? ((count / total) * 100).toFixed(2) : 0;

  // текстовые поля
  document.getElementById("companyName").textContent = localStorage.getItem("companyName") || "—";
  document.getElementById("count").textContent = count;
  document.getElementById("total").textContent = total;

  // круговой индикатор
  const circle  = document.getElementById("circleFg");
  const percentText = document.getElementById("percentText");

  const fullLen = 2 * Math.PI * 54;                 // 339.292
  const offset  = fullLen * (1 - percent / 100);    // сколько «скрыть»

  // плавно обновляем
  requestAnimationFrame(() => {
    circle.style.strokeDashoffset = offset;
    percentText.textContent = `${percent}%`;
  });

  document.getElementById("resultText").textContent =
    percent >= 80
      ? `Успех! Соответствие ${percent}%`
      : `Неудача. Соответствие только ${percent}%`;


  document.getElementById("retryBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
});