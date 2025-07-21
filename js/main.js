// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  localStorage.setItem('companyName', 'OnlyFans');

  // ЛЕВАЯ: старый чек-лист
  document.getElementById('btnChecklist')
          .addEventListener('click', () => location.href = 'form1.html');

  // ПРАВАЯ: новый каталог-опросник
  document.getElementById('btnCategories')
          .addEventListener('click', () => location.href = 'form2.html');
});