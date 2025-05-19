const answersMap = {};
let adviceCache = {}; // кэш советов

$(document).ready(function () {
  const weights = { Low: 1, Medium: 2, High: 3 };

  $('.category-link').click(function () {
    $('.category-link').removeClass('active');
    $(this).addClass('active');

    const category = $(this).data('category');
    $('#question-area').html('<p>Загрузка вопросов...</p>');

    Promise.all([
      fetch(`questions/${category}.json`).then(r => r.json()),
      fetch(`advices/${category}.json`).then(r => r.json())
    ])
    .then(([questions, advices]) => {
      adviceCache[category] = advices;
      renderCategory(category, questions);
    })
    .catch(() => {
      $('#question-area').html('<div class="alert alert-danger">Ошибка загрузки данных.</div>');
    });
  });

  function renderCategory(category, questions) {
  if (!answersMap[category]) answersMap[category] = [];

  let html = `<h4>${category} — Вопросы</h4>
    <form><table class="table table-bordered">
    <thead><tr>
      <th>№</th><th>Вопрос</th><th>Да</th><th>Нет</th><th>Совет</th>
    </tr></thead><tbody>`;

  questions.forEach((q, i) => {
    const id = `${category}-${i}`;
    if (!answersMap[category][i]) answersMap[category][i] = { answer: null };

    html += `<tr>
      <td>${q.id}</td>
      <td><strong>${q.title}</strong><br>${q.description}</td>
      <td><input type="radio" name="ans-${id}" value="yes" class="form-check-input answer-radio" data-category="${category}" data-index="${i}"></td>
      <td><input type="radio" name="ans-${id}" value="no" class="form-check-input answer-radio" data-category="${category}" data-index="${i}"></td>
      <td><button type="button" class="btn btn-sm btn-info show-advice" data-id="${q.id}" data-category="${category}">Совет</button></td>
    </tr>`;
  });

  html += '</tbody></table></form>';

  // Добавляем кнопку только для A10
  if (category === 'A10') {
    html += `
      <div class="text-center mt-4">
        <button type="button" class="btn btn-success btn-lg" id="calculateAll">Показать результат</button>
      </div>
      <div id="overall-result" class="mt-4"></div>`;
  }

  // ВСТАВКА в DOM после формирования ВСЕГО html
  $('#question-area').html(html);
}


  // Модальное окно — Показ
  $(document).on('click', '.show-advice', function () {
    const id = $(this).data('id');
    const category = $(this).data('category');
    const adviceObj = adviceCache[category]?.find(a => a.id === id);
    $('#adviceTitle').text(`Совет по ${id}`);
    $('#adviceText').text(adviceObj ? adviceObj.advice : 'Нет информации.');
    $('#adviceModal').fadeIn();
  });

  // Модальное окно — Закрытие
  $('#adviceModalClose').click(() => $('#adviceModal').fadeOut());
  $(document).on('click', function (e) {
    if (e.target.id === 'adviceModal') $('#adviceModal').fadeOut();
  });

  // Ответы "Да/Нет"
  $(document).on('change', '.answer-radio', function () {
    const cat = $(this).data('category');
    const idx = $(this).data('index');
    const val = $(this).val();
    if (!answersMap[cat]) answersMap[cat] = [];
    if (!answersMap[cat][idx]) answersMap[cat][idx] = {};
    answersMap[cat][idx].answer = val;
  });

  // Общая кнопка расчёта
 $(document).on('click', '#calculateAll', function () {
  let total = 0, yes = 0;
  let failedControls = []; // для тех, где "нет"

  for (const category in answersMap) {
    answersMap[category].forEach((ans, idx) => {
      if (ans.answer) total++;
      if (ans.answer === 'yes') yes++;
      if (ans.answer === 'no') {
        failedControls.push({ category, index: idx });
      }
    });
  }

  const percent = total ? Math.round((yes / total) * 100) : 0;

  // Вывод результата
  renderOverallChart(percent);
  showFailedAdvice(failedControls);
});


function renderOverallChart(percent) {
  $('#overall-result').html(`
    <h5>Общий уровень соответствия: ${percent}%</h5>
    <canvas id="overallChart" width="300" height="300"></canvas>
    <div id="adviceBlock" class="mt-4"></div>
  `);

  new Chart(document.getElementById('overallChart'), {
    type: 'doughnut',
    data: {
      labels: ['Да', 'Нет/Не отвечено'],
      datasets: [{
        data: [percent, 100 - percent],
        backgroundColor: ['#28a745', '#dee2e6']
      }]
    },
    options: {
      cutout: '70%',
      responsive: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}
function showFailedAdvice(failedControls) {
  let adviceHTML = '<h5>Рекомендации по несоответствующим пунктам:</h5><ul class="list-group">';

  const advicePromises = failedControls.map(({ category, index }) => {
    return fetch(`advices/${category}.json`)
      .then(res => res.json())
      .then(adviceData => {
        const questionId = Object.keys(answersMap[category])[index];
        const advice = adviceData[index]?.advice;
        if (advice) {
          adviceHTML += `<li class="list-group-item"><strong>${category}.${parseInt(index) + 1}:</strong> ${advice}</li>`;
        }
      });
  });

  Promise.all(advicePromises).then(() => {
    adviceHTML += '</ul>';
    $('#adviceBlock').html(adviceHTML);
  });
}

});
