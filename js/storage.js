// SOC L1 Alert Tracker - Storage and State Management Layer
import {
  generateInitialAlerts,
  generateInitialSlaLogs,
  DEFAULT_SETTINGS
} from './models.js';

const STORAGE_KEYS = {
  ALERTS: 'soc_alerts_v1',
  SLA_LOGS: 'soc_daily_sla_logs_v1',
  SETTINGS: 'soc_settings_v1',
  DAILY_NOTES: 'soc_daily_notes_v1'
};

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(generateInitialAlerts()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SLA_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.SLA_LOGS, JSON.stringify(generateInitialSlaLogs()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_NOTES)) {
      localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify({}));
    }
  }

  // --- ALERTS CRUD ---
  getAlerts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse alerts from storage:', e);
      return [];
    }
  }

  saveAlerts(alerts) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'alerts' } }));
  }

  getNextAlertId() {
    const alerts = this.getAlerts();
    if (alerts.length === 0) return 'ALT-0001';

    let maxNum = 0;
    alerts.forEach(a => {
      if (a.id && a.id.startsWith('ALT-')) {
        const num = parseInt(a.id.replace('ALT-', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    return `ALT-${String(maxNum + 1).padStart(4, '0')}`;
  }

  createAlert(alertData) {
    const alerts = this.getAlerts();
    const newAlert = {
      ...alertData,
      id: this.getNextAlertId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    alerts.unshift(newAlert);
    this.saveAlerts(alerts);
    return newAlert;
  }

  updateAlert(id, updatedFields) {
    const alerts = this.getAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index === -1) return null;

    alerts[index] = {
      ...alerts[index],
      ...updatedFields,
      updated_at: new Date().toISOString()
    };
    this.saveAlerts(alerts);
    return alerts[index];
  }

  deleteAlert(id) {
    let alerts = this.getAlerts();
    const prevLen = alerts.length;
    alerts = alerts.filter(a => a.id !== id);
    if (alerts.length !== prevLen) {
      this.saveAlerts(alerts);
      return true;
    }
    return false;
  }

  // --- DAILY SLA LOGS CRUD ---
  getSlaLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SLA_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse SLA logs from storage:', e);
      return [];
    }
  }

  saveSlaLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.SLA_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'sla_logs' } }));
  }

  upsertSlaLog(logEntry) {
    const logs = this.getSlaLogs();
    const index = logs.findIndex(l => l.log_date === logEntry.log_date);

    if (index >= 0) {
      logs[index] = {
        ...logs[index],
        ...logEntry
      };
    } else {
      const newEntry = {
        id: `SLA-${logEntry.log_date.replace(/-/g, '')}`,
        ...logEntry
      };
      logs.push(newEntry);
    }

    // Sort by log_date descending
    logs.sort((a, b) => b.log_date.localeCompare(a.log_date));
    this.saveSlaLogs(logs);
    return true;
  }

  deleteSlaLog(idOrDate) {
    let logs = this.getSlaLogs();
    const prevLen = logs.length;
    logs = logs.filter(l => l.id !== idOrDate && l.log_date !== idOrDate);
    if (logs.length !== prevLen) {
      this.saveSlaLogs(logs);
      return true;
    }
    return false;
  }

  // --- SETTINGS ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(fields) {
    const settings = { ...this.getSettings(), ...fields };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'settings' } }));
    return settings;
  }

  // --- DAILY REMARKS / OBSERVATIONS FOR TL ---
  getDailyRemarks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_NOTES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  getRemarkForDate(dateStr) {
    const remarks = this.getDailyRemarks();
    return remarks[dateStr] || '';
  }

  saveRemarkForDate(dateStr, noteText) {
    const remarks = this.getDailyRemarks();
    remarks[dateStr] = noteText;
    localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify(remarks));
    window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'daily_notes' } }));
  }

  // --- UTILITIES: RESET, EXPORT, IMPORT ---
  resetToSampleData() {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(generateInitialAlerts()));
    localStorage.setItem(STORAGE_KEYS.SLA_LOGS, JSON.stringify(generateInitialSlaLogs()));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify({}));
    window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'all' } }));
  }

  clearAllData() {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SLA_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify({}));
    window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'all' } }));
  }

  exportAllJson() {
    const payload = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      alerts: this.getAlerts(),
      sla_logs: this.getSlaLogs(),
      settings: this.getSettings(),
      daily_notes: this.getDailyRemarks()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soc-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportAlertsCsv(selectedDate = null) {
    let alerts = this.getAlerts();
    if (selectedDate) {
      alerts = alerts.filter(a => a.alert_date === selectedDate);
    }
    const headers = [
      'ID',
      'Alert Date',
      'Alert Time',
      'Source',
      'Alert Type',
      'Severity',
      'Status',
      'Escalated',
      'Escalated To',
      'Resolution Time',
      'Remarks',
      'Created At',
      'Updated At'
    ];

    const rows = alerts.map(a => [
      `"${a.id}"`,
      `"${a.alert_date}"`,
      `"${a.alert_time}"`,
      `"${a.source}"`,
      `"${a.alert_type}"`,
      `"${a.severity}"`,
      `"${a.status}"`,
      `"${a.escalated ? 'Yes' : 'No'}"`,
      `"${a.escalated_to || ''}"`,
      `"${a.resolution_time || ''}"`,
      `"${(a.remarks || '').replace(/"/g, '""')}"`,
      `"${a.created_at}"`,
      `"${a.updated_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soc-alerts-${selectedDate || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const storage = new StorageService();
