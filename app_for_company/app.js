const answersMap = {};
let adviceCache = {}; // кэш советов
const questionCounts = {}; // Храним количество вопросов по всем категориям

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
    questionCounts[category] = questions.length;
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

  $(document).on('click', '#calculateAll', function () {
  let total = 0;
  let yes = 0;
  let failedControls = [];
  let sectionStats = {};

  for (const category in questionCounts) {
    const catTotal = questionCounts[category];
    let catYes = 0;
    let catAnswered = 0;

    if (!answersMap[category]) answersMap[category] = [];

    for (let i = 0; i < catTotal; i++) {
      const ans = answersMap[category][i] || {};
      const val = ans.answer;

      if (val === 'yes') {
        yes++;
        catYes++;
      }

      if (val) catAnswered++;
    
      if (!val || val === 'no') {
      failedControls.push({ category, index: i });
}


      total++;
    }

    sectionStats[category] = {
      yes: catYes,
      total: catTotal,
      percent: catTotal > 0 ? Math.round((catYes / catTotal) * 100) : 0
    };
  }

  const percent = total ? Math.round((yes / total) * 100) : 0;

  renderOverallChart(percent, sectionStats);
  showFailedAdvice(failedControls);
});



function renderOverallChart(percent, sectionStats) {
  let sectionHtml = '<h5 class="mt-4">Результаты по категориям:</h5><ul class="list-group mb-4">';

  for (const section in sectionStats) {
    const stat = sectionStats[section];
    sectionHtml += `<li class="list-group-item d-flex justify-content-between">
      <span>${section}</span>
      <span>${stat.percent}% (${stat.yes}/${stat.total})</span>
    </li>`;
  }

  sectionHtml += '</ul>';

  $('#overall-result').html(`
    <h4>Общий уровень соответствия: ${percent}%</h4>
    <canvas id="overallChart" width="300" height="300"></canvas>
    ${sectionHtml}
    <div id="adviceBlock" class="mt-4"></div>
    <button id="exportReport" class="btn btn-outline-dark mt-3">Скачать отчёт (TXT)</button>
    <button id="resetAnswers" class="btn btn-danger mt-2">Очистить ответы</button>

  `);

  new Chart(document.getElementById('overallChart'), {
    type: 'doughnut',
    data: {
      labels: ['Да', 'Нет/Не заполнено'],
      datasets: [{
        data: [percent, 100 - percent],
        backgroundColor: ['#28a745', '#dee2e6']
      }]
    },
    options: {
      cutout: '70%',
      responsive: false,
      plugins: { legend: { position: 'bottom' } }
    }

  });
  
}

function showFailedAdvice(failedControls) {
  let adviceHTML = '<h5 class="mt-4">Рекомендации по несоответствующим пунктам:</h5>';

  // Группируем по категориям
  const grouped = {};
  failedControls.forEach(({ category, index }) => {
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(index);
  });

  const promises = Object.entries(grouped).map(([category, indices]) => {
    return fetch(`advices/${category}.json`)
      .then(res => res.json())
      .then(adviceList => {
        indices.forEach(i => {
          const adviceEntry = adviceList[i];
          if (adviceEntry && adviceEntry.advice) {
            adviceHTML += `
              <div class="alert alert-light border">
                <strong>${adviceEntry.id}:</strong> ${adviceEntry.advice}
              </div>`;
          }
        });
      });
  });

  Promise.all(promises).then(() => {
    $('#adviceBlock').html(adviceHTML);
  });
}


});
$(document).on('click', '#exportReport', function () {
  let output = 'Отчёт по оценке соответствия ISO/IEC 27001\n\n';

  let total = 0, yes = 0;
  for (const category in answersMap) {
    let catYes = 0;
    let catTotal = 0;
    output += `${category}:\n`;

    answersMap[category].forEach((ans, idx) => {
      const answer = ans.answer ? ans.answer.toUpperCase() : '—';
      output += `  Вопрос ${idx + 1}: ${answer}\n`;
      if (ans.answer) catTotal++;
      if (ans.answer === 'yes') catYes++;
    });

    const percent = catTotal ? Math.round((catYes / catTotal) * 100) : 0;
    output += `  → Итого: ${catYes}/${catTotal} (${percent}%)\n\n`;

    total += catTotal;
    yes += catYes;
  }

  const overall = total ? Math.round((yes / total) * 100) : 0;
  output += `Общий уровень соответствия: ${overall}%\n`;

  // Скачать как TXT
  const blob = new Blob([output], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ISO27001_Audit_Report.txt';
  link.click();
});
$(document).on('click', '#resetAnswers', function () {
  // Сброс переменных
  for (const cat in answersMap) delete answersMap[cat];
  for (const cat in questionCounts) delete questionCounts[cat];

  // Очистка UI
  $('#question-area').html('<p>Выберите категорию слева, чтобы начать заново.</p>');
  $('#overall-result').empty();
  $('#adviceBlock').empty();

  // Очистка выделения категорий
  $('.category-link').removeClass('active');
});

$(document).ready(function () {
  $('#companyTitle').on('click', function () {
    $('#companyModal').fadeIn();
  });

  $('#closeCompanyModal').on('click', function () {
    $('#companyModal').fadeOut();
  });

  $(document).on('click', function (e) {
    if (e.target.id === 'companyModal') {
      $('#companyModal').fadeOut();
    }
  });
});

  $(function () {
    $('#openCompanyModal').on('click', function () {
      $('#companyModal').fadeIn();
    });
    $('#closeCompanyModal').on('click', function () {
      $('#companyModal').fadeOut();
    });
    $(document).on('click', function (e) {
      if (e.target.id === 'companyModal') {
        $('#companyModal').fadeOut();
      }
    });
  });





