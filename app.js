// app.js
let questions = [];
let current = 0;
let score = 0;

const qCountEl = document.getElementById('qCount');
const scoreEl = document.getElementById('score');
const questionNumberEl = document.getElementById('questionNumber');
const questionTextEl = document.getElementById('questionText');
const optionsEl = document.getElementById('options');
const hintBtn = document.getElementById('hintBtn');
const nextBtn = document.getElementById('nextBtn');
const feedbackEl = document.getElementById('feedback');
const explanationEl = document.getElementById('explanation');
const endCard = document.getElementById('endCard');
const restartBtn = document.getElementById('restartBtn');
const questionCard = document.getElementById('questionCard');
const finalScoreEl = document.getElementById('finalScore');
const totalQEl = document.getElementById('totalQ');

async function loadQuestions(){
  try{
    const res = await fetch('/https://mjrep.github.io/aosreviewer/questions.json');
    questions = await res.json();
    qCountEl.textContent = questions.length;
    renderQuestion();
  }catch(err){
    questionTextEl.textContent = 'Failed to load questions. Make sure questions.json exists and is valid.';
    console.error(err);
  }
}

function renderQuestion(){
  feedbackEl.hidden = true;
  nextBtn.disabled = true;
  optionsEl.innerHTML = '';
  const q = questions[current];
  if(!q){
    finishQuiz();
    return;
  }

  questionNumberEl.textContent = `Question ${current+1} / ${questions.length}`;
  questionTextEl.innerHTML = sanitize(q.question);

  // Only handle singleSelect in this starter
  if(q.type !== 'singleSelect'){
    optionsEl.innerHTML = `<em>Unsupported question type: ${q.type}</em>`;
    return;
  }

  q.options.forEach((opt, idx) => {
    const b = document.createElement('button');
    b.className = 'optionBtn';
    b.type = 'button';
    b.innerHTML = sanitize(opt);
    b.addEventListener('click', () => selectOption(idx, b, q));
    optionsEl.appendChild(b);
  });

  // hint control
  hintBtn.disabled = false;
  hintBtn.onclick = () => {
    if(q.hint) {
      explanationEl.innerHTML = `<strong>Hint:</strong> ${sanitize(q.hint)}`;
      feedbackEl.hidden = false;
    } else {
      explanationEl.innerHTML = `<em>No hint available.</em>`;
      feedbackEl.hidden = false;
    }
  };
}

function selectOption(selectedIdx, btnElem, q){
  // disable all option buttons
  const allBtns = Array.from(optionsEl.querySelectorAll('.optionBtn'));
  allBtns.forEach(b => b.classList.add('disabled'), b => b.disabled = true);
  allBtns.forEach(b => b.disabled = true);

  // check answer - q.answer is an array; for singleSelect expect one index
  const correctIndexes = q.answer || [];
  const isCorrect = correctIndexes.includes(selectedIdx);

  if(isCorrect){
    btnElem.classList.add('correct');
    score++;
    scoreEl.textContent = score;
  } else {
    btnElem.classList.add('wrong');
    // highlight correct option(s)
    correctIndexes.forEach(ci => {
      const correctBtn = allBtns[ci];
      if(correctBtn) correctBtn.classList.add('correct');
    });
  }

  // show explanation if any
  let explanationHTML = '';
  if(q.explanation) explanationHTML += `<p>${sanitize(q.explanation)}</p>`;
  // also show the selected answer text
  explanationHTML = `<p><strong>Your answer:</strong> ${sanitize(q.options[selectedIdx] || '—')}</p>` + explanationHTML;
  explanationEl.innerHTML = explanationHTML;
  feedbackEl.hidden = false;

  // enable next
  nextBtn.disabled = false;
  nextBtn.onclick = () => {
    current++;
    if(current >= questions.length) finishQuiz();
    else renderQuestion();
  };
}

function finishQuiz(){
  questionCard.hidden = true;
  endCard.hidden = false;
  finalScoreEl.textContent = score;
  totalQEl.textContent = questions.length;
}

restartBtn.onclick = () => {
  current = 0;
  score = 0;
  scoreEl.textContent = '0';
  questionCard.hidden = false;
  endCard.hidden = true;
  renderQuestion();
};

function sanitize(str){
  if(!str) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

// start
loadQuestions();



