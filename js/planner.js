// Planner page - Daily task management with AI-powered plan generation

let currentDate = new Date();
let allTasks = [];
let generatedPlan = null;

// 요일 매핑
const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
const dayMapping = {
    '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6
};

// Update date display
function updateDateDisplay() {
    document.getElementById('currentDate').textContent = formatDateKorean(currentDate);
}

// Load tasks for current date (localStorage 기반)
function loadTasks() {
    const dateStr = formatDate(currentDate);
    const storedTasks = getLocalStorage('daily_tasks', []);
    
    allTasks = storedTasks.filter(task => task.date === dateStr);
    renderTasks();
    updateProgress();
}

// Save all tasks to localStorage
function saveAllTasks() {
    const dateStr = formatDate(currentDate);
    let storedTasks = getLocalStorage('daily_tasks', []);
    
    // 현재 날짜의 기존 태스크 제거
    storedTasks = storedTasks.filter(task => task.date !== dateStr);
    
    // 현재 태스크 추가
    storedTasks = [...storedTasks, ...allTasks];
    
    setLocalStorage('daily_tasks', storedTasks);
}

// Render tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    
    taskList.innerHTML = '';
    
    if (allTasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    allTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    allTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) {
            li.classList.add('completed');
        }
        
        // 과목 태그 (있는 경우)
        if (task.subject) {
            const subjectTag = document.createElement('span');
            subjectTag.className = `subject-tag subject-${task.subject}`;
            subjectTag.textContent = task.subject;
            li.appendChild(subjectTag);
        }
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed || false;
        checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));
        
        // Task text
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.task;
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        // Move up button
        if (index > 0) {
            const moveUpBtn = document.createElement('button');
            moveUpBtn.className = 'task-action-btn';
            moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            moveUpBtn.title = '위로 이동';
            moveUpBtn.addEventListener('click', () => moveTask(index, -1));
            actions.appendChild(moveUpBtn);
        }
        
        // Move down button
        if (index < allTasks.length - 1) {
            const moveDownBtn = document.createElement('button');
            moveDownBtn.className = 'task-action-btn';
            moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
            moveDownBtn.title = '아래로 이동';
            moveDownBtn.addEventListener('click', () => moveTask(index, 1));
            actions.appendChild(moveDownBtn);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = '삭제';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        actions.appendChild(deleteBtn);
        
        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(actions);
        taskList.appendChild(li);
    });
}

// Add new task
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (!taskText) {
        showToast('할 일을 입력해주세요', 'error');
        return;
    }
    
    const dateStr = formatDate(currentDate);
    const newOrder = allTasks.length > 0 
        ? Math.max(...allTasks.map(t => t.order || 0)) + 1 
        : 0;
    
    const newTask = {
        id: generateUUID(),
        date: dateStr,
        task: taskText,
        completed: false,
        order: newOrder
    };
    
    allTasks.push(newTask);
    saveAllTasks();
    
    input.value = '';
    showToast('할 일이 추가되었습니다', 'success');
    renderTasks();
    updateProgress();
}

// Toggle task completion
function toggleTask(taskId, completed) {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.completed = completed;
        saveAllTasks();
        renderTasks();
        updateProgress();
        
        if (completed) {
            showToast('할 일을 완료했습니다! 🎉', 'success');
        }
    }
}

// Delete task
function deleteTask(taskId) {
    if (!confirm('이 할 일을 삭제하시겠습니까?')) {
        return;
    }
    
    allTasks = allTasks.filter(t => t.id !== taskId);
    saveAllTasks();
    
    showToast('할 일이 삭제되었습니다', 'success');
    renderTasks();
    updateProgress();
}

// Move task
function moveTask(currentIndex, direction) {
    const newIndex = currentIndex + direction;
    
    if (newIndex < 0 || newIndex >= allTasks.length) {
        return;
    }
    
    // Swap orders
    const currentTask = allTasks[currentIndex];
    const targetTask = allTasks[newIndex];
    
    const tempOrder = currentTask.order;
    currentTask.order = targetTask.order;
    targetTask.order = tempOrder;
    
    saveAllTasks();
    renderTasks();
}

// Clear completed tasks
function clearCompletedTasks() {
    const completedTasks = allTasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
        showToast('완료된 할 일이 없습니다', 'info');
        return;
    }
    
    if (!confirm(`완료된 ${completedTasks.length}개의 할 일을 삭제하시겠습니까?`)) {
        return;
    }
    
    allTasks = allTasks.filter(task => !task.completed);
    saveAllTasks();
    
    showToast(`${completedTasks.length}개의 할 일이 삭제되었습니다`, 'success');
    renderTasks();
    updateProgress();
}

// Update progress
function updateProgress() {
    const totalCount = allTasks.length;
    const completedCount = allTasks.filter(task => task.completed).length;
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('completedCount').textContent = completedCount;
    
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    document.getElementById('progressPercentage').textContent = `${percentage}%`;
    document.getElementById('progressBarFill').style.width = `${percentage}%`;
}

// Navigate to previous day
function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadTasks();
}

// Navigate to next day
function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadTasks();
}

// =============================================
// 계획표 자동 생성 기능
// =============================================

// 교재 입력란 추가
function addTextbookInput() {
    const container = document.getElementById('textbooksContainer');
    const index = container.children.length;
    
    const textbookItem = document.createElement('div');
    textbookItem.className = 'textbook-item';
    textbookItem.dataset.index = index;
    
    textbookItem.innerHTML = `
        <div class="textbook-header">
            <span>교재 ${index + 1}</span>
            <button type="button" class="remove-textbook-btn" onclick="removeTextbook(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="form-group">
            <label>교재명</label>
            <input type="text" class="form-input textbook-name" placeholder="예: 수학의 정석">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>전체 페이지 수</label>
                <input type="number" class="form-input textbook-pages" placeholder="예: 300" min="1">
            </div>
            <div class="form-group">
                <label>하루 목표 분량 (페이지)</label>
                <input type="number" class="form-input textbook-daily" placeholder="예: 10" min="1">
            </div>
        </div>
        <div class="form-group">
            <label>과목</label>
            <select class="form-select textbook-subject">
                <option value="수학">수학</option>
                <option value="과학">과학</option>
                <option value="영어">영어</option>
                <option value="국어">국어</option>
                <option value="사회">사회</option>
                <option value="기타">기타</option>
            </select>
        </div>
    `;
    
    container.appendChild(textbookItem);
}

// 교재 입력란 제거
function removeTextbook(index) {
    const container = document.getElementById('textbooksContainer');
    const items = container.querySelectorAll('.textbook-item');
    
    if (items.length > 1) {
        items[index].remove();
        // 인덱스 재정렬
        container.querySelectorAll('.textbook-item').forEach((item, i) => {
            item.dataset.index = i;
        });
    } else {
        showToast('최소 1개의 교재가 필요합니다', 'error');
    }
}

// 교재 정보 수집
function collectTextbooks() {
    const textbooks = [];
    const items = document.querySelectorAll('.textbook-item');
    
    items.forEach(item => {
        const name = item.querySelector('.textbook-name').value.trim();
        const pages = parseInt(item.querySelector('.textbook-pages').value) || 0;
        const daily = parseInt(item.querySelector('.textbook-daily').value) || 0;
        const subject = item.querySelector('.textbook-subject').value;
        
        if (name && pages > 0 && daily > 0) {
            textbooks.push({ name, pages, daily, subject });
        }
    });
    
    return textbooks;
}

// 선택된 요일 수집
function collectSelectedDays() {
    const checkboxes = document.querySelectorAll('.days-selector input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// 계획표 생성
function generatePlan() {
    const schoolLevel = document.getElementById('schoolLevel').value;
    const grade = document.getElementById('grade').value;
    const goal = document.getElementById('goal').value;
    const textbooks = collectTextbooks();
    const selectedDays = collectSelectedDays();
    
    // 유효성 검사
    if (!schoolLevel || !grade || !goal) {
        showToast('기본 정보를 모두 입력해주세요', 'error');
        return;
    }
    
    if (textbooks.length === 0) {
        showToast('최소 1개의 교재 정보를 입력해주세요', 'error');
        return;
    }
    
    if (selectedDays.length === 0) {
        showToast('최소 1개의 학습 요일을 선택해주세요', 'error');
        return;
    }
    
    showLoading();
    
    // 1달(30일) 분량의 계획 생성
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const plan = [];
    let currentPlanDate = new Date(startDate);
    
    // 각 교재별 진행 상황 추적
    const textbookProgress = textbooks.map(tb => ({
        ...tb,
        currentPage: 0,
        completed: false
    }));
    
    while (currentPlanDate <= endDate) {
        const dayName = dayNames[currentPlanDate.getDay()];
        
        // 선택된 요일인 경우에만 할 일 생성
        if (selectedDays.includes(dayName)) {
            const dailyTasks = [];
            
            textbookProgress.forEach(tb => {
                if (!tb.completed) {
                    const startPage = tb.currentPage + 1;
                    const endPage = Math.min(tb.currentPage + tb.daily, tb.pages);
                    
                    if (startPage <= tb.pages) {
                        dailyTasks.push({
                            id: generateUUID(),
                            date: formatDate(currentPlanDate),
                            task: `[${tb.subject}] ${tb.name} p.${startPage}-${endPage}`,
                            subject: tb.subject,
                            completed: false,
                            order: dailyTasks.length
                        });
                        
                        tb.currentPage = endPage;
                        
                        if (tb.currentPage >= tb.pages) {
                            tb.completed = true;
                        }
                    }
                }
            });
            
            plan.push(...dailyTasks);
        }
        
        currentPlanDate.setDate(currentPlanDate.getDate() + 1);
    }
    
    // 기존 태스크와 병합하여 저장
    let storedTasks = getLocalStorage('daily_tasks', []);
    
    // 생성된 기간의 기존 태스크 제거 (덮어쓰기)
    const planDates = [...new Set(plan.map(t => t.date))];
    storedTasks = storedTasks.filter(t => !planDates.includes(t.date));
    
    // 새 계획 추가
    storedTasks = [...storedTasks, ...plan];
    setLocalStorage('daily_tasks', storedTasks);
    
    // 생성된 계획 정보 저장
    generatedPlan = {
        schoolLevel,
        grade,
        goal,
        textbooks,
        selectedDays,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        totalTasks: plan.length
    };
    setLocalStorage('generated_plan', generatedPlan);
    
    hideLoading();
    
    // 계획표 생성 섹션 접기
    document.getElementById('planGeneratorSection').classList.add('collapsed');
    
    // 캘린더 표시
    showCalendar();
    
    // 현재 날짜 태스크 로드
    loadTasks();
    
    showToast(`1달 분량의 학습 계획이 생성되었습니다! (총 ${plan.length}개 할 일)`, 'success');
}

// 월간 캘린더 표시
function showCalendar() {
    const calendarSection = document.getElementById('calendarSection');
    const calendarGrid = document.getElementById('calendarGrid');
    
    calendarSection.style.display = 'block';
    calendarGrid.innerHTML = '';
    
    const storedTasks = getLocalStorage('daily_tasks', []);
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // 요일 헤더
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // 첫 주의 빈 칸
    const firstDayOfWeek = startOfMonth.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // 날짜들
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        const dateStr = formatDate(date);
        const dayTasks = storedTasks.filter(t => t.date === dateStr);
        const completedTasks = dayTasks.filter(t => t.completed);
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        if (dateStr === formatDate(today)) {
            dayDiv.classList.add('today');
        }
        
        if (dayTasks.length > 0) {
            dayDiv.classList.add('has-tasks');
            if (completedTasks.length === dayTasks.length) {
                dayDiv.classList.add('all-completed');
            }
        }
        
        dayDiv.innerHTML = `
            <span class="day-number">${day}</span>
            ${dayTasks.length > 0 ? `<span class="task-count">${completedTasks.length}/${dayTasks.length}</span>` : ''}
        `;
        
        dayDiv.addEventListener('click', () => {
            currentDate = new Date(date);
            updateDateDisplay();
            loadTasks();
            
            // 선택된 날짜 강조
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            dayDiv.classList.add('selected');
        });
        
        calendarGrid.appendChild(dayDiv);
    }
}

// 계획표 수정 모드 토글
function toggleEditMode() {
    const generatorSection = document.getElementById('planGeneratorSection');
    generatorSection.classList.toggle('collapsed');
    
    if (!generatorSection.classList.contains('collapsed')) {
        // 기존 계획 정보 로드
        const savedPlan = getLocalStorage('generated_plan', null);
        if (savedPlan) {
            document.getElementById('schoolLevel').value = savedPlan.schoolLevel || '';
            document.getElementById('grade').value = savedPlan.grade || '';
            document.getElementById('goal').value = savedPlan.goal || '';
            
            // 요일 체크박스 복원
            document.querySelectorAll('.days-selector input[type="checkbox"]').forEach(cb => {
                cb.checked = savedPlan.selectedDays?.includes(cb.value) || false;
            });
        }
    }
}

// Initialize planner page
document.addEventListener('DOMContentLoaded', () => {
    // Date navigation
    document.getElementById('prevDay').addEventListener('click', previousDay);
    document.getElementById('nextDay').addEventListener('click', nextDay);
    
    // Add task
    document.getElementById('addTaskButton').addEventListener('click', addTask);
    
    // Enter key to add task
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });
    
    // Clear completed tasks
    document.getElementById('clearCompletedBtn').addEventListener('click', clearCompletedTasks);
    
    // Add textbook button
    document.getElementById('addTextbookBtn').addEventListener('click', addTextbookInput);
    
    // Generate plan button
    document.getElementById('generatePlanBtn').addEventListener('click', generatePlan);
    
    // Edit plan button
    document.getElementById('editPlanBtn').addEventListener('click', toggleEditMode);
    
    // 기존 계획이 있는 경우 생성 섹션 접기
    const savedPlan = getLocalStorage('generated_plan', null);
    if (savedPlan) {
        document.getElementById('planGeneratorSection').classList.add('collapsed');
        showCalendar();
    }
    
    // Initialize
    updateDateDisplay();
    loadTasks();
});
