/* Точка входа и логика переходов */ 

const companyInput = document.getElementById('companyInput');
const startBtn     = document.getElementById('startButton');

startBtn.addEventListener('click', () => {
  const name = companyInput.value.trim();

  if (!name) {
    alert('Пожалуйста, введите название компании');
    companyInput.focus();
    return;
  }

  localStorage.setItem('companyName', name);

  window.location.href = 'form1.html';
});
