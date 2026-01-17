// Study page - Timer and white noise functionality

let timerInterval = null;
let timeRemaining = 25 * 60; // 25 minutes in seconds
let totalTime = 25 * 60;
let isRunning = false;
let currentMode = 'pomodoro';
let isPomodoroBreak = false;

// White noise audio elements (using Web Audio API oscillator for demo)
let audioContext = null;
let whiteNoiseNode = null;
let gainNode = null;
let currentNoise = 'off';

// Motivational quotes
const quotes = [
    "성공은 매일의 작은 노력이 만들어낸다.",
    "오늘의 노력이 내일의 기적을 만든다.",
    "포기하지 않으면 반드시 목표에 도달한다.",
    "집중력은 성공의 가장 중요한 요소다.",
    "하루하루 성장하는 자신을 믿어라.",
    "지금의 노력이 미래의 나를 만든다.",
    "꾸준함이 재능을 이긴다.",
    "시작이 반이다. 지금 시작하라!",
    "작은 성취가 모여 큰 성공을 만든다.",
    "오늘 할 수 있는 일을 내일로 미루지 마라."
];

// Initialize audio context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0.5;
    }
}

// Create white noise
function createWhiteNoise() {
    if (whiteNoiseNode) {
        whiteNoiseNode.stop();
    }
    
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    whiteNoiseNode = audioContext.createBufferSource();
    whiteNoiseNode.buffer = noiseBuffer;
    whiteNoiseNode.loop = true;
    whiteNoiseNode.connect(gainNode);
    whiteNoiseNode.start();
}

// Play white noise
function playWhiteNoise(type) {
    initAudioContext();
    
    if (type === 'off') {
        if (whiteNoiseNode) {
            whiteNoiseNode.stop();
            whiteNoiseNode = null;
        }
        currentNoise = 'off';
        return;
    }
    
    createWhiteNoise();
    currentNoise = type;
}

// Update volume
function updateVolume(value) {
    if (gainNode) {
        gainNode.gain.value = value / 100;
    }
}

// Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Update timer display
function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = formatTime(timeRemaining);
    
    const progressCircle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 130;
    const progress = (totalTime - timeRemaining) / totalTime;
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
}

// Start timer
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'inline-flex';
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            timerComplete();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('startButton').style.display = 'inline-flex';
    document.getElementById('pauseButton').style.display = 'none';
}

// Reset timer
function resetTimer() {
    pauseTimer();
    
    if (currentMode === 'pomodoro') {
        timeRemaining = isPomodoroBreak ? 5 * 60 : 25 * 60;
        totalTime = timeRemaining;
    } else {
        const customMinutes = parseInt(document.getElementById('customMinutes').value) || 25;
        timeRemaining = customMinutes * 60;
        totalTime = timeRemaining;
    }
    
    updateTimerDisplay();
    const progressCircle = document.getElementById('progressCircle');
    progressCircle.style.strokeDashoffset = 816.81;
}

// Timer complete
async function timerComplete() {
    pauseTimer();
    
    // Play notification sound (browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('타이머 완료!', {
            body: isPomodoroBreak ? '휴식 시간이 끝났습니다!' : '집중 시간이 끝났습니다!',
            icon: '/favicon.ico'
        });
    }
    
    // Save study session
    if (!isPomodoroBreak) {
        const duration = Math.floor(totalTime / 60);
        await saveStudySession(duration);
        await updateTodayTime();
        
        // 공부 완료 후 계획표로 이동 제안
        showCompletionModal(duration);
    }
    
    // Pomodoro mode: switch between work and break
    if (currentMode === 'pomodoro') {
        isPomodoroBreak = !isPomodoroBreak;
        
        if (isPomodoroBreak) {
            showToast('휴식 시간입니다! 5분간 쉬어가세요 😊', 'success');
            document.getElementById('timerLabel').textContent = '휴식 시간';
            timeRemaining = 5 * 60;
        } else {
            showToast('다시 집중할 시간입니다! 💪', 'success');
            document.getElementById('timerLabel').textContent = '집중 시간';
            timeRemaining = 25 * 60;
        }
        
        totalTime = timeRemaining;
        updateTimerDisplay();
    } else {
        showToast('타이머가 완료되었습니다! 🎉', 'success');
        resetTimer();
    }
}

// 공부 완료 모달 표시
function showCompletionModal(duration) {
    // 기존 모달 제거
    const existingModal = document.getElementById('completionModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'completionModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: fadeIn 0.3s ease;
        ">
            <div style="font-size: 4rem; margin-bottom: 15px;">🎉</div>
            <h2 style="color: #333; margin-bottom: 10px;">공부 완료!</h2>
            <p style="color: #666; margin-bottom: 20px;">
                ${duration}분 동안 열심히 공부했어요!<br>
                이제 완료한 항목을 체크해볼까요?
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="goToPlanner()" style="
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #4A90E2, #5FCFB5);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    <i class="fas fa-calendar-check"></i> 계획표로 이동
                </button>
                <button onclick="closeCompletionModal()" style="
                    padding: 12px 24px;
                    background: #E0E0E0;
                    color: #333;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                ">
                    계속 공부하기
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 계획표로 이동
function goToPlanner() {
    window.location.href = 'planner.html';
}

// 완료 모달 닫기
function closeCompletionModal() {
    const modal = document.getElementById('completionModal');
    if (modal) modal.remove();
}

// Save study session to database
async function saveStudySession(duration) {
    const today = formatDate(new Date());
    
    await createRecord('study_sessions', {
        id: generateUUID(),
        date: today,
        duration: duration,
        type: currentMode
    });
}

// Update today's study time
async function updateTodayTime() {
    const today = formatDate(new Date());
    const result = await fetchTableData('study_sessions', {
        limit: 100,
        sort: '-created_at'
    });
    
    if (result && result.data) {
        const todaySessions = result.data.filter(session => session.date === today);
        const totalMinutes = todaySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
        document.getElementById('todayTime').textContent = timeText;
    }
}

// Calculate study streak
async function calculateStreak() {
    const result = await fetchTableData('study_sessions', {
        limit: 1000,
        sort: '-created_at'
    });
    
    if (!result || !result.data || result.data.length === 0) {
        document.getElementById('studyStreak').textContent = '0일';
        return;
    }
    
    // Get unique dates
    const dates = [...new Set(result.data.map(session => session.date))].sort().reverse();
    
    let streak = 0;
    const today = formatDate(new Date());
    let checkDate = new Date(today);
    
    for (const dateStr of dates) {
        const sessionDate = formatDate(checkDate);
        
        if (dateStr === sessionDate) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    document.getElementById('studyStreak').textContent = `${streak}일`;
}

// Initialize study page
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Random motivational quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('motivationalQuote').textContent = `"${randomQuote}"`;
    
    // Mode selection
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            
            const customControls = document.getElementById('customTimerControls');
            if (currentMode === 'custom') {
                customControls.style.display = 'block';
                document.getElementById('timerLabel').textContent = '공부 시간';
            } else {
                customControls.style.display = 'none';
                document.getElementById('timerLabel').textContent = '집중 시간';
                isPomodoroBreak = false;
            }
            
            resetTimer();
        });
    });
    
    // Custom minutes change
    document.getElementById('customMinutes').addEventListener('change', () => {
        if (currentMode === 'custom') {
            resetTimer();
        }
    });
    
    // Timer controls
    document.getElementById('startButton').addEventListener('click', startTimer);
    document.getElementById('pauseButton').addEventListener('click', pauseTimer);
    document.getElementById('resetButton').addEventListener('click', resetTimer);
    
    // White noise selection
    const noiseButtons = document.querySelectorAll('.noise-btn');
    noiseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            noiseButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playWhiteNoise(btn.dataset.noise);
            
            if (btn.dataset.noise !== 'off') {
                showToast(`${btn.querySelector('span').textContent} 백색소음이 재생됩니다`, 'info');
            }
        });
    });
    
    // Volume control
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        updateVolume(e.target.value);
    });
    
    // Initialize display
    updateTimerDisplay();
    updateTodayTime();
    calculateStreak();
    
    // Update stats every minute
    setInterval(() => {
        updateTodayTime();
        calculateStreak();
    }, 60000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (whiteNoiseNode) {
        whiteNoiseNode.stop();
    }
    if (audioContext) {
        audioContext.close();
    }
});
