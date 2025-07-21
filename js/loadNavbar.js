document.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('navbar');

  fetch('components/navbar.html')
    .then(r => r.text())
    .then(html => {
      target.innerHTML = html;

      /* Подсвечиваем активную ссылку */
      const page = location.pathname.split('/').pop();
      const map  = { 'form1.html': 'linkChecklist', 'form2.html': 'linkCategories' };
      const id   = map[page];
      id && document.getElementById(id)?.classList.add('active');
    });
});