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
    resetSaveState();
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
    if (![20, 40, 60].includes(Number(planTime.value))) return showError(planTime, '하루 학습 시간을 20분·40분·60분 중 선택해주세요.');
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
    resetSaveState();
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

// 중간고사: 확정한 계획을 보관 → 목록에서 다시 열기 → 학습 완료 기록.
// 입력 중인 계획과 보관한 계획을 분리해 '다시 시작'이 보관함을 지우지 않도록 한다.
const STORAGE_KEY = 'studyon.midterm.plans.v1';
const MAX_PLANS = 30;
const saveButton = document.querySelector('#save-plan');
const saveFeedback = document.querySelector('#save-feedback');
const openSavedButton = document.querySelector('#open-saved-plan');
const planFilter = document.querySelector('#plan-filter');
const savedList = document.querySelector('#saved-list');
const libraryFeedback = document.querySelector('#library-feedback');
const storageFeedback = document.querySelector('#storage-feedback');
const deleteDialog = document.querySelector('#delete-dialog');
let savedPlans = [];
let selectedPlanId = null;
let lastSavedId = null;
let canWriteStorage = true;

function resetSaveState() {
    lastSavedId = null;
    saveButton.disabled = false;
    saveButton.textContent = '내 계획에 보관';
    openSavedButton.hidden = true;
    setSaveFeedback('아직 보관하지 않았어요. 아래 버튼으로 계획을 보관하세요.');
}
function setSaveFeedback(message, type = '') {
    saveFeedback.textContent = message;
    saveFeedback.className = 'feedback' + (type ? ' ' + type : '');
}
function notifyLibrary(message, type = 'success') {
    libraryFeedback.hidden = !message;
    libraryFeedback.textContent = message;
    libraryFeedback.className = 'feedback' + (type ? ' ' + type : '');
}
function validRecord(plan) {
    return plan && typeof plan.id === 'string' && plan.id.length > 0 &&
        typeof plan.subject === 'string' && plan.subject.trim().length > 0 && plan.subject.length <= 60 &&
        typeof plan.goal === 'string' && plan.goal.trim().length > 0 && plan.goal.length <= 300 &&
        [20, 40, 60].includes(plan.minutes) && typeof plan.email === 'string' && plan.email.length <= 254 &&
        ['planned', 'done'].includes(plan.status) &&
        typeof plan.createdAt === 'string' && Number.isFinite(Date.parse(plan.createdAt));
}
function loadPlans() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const records = raw === null ? [] : JSON.parse(raw);
        if (!Array.isArray(records) || records.length > MAX_PLANS || !records.every(validRecord) ||
            new Set(records.map(plan => plan.id)).size !== records.length) throw new Error('Invalid saved plans');
        savedPlans = records;
        canWriteStorage = true;
        storageFeedback.hidden = true;
        return true;
    } catch {
        // 읽지 못한 기존 데이터를 빈 배열로 덮어쓰지 않는다.
        canWriteStorage = false;
        storageFeedback.hidden = false;
        storageFeedback.textContent = '보관함을 읽지 못했어요. 기존 자료를 보호하기 위해 저장·변경을 멈췄습니다. 브라우저의 사이트 저장 허용 여부를 확인하고 새로고침해주세요. 작성한 계획은 현재 화면에서 확인할 수 있어요.';
        return false;
    }
}
function persistPlans(next) {
    if (!canWriteStorage) return false;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        savedPlans = next;
        storageFeedback.hidden = true;
        return true;
    } catch {
        storageFeedback.hidden = false;
        storageFeedback.textContent = '변경 내용을 보관하지 못했어요. 저장 공간 또는 사이트 저장 허용 여부를 확인한 뒤 같은 버튼으로 다시 시도해주세요. 기존 보관함은 변경되지 않았습니다.';
        return false;
    }
}
function planLabel(plan) { return plan.status === 'done' ? '학습 완료' : '학습 예정'; }
function dateLabel(value) { return new Date(value).toLocaleDateString('ko-KR'); }
function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}
function renderPlans() {
    const filtered = savedPlans.filter(plan => planFilter.value === 'all' || plan.status === planFilter.value);
    const doneCount = savedPlans.filter(plan => plan.status === 'done').length;
    document.querySelector('#saved-count').textContent = `${savedPlans.length}개 보관 · ${doneCount}개 완료`;
    document.querySelector('#filter-summary').textContent = `${planFilter.options[planFilter.selectedIndex].text} ${filtered.length}개`;
    savedList.replaceChildren();
    filtered.forEach(plan => {
        const item = element('li', 'saved-card');
        const article = element('article');
        const top = element('div', 'card-top');
        top.append(element('span', 'status-badge ' + plan.status, planLabel(plan)), element('span', 'input-hint', dateLabel(plan.createdAt)));
        const open = element('button', 'secondary-button', '계획 다시 열기');
        open.type = 'button';
        open.setAttribute('aria-label', plan.subject + ' 계획 다시 열기');
        open.addEventListener('click', () => { notifyLibrary(''); openPlan(plan.id); });
        article.append(top, element('h3', '', plan.subject), element('p', 'card-goal', plan.goal),
            element('p', 'input-hint', `하루 ${plan.minutes}분 · 주 5일 ${plan.minutes * 5}분`), open);
        item.append(article); savedList.append(item);
    });
    document.querySelector('#empty-plans').hidden = filtered.length > 0;
    const hasPlans = savedPlans.length > 0;
    document.querySelector('#empty-heading').textContent = hasPlans ? '이 상태의 계획은 아직 없어요' : '보관한 계획이 아직 없어요';
    document.querySelector('#empty-message').textContent = hasPlans ? '전체 계획으로 돌아가 학습할 목표를 확인해보세요.' : '계획을 만들고 확정한 뒤 ‘내 계획에 보관’을 눌러보세요.';
    document.querySelector('#empty-action').textContent = hasPlans ? '전체 계획 보기' : '계획 만들러 가기';
}
function showList(focus = true) {
    selectedPlanId = null;
    document.querySelector('#saved-detail').hidden = true;
    document.querySelector('#saved-list-view').hidden = false;
    renderPlans();
    if (focus) document.querySelector('#saved-heading').focus();
}
function openPlan(id, focus = true) {
    const plan = savedPlans.find(item => item.id === id);
    if (!plan) {
        showList(); notifyLibrary('이 계획은 더 이상 보관함에 없어요. 다른 계획을 선택하거나 새 계획을 만들어주세요.', 'error');
        return;
    }
    selectedPlanId = id;
    document.querySelector('#saved-list-view').hidden = true;
    document.querySelector('#saved-detail').hidden = false;
    document.querySelector('#detail-title').textContent = plan.subject;
    document.querySelector('#detail-goal').textContent = plan.goal;
    document.querySelector('#detail-time').textContent = `하루 ${plan.minutes}분 · 주 5일 ${plan.minutes * 5}분`;
    document.querySelector('#detail-email').textContent = plan.email;
    document.querySelector('#detail-date').textContent = dateLabel(plan.createdAt);
    const badge = document.querySelector('#detail-state');
    badge.textContent = planLabel(plan); badge.className = 'status-badge ' + plan.status;
    document.querySelector('#toggle-complete').textContent = plan.status === 'done' ? '학습 예정으로 되돌리기' : '학습 완료로 표시';
    document.querySelector('#detail-guidance').textContent = plan.status === 'done' ? '목표를 완료했어요! 더 학습하려면 예정으로 되돌리거나 목록에서 다음 계획을 골라보세요.' : '위 목표를 실천한 뒤 학습 완료로 표시하세요. 지금은 학습 예정 상태예요.';
    if (focus) document.querySelector('#detail-title').focus();
}
saveButton.addEventListener('click', () => {
    if (currentStep !== 3 || !confirmedPlan) return;
    if (!loadPlans()) return setSaveFeedback('저장하지 못했어요. 아래 보관함의 오류 안내를 확인한 뒤 다시 시도해주세요.', 'error');
    const duplicate = savedPlans.find(plan => ['subject', 'goal', 'minutes', 'email'].every(key => plan[key] === confirmedPlan[key]));
    if (duplicate) {
        lastSavedId = duplicate.id;
        setSaveFeedback('같은 내용의 계획이 이미 있어요. 중복으로 추가하지 않았습니다. ‘보관한 계획 열기’로 이어서 확인하세요.');
    } else {
        if (savedPlans.length >= MAX_PLANS) return setSaveFeedback('최대 30개까지 보관할 수 있어요. 보관함에서 필요 없는 계획을 삭제한 뒤 다시 눌러주세요.', 'error');
        const record = { ...confirmedPlan, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'planned' };
        if (!persistPlans([record, ...savedPlans])) return setSaveFeedback('보관에 실패했어요. 입력한 계획은 그대로 있습니다. 사이트 저장 허용 여부와 저장 공간을 확인한 뒤 다시 눌러주세요.', 'error');
        lastSavedId = record.id;
        setSaveFeedback('내 계획에 보관했어요. 이 브라우저에서 새로고침해도 다시 볼 수 있어요.', 'success');
    }
    saveButton.disabled = true; saveButton.textContent = '보관 완료';
    openSavedButton.hidden = false;
    planFilter.value = 'all'; showList(false);
    openSavedButton.focus();
});
openSavedButton.addEventListener('click', () => { notifyLibrary(''); openPlan(lastSavedId); });
document.querySelector('#back-to-list').addEventListener('click', () => showList());
planFilter.addEventListener('change', () => { notifyLibrary(''); renderPlans(); });

// 빈 보관함에서는 작성 중인 내용을 보존해 기존 흐름으로 안내한다.
document.querySelector('#empty-action').addEventListener('click', () => {
    if (savedPlans.length) { planFilter.value = 'all'; renderPlans(); planFilter.focus(); }
    else { showStep(currentStep === 0 ? 1 : currentStep); }
});
document.querySelector('#new-plan').addEventListener('click', () => {
    // 기존 작성 중인 값을 유지한다. 초기화는 명시적인 '다시 시작'에서만 한다.
    if (currentStep === 3 && lastSavedId) resetPlan();
    showStep(currentStep === 0 ? 1 : currentStep);
});
document.querySelector('#toggle-complete').addEventListener('click', () => {
    if (!loadPlans()) return;
    const plan = savedPlans.find(item => item.id === selectedPlanId);
    if (!plan) return openPlan(selectedPlanId);
    const status = plan.status === 'done' ? 'planned' : 'done';
    const next = savedPlans.map(item => item.id === plan.id ? { ...item, status } : item);
    if (!persistPlans(next)) return notifyLibrary('상태 변경을 저장하지 못했어요. 위 안내를 확인한 뒤 다시 시도해주세요.', 'error');
    renderPlans(); openPlan(plan.id, false);
    notifyLibrary(status === 'done' ? '학습 완료로 기록했어요. 목록으로 돌아가 다음 계획을 확인하세요.' : '학습 예정으로 되돌렸어요. 목표를 다시 실천할 수 있어요.');
});
document.querySelector('#request-delete').addEventListener('click', () => {
    const plan = savedPlans.find(item => item.id === selectedPlanId);
    if (!plan) return openPlan(selectedPlanId);
    document.querySelector('#delete-description').textContent = `삭제할 계획: ${plan.subject}`;
    deleteDialog.showModal();
});
function cancelDelete() {
    deleteDialog.close();
    notifyLibrary('삭제를 취소했어요. 계획과 학습 상태가 그대로 유지됩니다.');
    document.querySelector('#request-delete').focus();
}
document.querySelector('#cancel-delete').addEventListener('click', cancelDelete);
deleteDialog.addEventListener('cancel', event => { event.preventDefault(); cancelDelete(); });
document.querySelector('#confirm-delete').addEventListener('click', () => {
    deleteDialog.close();
    if (!loadPlans()) return;
    const id = selectedPlanId;
    if (!savedPlans.some(plan => plan.id === id)) return openPlan(id);
    if (!persistPlans(savedPlans.filter(plan => plan.id !== id))) return notifyLibrary('삭제하지 못했어요. 계획은 그대로 있으니 저장 공간과 브라우저 설정을 확인해주세요.', 'error');
    if (lastSavedId === id) resetSaveState();
    showList(); notifyLibrary('계획을 삭제했어요. 다른 계획을 열거나 새 계획을 만들어보세요.');
});
// 같은 사이트의 다른 탭에서 변경해도 오래된 목록으로 덮어쓰지 않는다.
window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    if (loadPlans()) {
        renderPlans();
        if (selectedPlanId) openPlan(selectedPlanId, false);
        if (lastSavedId && !savedPlans.some(plan => plan.id === lastSavedId)) resetSaveState();
    }
});
loadPlans(); renderPlans();
