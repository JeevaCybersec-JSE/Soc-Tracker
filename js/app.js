// SOC L1 Alert Tracker - Main Application Orchestrator
import { storage } from './storage.js';
import {
  SOURCES,
  ALERT_TYPES,
  SEVERITIES,
  STATUSES,
  ESCALATED_TEAMS,
  getTodayDateStr,
  getCurrentTimeStr
} from './models.js';
import { initPage1, updatePage1Data } from './page1-daily.js';
import { initPage2, updatePage2Data } from './page2-monthly.js';

class SocApplication {
  constructor() {
    this.currentTab = 'page1'; // 'page1' or 'page2'
    this.editingAlert = null;
  }

  init() {
    this.setupNavigation();
    this.setupGlobalModals();
    this.setupDataListeners();
    this.setupQuickActions();

    // Start with Page 1 active
    initPage1();
    initPage2();
    this.switchTab('page1');

    // Periodic time check / refresher every 60s
    setInterval(() => {
      if (this.currentTab === 'page1') {
        const refreshedEl = document.getElementById('last-refreshed-time');
        if (refreshedEl) {
          refreshedEl.textContent = `Refreshed ${getCurrentTimeStr()}`;
        }
      }
    }, 60000);
  }

  setupNavigation() {
    const tab1Btn = document.getElementById('nav-tab-page1');
    const tab2Btn = document.getElementById('nav-tab-page2');

    if (tab1Btn) {
      tab1Btn.addEventListener('click', () => this.switchTab('page1'));
    }
    if (tab2Btn) {
      tab2Btn.addEventListener('click', () => this.switchTab('page2'));
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    const page1 = document.getElementById('page1-container');
    const page2 = document.getElementById('page2-container');
    const tab1Btn = document.getElementById('nav-tab-page1');
    const tab2Btn = document.getElementById('nav-tab-page2');

    if (tabId === 'page1') {
      page1.classList.remove('hidden');
      page2.classList.add('hidden');

      tab1Btn.className = 'px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-white bg-slate-800 border-b-2 border-cyan-400 shadow-sm flex items-center gap-2';
      tab2Btn.className = 'px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2';

      updatePage1Data();
    } else {
      page1.classList.add('hidden');
      page2.classList.remove('hidden');

      tab2Btn.className = 'px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-white bg-slate-800 border-b-2 border-blue-400 shadow-sm flex items-center gap-2';
      tab1Btn.className = 'px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2';

      updatePage2Data();
    }
  }

  setupDataListeners() {
    window.addEventListener('soc:data-changed', (e) => {
      if (this.currentTab === 'page1') {
        updatePage1Data();
      } else {
        updatePage2Data();
      }
    });
  }

  setupGlobalModals() {
    // Alert Form Modal Setup
    const modal = document.getElementById('alert-modal');
    const modalBackdrop = document.getElementById('alert-modal-backdrop');
    const btnClose = document.getElementById('btn-close-alert-modal');
    const form = document.getElementById('alert-form');

    const closeModal = () => {
      modal.classList.add('hidden');
      this.editingAlert = null;
    };

    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);

    // Escalated checkbox toggles Escalated To requirement
    const escalatedCheckbox = document.getElementById('modal-alert-escalated');
    const escalatedToGroup = document.getElementById('modal-escalated-to-group');
    const escalatedToSelect = document.getElementById('modal-alert-escalated-to');

    if (escalatedCheckbox) {
      escalatedCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          escalatedToGroup.classList.remove('opacity-40');
          escalatedToSelect.disabled = false;
        } else {
          escalatedToGroup.classList.add('opacity-40');
          escalatedToSelect.disabled = true;
          escalatedToSelect.value = '';
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveAlertFromModal();
        closeModal();
      });
    }
  }

  openAlertModal(alertToEdit = null, defaultDate = null) {
    this.editingAlert = alertToEdit;
    const modal = document.getElementById('alert-modal');
    const titleEl = document.getElementById('alert-modal-title');
    const subtitleEl = document.getElementById('alert-modal-subtitle');

    const dateInput = document.getElementById('modal-alert-date');
    const timeInput = document.getElementById('modal-alert-time');
    const sourceSelect = document.getElementById('modal-alert-source');
    const typeSelect = document.getElementById('modal-alert-type');
    const severitySelect = document.getElementById('modal-alert-severity');
    const statusSelect = document.getElementById('modal-alert-status');
    const escalatedCheckbox = document.getElementById('modal-alert-escalated');
    const escalatedToSelect = document.getElementById('modal-alert-escalated-to');
    const resolutionInput = document.getElementById('modal-alert-resolution');
    const remarksInput = document.getElementById('modal-alert-remarks');

    // Populate dropdowns if empty
    if (sourceSelect.options.length <= 1) {
      sourceSelect.innerHTML = SOURCES.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    if (typeSelect.options.length <= 1) {
      typeSelect.innerHTML = ALERT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    if (severitySelect.options.length <= 1) {
      severitySelect.innerHTML = SEVERITIES.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    if (statusSelect.options.length <= 1) {
      statusSelect.innerHTML = STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    if (escalatedToSelect.options.length <= 1) {
      escalatedToSelect.innerHTML = '<option value="">None / Not Escalated</option>' + 
        ESCALATED_TEAMS.map(team => `<option value="${team}">${team}</option>`).join('');
    }

    if (alertToEdit) {
      titleEl.textContent = `Edit Alert — ${alertToEdit.id}`;
      subtitleEl.textContent = `Created at ${new Date(alertToEdit.created_at).toLocaleString()}`;
      dateInput.value = alertToEdit.alert_date;
      timeInput.value = alertToEdit.alert_time;
      sourceSelect.value = alertToEdit.source;
      typeSelect.value = alertToEdit.alert_type;
      severitySelect.value = alertToEdit.severity;
      statusSelect.value = alertToEdit.status;
      escalatedCheckbox.checked = !!alertToEdit.escalated;
      escalatedToSelect.value = alertToEdit.escalated_to || '';
      resolutionInput.value = alertToEdit.resolution_time || '';
      remarksInput.value = alertToEdit.remarks || '';
    } else {
      titleEl.textContent = 'Log New Security Alert';
      subtitleEl.textContent = `New ID will be auto-generated (${storage.getNextAlertId()})`;
      dateInput.value = defaultDate || getTodayDateStr();
      timeInput.value = getCurrentTimeStr();
      sourceSelect.value = SOURCES[0];
      typeSelect.value = ALERT_TYPES[0];
      severitySelect.value = 'Medium';
      statusSelect.value = 'New';
      escalatedCheckbox.checked = false;
      escalatedToSelect.value = '';
      resolutionInput.value = '';
      remarksInput.value = '';
    }

    // Trigger escalated visibility sync
    escalatedCheckbox.dispatchEvent(new Event('change'));

    modal.classList.remove('hidden');
  }

  saveAlertFromModal() {
    const alertData = {
      alert_date: document.getElementById('modal-alert-date').value,
      alert_time: document.getElementById('modal-alert-time').value,
      source: document.getElementById('modal-alert-source').value,
      alert_type: document.getElementById('modal-alert-type').value,
      severity: document.getElementById('modal-alert-severity').value,
      status: document.getElementById('modal-alert-status').value,
      escalated: document.getElementById('modal-alert-escalated').checked,
      escalated_to: document.getElementById('modal-alert-escalated').checked 
        ? (document.getElementById('modal-alert-escalated-to').value || null)
        : null,
      resolution_time: document.getElementById('modal-alert-resolution').value.trim() || null,
      remarks: document.getElementById('modal-alert-remarks').value.trim()
    };

    if (this.editingAlert) {
      storage.updateAlert(this.editingAlert.id, alertData);
      this.showToast(`Alert ${this.editingAlert.id} updated successfully!`);
    } else {
      const created = storage.createAlert(alertData);
      this.showToast(`Alert ${created.id} created successfully!`);
    }

    if (this.currentTab === 'page1') {
      updatePage1Data();
    } else {
      updatePage2Data();
    }
  }

  setupQuickActions() {
    // Reset Data button
    const btnResetData = document.getElementById('btn-reset-sample-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Reset tracker to realistic SOC demo alerts and SLA logs? Any manual additions will be replaced.')) {
          storage.resetToSampleData();
          this.showToast('Demo dataset loaded successfully');
        }
      });
    }

    // Clear All button
    const btnClearData = document.getElementById('btn-clear-all-data');
    if (btnClearData) {
      btnClearData.addEventListener('click', () => {
        if (confirm('Are you sure you want to wipe ALL alerts and SLA records? This will leave the tracker completely blank.')) {
          storage.clearAllData();
          this.showToast('All alerts and SLA records cleared');
        }
      });
    }

    // Backup JSON button
    const btnBackup = document.getElementById('btn-backup-json');
    if (btnBackup) {
      btnBackup.addEventListener('click', () => {
        storage.exportAllJson();
      });
    }
  }

  showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'soc-card px-4 py-2.5 rounded-lg border-l-4 border-l-cyan-400 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0';
    toast.innerHTML = `
      <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

window.socApp = new SocApplication();
document.addEventListener('DOMContentLoaded', () => {
  window.socApp.init();
});
