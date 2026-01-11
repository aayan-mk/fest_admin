// Simple local activity log store for frontend
// In a real app, this would be replaced by backend API calls

const LOG_KEY = 'activity_logs';

export function getLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY)) || [];
  } catch {
    return [];
  }
}

export function addLog(message) {
  const logs = getLogs();
  logs.unshift({ message, time: new Date().toISOString() });
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 100)));
}
