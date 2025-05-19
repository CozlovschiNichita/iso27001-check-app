/* -----------------------------------------------------
   OnlyFans ISO-27001 — Категории (A5-A10)
   Версия без блока истории
   ----------------------------------------------------- */

// кеши
const answersMap     = {};
const questionsCache = {};
const advicesCache   = {};
const questionCnt    = {};

/* ---------- загрузка категории ---------- */
async function loadCategory(cat){
  $('#catMenu .cat-link').removeClass('active');
  $(`#catMenu .cat-link[data-category="${cat}"]`).addClass('active');
  $('#question-area').html('<p>Загрузка…</p>');

  try{
    const [qs,ads] = await Promise.all([
      fetch(`questions/${cat}.json`).then(r=>r.json()),
      fetch(`advices/${cat}.json`).then(r=>r.json())
    ]);
    questionsCache[cat] = qs;
    advicesCache[cat]   = ads;
    renderCategory(cat);
  }catch{
    $('#question-area').html('<p style="color:red;">Ошибка загрузки данных.</p>');
  }
}

/* ---------- таблица вопросов ---------- */
function renderCategory(cat){
  const qs  = questionsCache[cat];
  const ads = advicesCache[cat];
  questionCnt[cat] = qs.length;
  answersMap[cat]  ||= [];

  let html = `<h4>${cat} — Вопросы</h4>
  <table class="table"><thead><tr>
    <th>№</th><th>Вопрос</th><th>Да</th><th>Нет</th><th>Совет</th>
  </tr></thead><tbody>`;

  qs.forEach((q,i)=>{
    const advTxt = (ads.find(a=>a.id===q.id)||{}).advice || 'Совета нет.';
    const id = `${cat}-${i}`;
    answersMap[cat][i] ||= {answer:null};

    html += `<tr>
      <td>${q.id}</td>
      <td><strong>${q.title}</strong><br>${q.description}</td>
      <td><input type="radio" name="ans-${id}" value="yes"
                 class="answer-radio" data-cat="${cat}" data-idx="${i}"></td>
      <td><input type="radio" name="ans-${id}" value="no"
                 class="answer-radio" data-cat="${cat}" data-idx="${i}"></td>
      <td><div class="inline-advice"
               data-title="${encodeURIComponent(q.title)}"
               data-advice="${encodeURIComponent(advTxt)}">
               Совет</div></td>
    </tr>`;
  });

  html += '</tbody></table>';

  if(cat==='A10'){
    html += `<div style="text-align:center;margin-top:20px;">
               <button id="calculateAll" class="btn primary">Показать результат</button>
             </div>`;
  }
  $('#question-area').html(html);
}

/* ---------- карточка-совет ---------- */
$(document).on('click','.inline-advice',function(){
  const title  = decodeURIComponent($(this).attr('data-title'));
  const advice = decodeURIComponent($(this).attr('data-advice'));
  $('#adviceTitle').text(title);
  $('#adviceText').text(advice);
  $('#adviceModal').removeClass('hidden');
});
$('#adviceModalClose').on('click',()=>$('#adviceModal').addClass('hidden'));
$(document).on('click',e=>{ if(e.target.id==='adviceModal')$('#adviceModal').addClass('hidden'); });

/* ---------- запись ответа ---------- */
$(document).on('change','.answer-radio',function(){
  const cat=$(this).data('cat'), idx=$(this).data('idx');
  answersMap[cat][idx]={answer:$(this).val()};
});

/* ---------- итог ---------- */
$(document).on('click','#calculateAll',()=>{
  const total = Object.values(questionCnt).reduce((a,b)=>a+b,0);
  const yes   = Object.values(answersMap).flat().filter(a=>a?.answer==='yes').length;

  const missed=[];
  Object.entries(answersMap).forEach(([cat,arr])=>{
    arr.forEach((ans,i)=>{ if(!ans.answer||ans.answer==='no') missed.push(`${cat}-${i}`); });
  });

  const entry={
    type:'Категории',
    total,count:yes,missed,
    time:new Date().toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'})
  };

  localStorage.setItem('result',JSON.stringify({total,count:yes}));
  localStorage.setItem('missed',JSON.stringify(missed));
  localStorage.setItem('lastResult',JSON.stringify(entry));

  const hist=JSON.parse(localStorage.getItem('history')||'[]');
  hist.push(entry);
  localStorage.setItem('history',JSON.stringify(hist));

  location.href='form3.html';
});

/* ---------- запуск ---------- */
$(document).ready(()=>{
  $('#catMenu').on('click','.cat-link',e=>loadCategory($(e.currentTarget).data('category')));
  loadCategory('A5');
});