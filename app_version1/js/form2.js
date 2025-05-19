/* Ввод имени компании */ 

document.getElementById("startButton").addEventListener("click", () => {
  const companyName = document.getElementById("companyInput").value;
  localStorage.setItem("companyName", companyName);
  window.location.href = "form1.html";
});
