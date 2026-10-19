// 5·6주차: 요소 선택 → 이벤트 → 함수 → 조건 검사 → 결과 안내
const form = document.querySelector('#plan-form');
const subjectInput = document.querySelector('#subject');
const goalInput = document.querySelector('#goal');
const emailInput = document.querySelector('#email');
const feedback = document.querySelector('#feedback');
const confirmButton = document.querySelector('#confirm-button');
const preview = document.querySelector('#plan-preview');
const previewSubject = document.querySelector('#preview-subject');
const previewGoal = document.querySelector('#preview-goal');
const previewEmail = document.querySelector('#preview-email');
let isConfirmed = false;
function showMessage(message, state) {
    feedback.textContent = message;
    feedback.className = 'feedback' + (state ? ' ' + state : '');
}
function clearErrors() {
    subjectInput.removeAttribute('aria-invalid');
    goalInput.removeAttribute('aria-invalid');
    emailInput.removeAttribute('aria-invalid');
}
function showError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    showMessage(message, 'error');
    input.focus();
}
function confirmPlan(event) {
    event.preventDefault(); // 화면 이동이나 서버 전송 방지
    if (isConfirmed) return;
    clearErrors();
    const subject = subjectInput.value.trim();
    const goal = goalInput.value.trim();
    const email = emailInput.value.trim();
    if (subject === '') {
        showError(subjectInput, '관심 과목을 입력해주세요.');
        return;
    }
    if (goal === '') {
        showError(goalInput, '이번 주 학습 목표를 입력해주세요.');
        return;
    }
    if (email !== '' && emailInput.validity.typeMismatch) {
        showError(emailInput, '이메일을 올바른 형식으로 입력해주세요. 예: student@example.com');
        return;
    }
    // HTML이 아닌 텍스트로만 표시
    previewSubject.textContent = subject;
    previewGoal.textContent = goal;
    previewEmail.textContent = email || '입력하지 않음';
    preview.hidden = false;
    isConfirmed = true;
    confirmButton.disabled = true;
    confirmButton.textContent = '확인 완료';
    showMessage('학습 계획을 확인했어요! 내용을 바꾸면 다시 확인할 수 있습니다.', 'success');
}
function editPlan() {
    const wasConfirmed = isConfirmed;
    isConfirmed = false;
    confirmButton.disabled = false;
    confirmButton.textContent = '계획 확인';
    preview.hidden = true;
    clearErrors();
    const complete = subjectInput.value.trim() !== '' && goalInput.value.trim() !== '';
    showMessage(wasConfirmed ? '내용이 변경됐어요. 계획 확인을 다시 눌러주세요.' : (complete ? '필수 내용을 입력했어요. 계획 확인을 눌러주세요.' : '관심 과목과 학습 목표를 모두 입력해주세요.'), complete ? 'success' : '');
    document.querySelector('#goal-count').textContent = goalInput.value.length + ' / 300자';
}
function resetPlan() {
    isConfirmed = false;
    confirmButton.disabled = false;
    confirmButton.textContent = '계획 확인';
    preview.hidden = true;
    previewSubject.textContent = '';
    previewGoal.textContent = '';
    previewEmail.textContent = '';
    clearErrors();
    showMessage('입력을 초기화했어요. 새로운 과목과 목표를 입력해주세요.', '');
    document.querySelector('#goal-count').textContent = '0 / 300자';
    subjectInput.focus();
}
form.addEventListener('submit', confirmPlan);
form.addEventListener('input', editPlan);
form.addEventListener('reset', resetPlan);


// 6주차: 선택 탭과 해당 패널을 일대일로 연결한다.
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
    tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
}
tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
        const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
            (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activateTab(tabs[next]); tabs[next].focus();
    });
});
const dailyTime = document.querySelector('#daily-time');
const timeFeedback = document.querySelector('#time-feedback');
const applyTime = document.querySelector('#apply-time');
const timeApplied = document.querySelector('#time-applied');
dailyTime.addEventListener('change', () => {
    const minutes = Number(dailyTime.value);
    const selected = minutes > 0;
    timeFeedback.textContent = selected ? `하루 ${minutes}분, 주 5일이면 ${minutes * 5}분 학습할 수 있어요.` : '시간을 선택하면 주 5일 기준 학습 시간을 알려드려요.';
    timeFeedback.className = 'feedback' + (selected ? ' success' : '');
    applyTime.disabled = !selected;
    applyTime.textContent = selected ? '이 시간으로 준비하기' : '시간을 먼저 선택해주세요';
    timeApplied.hidden = true;
});
applyTime.addEventListener('click', () => {
    timeApplied.textContent = `하루 ${dailyTime.value}분 학습을 준비했어요. 아래 학습 계획에 실천할 내용을 적어보세요.`;
    timeApplied.className = 'feedback success'; timeApplied.hidden = false;
    applyTime.disabled = true; applyTime.textContent = '준비 완료';
});
const readyButton = document.querySelector('#ready-button');
const readyFeedback = document.querySelector('#ready-feedback');
readyButton.addEventListener('click', () => {
    const ready = readyButton.getAttribute('aria-pressed') !== 'true';
    readyButton.setAttribute('aria-pressed', String(ready));
    readyButton.textContent = ready ? '준비 표시 취소' : '준비 완료로 표시';
    readyFeedback.textContent = ready ? '준비 완료! 이제 학습 목표를 입력해보세요.' : '아직 준비 전이에요. 강의 자료와 제출 기한을 확인해주세요.';
    readyFeedback.className = 'feedback' + (ready ? ' success' : '');
});
