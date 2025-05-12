/* Точка входа и логика переходов */ 

const companyInput = document.getElementById('companyInput');
const startBtn     = document.getElementById('startButton');

// 1. Слушаем клик по кнопке
startBtn.addEventListener('click', () => {
  const name = companyInput.value.trim();

  // 2. Простая валидация
  if (!name) {
    alert('Пожалуйста, введите название компании');
    companyInput.focus();
    return;
  }

  // 3. Сохраняем название в localStorage
  localStorage.setItem('companyName', name);

  // 4. Переходим к опроснику (позже создадим файл form1.html)
  window.location.href = 'form1.html';
});
