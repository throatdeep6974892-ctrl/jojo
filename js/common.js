// Common utility functions and API helpers

// API Configuration
const API_BASE = 'tables';

// Date formatting utility
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateKorean(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Table API Functions
async function fetchTableData(tableName, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE}/${tableName}${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching table data:', error);
        return null;
    }
}

async function getRecordById(tableName, recordId) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`);
        if (!response.ok) {
            throw new Error(`Failed to get record: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting record:', error);
        return null;
    }
}

async function createRecord(tableName, data) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to create record: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating record:', error);
        return null;
    }
}

async function updateRecord(tableName, recordId, data) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to update record: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating record:', error);
        return null;
    }
}

async function patchRecord(tableName, recordId, data) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to patch record: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error patching record:', error);
        return null;
    }
}

async function deleteRecord(tableName, recordId) {
    try {
        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete record: ${response.statusText}`);
        }
        return true;
    } catch (error) {
        console.error('Error deleting record:', error);
        return false;
    }
}

// Local Storage Helpers
function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error writing to localStorage:', error);
        return false;
    }
}

// Toast notification (simple)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#28A745' : type === 'error' ? '#DC3545' : '#4A90E2'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
if (!document.querySelector('#toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading indicator
function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    loading.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4A90E2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <p style="color: #333; font-weight: 500;">로딩 중...</p>
        </div>
    `;
    
    if (!document.querySelector('#loading-animation')) {
        const style = document.createElement('style');
        style.id = 'loading-animation';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('global-loading');
    if (loading) {
        loading.remove();
    }
}
