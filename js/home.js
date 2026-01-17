// Home page functionality

// Update today's study time
async function updateTodayStudyTime() {
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
        document.getElementById('todayStudyTime').textContent = timeText;
    }
}

// Update today's tasks count
async function updateTodayTasks() {
    const today = formatDate(new Date());
    const result = await fetchTableData('daily_tasks', {
        limit: 100,
        sort: 'order'
    });
    
    if (result && result.data) {
        const todayTasks = result.data.filter(task => task.date === today);
        const completedTasks = todayTasks.filter(task => task.completed).length;
        const totalTasks = todayTasks.length;
        
        document.getElementById('todayTasks').textContent = 
            totalTasks > 0 ? `${completedTasks}/${totalTasks}개` : '0개';
    }
}

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    updateTodayStudyTime();
    updateTodayTasks();
    
    // Refresh every minute
    setInterval(() => {
        updateTodayStudyTime();
        updateTodayTasks();
    }, 60000);
});
