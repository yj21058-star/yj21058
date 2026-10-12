// 5주차: 요소 선택 → 이벤트 → 함수 → 조건 검사 → 결과 안내
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
    showMessage(wasConfirmed ? '내용이 변경됐어요. 계획 확인을 다시 눌러주세요.' : '입력 후 계획 확인을 눌러주세요.', '');
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
    subjectInput.focus();
}
form.addEventListener('submit', confirmPlan);
form.addEventListener('input', editPlan);
form.addEventListener('reset', resetPlan);
