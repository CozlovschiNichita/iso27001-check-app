const weights = { Low: 1, Medium: 2, High: 3 };

$(document).ready(function () {
  $('.category-link').click(function () {
    $('.category-link').removeClass('active');
    $(this).addClass('active');

    const category = $(this).data('category');
    $('#question-area').html('<p>Загрузка вопросов для ' + category + '...</p>');

    fetch(`questions/${category}.json`)
      .then(res => res.json())
      .then(data => renderQuestions(category, data))
      .catch(() => {
        $('#question-area').html('<div class="alert alert-danger">Ошибка загрузки.</div>');
      });
  });

  function renderQuestions(category, data) {
    let html = `<h4>${category} — Вопросы</h4><form id="answers"><table class="table table-bordered"><thead>
      <tr><th>№</th><th>Вопрос</th><th>TP</th><th>VL</th><th>SEV</th><th>DET</th><th>RISK</th></tr></thead><tbody>`;

    data.forEach((q, index) => {
      html += `<tr data-index="${index}">
        <td>${q.id}</td>
        <td><strong>${q.title}</strong><br>${q.description}</td>
        <td>${select('tp', index)}</td>
        <td>${select('vl', index)}</td>
        <td>${select('sev', index)}</td>
        <td>${select('det', index)}</td>
        <td class="risk-output"></td>
      </tr>`;
    });

    html += `</tbody></table>
      <button type="button" class="btn btn-primary" id="calculate">Показать результаты</button>
      <div class="mt-4" id="result-area"></div>
    </form>`;

    $('#question-area').html(html);
  }

  function select(name, index) {
    return `
      <select class="form-control" data-type="${name}" data-index="${index}">
        <option value="">—</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>`;
  }

  $(document).on('change', 'select', function () {
    const row = $(this).closest('tr');
    const index = row.data('index');
    const tp = getWeight(row, 'tp');
    const vl = getWeight(row, 'vl');
    const sev = getWeight(row, 'sev');
    const det = getWeight(row, 'det');
    const risk = (tp + vl + sev) / (det || 1);

    const cell = row.find('.risk-output');
    cell.text(risk.toFixed(2));
    cell.removeClass().addClass('risk-output');

    if (risk < 2) cell.addClass('text-success');
    else if (risk < 4) cell.addClass('text-warning');
    else cell.addClass('text-danger');
  });

  function getWeight(row, type) {
    const val = row.find(`[data-type="${type}"]`).val();
    return weights[val] || 0;
  }

  $(document).on('click', '#calculate', function () {
    let total = 0, answered = 0;

    $('#answers tbody tr').each(function () {
      const tp = getWeight($(this), 'tp');
      const vl = getWeight($(this), 'vl');
      const sev = getWeight($(this), 'sev');
      const det = getWeight($(this), 'det');

      if (tp && vl && sev && det) {
        total++;
        answered++;
      } else if (tp || vl || sev || det) {
        total++;
      }
    });

    const percent = total ? Math.round((answered / total) * 100) : 0;
    showChart(percent);
  });

  function showChart(percent) {
    $('#result-area').html(`
      <h5>Уровень полноты оценки: ${percent}%</h5>
      <canvas id="chartResult" width="300" height="300"></canvas>
    `);

    new Chart(document.getElementById('chartResult'), {
      type: 'doughnut',
      data: {
        labels: ['Заполнено', 'Осталось'],
        datasets: [{
          data: [percent, 100 - percent],
          backgroundColor: ['#28a745', '#dee2e6']
        }]
      },
      options: {
        cutoutPercentage: 70,
        responsive: false,
        legend: { position: 'bottom' }
      }
    });
  }
});
