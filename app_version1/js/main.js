/* Точка входа и логика переходов */ 

const companyInput = document.getElementById('companyInput');
const startBtn     = document.getElementById('startButton');
const errorMsg     = document.getElementById('errorMsg');

startBtn.addEventListener('click', () => {
  const name = companyInput.value.trim();

  if (!name) {
    errorMsg.style.display = "block";   
    companyInput.focus();
    return;
  }

  errorMsg.style.display = "none";        
  localStorage.setItem('companyName', name);
  window.location.href = 'form1.html';
});
