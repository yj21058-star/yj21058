// 7주차: 시작 → 입력·선택 → 확인 → 완료. 입력은 DOM에 유지한다.
const form = document.querySelector('#plan-form');
const subjectInput = document.querySelector('#subject');
const goalInput = document.querySelector('#goal');
const emailInput = document.querySelector('#email');
const planTime = document.querySelector('#plan-time');
const feedback = document.querySelector('#feedback');
const confirmButton = document.querySelector('#confirm-button');
const flowPanels = ['flow-welcome', 'plan-form', 'flow-review', 'flow-complete'].map(id => document.getElementById(id));
const stepNames = ['시작', '입력·선택', '확인', '완료'];
let currentStep = 0;
let confirmedPlan = null;
function showStep(step) {
    currentStep = step;
    flowPanels.forEach((panel, index) => { panel.hidden = index !== step; });
    document.querySelectorAll('.flow-progress li').forEach((item, index) => {
        if (index === step) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
    });
    document.querySelector('#flow-status').textContent = `${step + 1} / 4 단계 · ${stepNames[step]}`;
    flowPanels[step].querySelector('h3').focus();
}
function clearErrors() {
    [subjectInput, goalInput, planTime, emailInput].forEach(input => input.removeAttribute('aria-invalid'));
}
function showMessage(message, state = '') {
    feedback.textContent = message; feedback.className = 'feedback' + (state ? ' ' + state : '');
}
function showError(input, message) {
    input.setAttribute('aria-invalid', 'true'); showMessage(message, 'error'); input.focus();
}
function editPlan() {
    clearErrors(); confirmedPlan = null;
    document.querySelector('#goal-count').textContent = goalInput.value.length + ' / 300자';
    const complete = subjectInput.value.trim() && goalInput.value.trim() && planTime.value;
    showMessage(complete ? '필수 내용을 입력했어요. 다음 단계에서 계획을 확인하세요.' : '과목·학습 목표·하루 학습 시간을 모두 입력해주세요.', complete ? 'success' : '');
}
function confirmPlan(event) {
    event.preventDefault();
    if (currentStep !== 1) return;
    clearErrors();
    if (!subjectInput.value.trim()) return showError(subjectInput, '관심 과목을 입력해주세요. 예: UI/UX프로그래밍');
    if (!goalInput.value.trim()) return showError(goalInput, '이번 주 실천할 학습 목표를 입력해주세요.');
    if (!planTime.value) return showError(planTime, '하루 학습 시간을 20분·40분·60분 중 선택해주세요.');
    if (emailInput.value.trim() && emailInput.validity.typeMismatch) return showError(emailInput, '이메일 형식을 확인해주세요. 예: student@example.com (비워도 됩니다)');
    confirmedPlan = { subject: subjectInput.value.trim(), goal: goalInput.value.trim(), minutes: Number(planTime.value), email: emailInput.value.trim() || '입력하지 않음' };
    document.querySelector('#preview-subject').textContent = confirmedPlan.subject;
    document.querySelector('#preview-goal').textContent = confirmedPlan.goal;
    document.querySelector('#preview-time').textContent = `${confirmedPlan.minutes}분`;
    document.querySelector('#preview-week').textContent = `${confirmedPlan.minutes * 5}분`;
    document.querySelector('#preview-email').textContent = confirmedPlan.email;
    document.querySelector('#finish-button').disabled = false;
    document.querySelector('#finish-button').textContent = '계획 확정';
    showStep(2);
}
function resetPlan() {
    form.reset(); clearErrors(); confirmedPlan = null;
    document.querySelector('#goal-count').textContent = '0 / 300자';
    showMessage('필수 항목 3개를 입력해주세요.');
    document.querySelectorAll('#plan-preview dd').forEach(item => { item.textContent = ''; });
    document.querySelector('#complete-summary').replaceChildren();
    document.querySelector('#complete-message').textContent = '';
    document.querySelector('#finish-button').disabled = false;
    document.querySelector('#finish-button').textContent = '계획 확정';
    // 연결된 학습 도구도 초기화: 다음 시작 때 이전 시간 선택이 유입되지 않도록 한다.
    dailyTime.value = ''; dailyTime.dispatchEvent(new Event('change'));
    readyButton.setAttribute('aria-pressed', 'false'); readyButton.textContent = '준비 완료로 표시';
    readyFeedback.textContent = '아직 준비 전이에요. 강의 자료와 제출 기한을 확인해주세요.';
    readyFeedback.className = 'feedback'; timeApplied.textContent = '';
    activateTab(tabs[0]); showStep(0);
}
document.querySelector('#begin-button').addEventListener('click', () => showStep(1));
document.querySelector('#back-start').addEventListener('click', () => showStep(0));
document.querySelector('#edit-button').addEventListener('click', () => { confirmedPlan = null; showStep(1); });
form.addEventListener('submit', confirmPlan);
form.addEventListener('input', editPlan);
planTime.addEventListener('change', editPlan);
document.querySelector('#finish-button').addEventListener('click', () => {
    if (currentStep !== 2 || !confirmedPlan) return;
    document.querySelector('#finish-button').disabled = true;
    document.querySelector('#finish-button').textContent = '확정 완료';
    document.querySelector('#complete-message').textContent = `${confirmedPlan.subject}: 하루 ${confirmedPlan.minutes}분씩, 주 5일 학습 계획을 확정했어요.`;
    // 이미 textContent로 생성한 안전한 요약을 복사하되 중복 id는 제거한다.
    const summary = document.querySelector('#plan-preview dl').cloneNode(true);
    summary.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    document.querySelector('#complete-summary').replaceChildren(summary); showStep(3);
});
document.querySelector('#reset-button').addEventListener('click', resetPlan);
document.querySelector('#restart-button').addEventListener('click', resetPlan);

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
    planTime.value = dailyTime.value; editPlan(); showStep(1);
    timeApplied.textContent = `하루 ${dailyTime.value}분을 학습 계획에 반영했어요. 과목과 목표를 입력해주세요.`;
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
