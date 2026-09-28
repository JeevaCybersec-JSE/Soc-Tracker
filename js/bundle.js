// SOC L1 Alert Tracker - JK CYBER COMMAND EXECUTIVE LIGHT EDITION
// Dynamic Animated Cyber Mesh Canvas + Full-Width Fluid Console + Configurable Telemetry Sources & Clients
(function() {
  'use strict';

  // Default Baseline Telemetry Sources (Only Wazuh, Sophos, CrowdStrike)
  const DEFAULT_SOURCES = [
    'Wazuh',
    'Sophos',
    'CrowdStrike'
  ];

  // Default Baseline Clients (Wazuh & Sophos specific options)
  const DEFAULT_CLIENTS = {
    Wazuh: ['Giib', 'Indicosmic', 'Quantique'],
    Sophos: ['NGM', 'Brysa', 'mirror'],
    CrowdStrike: ['Internal Enterprise', 'Tenant Alpha', 'Tenant Beta'],
    Other: ['Internal Enterprise', 'Client Alpha', 'Client Beta']
  };

  const ALERT_TYPES = [
    'Malware Detection',
    'Phishing',
    'Brute Force',
    'Multiple Failed Login',
    'Successful Login',
    'Unauthorized Access',
    'Port Scan',
    'Suspicious Network Traffic',
    'Privilege Escalation',
    'Endpoint Security',
    'Policy Violation',
    'Data Exfiltration',
    'Other'
  ];

  const SEVERITIES = [
    'Critical',
    'High',
    'Medium',
    'Low',
    'Informational'
  ];

  const STATUSES = [
    'New',
    'Acknowledged',
    'Investigating',
    'Escalated',
    'Resolved',
    'Closed',
    'False Positive'
  ];

  const ESCALATED_TEAMS = [
    'SOC L2',
    'SOC Lead',
    'Incident Response Team',
    'IT Team',
    'Network Team',
    'Security Team',
    'Other'
  ];

  // Refined Light Theme Color Palette with high-contrast text and crisp pastel pills
  const SEVERITY_COLORS = {
    Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', hex: '#dc2626', sla: '15m SLA' },
    High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', hex: '#ea580c', sla: '30m SLA' },
    Medium: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', hex: '#d97706', sla: '1h SLA' },
    Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', hex: '#059669', sla: '4h SLA' },
    Informational: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', hex: '#475569', sla: 'Standard' }
  };

  const STATUS_COLORS = {
    New: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300', hex: '#0284c7' },
    Acknowledged: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', hex: '#4f46e5' },
    Investigating: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', hex: '#d97706' },
    Escalated: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', hex: '#e11d48' },
    Resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', hex: '#059669' },
    Closed: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', hex: '#64748b' },
    'False Positive': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', hex: '#9333ea' }
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // --- DATE & TIME HELPER FUNCTIONS ---
  function getTodayDateStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDateShifted(days) {
    const d = new Date(Date.now() + days * 86400000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  }

  // 12-Hour Time with AM / PM formatting
  function getCurrentTime12h() {
    const d = new Date();
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    const minsStr = String(d.getMinutes()).padStart(2, '0');
    const secsStr = String(d.getSeconds()).padStart(2, '0');
    return {
      time: `${hoursStr}:${minsStr}:${secsStr}`,
      ampm: ampm,
      full: `${hoursStr}:${minsStr}:${secsStr} ${ampm}`
    };
  }

  function parseTime12h(timeStr) {
    if (!timeStr) return getCurrentTime12h();
    const str = String(timeStr).trim();

    const matchAmpm = str.match(/^(.*?)\s*(AM|PM)$/i);
    if (matchAmpm) {
      let t = matchAmpm[1].trim();
      let ap = matchAmpm[2].toUpperCase();
      const parts = t.split(':');
      if (parts.length >= 2) {
        let h = String(parseInt(parts[0], 10) || 12).padStart(2, '0');
        let m = String(parseInt(parts[1], 10) || 0).padStart(2, '0');
        let s = parts[2] ? String(parseInt(parts[2], 10) || 0).padStart(2, '0') : '00';
        return { time: `${h}:${m}:${s}`, ampm: ap, full: `${h}:${m}:${s} ${ap}` };
      }
      return { time: t, ampm: ap, full: `${t} ${ap}` };
    }

    const parts = str.split(':');
    if (parts.length >= 2) {
      let h24 = parseInt(parts[0], 10) || 0;
      let m = String(parseInt(parts[1], 10) || 0).padStart(2, '0');
      let s = parts[2] ? String(parseInt(parts[2], 10) || 0).padStart(2, '0') : '00';
      const ap = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      h12 = h12 ? h12 : 12;
      let hStr = String(h12).padStart(2, '0');
      return { time: `${hStr}:${m}:${s}`, ampm: ap, full: `${hStr}:${m}:${s} ${ap}` };
    }

    return getCurrentTime12h();
  }

  function formatDisplayTime(timeStr) {
    if (!timeStr) return '--:--';
    return parseTime12h(timeStr).full;
  }

  // --- PERSISTENT STORAGE SERVICE ---
  const STORAGE_KEYS = {
    ALERTS: 'jk_soc_alerts_v3_clean',
    SLA_LOGS: 'jk_soc_sla_logs_v3_clean',
    SETTINGS: 'jk_soc_settings_v3_clean',
    DAILY_NOTES: 'jk_soc_daily_notes_v3_clean'
  };

  class PersistentStorageService {
    constructor() {
      this.isServerConnected = false;
      this.cache = {
        alerts: [],
        sla_logs: [],
        settings: {
          target_sla_pct: 90,
          sources: [...DEFAULT_SOURCES],
          clients: JSON.parse(JSON.stringify(DEFAULT_CLIENTS))
        },
        daily_notes: {}
      };
      this.init();
    }

    async init() {
      try {
        const localAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
        const localSla = localStorage.getItem(STORAGE_KEYS.SLA_LOGS);
        const localSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const localNotes = localStorage.getItem(STORAGE_KEYS.DAILY_NOTES);

        if (localAlerts) {
          try {
            const parsed = JSON.parse(localAlerts);
            this.cache.alerts = Array.isArray(parsed) ? parsed : [];
          } catch (_) {
            this.cache.alerts = [];
          }
        } else {
          this.cache.alerts = [];
        }

        if (localSla) {
          try {
            const parsed = JSON.parse(localSla);
            this.cache.sla_logs = Array.isArray(parsed) ? parsed : [];
          } catch (_) {
            this.cache.sla_logs = [];
          }
        } else {
          this.cache.sla_logs = [];
        }

        if (localSettings) {
          try {
            const parsed = JSON.parse(localSettings);
            this.cache.settings = {
              target_sla_pct: parsed.target_sla_pct || 90,
              sources: (parsed.sources && parsed.sources.length) ? parsed.sources : [...DEFAULT_SOURCES],
              clients: (parsed.clients && Object.keys(parsed.clients).length) ? parsed.clients : JSON.parse(JSON.stringify(DEFAULT_CLIENTS)),
              alert_types: (parsed.alert_types && parsed.alert_types.length) ? parsed.alert_types : [...ALERT_TYPES],
              escalated_teams: (parsed.escalated_teams && parsed.escalated_teams.length) ? parsed.escalated_teams : [...ESCALATED_TEAMS]
            };
          } catch (_) {}
        }
        if (localNotes) {
          try {
            this.cache.daily_notes = JSON.parse(localNotes) || {};
          } catch (_) {
            this.cache.daily_notes = {};
          }
        }
      } catch (e) {
        this.cache.alerts = [];
        this.cache.sla_logs = [];
      }

      await this.syncWithDatabase();
    }

    async syncWithDatabase() {
      try {
        const res = await fetch('/api/db', { cache: 'no-store' });
        if (res.ok) {
          const resData = await res.json();
          const dbData = (resData && resData.data) ? resData.data : resData;
          if (dbData && Array.isArray(dbData.alerts)) {
            this.cache.alerts = dbData.alerts;
            this.cache.sla_logs = Array.isArray(dbData.sla_logs) ? dbData.sla_logs : [];
            
            const s = dbData.settings || {};
            this.cache.settings = {
              target_sla_pct: s.target_sla_pct || 90,
              sources: (s.sources && s.sources.length) ? s.sources : (this.cache.settings.sources || [...DEFAULT_SOURCES]),
              clients: (s.clients && Object.keys(s.clients).length) ? s.clients : (this.cache.settings.clients || JSON.parse(JSON.stringify(DEFAULT_CLIENTS))),
              alert_types: (s.alert_types && s.alert_types.length) ? s.alert_types : (this.cache.settings.alert_types || [...ALERT_TYPES]),
              escalated_teams: (s.escalated_teams && s.escalated_teams.length) ? s.escalated_teams : (this.cache.settings.escalated_teams || [...ESCALATED_TEAMS])
            };

            this.cache.daily_notes = dbData.daily_notes || {};
            this.saveToLocalStorage();
            this.isServerConnected = true;
            this.updateDbStatusBadge(true);
            window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'all' } }));
            return true;
          }
        }
      } catch (err) {}

      this.isServerConnected = false;
      this.updateDbStatusBadge(false);
      return false;
    }

    updateDbStatusBadge(isOnline) {
      const badge = document.getElementById('db-status-badge');
      if (!badge) return;
      if (isOnline) {
        badge.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>DB SAFE: DISK ON</span>
        `;
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono-code flex items-center gap-1.5 shadow-sm';
        badge.title = 'Data permanently saved in data/soc_database.json (Safe against reboot/refresh)';
      } else {
        badge.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          <span>LOCAL READY</span>
        `;
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-sky-100 text-sky-800 border border-sky-300 font-mono-code flex items-center gap-1.5 shadow-sm';
        badge.title = 'Saved to browser local storage. Double-click start-server.bat for permanent disk sync.';
      }
    }

    saveToLocalStorage() {
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(this.cache.alerts));
        localStorage.setItem(STORAGE_KEYS.SLA_LOGS, JSON.stringify(this.cache.sla_logs));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.cache.settings));
        localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify(this.cache.daily_notes));
      } catch (e) {}
    }

    // --- CONFIGURED SOURCES & CLIENTS MANAGEMENT ---
    getSources() {
      return (this.cache.settings && this.cache.settings.sources && this.cache.settings.sources.length)
        ? this.cache.settings.sources
        : DEFAULT_SOURCES;
    }

    addSource(sourceName) {
      const trimmed = sourceName.trim();
      if (!trimmed) return false;
      const sources = this.getSources();
      if (!sources.includes(trimmed)) {
        sources.push(trimmed);
        this.cache.settings.sources = sources;
        this.saveSettings(this.cache.settings);
        return true;
      }
      return false;
    }

    deleteSource(sourceName) {
      let sources = this.getSources();
      if (sources.length <= 1) {
        alert('You must keep at least one telemetry source.');
        return false;
      }
      sources = sources.filter(s => s !== sourceName);
      this.cache.settings.sources = sources;
      this.saveSettings(this.cache.settings);
      return true;
    }

    getClients() {
      return (this.cache.settings && this.cache.settings.clients)
        ? this.cache.settings.clients
        : DEFAULT_CLIENTS;
    }

    getClientsForSource(source) {
      const clients = this.getClients();
      if (clients && clients[source] && Array.isArray(clients[source]) && clients[source].length) return clients[source];
      if (source === 'Wazuh') return (clients && clients.Wazuh) || DEFAULT_CLIENTS.Wazuh;
      if (source === 'Sophos') return (clients && clients.Sophos) || DEFAULT_CLIENTS.Sophos;
      if (source === 'CrowdStrike') return (clients && clients.CrowdStrike) || DEFAULT_CLIENTS.CrowdStrike;
      return (clients && clients.Other) || DEFAULT_CLIENTS.Other || ['Internal Enterprise', 'Tenant Alpha'];
    }

    addClientToSource(source, clientName) {
      const trimmed = clientName.trim();
      if (!trimmed) return false;
      const allClients = this.getClients();
      if (!allClients[source]) allClients[source] = [];
      if (!allClients[source].includes(trimmed)) {
        allClients[source].push(trimmed);
        this.cache.settings.clients = allClients;
        this.saveSettings(this.cache.settings);
        return true;
      }
      return false;
    }

    renameClientInSource(source, oldName, newName) {
      const trimmed = newName.trim();
      if (!trimmed) return false;
      const allClients = this.getClients();
      if (!allClients[source]) return false;
      const idx = allClients[source].indexOf(oldName);
      if (idx !== -1) {
        allClients[source][idx] = trimmed;
        this.cache.settings.clients = allClients;
        this.saveSettings(this.cache.settings);
        return true;
      }
      return false;
    }

    deleteClientFromSource(source, clientName) {
      const allClients = this.getClients();
      if (!allClients[source]) return false;
      allClients[source] = allClients[source].filter(c => c !== clientName);
      this.cache.settings.clients = allClients;
      this.saveSettings(this.cache.settings);
      return true;
    }

    // --- CONFIGURED ALERT TYPES MANAGEMENT ---
    getAlertTypes() {
      return (this.cache.settings && this.cache.settings.alert_types && this.cache.settings.alert_types.length)
        ? this.cache.settings.alert_types
        : ALERT_TYPES;
    }

    addAlertType(type) {
      const trimmed = type.trim();
      if (!trimmed) return false;
      const list = this.getAlertTypes();
      if (!list.includes(trimmed)) {
        list.push(trimmed);
        this.cache.settings.alert_types = list;
        this.saveSettings(this.cache.settings);
        return true;
      }
      return false;
    }

    deleteAlertType(type) {
      let list = this.getAlertTypes();
      if (list.length <= 1) {
        alert('You must keep at least one alert category.');
        return false;
      }
      list = list.filter(t => t !== type);
      this.cache.settings.alert_types = list;
      this.saveSettings(this.cache.settings);
      return true;
    }

    // --- CONFIGURED ESCALATED TEAMS MANAGEMENT ---
    getEscalatedTeams() {
      return (this.cache.settings && this.cache.settings.escalated_teams && this.cache.settings.escalated_teams.length)
        ? this.cache.settings.escalated_teams
        : ESCALATED_TEAMS;
    }

    addEscalatedTeam(team) {
      const trimmed = team.trim();
      if (!trimmed) return false;
      const list = this.getEscalatedTeams();
      if (!list.includes(trimmed)) {
        list.push(trimmed);
        this.cache.settings.escalated_teams = list;
        this.saveSettings(this.cache.settings);
        return true;
      }
      return false;
    }

    deleteEscalatedTeam(team) {
      let list = this.getEscalatedTeams();
      if (list.length <= 1) {
        alert('You must keep at least one escalation team.');
        return false;
      }
      list = list.filter(t => t !== team);
      this.cache.settings.escalated_teams = list;
      this.saveSettings(this.cache.settings);
      return true;
    }

    // --- ALERTS CRUD ---
    getAlerts() {
      if (!this.cache) this.cache = {};
      if (!Array.isArray(this.cache.alerts)) this.cache.alerts = [];
      const today = getTodayDateStr();
      return this.cache.alerts.filter(a => a && typeof a === 'object').map(a => {
        let d = a.alert_date;
        if (!d && a.created_at) {
          d = String(a.created_at).split('T')[0];
        }
        if (!d) d = today;
        return {
          ...a,
          alert_date: d,
          source: a.source || 'Wazuh',
          client: a.client || 'Giib',
          endpoint_name: a.endpoint_name || 'WS-ENDPOINT-01',
          ip_address: a.ip_address || '192.168.1.50',
          severity: a.severity || 'Medium',
          status: a.status || 'New',
          alert_type: a.alert_type || 'Malware Detection',
          alert_time: a.alert_time || '12:00:00 PM',
          level: (a.level !== undefined && a.level !== null && !isNaN(parseInt(a.level, 10))) ? parseInt(a.level, 10) : 1
        };
      });
    }

    getNextAlertId() {
      const alerts = this.getAlerts();
      if (!alerts || alerts.length === 0) return 'ALT-0001';

      let maxNum = 0;
      alerts.forEach(a => {
        if (a && a.id && a.id.startsWith('ALT-')) {
          const num = parseInt(a.id.replace('ALT-', ''), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      return `ALT-${String(maxNum + 1).padStart(4, '0')}`;
    }

    createAlert(alertData) {
      if (!this.cache) this.cache = {};
      if (!Array.isArray(this.cache.alerts)) this.cache.alerts = [];

      const newAlert = {
        ...alertData,
        id: alertData.id || this.getNextAlertId(),
        alert_date: alertData.alert_date || getTodayDateStr(),
        client: alertData.client || 'Internal Enterprise',
        endpoint_name: alertData.endpoint_name || 'WS-ENDPOINT-01',
        ip_address: alertData.ip_address || '192.168.1.50',
        alert_time: alertData.alert_time || getCurrentTime12h().full,
        level: (alertData.level !== undefined && alertData.level !== null) ? parseInt(alertData.level, 10) : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.cache.alerts.unshift(newAlert);
      this.saveToLocalStorage();

      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      }).then(() => this.updateDbStatusBadge(true)).catch(() => this.updateDbStatusBadge(false));

      window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'alerts' } }));
      return newAlert;
    }

    updateAlert(id, updatedFields) {
      if (!this.cache) this.cache = {};
      if (!Array.isArray(this.cache.alerts)) this.cache.alerts = [];

      const index = this.cache.alerts.findIndex(a => a && a.id === id);
      if (index === -1) return null;

      this.cache.alerts[index] = {
        ...this.cache.alerts[index],
        ...updatedFields,
        updated_at: new Date().toISOString()
      };
      this.saveToLocalStorage();

      fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      }).then(() => this.updateDbStatusBadge(true)).catch(() => this.updateDbStatusBadge(false));

      window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'alerts' } }));
      return this.cache.alerts[index];
    }

    deleteAlert(id) {
      if (!this.cache) this.cache = {};
      if (!Array.isArray(this.cache.alerts)) this.cache.alerts = [];

      const prevLen = this.cache.alerts.length;
      this.cache.alerts = this.cache.alerts.filter(a => a && a.id !== id);
      if (this.cache.alerts.length !== prevLen) {
        this.saveToLocalStorage();
        fetch(`/api/alerts/${id}`, { method: 'DELETE' }).catch(() => {});
        window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'alerts' } }));
        return true;
      }
      return false;
    }

    // --- SLA LOGS CRUD ---
    getSlaLogs() {
      return this.cache.sla_logs || [];
    }

    upsertSlaLog(logEntry) {
      const logs = this.cache.sla_logs;
      const index = logs.findIndex(l => l.log_date === logEntry.log_date);

      if (index >= 0) {
        logs[index] = { ...logs[index], ...logEntry };
      } else {
        const id = logEntry.id || `SLA-${logEntry.log_date.replace(/-/g, '')}`;
        logs.push({ ...logEntry, id });
      }

      logs.sort((a, b) => b.log_date.localeCompare(a.log_date));
      this.saveToLocalStorage();

      fetch('/api/sla-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).then(() => this.updateDbStatusBadge(true)).catch(() => this.updateDbStatusBadge(false));

      window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'sla_logs' } }));
      return true;
    }

    deleteSlaLog(idOrDate) {
      const prevLen = this.cache.sla_logs.length;
      this.cache.sla_logs = this.cache.sla_logs.filter(l => l.id !== idOrDate && l.log_date !== idOrDate);
      if (this.cache.sla_logs.length !== prevLen) {
        this.saveToLocalStorage();
        fetch(`/api/sla-logs/${idOrDate}`, { method: 'DELETE' }).catch(() => {});
        window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'sla_logs' } }));
        return true;
      }
      return false;
    }

    // --- SETTINGS & NOTES ---
    getSettings() {
      return this.cache.settings || { target_sla_pct: 90 };
    }

    saveSettings(newSettings) {
      this.cache.settings = { ...this.cache.settings, ...newSettings };
      this.saveToLocalStorage();

      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }).catch(() => {});

      window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'settings' } }));
    }

    getRemarkForDate(dateStr) {
      return (this.cache.daily_notes && this.cache.daily_notes[dateStr]) || '';
    }

    saveRemarkForDate(dateStr, remarkText) {
      if (!this.cache.daily_notes) this.cache.daily_notes = {};
      this.cache.daily_notes[dateStr] = remarkText;
      this.saveToLocalStorage();

      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, note: remarkText })
      }).catch(() => {});

      window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'notes' } }));
    }

    async resetToSampleData() {
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        if (res.ok) {
          const resJson = await res.json();
          const dbData = (resJson && resJson.data) ? resJson.data : resJson;
          if (dbData && Array.isArray(dbData.alerts)) {
            this.cache.alerts = dbData.alerts;
            this.cache.sla_logs = Array.isArray(dbData.sla_logs) ? dbData.sla_logs : [];
            this.cache.settings = dbData.settings || this.cache.settings;
            this.cache.daily_notes = dbData.daily_notes || {};
            this.saveToLocalStorage();
            this.updateDbStatusBadge(true);
            window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'all' } }));
            return;
          }
        }
      } catch (e) {}

      // Fallback
      const today = getTodayDateStr();
      this.cache.alerts = [
        {
          id: 'ALT-0001',
          alert_date: today,
          alert_time: '08:14:22 AM',
          source: 'Wazuh',
          client: 'Indicosmic',
          endpoint_name: 'BASTION-HOST-01',
          ip_address: '198.51.100.44',
          alert_type: 'Brute Force',
          severity: 'High',
          level: 3,
          status: 'Investigating',
          escalated: false,
          escalated_to: null,
          resolution_time: null,
          remarks: 'Multiple failed SSH attempts targeting bastion server from external IP.'
        },
        {
          id: 'ALT-0002',
          alert_date: today,
          alert_time: '09:05:10 AM',
          source: 'Sophos',
          client: 'mirror',
          endpoint_name: 'WS-FIN-09',
          ip_address: '10.200.4.52',
          alert_type: 'Malware Detection',
          severity: 'Critical',
          level: 4,
          status: 'Escalated',
          escalated: true,
          escalated_to: 'Incident Response Team',
          resolution_time: null,
          remarks: 'Endpoint Intercept X flagged staged suspicious script in user temp folder.'
        }
      ];

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'all' } }));
    }

    async clearAllData() {
      try {
        const res = await fetch('/api/clear', { method: 'POST' });
        if (res.ok) {
          const resJson = await res.json();
          const dbData = (resJson && resJson.data) ? resJson.data : resJson;
          this.cache.alerts = [];
          this.cache.sla_logs = [];
          this.cache.daily_notes = {};
          if (dbData && dbData.settings) {
            this.cache.settings = dbData.settings;
          }
          this.saveToLocalStorage();
          this.updateDbStatusBadge(true);
          window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'all' } }));
          return;
        }
      } catch (e) {}

      this.cache.alerts = [];
      this.cache.sla_logs = [];
      this.cache.daily_notes = {};
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('soc:data-changed', { detail: { type: 'all' } }));
    }

    exportAllJson() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.cache, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `soc_database_backup_${getTodayDateStr()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    exportCsv(dateStr) {
      const alerts = this.getAlerts().filter(a => a.alert_date === dateStr);
      if (alerts.length === 0) {
        alert(`No alerts found for ${dateStr} to export.`);
        return;
      }

      const headers = ['ID', 'Date', 'Time', 'Client', 'Source', 'Endpoint', 'IP Address', 'Alert Type', 'Severity', 'Status', 'Escalated', 'Escalated To', 'Resolution Time', 'Remarks'];
      const rows = alerts.map(a => [
        a.id,
        a.alert_date,
        a.alert_time,
        a.client || 'N/A',
        a.source,
        a.endpoint_name || 'N/A',
        a.ip_address || 'N/A',
        a.alert_type,
        a.severity,
        a.status,
        a.escalated ? 'Yes' : 'No',
        a.escalated_to || '',
        a.resolution_time || '',
        `"${(a.remarks || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `soc_alerts_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    exportTodayPdfReport(dateStr) {
      const alerts = this.getAlerts().filter(a => a.alert_date === dateStr);
      const total = alerts.length;
      const critical = alerts.filter(a => a.severity === 'Critical').length;
      const high = alerts.filter(a => a.severity === 'High').length;
      const medium = alerts.filter(a => a.severity === 'Medium').length;
      const low = alerts.filter(a => a.severity === 'Low').length;
      const info = alerts.filter(a => a.severity === 'Informational').length;
      const escalated = alerts.filter(a => a.escalated || a.status === 'Escalated').length;
      const inProgress = alerts.filter(a => a.status === 'Investigating' || a.status === 'Acknowledged').length;
      const resolved = alerts.filter(a => a.status === 'Resolved' || a.status === 'Closed').length;
      const falsePos = alerts.filter(a => a.status === 'False Positive').length;

      const jsPDF = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDF) {
        window.print();
        return false;
      }

      try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 36, 'F');
        doc.setDrawColor(2, 132, 199);
        doc.setLineWidth(1.2);
        doc.line(0, 36, 210, 36);

        doc.setFillColor(2, 132, 199);
        doc.roundedRect(14, 8, 16, 16, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('JK', 19, 19);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(13);
        doc.text('JK DEFENSE SOC • TIER-1 INCIDENT REPORT', 35, 15);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Shift Incident Triage & Telemetry Handover • Team Lead (TL) Briefing', 35, 21);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(2, 132, 199);
        doc.text(`SHIFT DATE: ${dateStr}`, 155, 14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toLocaleTimeString()} (UTC+05:30)`, 155, 19);
        doc.text('CONFIDENTIAL • RESTRICTED', 155, 24);

        let startY = 44;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, startY, 182, 16, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(14, startY, 182, 16, 2, 2, 'S');

        const metrics = [
          { label: 'TOTAL LOGGED', val: `${total}`, x: 26, c: [2, 132, 199] },
          { label: 'ESCALATED', val: `${escalated}`, x: 62, c: [225, 29, 72] },
          { label: 'IN PROGRESS', val: `${inProgress}`, x: 98, c: [217, 119, 6] },
          { label: 'RESOLVED', val: `${resolved}`, x: 134, c: [5, 150, 105] },
          { label: 'FALSE POSITIVE', val: `${falsePos}`, x: 170, c: [124, 58, 237] }
        ];

        metrics.forEach(m => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(m.c[0], m.c[1], m.c[2]);
          doc.text(m.val, m.x, startY + 7, { align: 'center' });
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text(m.label, m.x, startY + 13, { align: 'center' });
        });

        startY = 66;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('DAILY INCIDENT TRIAGE ROSTER', 14, startY - 2);

        const tableBody = alerts.map(a => [
          a.id,
          a.alert_time || '--:--',
          a.client || 'Enterprise',
          a.source,
          a.endpoint_name || 'N/A',
          a.ip_address || 'N/A',
          a.alert_type,
          a.severity,
          `Lvl ${a.level !== undefined && a.level !== null ? a.level : 1}`,
          a.status,
          a.remarks || ''
        ]);

        if (doc.autoTable) {
          doc.autoTable({
            startY: startY,
            head: [['ID', 'Time', 'Client', 'Source', 'Endpoint', 'IP Address', 'Type', 'Severity', 'Level', 'Status', 'Remarks / Actions']],
            body: tableBody.length > 0 ? tableBody : [['--', '--', '--', '--', '--', '--', '--', '--', '--', '--', 'No alerts logged for this shift date.']],
            theme: 'grid',
            headStyles: {
              fillColor: [241, 245, 249],
              textColor: [15, 23, 42],
              fontSize: 7.5,
              fontStyle: 'bold',
              halign: 'left'
            },
            styles: {
              fontSize: 6.8,
              cellPadding: 2,
              overflow: 'linebreak',
              textColor: [51, 65, 85]
            },
            columnStyles: {
              0: { cellWidth: 15, fontStyle: 'bold', textColor: [2, 132, 199] },
              1: { cellWidth: 15 },
              2: { cellWidth: 16, fontStyle: 'bold', textColor: [15, 23, 42] },
              3: { cellWidth: 15 },
              4: { cellWidth: 16 },
              5: { cellWidth: 16 },
              6: { cellWidth: 18 },
              7: { cellWidth: 13, fontStyle: 'bold' },
              8: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
              9: { cellWidth: 14 },
              10: { cellWidth: 'auto' }
            },
            didParseCell: function(data) {
              if (data.section === 'body' && data.column.index === 7) {
                const sev = data.cell.raw;
                if (sev === 'Critical') data.cell.styles.textColor = [225, 29, 72];
                else if (sev === 'High') data.cell.styles.textColor = [234, 88, 12];
                else if (sev === 'Medium') data.cell.styles.textColor = [217, 119, 6];
                else if (sev === 'Low') data.cell.styles.textColor = [5, 150, 105];
              }
            }
          });
        }

        doc.save(`JK_SOC_Daily_Incident_Report_${dateStr}.pdf`);
        return true;
      } catch (err) {
        console.error('PDF generation error:', err);
        window.print();
        return false;
      }
    }
  }

  const storage = new PersistentStorageService();

  // --- STATE FOR PAGE 1 ---
  let selectedDate = getTodayDateStr();
  let filterSearch = '';
  let filterSeverity = 'ALL';
  let filterStatus = 'ALL';
  let filterSource = 'ALL';
  let sortField = 'id';
  let sortDirection = 'desc';

  // --- PAGE 1: DAILY DASHBOARD ---
  function initPage1() {
    const container = document.getElementById('page1-container');
    if (!container) return;

    renderPage1Layout(container);
    setupPage1EventListeners();
    updatePage1Data();
  }

  function renderPage1Layout(container) {
    const sources = storage.getSources();

    container.innerHTML = `
      <!-- TOP COMMAND CONSOLE: SEARCH & DATE INVESTIGATION BAR (Streamlined - No Duplicate Buttons) -->
      <div class="soc-card p-4 sm:p-5 mb-5 border-l-4 border-l-sky-500 shadow-sm w-full">
        <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          
          <!-- Date Navigator Stepper -->
          <div class="flex items-center gap-2 shrink-0">
            <button id="btn-prev-day" class="btn-molded btn-molded-secondary px-3 py-2 text-xs font-semibold" title="Previous Calendar Day">
              <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              <span class="hidden sm:inline">Prev</span>
            </button>

            <!-- Molded Date Picker Input -->
            <div class="relative flex items-center">
              <input 
                type="date" 
                id="report-date-picker" 
                value="${selectedDate}"
                class="cyber-search-input text-slate-900 text-xs sm:text-sm font-bold px-3 py-2 font-mono-code cursor-pointer"
                title="Select Calendar Day to Inspect and Alter"
              />
            </div>

            <button id="btn-next-day" class="btn-molded btn-molded-secondary px-3 py-2 text-xs font-semibold" title="Next Calendar Day">
              <span class="hidden sm:inline">Next</span>
              <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>

            <button id="btn-quick-today" class="btn-molded btn-molded-secondary px-3 py-2 text-xs font-bold text-sky-600" title="Jump to Today">
              ⚡ Today
            </button>
          </div>

          <!-- SMART SEARCH BAR (Client, Hostname, IP, Source, Remarks) -->
          <div class="flex-1 min-w-[300px] relative">
            <input 
              type="text" 
              id="smart-day-search" 
              placeholder="🔍 Search Client, IP Address, Hostname, Source, or triage remarks..." 
              class="cyber-search-input w-full px-4 py-2 text-xs sm:text-sm placeholder-slate-400 font-sans shadow-sm"
            />
            <button id="btn-clear-search" class="hidden absolute right-3 top-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100">✕</button>
          </div>

          <!-- Action: CSV Export -->
          <div class="flex items-center gap-2 shrink-0">
            <button id="btn-export-csv" class="btn-molded btn-molded-secondary px-3.5 py-2 text-xs font-semibold text-emerald-700" title="Export this date to CSV">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        <!-- EXECUTIVE DAY INVESTIGATION LOG & ACTION BRIEF -->
        <div id="day-investigation-brief" class="mt-3.5 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <!-- Injected via updatePage1Data -->
        </div>

      </div>

      <!-- 7 KPI CARDS (Interactive Dynamic Filter on Click) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5 w-full" id="kpi-cards-grid"></div>

      <!-- 2-COLUMN SUMMARY: Executive Severity Assessment Matrix & Sources -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 w-full">
        
        <!-- Left: Redesigned Executive Threat Assessment Matrix -->
        <div class="lg:col-span-7 soc-card p-5 border-t-2 border-t-amber-500 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3.5">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span>Threat Assessment Matrix</span>
                </h3>
              </div>
              <span id="threat-index-badge" class="px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Threat Level: Normal
              </span>
            </div>

            <div id="severity-matrix-container"></div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Click any tile to filter alerts table</span>
            <span class="text-slate-400 font-mono-code">Auto-calculated</span>
          </div>
        </div>

        <!-- Right: Telemetry Ingestion Sources Summary Grid -->
        <div class="lg:col-span-5 soc-card p-5 border-t-2 border-t-sky-500 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3.5">
              <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>Telemetry Ingestion Sources</span>
              </h3>
              <span class="text-xs text-slate-500 font-mono-code" id="source-summary-total">Active: 0 / ${sources.length}</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="source-summary-grid"></div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Configurable in Settings</span>
            <span class="text-slate-400 font-mono-code">Live Ingestion</span>
          </div>
        </div>

      </div>

      <!-- REMARKS / OBSERVATIONS FOR TL -->
      <div class="soc-card p-5 mb-5 border-l-4 border-l-rose-500 w-full">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <h3 class="text-sm font-semibold text-slate-800 uppercase tracking-wider">Remarks / Observations for Team Lead (TL)</h3>
          </div>
          <span id="notes-save-indicator" class="text-xs text-slate-500 italic">Saved to database</span>
        </div>

        <div id="tl-auto-warning" class="px-4 py-3 rounded-xl mb-3 text-sm font-medium transition-all"></div>

        <div>
          <label for="tl-daily-notes" class="block text-xs text-slate-600 mb-1.5 font-medium">Analyst Daily Handover / Investigation Notes (Date: <span id="notes-date-label" class="font-mono-code text-sky-600 font-bold"></span>):</label>
          <textarea 
            id="tl-daily-notes" 
            rows="2" 
            placeholder="Enter shift handover notes, root cause findings, pending analyst reviews, or follow-ups for TL on this day..."
            class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all font-sans"
          ></textarea>
        </div>
      </div>

      <!-- ALERT LOG TABLE SECTION (Fluid Full Width) -->
      <div class="soc-card border border-slate-200 shadow-md overflow-hidden mb-8 w-full">
        <div class="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-slate-900 tracking-wide">SOC Alert Log Table</h2>
              <span id="table-row-count-badge" class="px-2.5 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-mono-code font-bold">0 alerts</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Live alert roster with IP address, hostname, client organization, severity badges, and instant search</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs">
            <div class="relative">
              <input 
                type="text" 
                id="filter-search" 
                placeholder="Filter table alerts..." 
                class="cyber-search-input pl-8 pr-3 py-1.5 text-xs w-44 sm:w-56"
              />
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>

            <select id="filter-severity" class="cyber-search-input px-2 py-1.5 text-xs">
              <option value="ALL">Severity: All</option>
              ${SEVERITIES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>

            <select id="filter-status" class="cyber-search-input px-2 py-1.5 text-xs">
              <option value="ALL">Status: All</option>
              ${STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>

            <select id="filter-source" class="cyber-search-input px-2 py-1.5 text-xs">
              <option value="ALL">Source: All</option>
              ${sources.map(src => `<option value="${src}">${src}</option>`).join('')}
            </select>

            <button id="btn-reset-filters" class="btn-molded btn-molded-secondary px-2.5 py-1.5 text-xs">
              Clear Filters
            </button>
          </div>
        </div>

        <div class="overflow-x-auto max-h-[580px] relative w-full">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky-table-header uppercase text-[11px] font-semibold text-slate-600 tracking-wider border-b border-slate-200">
              <tr>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="id">
                  <div class="flex items-center gap-1">ID <span class="sort-icon font-normal opacity-50" data-col="id">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="alert_time">
                  <div class="flex items-center gap-1">Time <span class="sort-icon font-normal opacity-50" data-col="alert_time">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="client">
                  <div class="flex items-center gap-1">Client <span class="sort-icon font-normal opacity-50" data-col="client">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="source">
                  <div class="flex items-center gap-1">Source <span class="sort-icon font-normal opacity-50" data-col="source">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="endpoint_name">
                  <div class="flex items-center gap-1">Endpoint <span class="sort-icon font-normal opacity-50" data-col="endpoint_name">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="ip_address">
                  <div class="flex items-center gap-1">IP Address <span class="sort-icon font-normal opacity-50" data-col="ip_address">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="alert_type">
                  <div class="flex items-center gap-1">Alert Type <span class="sort-icon font-normal opacity-50" data-col="alert_type">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="severity">
                  <div class="flex items-center gap-1">Severity <span class="sort-icon font-normal opacity-50" data-col="severity">↕</span></div>
                </th>
                <th scope="col" class="px-3 py-3 cursor-pointer hover:text-sky-600 transition-colors text-center" data-sort="level">
                  <div class="flex items-center justify-center gap-1">Level <span class="sort-icon font-normal opacity-50" data-col="level">↕</span></div>
                </th>
                <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-sky-600 transition-colors" data-sort="status">
                  <div class="flex items-center gap-1">Status <span class="sort-icon font-normal opacity-50" data-col="status">↕</span></div>
                </th>
                <th scope="col" class="px-3 py-3">Escalated?</th>
                <th scope="col" class="px-4 py-3 min-w-[200px]">Remarks / Analysis</th>
                <th scope="col" class="px-3.5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="alerts-table-body" class="divide-y divide-slate-200 text-slate-700 bg-white"></tbody>
          </table>
        </div>

        <div id="table-empty-state" class="hidden py-14 px-4 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h4 class="text-sm font-semibold text-slate-800">No alerts found for this date & filter</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">There are no security alerts logged for <span class="font-mono-code text-sky-600 font-bold">${selectedDate}</span>.</p>
          <button id="btn-empty-add-alert" class="btn-molded btn-molded-primary mt-4 px-4 py-2 text-xs font-bold text-white">
            + Log Alert For ${selectedDate}
          </button>
        </div>

        <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span id="table-summary-status">Showing alerts for ${selectedDate}</span>
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Escalated / Critical</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Resolved</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> False Positive</span>
          </div>
        </div>
      </div>
    `;
  }

  function setupPage1EventListeners() {
    const datePicker = document.getElementById('report-date-picker');
    const btnPrev = document.getElementById('btn-prev-day');
    const btnNext = document.getElementById('btn-next-day');
    const btnToday = document.getElementById('btn-quick-today');
    const smartSearch = document.getElementById('smart-day-search');
    const btnClearSearch = document.getElementById('btn-clear-search');

    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        changeSelectedDate(e.target.value);
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const parts = selectedDate.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10) - 1);
        const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        changeSelectedDate(newStr);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const parts = selectedDate.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10) + 1);
        const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        changeSelectedDate(newStr);
      });
    }

    if (btnToday) {
      btnToday.addEventListener('click', () => {
        changeSelectedDate(getTodayDateStr());
      });
    }

    if (smartSearch) {
      smartSearch.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        if (btnClearSearch) btnClearSearch.classList.toggle('hidden', !val);

        const dateMatch = val.match(/^\d{4}-\d{2}-\d{2}$/);
        if (dateMatch) {
          changeSelectedDate(dateMatch[0]);
          return;
        }

        filterSearch = val;
        renderAlertsTable();
      });
    }

    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        if (smartSearch) smartSearch.value = '';
        btnClearSearch.classList.add('hidden');
        filterSearch = '';
        renderAlertsTable();
      });
    }

    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        storage.exportCsv(selectedDate);
      });
    }

    const btnEmptyAdd = document.getElementById('btn-empty-add-alert');
    if (btnEmptyAdd) {
      btnEmptyAdd.addEventListener('click', () => {
        window.socApp.openAlertModal(null, selectedDate);
      });
    }

    const notesArea = document.getElementById('tl-daily-notes');
    if (notesArea) {
      let timeoutId = null;
      notesArea.addEventListener('input', (e) => {
        const indicator = document.getElementById('notes-save-indicator');
        if (indicator) indicator.textContent = 'Saving...';
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          storage.saveRemarkForDate(selectedDate, e.target.value);
          if (indicator) indicator.textContent = 'Saved to database';
        }, 500);
      });
    }

    // Table Filters
    const filterInput = document.getElementById('filter-search');
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        filterSearch = e.target.value.trim().toLowerCase();
        renderAlertsTable();
      });
    }

    const filterSevSelect = document.getElementById('filter-severity');
    if (filterSevSelect) {
      filterSevSelect.addEventListener('change', (e) => {
        filterSeverity = e.target.value;
        renderAlertsTable();
      });
    }

    const filterStatSelect = document.getElementById('filter-status');
    if (filterStatSelect) {
      filterStatSelect.addEventListener('change', (e) => {
        filterStatus = e.target.value;
        renderAlertsTable();
      });
    }

    const filterSrcSelect = document.getElementById('filter-source');
    if (filterSrcSelect) {
      filterSrcSelect.addEventListener('change', (e) => {
        filterSource = e.target.value;
        renderAlertsTable();
      });
    }

    const btnResetFilters = document.getElementById('btn-reset-filters');
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        filterSearch = '';
        filterSeverity = 'ALL';
        filterStatus = 'ALL';
        filterSource = 'ALL';
        if (filterInput) filterInput.value = '';
        if (filterSevSelect) filterSevSelect.value = 'ALL';
        if (filterStatSelect) filterStatSelect.value = 'ALL';
        if (filterSrcSelect) filterSrcSelect.value = 'ALL';
        renderAlertsTable();
      });
    }

    // Table Header Sorting
    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (sortField === field) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortField = field;
          sortDirection = 'asc';
        }
        renderAlertsTable();
      });
    });
  }

  function changeSelectedDate(newDate) {
    selectedDate = newDate;
    const picker = document.getElementById('report-date-picker');
    if (picker) picker.value = newDate;
    updatePage1Data();
  }

  function updatePage1Data() {
    const allAlerts = storage.getAlerts();
    const dateAlerts = allAlerts.filter(a => a.alert_date === selectedDate);

    updateDayInvestigationBrief(dateAlerts);
    renderKpiCards(dateAlerts);
    renderSeveritySummary(dateAlerts);
    renderSourceSummary(dateAlerts);
    renderTlWarningLine(dateAlerts);
    loadDailyNotes();
    renderAlertsTable();
  }

  function updateDayInvestigationBrief(dateAlerts = null) {
    const briefContainer = document.getElementById('day-investigation-brief');
    if (!briefContainer) return;

    const allAlerts = storage.getAlerts();
    const alerts = dateAlerts || allAlerts.filter(a => a.alert_date === selectedDate);

    const total = alerts.length;
    const critical = alerts.filter(a => a.severity === 'Critical').length;
    const high = alerts.filter(a => a.severity === 'High').length;
    const escalated = alerts.filter(a => a.escalated || a.status === 'Escalated').length;
    const resolved = alerts.filter(a => a.status === 'Resolved' || a.status === 'Closed').length;

    let postureBadge = '';
    let summaryText = '';

    if (total === 0) {
      postureBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono-code bg-slate-100 text-slate-700 border border-slate-300">CALM / CLEAN SHIFT</span>';
      summaryText = `No alerts logged on <span class="font-mono-code font-bold text-sky-600">${selectedDate}</span>. Ready for analyst entries.`;
    } else if (critical > 0 || escalated > 0) {
      postureBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono-code bg-red-100 text-red-700 border border-red-300 animate-pulse">ACTIVE INCIDENTS</span>';
      summaryText = `Active shift with <span class="font-bold text-red-700">${critical} Critical</span> and <span class="font-bold text-rose-700">${escalated} Escalated</span> threat investigations. ${resolved} resolved.`;
    } else {
      postureBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono-code bg-emerald-100 text-emerald-800 border border-emerald-300">NORMAL DISPATCH</span>';
      summaryText = `Triage completed for all <span class="font-bold text-slate-800">${total} alerts</span>. ${resolved} closed/resolved.`;
    }

    const datesWithAlerts = [...new Set(allAlerts.map(a => a.alert_date).filter(Boolean))].sort().reverse().slice(0, 5);

    briefContainer.innerHTML = `
      <div class="md:col-span-8 flex flex-wrap items-center gap-2.5">
        ${postureBadge}
        <p class="text-xs text-slate-600">${summaryText}</p>
      </div>

      <div class="md:col-span-4 flex items-center justify-end gap-1.5 flex-wrap">
        <span class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">Logged Days:</span>
        ${datesWithAlerts.map(d => `
          <button class="quick-jump-date px-2 py-0.5 rounded text-[11px] font-mono-code font-bold transition-all ${d === selectedDate ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-date="${d}">
            ${d && d.length >= 10 ? d.substring(5) : d}
          </button>
        `).join('')}
      </div>
    `;

    briefContainer.querySelectorAll('.quick-jump-date').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-date');
        if (d) changeSelectedDate(d);
      });
    });
  }

  function renderKpiCards(dateAlerts) {
    const grid = document.getElementById('kpi-cards-grid');
    if (!grid) return;

    const total = dateAlerts.length;
    const escalated = dateAlerts.filter(a => a.escalated || a.status === 'Escalated').length;
    const inProgress = dateAlerts.filter(a => a.status === 'Investigating' || a.status === 'Acknowledged').length;
    const resolved = dateAlerts.filter(a => a.status === 'Resolved' || a.status === 'Closed').length;
    const critical = dateAlerts.filter(a => a.severity === 'Critical').length;
    const high = dateAlerts.filter(a => a.severity === 'High').length;
    const falsePos = dateAlerts.filter(a => a.status === 'False Positive').length;

    const cards = [
      { label: 'Total Alerts', val: total, color: 'text-sky-600', border: 'border-l-sky-500', action: 'ALL', sub: 'Active Day' },
      { label: 'Escalated', val: escalated, color: 'text-rose-600', border: 'border-l-rose-500', action: 'STATUS_Escalated', sub: 'Urgent' },
      { label: 'In Progress', val: inProgress, color: 'text-amber-600', border: 'border-l-amber-500', action: 'STATUS_Investigating', sub: 'Triage' },
      { label: 'Resolved / Closed', val: resolved, color: 'text-emerald-600', border: 'border-l-emerald-500', action: 'STATUS_Resolved', sub: 'Contained' },
      { label: 'Critical Threats', val: critical, color: 'text-red-600', border: 'border-l-red-500', action: 'SEV_Critical', sub: '15m SLA' },
      { label: 'High Threats', val: high, color: 'text-orange-600', border: 'border-l-orange-500', action: 'SEV_High', sub: '30m SLA' },
      { label: 'False Positives', val: falsePos, color: 'text-purple-600', border: 'border-l-purple-500', action: 'STATUS_False Positive', sub: 'Tuned' }
    ];

    grid.innerHTML = cards.map(c => `
      <div class="soc-card p-3 sm:p-3.5 border-l-4 ${c.border} cursor-pointer hover:shadow-md transition-all group" data-kpi-action="${c.action}" title="Click to filter table by ${c.label}">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">${c.label}</span>
          <span class="text-[9px] font-mono-code px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">${c.sub}</span>
        </div>
        <div class="text-xl sm:text-2xl font-black font-mono-code ${c.color}">${c.val}</div>
      </div>
    `).join('');

    grid.querySelectorAll('[data-kpi-action]').forEach(card => {
      card.addEventListener('click', () => {
        const action = card.getAttribute('data-kpi-action');
        if (action === 'ALL') {
          filterSeverity = 'ALL';
          filterStatus = 'ALL';
        } else if (action.startsWith('SEV_')) {
          filterSeverity = action.replace('SEV_', '');
          filterStatus = 'ALL';
        } else if (action.startsWith('STATUS_')) {
          filterStatus = action.replace('STATUS_', '');
          filterSeverity = 'ALL';
        }

        const sevSelect = document.getElementById('filter-severity');
        const statSelect = document.getElementById('filter-status');
        if (sevSelect) sevSelect.value = filterSeverity;
        if (statSelect) statSelect.value = filterStatus;

        renderAlertsTable();
      });
    });
  }

  function renderSeveritySummary(dateAlerts) {
    const container = document.getElementById('severity-matrix-container');
    const badge = document.getElementById('threat-index-badge');
    if (!container) return;

    const total = dateAlerts.length;
    const counts = {};
    SEVERITIES.forEach(s => {
      counts[s] = dateAlerts.filter(a => a.severity === s).length;
    });

    if (badge) {
      if (counts.Critical > 0) {
        badge.textContent = 'Threat Level: CRITICAL';
        badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-red-100 text-red-700 border border-red-300 animate-pulse';
      } else if (counts.High > 0) {
        badge.textContent = 'Threat Level: ELEVATED';
        badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-orange-100 text-orange-800 border border-orange-300';
      } else {
        badge.textContent = 'Threat Level: NORMAL';
        badge.className = 'px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
      }
    }

    container.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        ${SEVERITIES.map(s => {
          const count = counts[s] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          const col = SEVERITY_COLORS[s];
          const isFilterActive = filterSeverity === s;

          return `
            <div class="threat-matrix-tile ${isFilterActive ? 'active-filter' : ''}" data-sev="${s}">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold ${col.text}">${s}</span>
                <span class="text-[10px] font-mono-code text-slate-500">${pct}%</span>
              </div>
              <div class="text-xl font-black font-mono-code ${col.text}">${count}</div>
              <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="h-full rounded-full" style="width: ${pct}%; background-color: ${col.hex}"></div>
              </div>
              <div class="text-[9px] text-slate-400 mt-1 font-mono-code">${col.sla}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('[data-sev]').forEach(tile => {
      tile.addEventListener('click', () => {
        const sev = tile.getAttribute('data-sev');
        filterSeverity = (filterSeverity === sev) ? 'ALL' : sev;
        const select = document.getElementById('filter-severity');
        if (select) select.value = filterSeverity;
        renderSeveritySummary(dateAlerts);
        renderAlertsTable();
      });
    });
  }

  function renderSourceSummary(dateAlerts) {
    const grid = document.getElementById('source-summary-grid');
    const totalEl = document.getElementById('source-summary-total');
    if (!grid) return;

    const sources = storage.getSources();
    const sourceMap = {};
    dateAlerts.forEach(a => {
      const s = a.source || 'Other';
      sourceMap[s] = (sourceMap[s] || 0) + 1;
    });

    const activeCount = Object.keys(sourceMap).length;
    if (totalEl) totalEl.textContent = `Active: ${activeCount} / ${sources.length}`;

    grid.innerHTML = sources.slice(0, 6).map(src => {
      const count = sourceMap[src] || 0;
      const isActive = count > 0;
      const isFilterActive = filterSource === src;

      return `
        <div class="p-2 rounded-xl border transition-all cursor-pointer ${isFilterActive ? 'bg-sky-50 border-sky-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}" data-src="${src}">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium truncate ${isActive ? 'text-slate-800' : 'text-slate-400'}">${src}</span>
            <span class="font-mono-code font-bold text-xs ${isActive ? 'text-sky-600' : 'text-slate-400'}">${count}</span>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('[data-src]').forEach(tile => {
      tile.addEventListener('click', () => {
        const src = tile.getAttribute('data-src');
        filterSource = (filterSource === src) ? 'ALL' : src;
        const select = document.getElementById('filter-source');
        if (select) select.value = filterSource;
        renderAlertsTable();
      });
    });
  }

  function renderTlWarningLine(dateAlerts) {
    const warning = document.getElementById('tl-auto-warning');
    if (!warning) return;

    const critical = dateAlerts.filter(a => a.severity === 'Critical');
    const escalated = dateAlerts.filter(a => a.escalated || a.status === 'Escalated');

    if (critical.length > 0) {
      warning.className = 'px-4 py-3 rounded-xl mb-3 text-xs font-medium bg-red-50 text-red-800 border border-red-200 flex items-center gap-2';
      warning.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
        <span><strong>CRITICAL ALERT ADVISORY:</strong> ${critical.length} critical severity threat${critical.length > 1 ? 's' : ''} detected on this date requiring mandatory Team Lead sign-off.</span>
      `;
    } else if (escalated.length > 0) {
      warning.className = 'px-4 py-3 rounded-xl mb-3 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-2';
      warning.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-600"></span>
        <span><strong>ESCALATION NOTICE:</strong> ${escalated.length} incident${escalated.length > 1 ? 's' : ''} escalated to Tier 2 / Incident Response Team.</span>
      `;
    } else {
      warning.className = 'px-4 py-3 rounded-xl mb-3 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2';
      warning.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
        <span>Standard shift telemetry active. No active SLA breaches or unhandled critical incidents on this date.</span>
      `;
    }
  }

  function loadDailyNotes() {
    const label = document.getElementById('notes-date-label');
    const textarea = document.getElementById('tl-daily-notes');
    if (label) label.textContent = selectedDate;
    if (textarea) textarea.value = storage.getRemarkForDate(selectedDate);
  }

  function renderAlertsTable() {
    const tbody = document.getElementById('alerts-table-body');
    const emptyState = document.getElementById('table-empty-state');
    const countBadge = document.getElementById('table-row-count-badge');
    const summaryStatus = document.getElementById('table-summary-status');
    if (!tbody) return;

    const allAlerts = storage.getAlerts();
    let filtered = allAlerts.filter(a => a.alert_date === selectedDate);

    if (filterSearch) {
      filtered = filtered.filter(a => {
        const text = `${a.id} ${a.client || ''} ${a.endpoint_name || ''} ${a.ip_address || ''} ${a.remarks || ''} ${a.alert_type} ${a.source} ${a.escalated_to || ''} ${a.severity} ${a.status}`.toLowerCase();
        return text.includes(filterSearch);
      });
    }

    if (filterSeverity !== 'ALL') {
      filtered = filtered.filter(a => a.severity === filterSeverity);
    }
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }
    if (filterSource !== 'ALL') {
      filtered = filtered.filter(a => a.source === filterSource);
    }

    filtered.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'id') {
        const numA = parseInt(valA.replace('ALT-', ''), 10) || 0;
        const numB = parseInt(valB.replace('ALT-', ''), 10) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
      if (sortField === 'level') {
        const numA = parseInt(valA, 10) || 0;
        const numB = parseInt(valB, 10) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
      return sortDirection === 'asc' 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    if (countBadge) countBadge.textContent = `${filtered.length} alert${filtered.length === 1 ? '' : 's'}`;
    if (summaryStatus) summaryStatus.textContent = `Showing ${filtered.length} alert${filtered.length === 1 ? '' : 's'} for ${selectedDate}`;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) {
        emptyState.classList.remove('hidden');
        const emptyDateSpan = emptyState.querySelector('.font-mono-code');
        if (emptyDateSpan) emptyDateSpan.textContent = selectedDate;
        const emptyAddBtn = document.getElementById('btn-empty-add-alert');
        if (emptyAddBtn) emptyAddBtn.textContent = `+ Log Alert For ${selectedDate}`;
      }
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    tbody.innerHTML = filtered.map(alert => {
      const sevColor = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.Medium;
      const statColor = STATUS_COLORS[alert.status] || STATUS_COLORS.New;
      const isUrgent = alert.severity === 'Critical' || alert.status === 'Escalated' || alert.escalated;
      const displayTime = formatDisplayTime(alert.alert_time);

      return `
        <tr class="table-row-hover ${isUrgent ? 'bg-red-50/40' : ''}" data-id="${alert.id}">
          <td class="px-3.5 py-3 font-mono-code font-bold text-sky-700 whitespace-nowrap">${alert.id}</td>
          <td class="px-3.5 py-3 font-mono-code text-slate-700 whitespace-nowrap font-medium">${displayTime}</td>
          
          <!-- Client Badge -->
          <td class="px-3.5 py-3 whitespace-nowrap font-semibold">
            <span class="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-mono-code">
              ${alert.client || 'Enterprise'}
            </span>
          </td>

          <!-- Source -->
          <td class="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
            <span class="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">${alert.source}</span>
          </td>

          <!-- Endpoint Name (Hostname) -->
          <td class="px-3.5 py-3 font-mono-code text-slate-800 whitespace-nowrap font-semibold">
            ${alert.endpoint_name || '<span class="text-slate-400">N/A</span>'}
          </td>

          <!-- IP Address -->
          <td class="px-3.5 py-3 font-mono-code text-slate-700 whitespace-nowrap">
            <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
              ${alert.ip_address || '<span class="text-slate-400">--</span>'}
            </span>
          </td>

          <!-- Alert Type -->
          <td class="px-3.5 py-3 text-slate-800 whitespace-nowrap">${alert.alert_type}</td>

          <!-- Severity Badge -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${sevColor.bg} ${sevColor.text} border ${sevColor.border}">
              ${alert.severity}
            </span>
          </td>

          <!-- Level (Integer Value) -->
          <td class="px-3 py-3 whitespace-nowrap text-center">
            <span class="px-2 py-0.5 rounded-md font-mono-code font-bold text-xs bg-slate-100 text-slate-800 border border-slate-300 shadow-xs">
              Lvl ${alert.level !== undefined && alert.level !== null ? alert.level : 1}
            </span>
          </td>

          <!-- Status Badge -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statColor.bg} ${statColor.text} border ${statColor.border}">
              ${alert.status}
            </span>
          </td>

          <!-- Escalated? -->
          <td class="px-3 py-3 text-center whitespace-nowrap">
            ${alert.escalated ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 font-mono">YES (${alert.escalated_to || 'L2'})</span>` : '<span class="text-slate-400 font-mono text-[11px]">No</span>'}
          </td>

          <!-- Remarks -->
          <td class="px-4 py-3 text-slate-600 max-w-xs truncate" title="${(alert.remarks || '').replace(/"/g, '&quot;')}">
            ${alert.remarks || '<span class="text-slate-400 italic">No remarks</span>'}
          </td>

          <!-- Actions -->
          <td class="px-3.5 py-3 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1.5">
              <button class="btn-edit-alert text-slate-500 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition-colors" data-id="${alert.id}" title="Edit Alert">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button class="btn-delete-alert text-slate-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" data-id="${alert.id}" title="Delete Alert">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-edit-alert').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const alert = storage.getAlerts().find(a => a.id === id);
        if (alert) window.socApp.openAlertModal(alert);
      });
    });

    document.querySelectorAll('.btn-delete-alert').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Permanently delete alert ${id} from database?`)) {
          storage.deleteAlert(id);
          window.socApp.showToast(`Alert ${id} deleted`);
          updatePage1Data();
        }
      });
    });
  }

  // --- PAGE 2: MONTHLY SLA & SEVERITY LOGIC ---
  let selectedMonth = new Date().getMonth() + 1;
  let selectedYear = new Date().getFullYear();
  let chartInstance = null;

  function initPage2() {
    const container = document.getElementById('page2-container');
    if (!container) return;

    renderPage2Layout(container);
    setupPage2EventListeners();
    updatePage2Data();
  }

  function renderPage2Layout(container) {
    container.innerHTML = `
      <!-- TOP MONTH & YEAR SELECTOR -->
      <div class="soc-card p-4 sm:p-5 mb-5 border-l-4 border-l-blue-500 shadow-sm w-full">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              📈
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 tracking-wide">Monthly SLA Compliance & Severity Analytics</h2>
              <p class="text-xs text-slate-500">Aggregated mathematical averages and rotating severity distribution</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <select id="monthly-select-month" class="cyber-search-input px-3 py-2 text-xs font-semibold cursor-pointer">
              ${MONTH_NAMES.map((m, idx) => `
                <option value="${idx + 1}" ${idx + 1 === selectedMonth ? 'selected' : ''}>${m}</option>
              `).join('')}
            </select>

            <select id="monthly-select-year" class="cyber-search-input px-3 py-2 text-xs font-semibold cursor-pointer">
              ${[2024, 2025, 2026, 2027].map(y => `
                <option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>
              `).join('')}
            </select>

            <button id="btn-open-target-sla-modal" class="btn-molded btn-molded-secondary px-3 py-2 text-xs font-semibold" title="Configure Monthly Target SLA %">
              ⚙️ Target SLA
            </button>
          </div>
        </div>
      </div>

      <!-- 4 KEY KPI CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 w-full" id="monthly-kpis-grid"></div>

      <!-- 2-COLUMN: SEVERITY MATRIX & ROTATING PIE CHART -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 w-full">
        
        <!-- Left: Monthly Severity Aggregation Table -->
        <div class="lg:col-span-6 soc-card p-5 border-t-2 border-t-amber-500 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800">Monthly Severity Breakdown</h3>
                <p class="text-xs text-slate-500 mt-0.5">Accurate sum of all alerts across the entire selected month</p>
              </div>
              <span id="monthly-total-alerts-badge" class="px-2.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-mono-code font-bold">
                0 Total
              </span>
            </div>

            <div id="monthly-severity-table-container"></div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Aggregated multi-source telemetry</span>
            <span class="text-slate-400 font-mono-code">Multi-day sum</span>
          </div>
        </div>

        <!-- Right: Dynamic Rotating Cyber Pie Chart -->
        <div class="lg:col-span-6 soc-card p-5 border-t-2 border-t-cyan-500 flex flex-col items-center justify-between">
          <div class="w-full">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800">Severity Distribution</h3>
                <p class="text-xs text-slate-500 mt-0.5">Interactive rotating visualization</p>
              </div>
              <button id="btn-respin-pie-chart" class="btn-molded btn-molded-secondary px-2.5 py-1 text-xs font-semibold" title="Re-spin Chart Rotation Animation">
                🔄 Re-spin
              </button>
            </div>
          </div>

          <div class="pie-chart-wrapper my-4">
            <div class="pie-chart-cyber-ring"></div>
            <div class="pie-chart-cyber-ring-outer"></div>
            <div style="position: relative; width: 230px; height: 230px;">
              <canvas id="monthly-pie-chart" width="230" height="230"></canvas>
            </div>
          </div>

          <div class="w-full text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
            Click 'Re-spin' to re-trigger rotational scan animation
          </div>
        </div>

      </div>

      <!-- DAILY SLA LOG TABLE -->
      <div class="soc-card border border-slate-200 shadow-md overflow-hidden mb-8 w-full">
        <div class="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-slate-900 tracking-wide">Daily SLA Compliance Log Table</h3>
              <span id="monthly-log-count-badge" class="px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-mono-code font-bold">0 entries</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Audit log of day-by-day SLA percentages that calculate the monthly mathematical average</p>
          </div>

          <button id="btn-open-add-sla-modal" class="btn-molded btn-molded-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm">
            + Log Daily SLA Entry
          </button>
        </div>

        <div class="overflow-x-auto max-h-[460px] w-full">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky-table-header uppercase text-[11px] font-semibold text-slate-600 tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Log ID</th>
                <th class="px-4 py-3">Log Date</th>
                <th class="px-4 py-3">Daily SLA %</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Variance vs Target</th>
                <th class="px-4 py-3 min-w-[200px]">Notes / Queue Justification</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="daily-sla-table-body" class="divide-y divide-slate-200 text-slate-700 bg-white"></tbody>
          </table>
        </div>

        <div id="sla-table-empty-state" class="hidden py-10 text-center text-slate-500">
          <p class="text-xs italic">No daily SLA entries logged for this month yet. Click "+ Log Daily SLA Entry" to record compliance.</p>
        </div>
      </div>
    `;
  }

  function setupPage2EventListeners() {
    const monthSelect = document.getElementById('monthly-select-month');
    const yearSelect = document.getElementById('monthly-select-year');
    const btnRespin = document.getElementById('btn-respin-pie-chart');
    const btnTargetSla = document.getElementById('btn-open-target-sla-modal');
    const btnAddSla = document.getElementById('btn-open-add-sla-modal');

    if (monthSelect) {
      monthSelect.addEventListener('change', (e) => {
        selectedMonth = parseInt(e.target.value, 10);
        updatePage2Data();
      });
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        selectedYear = parseInt(e.target.value, 10);
        updatePage2Data();
      });
    }

    if (btnRespin) {
      btnRespin.addEventListener('click', () => {
        const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const monthAlerts = storage.getAlerts().filter(a => a.alert_date && a.alert_date.startsWith(monthPrefix));
        const counts = {};
        SEVERITIES.forEach(s => counts[s] = monthAlerts.filter(a => a.severity === s).length);
        renderDynamicRotatingPieChart(counts, monthAlerts.length);
      });
    }

    if (btnTargetSla) {
      btnTargetSla.addEventListener('click', () => {
        const cur = storage.getSettings().target_sla_pct || 90;
        const val = prompt('Enter Target SLA Percentage for the Team (%):', cur);
        if (val !== null) {
          const num = parseFloat(val);
          if (!isNaN(num) && num >= 0 && num <= 100) {
            storage.saveSettings({ target_sla_pct: num });
            updatePage2Data();
            window.socApp.showToast(`Target SLA set to ${num}%`);
          } else {
            alert('Please enter a valid percentage between 0 and 100.');
          }
        }
      });
    }

    if (btnAddSla) {
      btnAddSla.addEventListener('click', () => {
        const dateStr = prompt('Enter Date for Daily SLA Log (YYYY-MM-DD):', getTodayDateStr());
        if (!dateStr) return;
        const pctStr = prompt(`Enter SLA Compliance Percentage for ${dateStr} (%):`, '92.5');
        if (!pctStr) return;
        const pct = parseFloat(pctStr);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          alert('Invalid percentage.');
          return;
        }
        const notes = prompt('Enter shift notes or reason for queue delay:', 'Normal operational queue processing');
        storage.upsertSlaLog({
          log_date: dateStr,
          daily_sla_pct: pct,
          notes: notes || ''
        });
        window.socApp.showToast(`SLA entry for ${dateStr} saved!`);
        updatePage2Data();
      });
    }
  }

  function updatePage2Data() {
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const allAlerts = storage.getAlerts();
    const monthAlerts = allAlerts.filter(a => a.alert_date && a.alert_date.startsWith(monthPrefix));

    const allSlaLogs = storage.getSlaLogs();
    const monthSlaLogs = allSlaLogs.filter(l => l.log_date && l.log_date.startsWith(monthPrefix));

    const targetSla = storage.getSettings().target_sla_pct || 90;

    renderMonthlySlaKpis(monthSlaLogs, targetSla, monthAlerts);
    renderMonthlySeveritySummary(monthAlerts);
    renderDailySlaTable(monthSlaLogs, targetSla);
  }

  function renderMonthlySlaKpis(monthSlaLogs, targetSla, monthAlerts) {
    const container = document.getElementById('monthly-kpis-grid');
    if (!container) return;

    let overallAvg = null;
    if (monthSlaLogs.length > 0) {
      const sum = monthSlaLogs.reduce((acc, curr) => acc + (parseFloat(curr.daily_sla_pct) || 0), 0);
      overallAvg = Number((sum / monthSlaLogs.length).toFixed(1));
    }

    let statusText = 'No Data';
    let statusColor = 'text-slate-500';
    let badgeBorder = 'border-l-slate-400';

    if (overallAvg !== null) {
      if (overallAvg >= targetSla) {
        statusText = 'TARGET MET';
        statusColor = 'text-emerald-600';
        badgeBorder = 'border-l-emerald-500';
      } else {
        statusText = 'BREACHED';
        statusColor = 'text-red-600';
        badgeBorder = 'border-l-red-500';
      }
    }

    const criticalHigh = monthAlerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length;

    container.innerHTML = `
      <div class="soc-card p-4 border-l-4 ${badgeBorder}">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Overall Monthly SLA</div>
        <div class="text-2xl font-black font-mono-code ${statusColor}">
          ${overallAvg !== null ? `${overallAvg}%` : '--'}
        </div>
        <div class="text-[11px] text-slate-500 mt-1">Mathematical avg of ${monthSlaLogs.length} logged day${monthSlaLogs.length === 1 ? '' : 's'}</div>
      </div>

      <div class="soc-card p-4 border-l-4 border-l-blue-500">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target SLA Threshold</div>
        <div class="text-2xl font-black font-mono-code text-blue-700">${targetSla}%</div>
        <div class="text-[11px] text-slate-500 mt-1">Status: <span class="font-bold ${statusColor}">${statusText}</span></div>
      </div>

      <div class="soc-card p-4 border-l-4 border-l-sky-500">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Alerts in Month</div>
        <div class="text-2xl font-black font-mono-code text-sky-700">${monthAlerts.length}</div>
        <div class="text-[11px] text-slate-500 mt-1">Sum of every day in ${MONTH_NAMES[selectedMonth - 1]}</div>
      </div>

      <div class="soc-card p-4 border-l-4 border-l-red-500">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Critical & High Threats</div>
        <div class="text-2xl font-black font-mono-code text-red-600">${criticalHigh}</div>
        <div class="text-[11px] text-slate-500 mt-1">Priority investigations</div>
      </div>
    `;
  }

  function renderMonthlySeveritySummary(monthAlerts) {
    const container = document.getElementById('monthly-severity-table-container');
    const badge = document.getElementById('monthly-total-alerts-badge');
    if (!container) return;

    const total = monthAlerts.length;
    if (badge) badge.textContent = `${total} Total Alert${total === 1 ? '' : 's'}`;

    const counts = {};
    SEVERITIES.forEach(s => {
      counts[s] = monthAlerts.filter(a => a.severity === s).length;
    });

    container.innerHTML = `
      <div class="space-y-3 my-2">
        ${SEVERITIES.map(s => {
          const count = counts[s] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          const col = SEVERITY_COLORS[s];

          return `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${col.hex}"></span>
                  <span class="font-bold text-slate-800">${s}</span>
                </div>
                <div class="flex items-center gap-2 font-mono-code">
                  <span class="font-bold text-slate-900">${count} alerts</span>
                  <span class="text-slate-500 text-[11px]">(${pct}%)</span>
                </div>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${col.hex}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    renderDynamicRotatingPieChart(counts, total);
  }

  function renderDynamicRotatingPieChart(counts, total) {
    const canvas = document.getElementById('monthly-pie-chart');
    if (!canvas) return;

    if (total === 0) {
      if (chartInstance) chartInstance.destroy();
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No alerts recorded', canvas.width / 2, canvas.height / 2);
      return;
    }

    if (window.Chart) {
      if (chartInstance) chartInstance.destroy();

      const labels = SEVERITIES;
      const data = SEVERITIES.map(s => counts[s] || 0);
      const bgColors = SEVERITIES.map(s => SEVERITY_COLORS[s].hex);

      chartInstance = new window.Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: bgColors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.parsed;
                  const pct = total ? Math.round((val / total) * 100) : 0;
                  return ` ${context.label}: ${val} (${pct}%)`;
                }
              }
            }
          },
          cutout: '68%'
        }
      });
    }
  }

  function renderDailySlaTable(monthSlaLogs, targetSla) {
    const tbody = document.getElementById('daily-sla-table-body');
    const badge = document.getElementById('monthly-log-count-badge');
    const empty = document.getElementById('sla-table-empty-state');
    if (!tbody) return;

    if (badge) badge.textContent = `${monthSlaLogs.length} logged day${monthSlaLogs.length === 1 ? '' : 's'}`;

    if (monthSlaLogs.length === 0) {
      tbody.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    } else {
      if (empty) empty.classList.add('hidden');
    }

    tbody.innerHTML = monthSlaLogs.map(log => {
      const pct = parseFloat(log.daily_sla_pct) || 0;
      const isMet = pct >= targetSla;
      const variance = (pct - targetSla).toFixed(1);

      return `
        <tr class="table-row-hover">
          <td class="px-4 py-3 font-mono-code font-bold text-sky-700 whitespace-nowrap">${log.id}</td>
          <td class="px-4 py-3 font-mono-code text-slate-800 whitespace-nowrap">${log.log_date}</td>
          <td class="px-4 py-3 font-mono-code font-extrabold text-sm whitespace-nowrap ${isMet ? 'text-emerald-600' : 'text-red-600'}">
            ${pct}%
          </td>
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isMet ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'} font-mono-code">
              ${isMet ? 'MET' : 'BREACHED'}
            </span>
          </td>
          <td class="px-4 py-3 font-mono-code whitespace-nowrap ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}">
            ${variance >= 0 ? `+${variance}%` : `${variance}%`}
          </td>
          <td class="px-4 py-3 text-slate-600 max-w-sm truncate" title="${(log.notes || '').replace(/"/g, '&quot;')}">
            ${log.notes || '<span class="text-slate-400 italic">No justification required</span>'}
          </td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <button class="btn-delete-sla text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" data-id="${log.id}" title="Delete SLA entry">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-delete-sla').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Delete SLA log entry ${id}?`)) {
          storage.deleteSlaLog(id);
          window.socApp.showToast(`SLA entry deleted`);
          updatePage2Data();
        }
      });
    });
  }

  // --- EXECUTIVE AMBIENT LIGHT THEME BACKGROUND CONTROLLER ---
  // Smooth Interactive Ambient Spotlight Glow & Precision Cursor Tracking
  function initCyberBackground() {
    const cursorGlow = document.getElementById('executive-cursor-glow');
    if (!cursorGlow) return;

    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;
    let isMoving = false;
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        currentX = targetX;
        currentY = targetY;
        hasMoved = true;
      }
      if (!isMoving) {
        cursorGlow.style.opacity = '1';
        isMoving = true;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
      isMoving = false;
    });

    function animateCursorGlow() {
      if (hasMoved) {
        // Luxuriously smooth inertia tracking
        currentX += (targetX - currentX) * 0.085;
        currentY += (targetY - currentY) * 0.085;

        cursorGlow.style.left = `${currentX}px`;
        cursorGlow.style.top = `${currentY}px`;
      }
      requestAnimationFrame(animateCursorGlow);
    }

    animateCursorGlow();
  }

  // --- 3-SECOND FULL-SCREEN EPIC 3D COSMIC GALAXY WELCOME SCREEN ---
  let splashAnimId = null;

  function initSplashScreen(isReplay = false) {
    const splashEl = document.getElementById('welcome-splash-screen');
    const canvas = document.getElementById('splash-galaxy-canvas') || document.getElementById('splash-feathers-canvas');
    const progressBar = document.getElementById('splash-progress-bar');
    const pctText = document.getElementById('splash-pct-text');
    const statusText = document.getElementById('splash-status-text');
    const btnSkip = document.getElementById('btn-skip-splash');

    if (!splashEl || !canvas) return;

    if (isReplay) {
      splashEl.style.display = 'flex';
      splashEl.classList.remove('splash-exit', 'hidden');
      if (progressBar) progressBar.style.width = '0%';
      if (pctText) pctText.textContent = '0%';
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetTiltX = (mouseY / height - 0.5) * 0.35;
      targetTiltY = (mouseX / width - 0.5) * 0.35;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // --- 1. PROCEDURAL 3D SPIRAL GALAXY STARS (4 Logarithmic Arms) ---
    const TOTAL_STARS = 950;
    const NUM_ARMS = 4;
    const ARM_OFFSET = (Math.PI * 2) / NUM_ARMS;
    const stars = [];

    const starColorPalettes = [
      { r: 254, g: 240, b: 138, core: true },   // Solar Gold (Core)
      { r: 255, g: 255, b: 255, core: true },   // Brilliant White
      { r: 56,  g: 189, b: 248, core: false },  // Cyan Plasma
      { r: 96,  g: 165, b: 250, core: false },  // Sapphire Hypergiant
      { r: 192, g: 132, b: 252, core: false },  // Nebula Violet
      { r: 244, g: 114, b: 182, core: false }   // Cosmic Magenta
    ];

    for (let i = 0; i < TOTAL_STARS; i++) {
      const isCore = Math.random() < 0.28;
      let dist, angle;

      if (isCore) {
        dist = Math.random() * (Math.min(width, height) * 0.16);
        angle = Math.random() * Math.PI * 2;
      } else {
        const arm = Math.floor(Math.random() * NUM_ARMS);
        const normDist = Math.pow(Math.random(), 1.45);
        dist = 30 + normDist * (Math.min(width, height) * 0.65);
        const spiralCurvature = Math.log(1 + dist / 35) * 2.7;
        const armJitter = (Math.random() - 0.5) * (0.35 + (dist / 500) * 0.5);
        angle = arm * ARM_OFFSET + spiralCurvature + armJitter;
      }

      // Vertical galactic disk thickness (Gaussian-like spread)
      const diskHeight = (Math.random() - 0.5) * (isCore ? 60 : 35);
      const color = starColorPalettes[isCore ? (Math.random() > 0.5 ? 0 : 1) : Math.floor(Math.random() * starColorPalettes.length)];

      stars.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: diskHeight,
        dist: dist,
        angle: angle,
        orbitSpeed: (0.0035 + (35 / (dist + 40)) * 0.012) * (isCore ? 1.4 : 1),
        radius: isCore ? (1.2 + Math.random() * 2.2) : (0.7 + Math.random() * 1.8),
        color: color,
        twinkleSpeed: 0.03 + Math.random() * 0.06,
        twinklePhase: Math.random() * Math.PI * 2,
        alphaBase: 0.45 + Math.random() * 0.55
      });
    }

    // --- 2. DEEP SPACE NEBULA DUST CLOUDS ---
    const nebulae = [];
    const nebulaColors = [
      { r: 139, g: 92,  b: 246, alpha: 0.14 }, // Purple
      { r: 14,  g: 165, b: 233, alpha: 0.16 }, // Deep Cyan
      { r: 244, g: 63,  b: 94,  alpha: 0.10 }, // Rose Nebula
      { r: 245, g: 158, b: 11,  alpha: 0.12 }, // Amber Stardust
      { r: 79,  g: 70,  b: 229, alpha: 0.15 }  // Royal Indigo
    ];

    for (let i = 0; i < 7; i++) {
      nebulae.push({
        dist: 70 + Math.random() * (Math.min(width, height) * 0.38),
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.002,
        radius: 120 + Math.random() * 190,
        color: nebulaColors[i % nebulaColors.length],
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // --- 3. INTERSTELLAR METEORS / SHOOTING STARS ---
    const meteors = [];
    for (let i = 0; i < 4; i++) {
      meteors.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        len: 80 + Math.random() * 140,
        speedX: 12 + Math.random() * 16,
        speedY: 6 + Math.random() * 10,
        alpha: 0,
        active: false,
        nextSpawn: performance.now() + Math.random() * 2500
      });
    }

    const DURATION_MS = 3000;
    const startTime = performance.now();
    let isFinished = false;

    function finishSplash() {
      if (isFinished) return;
      isFinished = true;
      if (splashAnimId) cancelAnimationFrame(splashAnimId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      splashEl.classList.add('splash-exit');
      setTimeout(() => {
        splashEl.style.display = 'none';
        splashEl.classList.add('hidden');
      }, 700);
    }

    if (btnSkip) btnSkip.onclick = finishSplash;
    const keyHandler = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        finishSplash();
        window.removeEventListener('keydown', keyHandler);
      }
    };
    window.addEventListener('keydown', keyHandler);

    // --- 4. RENDER GALAXY FRAME (60 FPS 3D PERSPECTIVE ENGINE) ---
    let galaxyRotation = 0;

    function renderSplashFrame(now) {
      if (isFinished) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const pct = Math.round(progress * 100);

      // Smooth mouse tilt damping
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;

      // Update UI Progress Bar & Percent
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (pctText) pctText.textContent = `${pct}%`;

      if (statusText) {
        if (elapsed < 750) {
          statusText.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span><span class="font-semibold tracking-wider">INITIALIZING DEEP SPACE SENSORS...</span>`;
        } else if (elapsed < 1650) {
          statusText.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span><span class="font-semibold tracking-wider">SYNCHRONIZING INTERSTELLAR DEFENSE MATRIX...</span>`;
        } else if (elapsed < 2550) {
          statusText.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span><span class="font-semibold tracking-wider">ENGAGING EVENT HORIZON THREAT PROTOCOLS...</span>`;
        } else {
          statusText.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span class="text-amber-400 font-bold tracking-wider">COMMAND CONSOLE ONLINE • ACCESS GRANTED</span>`;
        }
      }

      // Clear Canvas with Cosmic Dark Background
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;

      galaxyRotation += 0.0035;

      // 3D Projection Angles
      const basePitch = 1.05 + currentTiltX; // ~60 degree inclination
      const yaw = currentTiltY;
      const cosPitch = Math.cos(basePitch);
      const sinPitch = Math.sin(basePitch);
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);

      // --- Draw Glowing Nebula Clouds ---
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      nebulae.forEach(neb => {
        neb.angle += neb.rotSpeed;
        const nx = centerX + Math.cos(neb.angle) * neb.dist;
        const ny = centerY + Math.sin(neb.angle) * (neb.dist * cosPitch);
        const pRadius = neb.radius * (1 + Math.sin(now * neb.pulseSpeed + neb.pulsePhase) * 0.15);

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, pRadius);
        grad.addColorStop(0, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${neb.color.alpha})`);
        grad.addColorStop(0.5, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${neb.color.alpha * 0.45})`);
        grad.addColorStop(1, 'rgba(2, 4, 10, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, pRadius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // --- Draw Supermassive Galactic Core Flare & Accretion Halo ---
      ctx.save();
      const corePulse = 1 + Math.sin(now * 0.003) * 0.08;
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 160 * corePulse);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreGrad.addColorStop(0.12, 'rgba(253, 224, 71, 0.7)');
      coreGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.4)');
      coreGrad.addColorStop(0.65, 'rgba(139, 92, 246, 0.18)');
      coreGrad.addColorStop(1, 'rgba(2, 4, 10, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 160 * corePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- Draw 3D Orbiting Stars & Galactic Arms ---
      const fov = 650;

      stars.forEach(star => {
        star.angle += star.orbitSpeed;

        // Plane 2D coords
        const rx = Math.cos(star.angle) * star.dist;
        const ry = Math.sin(star.angle) * star.dist;
        const rz = star.z;

        // 3D Perspective Rotation
        // Rotate around X (pitch) and Y (yaw)
        const rotY_x = rx * cosYaw - rz * sinYaw;
        const rotY_z = rx * sinYaw + rz * cosYaw;

        const rotX_y = ry * cosPitch - rotY_z * sinPitch;
        const rotX_z = ry * sinPitch + rotY_z * cosPitch;

        // Perspective Projection
        const scale = fov / (fov + rotX_z);
        const projX = centerX + rotY_x * scale;
        const projY = centerY + rotX_y * scale;

        if (projX < -50 || projX > width + 50 || projY < -50 || projY > height + 50) return;

        // Twinkle factor
        const twinkle = 0.75 + Math.sin(now * star.twinkleSpeed + star.twinklePhase) * 0.25;
        const starAlpha = Math.min(1, Math.max(0.15, star.alphaBase * twinkle * scale));
        const finalR = Math.max(0.5, star.radius * scale);

        // Core / large stars get subtle radiant glow
        if (finalR > 1.4) {
          ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${starAlpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(projX, projY, finalR * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${starAlpha})`;
        ctx.beginPath();
        ctx.arc(projX, projY, finalR, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Draw Shooting Stars / Interstellar Meteors ---
      meteors.forEach(m => {
        if (!m.active && now > m.nextSpawn) {
          m.active = true;
          m.x = Math.random() * (width * 0.75);
          m.y = Math.random() * (height * 0.45);
          m.alpha = 1;
        }

        if (m.active) {
          m.x += m.speedX;
          m.y += m.speedY;
          m.alpha -= 0.028;

          if (m.alpha <= 0 || m.x > width || m.y > height) {
            m.active = false;
            m.nextSpawn = now + 1200 + Math.random() * 2800;
          } else {
            ctx.save();
            const tailX = m.x - m.speedX * 3.5;
            const tailY = m.y - m.speedY * 3.5;
            const meteorGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
            meteorGrad.addColorStop(0.3, `rgba(56, 189, 248, ${m.alpha * 0.85})`);
            meteorGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

            ctx.strokeStyle = meteorGrad;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      if (elapsed >= DURATION_MS) {
        finishSplash();
      } else {
        splashAnimId = requestAnimationFrame(renderSplashFrame);
      }
    }

    splashAnimId = requestAnimationFrame(renderSplashFrame);
  }

  // --- APPLICATION ORCHESTRATOR ---
  class SocApplication {
    constructor() {
      this.currentTab = 'page1';
      this.editingAlert = null;
      this.activeReportDate = null;
    }

    init() {
      initSplashScreen();
      initCyberBackground();
      this.setupNavigation();
      this.setupGlobalModals();
      this.setupSettingsModal();
      this.setupDataListeners();
      this.setupQuickActions();

      initPage1();
      initPage2();
      this.switchTab('page1');
    }

    setupNavigation() {
      const tab1Btn = document.getElementById('nav-tab-page1');
      const tab2Btn = document.getElementById('nav-tab-page2');

      if (tab1Btn) tab1Btn.addEventListener('click', () => this.switchTab('page1'));
      if (tab2Btn) tab2Btn.addEventListener('click', () => this.switchTab('page2'));
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
        tab1Btn.className = 'btn-molded px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-white bg-sky-600 shadow-md flex items-center gap-1.5';
        tab2Btn.className = 'btn-molded px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent flex items-center gap-1.5';
        updatePage1Data();
      } else {
        page1.classList.add('hidden');
        page2.classList.remove('hidden');
        tab2Btn.className = 'btn-molded px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-white bg-sky-600 shadow-md flex items-center gap-1.5';
        tab1Btn.className = 'btn-molded px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent flex items-center gap-1.5';
        updatePage2Data();
      }
    }

    setupDataListeners() {
      window.addEventListener('soc:data-changed', () => {
        if (this.currentTab === 'page1') updatePage1Data();
        else updatePage2Data();
      });
    }

    updateClientDropdown(source, selectedClient = null) {
      const clientSelect = document.getElementById('modal-alert-client');
      const clientHint = document.getElementById('modal-client-hint');
      const clientTag = document.getElementById('modal-client-tag');
      if (!clientSelect) return;

      const options = storage.getClientsForSource(source);
      let tagText = `${source} Client`;
      let hintText = `Options: ${options.join(', ')}`;

      if (clientTag) clientTag.textContent = tagText;
      if (clientHint) clientHint.textContent = hintText;

      clientSelect.innerHTML = options.map(c => `<option value="${c}">${c}</option>`).join('');

      if (selectedClient && options.includes(selectedClient)) {
        clientSelect.value = selectedClient;
      } else if (selectedClient) {
        const opt = document.createElement('option');
        opt.value = selectedClient;
        opt.textContent = selectedClient;
        opt.selected = true;
        clientSelect.prepend(opt);
      }
    }

    setupGlobalModals() {
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

      const sourceSelect = document.getElementById('modal-alert-source');
      if (sourceSelect) {
        sourceSelect.addEventListener('change', (e) => {
          this.updateClientDropdown(e.target.value);
        });
      }

      const btnTimeNow = document.getElementById('btn-alert-time-now');
      if (btnTimeNow) {
        btnTimeNow.addEventListener('click', () => {
          const t12 = getCurrentTime12h();
          const timeInput = document.getElementById('modal-alert-time');
          const ampmSelect = document.getElementById('modal-alert-ampm');
          if (timeInput) timeInput.value = t12.time;
          if (ampmSelect) ampmSelect.value = t12.ampm;
        });
      }

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

      const btnSaveAlert = document.getElementById('btn-save-security-alert');
      const handleSave = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try {
          this.saveAlertFromModal();
          closeModal();
        } catch (err) {
          console.error('Error saving alert:', err);
          this.showToast('Error saving alert: ' + (err.message || err));
        }
      };

      if (form) {
        form.addEventListener('submit', handleSave);
      }
      if (btnSaveAlert) {
        btnSaveAlert.addEventListener('click', handleSave);
      }
    }

    openAlertModal(alertToEdit = null, defaultDate = null) {
      this.editingAlert = alertToEdit;
      const modal = document.getElementById('alert-modal');
      const titleEl = document.getElementById('alert-modal-title');
      const subtitleEl = document.getElementById('alert-modal-subtitle');

      const dateInput = document.getElementById('modal-alert-date');
      const timeInput = document.getElementById('modal-alert-time');
      const ampmSelect = document.getElementById('modal-alert-ampm');
      const sourceSelect = document.getElementById('modal-alert-source');
      const endpointInput = document.getElementById('modal-alert-endpoint');
      const ipInput = document.getElementById('modal-alert-ip');
      const typeSelect = document.getElementById('modal-alert-type');
      const severitySelect = document.getElementById('modal-alert-severity');
      const levelInput = document.getElementById('modal-alert-level');
      const statusSelect = document.getElementById('modal-alert-status');
      const escalatedCheckbox = document.getElementById('modal-alert-escalated');
      const escalatedToSelect = document.getElementById('modal-alert-escalated-to');
      const resolutionInput = document.getElementById('modal-alert-resolution');
      const remarksInput = document.getElementById('modal-alert-remarks');

      const sources = storage.getSources();
      const alertTypes = storage.getAlertTypes();
      const escalatedTeams = storage.getEscalatedTeams();

      sourceSelect.innerHTML = sources.map(s => `<option value="${s}">${s}</option>`).join('');
      typeSelect.innerHTML = alertTypes.map(t => `<option value="${t}">${t}</option>`).join('');
      severitySelect.innerHTML = SEVERITIES.map(s => `<option value="${s}">${s}</option>`).join('');
      statusSelect.innerHTML = STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
      escalatedToSelect.innerHTML = '<option value="">None / Not Escalated</option>' + 
        escalatedTeams.map(team => `<option value="${team}">${team}</option>`).join('');

      if (alertToEdit) {
        titleEl.textContent = `Edit Alert — ${alertToEdit.id}`;
        subtitleEl.textContent = `Modifying record saved in database`;
        dateInput.value = alertToEdit.alert_date;
        
        const parsedTime = parseTime12h(alertToEdit.alert_time);
        timeInput.value = parsedTime.time;
        ampmSelect.value = parsedTime.ampm;

        sourceSelect.value = alertToEdit.source;
        this.updateClientDropdown(alertToEdit.source, alertToEdit.client);

        endpointInput.value = alertToEdit.endpoint_name || '';
        ipInput.value = alertToEdit.ip_address || '';
        typeSelect.value = alertToEdit.alert_type;
        severitySelect.value = alertToEdit.severity;
        if (levelInput) levelInput.value = (alertToEdit.level !== undefined && alertToEdit.level !== null) ? alertToEdit.level : 1;
        statusSelect.value = alertToEdit.status;
        escalatedCheckbox.checked = !!alertToEdit.escalated;
        escalatedToSelect.value = alertToEdit.escalated_to || '';
        resolutionInput.value = alertToEdit.resolution_time || '';
        remarksInput.value = alertToEdit.remarks || '';
      } else {
        const targetDate = defaultDate || selectedDate || getTodayDateStr();
        titleEl.textContent = 'Log New Security Alert';
        subtitleEl.textContent = `New ID will be auto-generated (${storage.getNextAlertId()})`;
        dateInput.value = targetDate;
        
        const curTime12 = getCurrentTime12h();
        timeInput.value = curTime12.time;
        ampmSelect.value = curTime12.ampm;

        sourceSelect.value = sources[0] || 'Wazuh';
        this.updateClientDropdown(sourceSelect.value);

        endpointInput.value = '';
        ipInput.value = '';
        typeSelect.value = ALERT_TYPES[0];
        severitySelect.value = 'Medium';
        if (levelInput) levelInput.value = '1';
        statusSelect.value = 'New';
        escalatedCheckbox.checked = false;
        escalatedToSelect.value = '';
        resolutionInput.value = '';
        remarksInput.value = '';
      }

      escalatedCheckbox.dispatchEvent(new Event('change'));
      modal.classList.remove('hidden');
    }

    saveAlertFromModal() {
      const dateEl = document.getElementById('modal-alert-date');
      const timeEl = document.getElementById('modal-alert-time');
      const ampmEl = document.getElementById('modal-alert-ampm');
      const sourceEl = document.getElementById('modal-alert-source');
      const clientEl = document.getElementById('modal-alert-client');
      const endpointEl = document.getElementById('modal-alert-endpoint');
      const ipEl = document.getElementById('modal-alert-ip');
      const typeEl = document.getElementById('modal-alert-type');
      const severityEl = document.getElementById('modal-alert-severity');
      const levelEl = document.getElementById('modal-alert-level');
      const statusEl = document.getElementById('modal-alert-status');
      const escalatedEl = document.getElementById('modal-alert-escalated');
      const escalatedToEl = document.getElementById('modal-alert-escalated-to');
      const resolutionEl = document.getElementById('modal-alert-resolution');
      const remarksEl = document.getElementById('modal-alert-remarks');

      const dateVal = (dateEl && dateEl.value) ? dateEl.value : (selectedDate || getTodayDateStr());
      const rawTime = (timeEl && timeEl.value.trim()) ? timeEl.value.trim() : getCurrentTime12h().time;
      const ampmVal = (ampmEl && ampmEl.value) ? ampmEl.value : 'AM';
      const combinedTime = `${rawTime} ${ampmVal}`;

      const sourceVal = (sourceEl && sourceEl.value) ? sourceEl.value : 'Wazuh';

      let clientVal = (clientEl && clientEl.value) ? clientEl.value : '';
      if (!clientVal) {
        const clients = storage.getClientsForSource(sourceVal);
        clientVal = (clients && clients.length) ? clients[0] : 'Giib';
      }

      const endpointVal = (endpointEl && endpointEl.value.trim()) ? endpointEl.value.trim() : 'WS-ENDPOINT-01';
      const ipVal = (ipEl && ipEl.value.trim()) ? ipEl.value.trim() : '192.168.1.50';
      const typeVal = (typeEl && typeEl.value) ? typeEl.value : (ALERT_TYPES[0] || 'Malware Detection');
      const severityVal = (severityEl && severityEl.value) ? severityEl.value : 'Medium';
      
      const levelNum = (levelEl && levelEl.value) ? parseInt(levelEl.value, 10) : 1;
      const levelVal = isNaN(levelNum) ? 1 : levelNum;
      
      const statusVal = (statusEl && statusEl.value) ? statusEl.value : 'New';
      const isEscalated = escalatedEl ? escalatedEl.checked : false;
      const escalatedToVal = isEscalated ? ((escalatedToEl && escalatedToEl.value) ? escalatedToEl.value : 'SOC L2') : null;
      const resVal = (resolutionEl && resolutionEl.value.trim()) ? resolutionEl.value.trim() : null;
      const remarksVal = (remarksEl && remarksEl.value.trim()) ? remarksEl.value.trim() : 'Security alert triaged by SOC analyst.';

      const alertData = {
        alert_date: dateVal,
        alert_time: combinedTime,
        source: sourceVal,
        client: clientVal,
        endpoint_name: endpointVal,
        ip_address: ipVal,
        alert_type: typeVal,
        severity: severityVal,
        level: levelVal,
        status: statusVal,
        escalated: isEscalated,
        escalated_to: escalatedToVal,
        resolution_time: resVal,
        remarks: remarksVal
      };

      if (this.editingAlert && this.editingAlert.id) {
        storage.updateAlert(this.editingAlert.id, alertData);
        this.showToast(`Alert ${this.editingAlert.id} saved to database!`);
      } else {
        const created = storage.createAlert(alertData);
        this.showToast(`Alert ${created.id} saved to database!`);
      }

      // Close modal immediately so user sees the updated dashboard
      const modal = document.getElementById('alert-modal');
      if (modal) modal.classList.add('hidden');

      // Reset filters so the newly saved alert is immediately visible
      filterSeverity = 'ALL';
      filterStatus = 'ALL';
      filterSource = 'ALL';
      filterSearch = '';

      const filterInput = document.getElementById('filter-search');
      const smartSearch = document.getElementById('smart-day-search');
      const btnClearSearch = document.getElementById('btn-clear-search');
      const filterSevSelect = document.getElementById('filter-severity');
      const filterStatSelect = document.getElementById('filter-status');
      const filterSrcSelect = document.getElementById('filter-source');

      if (filterInput) filterInput.value = '';
      if (smartSearch) smartSearch.value = '';
      if (btnClearSearch) btnClearSearch.classList.add('hidden');
      if (filterSevSelect) filterSevSelect.value = 'ALL';
      if (filterStatSelect) filterStatSelect.value = 'ALL';
      if (filterSrcSelect) filterSrcSelect.value = 'ALL';

      // Ensure the dashboard switches to the saved alert's date
      selectedDate = alertData.alert_date || getTodayDateStr();
      const picker = document.getElementById('report-date-picker');
      if (picker) picker.value = selectedDate;

      if (this.currentTab === 'page1') {
        updatePage1Data();
        renderAlertsTable();
      } else {
        updatePage2Data();
      }
    }

    // --- SETTINGS MODAL & TELEMETRY CONFIGURATION ---
    setupSettingsModal() {
      const btnOpen = document.getElementById('btn-open-settings');
      const modal = document.getElementById('settings-modal');
      const backdrop = document.getElementById('settings-modal-backdrop');
      const btnClose = document.getElementById('btn-close-settings-modal');
      const btnFinish = document.getElementById('btn-finish-settings');

      const closeModal = () => {
        if (modal) modal.classList.add('hidden');
        if (this.currentTab === 'page1') updatePage1Data();
        else updatePage2Data();
      };

      if (btnOpen) btnOpen.addEventListener('click', () => this.openSettingsModal());
      if (backdrop) backdrop.addEventListener('click', closeModal);
      if (btnClose) btnClose.addEventListener('click', closeModal);
      if (btnFinish) btnFinish.addEventListener('click', closeModal);

      // Settings Tab Switcher
      const tabSources = document.getElementById('tab-btn-cfg-sources');
      const tabClients = document.getElementById('tab-btn-cfg-clients');
      const tabAlertTypes = document.getElementById('tab-btn-cfg-alert-types');
      const tabTeams = document.getElementById('tab-btn-cfg-teams');
      const tabSla = document.getElementById('tab-btn-cfg-sla');

      const secSources = document.getElementById('cfg-section-sources');
      const secClients = document.getElementById('cfg-section-clients');
      const secAlertTypes = document.getElementById('cfg-section-alert-types');
      const secTeams = document.getElementById('cfg-section-teams');
      const secSla = document.getElementById('cfg-section-sla');

      const activateTab = (tab) => {
        [tabSources, tabClients, tabAlertTypes, tabTeams, tabSla].forEach(t => t && t.classList.remove('active'));
        [secSources, secClients, secAlertTypes, secTeams, secSla].forEach(s => s && s.classList.add('hidden'));

        if (tab === 'sources') {
          if (tabSources) tabSources.classList.add('active');
          if (secSources) secSources.classList.remove('hidden');
          this.renderSettingsSources();
        } else if (tab === 'clients') {
          if (tabClients) tabClients.classList.add('active');
          if (secClients) secClients.classList.remove('hidden');
          this.renderSettingsClients();
        } else if (tab === 'alert-types') {
          if (tabAlertTypes) tabAlertTypes.classList.add('active');
          if (secAlertTypes) secAlertTypes.classList.remove('hidden');
          this.renderSettingsAlertTypes();
        } else if (tab === 'teams') {
          if (tabTeams) tabTeams.classList.add('active');
          if (secTeams) secTeams.classList.remove('hidden');
          this.renderSettingsTeams();
        } else if (tab === 'sla') {
          if (tabSla) tabSla.classList.add('active');
          if (secSla) secSla.classList.remove('hidden');
          const input = document.getElementById('cfg-target-sla-input');
          if (input) input.value = storage.getSettings().target_sla_pct || 90;
        }
      };

      if (tabSources) tabSources.addEventListener('click', () => activateTab('sources'));
      if (tabClients) tabClients.addEventListener('click', () => activateTab('clients'));
      if (tabAlertTypes) tabAlertTypes.addEventListener('click', () => activateTab('alert-types'));
      if (tabTeams) tabTeams.addEventListener('click', () => activateTab('teams'));
      if (tabSla) tabSla.addEventListener('click', () => activateTab('sla'));

      // Add New Source
      const btnAddSource = document.getElementById('btn-add-new-source');
      const inputSource = document.getElementById('input-new-source-name');
      if (btnAddSource && inputSource) {
        btnAddSource.addEventListener('click', () => {
          const val = inputSource.value.trim();
          if (!val) return;
          if (storage.addSource(val)) {
            inputSource.value = '';
            this.renderSettingsSources();
            this.showToast(`Source "${val}" added to console!`);
          } else {
            alert('Source already exists.');
          }
        });
      }

      // Add Client to Wazuh
      const btnAddWazuhClient = document.getElementById('btn-add-wazuh-client');
      const inputWazuhClient = document.getElementById('input-new-wazuh-client');
      if (btnAddWazuhClient && inputWazuhClient) {
        btnAddWazuhClient.addEventListener('click', () => {
          const val = inputWazuhClient.value.trim();
          if (!val) return;
          if (storage.addClientToSource('Wazuh', val)) {
            inputWazuhClient.value = '';
            this.renderSettingsClients();
            this.showToast(`Client "${val}" added to Wazuh!`);
          }
        });
      }

      // Add Client to Sophos
      const btnAddSophosClient = document.getElementById('btn-add-sophos-client');
      const inputSophosClient = document.getElementById('input-new-sophos-client');
      if (btnAddSophosClient && inputSophosClient) {
        btnAddSophosClient.addEventListener('click', () => {
          const val = inputSophosClient.value.trim();
          if (!val) return;
          if (storage.addClientToSource('Sophos', val)) {
            inputSophosClient.value = '';
            this.renderSettingsClients();
            this.showToast(`Client "${val}" added to Sophos!`);
          }
        });
      }

      // Add Client to CrowdStrike
      const btnAddCsClient = document.getElementById('btn-add-crowdstrike-client');
      const inputCsClient = document.getElementById('input-new-crowdstrike-client');
      if (btnAddCsClient && inputCsClient) {
        btnAddCsClient.addEventListener('click', () => {
          const val = inputCsClient.value.trim();
          if (!val) return;
          if (storage.addClientToSource('CrowdStrike', val)) {
            inputCsClient.value = '';
            this.renderSettingsClients();
            this.showToast(`Client "${val}" added to CrowdStrike!`);
          }
        });
      }

      // Add Alert Type
      const btnAddAlertType = document.getElementById('btn-add-alert-type');
      const inputAlertType = document.getElementById('input-new-alert-type');
      if (btnAddAlertType && inputAlertType) {
        btnAddAlertType.addEventListener('click', () => {
          const val = inputAlertType.value.trim();
          if (!val) return;
          if (storage.addAlertType(val)) {
            inputAlertType.value = '';
            this.renderSettingsAlertTypes();
            this.showToast(`Alert type "${val}" added to directory!`);
          } else {
            alert('Alert type already exists or is empty.');
          }
        });
      }

      // Add Escalation Team
      const btnAddTeam = document.getElementById('btn-add-escalated-team');
      const inputTeam = document.getElementById('input-new-escalated-team');
      if (btnAddTeam && inputTeam) {
        btnAddTeam.addEventListener('click', () => {
          const val = inputTeam.value.trim();
          if (!val) return;
          if (storage.addEscalatedTeam(val)) {
            inputTeam.value = '';
            this.renderSettingsTeams();
            this.showToast(`Escalation team "${val}" registered!`);
          } else {
            alert('Escalation team already exists or is empty.');
          }
        });
      }

      // Save Target SLA %
      const btnSaveSla = document.getElementById('btn-save-cfg-sla');
      if (btnSaveSla) {
        btnSaveSla.addEventListener('click', () => {
          const input = document.getElementById('cfg-target-sla-input');
          if (!input) return;
          const val = parseFloat(input.value);
          if (!isNaN(val) && val >= 50 && val <= 100) {
            storage.saveSettings({ target_sla_pct: val });
            this.showToast(`Target SLA updated to ${val}%!`);
          } else {
            alert('Please enter a valid percentage between 50 and 100.');
          }
        });
      }

      // Replay Welcome Intro
      const btnReplaySplash = document.getElementById('btn-replay-splash');
      if (btnReplaySplash) {
        btnReplaySplash.addEventListener('click', () => {
          closeModal();
          initSplashScreen(true);
        });
      }
    }

    openSettingsModal() {
      const modal = document.getElementById('settings-modal');
      if (!modal) return;
      modal.classList.remove('hidden');
      this.renderSettingsSources();
      this.renderSettingsClients();
      this.renderSettingsAlertTypes();
      this.renderSettingsTeams();
    }

    renderSettingsSources() {
      const list = document.getElementById('cfg-sources-list');
      if (!list) return;

      const sources = storage.getSources();
      list.innerHTML = sources.map(s => `
        <div class="config-tag-pill">
          <span>${s}</span>
          <button class="btn-del-cfg-src text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer" data-src="${s}" title="Remove this source">✕</button>
        </div>
      `).join('');

      list.querySelectorAll('.btn-del-cfg-src').forEach(btn => {
        btn.addEventListener('click', () => {
          const src = btn.getAttribute('data-src');
          if (confirm(`Remove "${src}" from available sources?`)) {
            storage.deleteSource(src);
            this.renderSettingsSources();
            this.showToast(`Source "${src}" removed`);
          }
        });
      });
    }

    renderSettingsClients() {
      const wazuhList = document.getElementById('cfg-wazuh-clients-list');
      const sophosList = document.getElementById('cfg-sophos-clients-list');
      const csList = document.getElementById('cfg-crowdstrike-clients-list');

      if (wazuhList) {
        const wClients = storage.getClientsForSource('Wazuh');
        wazuhList.innerHTML = wClients.map(c => `
          <div class="config-tag-pill">
            <span class="text-sky-800 font-bold">${c}</span>
            <button class="btn-del-wazuh-client text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer" data-client="${c}" title="Delete client">✕</button>
          </div>
        `).join('');

        wazuhList.querySelectorAll('.btn-del-wazuh-client').forEach(btn => {
          btn.addEventListener('click', () => {
            const cl = btn.getAttribute('data-client');
            storage.deleteClientFromSource('Wazuh', cl);
            this.renderSettingsClients();
          });
        });
      }

      if (sophosList) {
        const sClients = storage.getClientsForSource('Sophos');
        sophosList.innerHTML = sClients.map(c => `
          <div class="config-tag-pill">
            <span class="text-sky-800 font-bold">${c}</span>
            <button class="btn-rename-sophos-client text-sky-600 hover:text-sky-800 text-[10px] font-bold px-1 rounded bg-sky-50 ml-1 cursor-pointer" data-client="${c}" title="Rename client">Edit</button>
            <button class="btn-del-sophos-client text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer" data-client="${c}" title="Delete client">✕</button>
          </div>
        `).join('');

        sophosList.querySelectorAll('.btn-rename-sophos-client').forEach(btn => {
          btn.addEventListener('click', () => {
            const oldName = btn.getAttribute('data-client');
            const newName = prompt(`Rename Sophos client "${oldName}" to:`, oldName);
            if (newName && newName.trim() && newName.trim() !== oldName) {
              storage.renameClientInSource('Sophos', oldName, newName.trim());
              this.renderSettingsClients();
              window.socApp.showToast(`Renamed to "${newName.trim()}"`);
            }
          });
        });

        sophosList.querySelectorAll('.btn-del-sophos-client').forEach(btn => {
          btn.addEventListener('click', () => {
            const cl = btn.getAttribute('data-client');
            storage.deleteClientFromSource('Sophos', cl);
            this.renderSettingsClients();
          });
        });
      }

      if (csList) {
        const csClients = storage.getClientsForSource('CrowdStrike');
        csList.innerHTML = csClients.map(c => `
          <div class="config-tag-pill">
            <span class="text-sky-800 font-bold">${c}</span>
            <button class="btn-del-cs-client text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer" data-client="${c}" title="Delete client">✕</button>
          </div>
        `).join('');

        csList.querySelectorAll('.btn-del-cs-client').forEach(btn => {
          btn.addEventListener('click', () => {
            const cl = btn.getAttribute('data-client');
            storage.deleteClientFromSource('CrowdStrike', cl);
            this.renderSettingsClients();
          });
        });
      }
    }

    renderSettingsAlertTypes() {
      const list = document.getElementById('cfg-alert-types-list');
      if (!list) return;

      const types = storage.getAlertTypes();
      list.innerHTML = types.map(t => `
        <div class="config-tag-pill">
          <span class="text-amber-800 font-bold">${t}</span>
          <button class="btn-del-cfg-alert-type text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer" data-type="${t}" title="Remove alert type">✕</button>
        </div>
      `).join('');

      list.querySelectorAll('.btn-del-cfg-alert-type').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-type');
          if (confirm(`Remove "${type}" from alert types?`)) {
            if (storage.deleteAlertType(type)) {
              this.renderSettingsAlertTypes();
              this.showToast(`Alert type "${type}" removed`);
            }
          }
        });
      });
    }

    renderSettingsTeams() {
      const list = document.getElementById('cfg-teams-list');
      if (!list) return;

      const teams = storage.getEscalatedTeams();
      list.innerHTML = teams.map(tm => `
        <div class="config-tag-pill">
          <span class="text-rose-800 font-bold">${tm}</span>
          <button class="btn-del-cfg-team text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer" data-team="${tm}" title="Remove escalation team">✕</button>
        </div>
      `).join('');

      list.querySelectorAll('.btn-del-cfg-team').forEach(btn => {
        btn.addEventListener('click', () => {
          const tm = btn.getAttribute('data-team');
          if (confirm(`Remove "${tm}" from escalation teams?`)) {
            if (storage.deleteEscalatedTeam(tm)) {
              this.renderSettingsTeams();
              this.showToast(`Escalation team "${tm}" removed`);
            }
          }
        });
      });
    }

    openTodayReportModal(targetDate = null) {
      const dateStr = targetDate || selectedDate || getTodayDateStr();
      this.activeReportDate = dateStr;

      const modal = document.getElementById('tl-report-modal');
      const container = document.getElementById('tl-printable-document-container');
      if (!modal || !container) return;

      const allAlerts = storage.getAlerts();
      const alerts = allAlerts.filter(a => a.alert_date === dateStr);
      const notes = storage.getRemarkForDate(dateStr) || 'Shift handover recorded. Telemetry sources, endpoints, IPs, and triage actions reviewed with duty analyst.';

      const total = alerts.length;
      const critical = alerts.filter(a => a.severity === 'Critical').length;
      const high = alerts.filter(a => a.severity === 'High').length;
      const medium = alerts.filter(a => a.severity === 'Medium').length;
      const low = alerts.filter(a => a.severity === 'Low').length;
      const info = alerts.filter(a => a.severity === 'Informational').length;
      const escalated = alerts.filter(a => a.escalated || a.status === 'Escalated').length;
      const inProgress = alerts.filter(a => a.status === 'Investigating' || a.status === 'Acknowledged').length;
      const resolved = alerts.filter(a => a.status === 'Resolved' || a.status === 'Closed').length;
      const falsePos = alerts.filter(a => a.status === 'False Positive').length;

      const sourceMap = {};
      const clientMap = {};
      alerts.forEach(a => {
        const s = a.source || 'Other';
        sourceMap[s] = (sourceMap[s] || 0) + 1;
        const c = a.client || 'Enterprise';
        clientMap[c] = (clientMap[c] || 0) + 1;
      });

      container.innerHTML = `
        <div class="tl-report-sheet p-6 font-sans">
          
          <!-- Corporate Header Banner -->
          <div class="report-header-banner flex flex-wrap items-center justify-between gap-4 -m-6 mb-6 p-6 rounded-t-xl">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center font-extrabold font-mono-code text-xl shadow-md">
                JK
              </div>
              <div>
                <h2 class="text-base font-extrabold tracking-wider uppercase text-slate-900 font-mono-code flex items-center gap-2">
                  <span class="text-sky-600">JK</span> DEFENSE SOC • TIER-1 OPS
                </h2>
                <p class="text-xs text-slate-500">Daily Incident Briefing & Shift Handover • Specially Prepared for Team Lead (TL)</p>
              </div>
            </div>
            <div class="text-right">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono-code bg-red-100 text-red-800 border border-red-300 uppercase">
                Classification: Confidential / Restricted
              </span>
              <p class="text-xs text-slate-700 mt-1 font-medium">Shift Date: <span class="text-sky-700 font-mono-code font-bold">${dateStr}</span></p>
              <p class="text-[11px] text-slate-500">Generated: ${new Date().toLocaleTimeString()} (UTC+05:30)</p>
            </div>
          </div>

          <!-- 5 Key KPI Metric Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div class="tl-metric-badge border-l-4 border-l-sky-500">
              <span class="tl-metric-val text-sky-700">${total}</span>
              <span class="tl-metric-lbl">Total Alerts Logged</span>
            </div>
            <div class="tl-metric-badge border-l-4 border-l-rose-500">
              <span class="tl-metric-val text-rose-700">${escalated}</span>
              <span class="tl-metric-lbl">Escalated (Urgent)</span>
            </div>
            <div class="tl-metric-badge border-l-4 border-l-amber-500">
              <span class="tl-metric-val text-amber-700">${inProgress}</span>
              <span class="tl-metric-lbl">Under Investigation</span>
            </div>
            <div class="tl-metric-badge border-l-4 border-l-emerald-500">
              <span class="tl-metric-val text-emerald-700">${resolved}</span>
              <span class="tl-metric-lbl">Resolved / Closed</span>
            </div>
            <div class="tl-metric-badge border-l-4 border-l-purple-500">
              <span class="tl-metric-val text-purple-700">${falsePos}</span>
              <span class="tl-metric-lbl">False Positive</span>
            </div>
          </div>

          <!-- 2-Column: Threat Severity Matrix & Client/Telemetry Breakdown -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            <!-- Threat Severity Distribution -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center justify-between">
                <span>Threat Severity Breakdown</span>
                <span class="text-[10px] text-slate-500">Triage Protocols</span>
              </h4>
              <div class="space-y-2.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-red-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-600"></span> Critical</span>
                  <span class="font-mono-code font-bold text-slate-800">${critical} (${total ? Math.round((critical/total)*100) : 0}%)</span>
                  <span class="text-[10px] text-slate-500">15m SLA / Escalated</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-orange-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-orange-600"></span> High</span>
                  <span class="font-mono-code font-bold text-slate-800">${high} (${total ? Math.round((high/total)*100) : 0}%)</span>
                  <span class="text-[10px] text-slate-500">30m SLA / Triage</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-amber-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-600"></span> Medium</span>
                  <span class="font-mono-code font-bold text-slate-800">${medium} (${total ? Math.round((medium/total)*100) : 0}%)</span>
                  <span class="text-[10px] text-slate-500">1h SLA / Priority</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-emerald-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-600"></span> Low</span>
                  <span class="font-mono-code font-bold text-slate-800">${low} (${total ? Math.round((low/total)*100) : 0}%)</span>
                  <span class="text-[10px] text-slate-500">4h SLA / Standard</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-slate-500"></span> Informational</span>
                  <span class="font-mono-code font-bold text-slate-800">${info} (${total ? Math.round((info/total)*100) : 0}%)</span>
                  <span class="text-[10px] text-slate-500">Auditing</span>
                </div>
              </div>
            </div>

            <!-- Client & Telemetry Breakdown -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center justify-between">
                <span>Client & Telemetry Sources</span>
                <span class="text-[10px] text-slate-500 font-mono-code">Clients: ${Object.keys(clientMap).length}</span>
              </h4>
              <div class="space-y-3">
                <div>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clients Impacted:</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    ${Object.entries(clientMap).map(([client, count]) => `
                      <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                        ${client} (${count})
                      </span>
                    `).join('') || '<span class="text-xs text-slate-400 italic">None</span>'}
                  </div>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telemetry Ingestion:</span>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    ${Object.entries(sourceMap).map(([src, count]) => `
                      <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700">
                        ${src}: ${count}
                      </span>
                    `).join('') || '<span class="text-xs text-slate-400 italic">None</span>'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Shift Incident Triage Roster Table -->
          <div class="mb-6 overflow-hidden rounded-xl border border-slate-200">
            <div class="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900">Detailed Incident Triage Roster</h4>
              <span class="text-[10px] text-slate-500 font-mono-code">${total} records logged</span>
            </div>
            <div class="overflow-x-auto max-h-[360px]">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-2.5">ID</th>
                    <th class="p-2.5">Time</th>
                    <th class="p-2.5">Client</th>
                    <th class="p-2.5">Source</th>
                    <th class="p-2.5">Endpoint</th>
                    <th class="p-2.5">IP Address</th>
                    <th class="p-2.5">Alert Type</th>
                    <th class="p-2.5">Severity</th>
                    <th class="p-2.5 text-center">Level</th>
                    <th class="p-2.5">Status</th>
                    <th class="p-2.5">Analyst Actions & Remarks</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-slate-700">
                  ${alerts.map(a => `
                    <tr class="hover:bg-slate-50">
                      <td class="p-2.5 font-mono-code text-sky-700 font-bold">${a.id}</td>
                      <td class="p-2.5 font-mono-code text-slate-600">${formatDisplayTime(a.alert_time)}</td>
                      <td class="p-2.5 font-semibold text-slate-800">${a.client || 'Enterprise'}</td>
                      <td class="p-2.5 text-slate-700">${a.source || 'Other'}</td>
                      <td class="p-2.5 font-mono-code font-medium text-slate-800">${a.endpoint_name || '--'}</td>
                      <td class="p-2.5 font-mono-code text-slate-700">${a.ip_address || '--'}</td>
                      <td class="p-2.5 text-slate-800">${a.alert_type || 'Unknown'}</td>
                      <td class="p-2.5 font-bold ${a.severity === 'Critical' ? 'text-red-600' : a.severity === 'High' ? 'text-orange-600' : a.severity === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}">${a.severity}</td>
                      <td class="p-2.5 font-mono-code font-bold text-center">Lvl ${a.level !== undefined && a.level !== null ? a.level : 1}</td>
                      <td class="p-2.5">
                        ${a.escalated ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">ESCALATED (${a.escalated_to || 'Lead'})</span>` : `<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">${a.status}</span>`}
                      </td>
                      <td class="p-2.5 text-slate-600 max-w-xs truncate" title="${a.remarks || ''}">${a.remarks || 'No remarks entered'}</td>
                    </tr>
                  `).join('') || `
                    <tr>
                      <td colspan="11" class="p-6 text-center text-xs text-slate-400 italic">
                        No alerts logged for this shift date. Ready for new entries.
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Analyst & Team Lead Sign-off Block -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duty Analyst Handover Signature:</span>
              <p class="text-xs font-semibold text-slate-800 mt-1">SOC-L1 Duty Analyst / Security Operations Center</p>
              <p class="text-[10px] text-slate-500">Handover notes: "${notes}"</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Team Lead (TL) Review & Approval:</span>
              <p class="text-xs font-semibold text-sky-700 mt-1">Reviewed & Certified by SOC Team Lead</p>
              <p class="text-[10px] text-slate-400">Digitally timestamped upon export</p>
            </div>
          </div>

        </div>
      `;

      modal.classList.remove('hidden');
    }

    setupQuickActions() {
      // Top "+ Log Alert" Button in Header Menu Bar
      const btnTopLogAlert = document.getElementById('btn-top-log-alert');
      if (btnTopLogAlert) {
        btnTopLogAlert.addEventListener('click', () => {
          this.openAlertModal(null, selectedDate);
        });
      }

      // Quick Today PDF from Header Menu Bar
      const btnQuickPdf = document.getElementById('btn-quick-today-pdf');
      if (btnQuickPdf) {
        btnQuickPdf.addEventListener('click', () => {
          this.openTodayReportModal(selectedDate);
        });
      }

      // TL Modal Buttons
      const btnCloseTl = document.getElementById('btn-close-tl-modal');
      const tlBackdrop = document.getElementById('tl-report-backdrop');
      const closeModal = () => {
        const modal = document.getElementById('tl-report-modal');
        if (modal) modal.classList.add('hidden');
      };
      if (btnCloseTl) btnCloseTl.addEventListener('click', closeModal);
      if (tlBackdrop) tlBackdrop.addEventListener('click', closeModal);

      // Direct Download PDF
      const btnDirectDownload = document.getElementById('btn-modal-download-pdf-direct');
      if (btnDirectDownload) {
        btnDirectDownload.addEventListener('click', () => {
          const success = storage.exportTodayPdfReport(this.activeReportDate || selectedDate);
          if (success) {
            this.showToast('Today Incident PDF downloaded successfully!');
          } else {
            window.print();
          }
        });
      }

      // Print / Save Browser PDF
      const btnPrintPdf = document.getElementById('btn-modal-print-pdf');
      if (btnPrintPdf) {
        btnPrintPdf.addEventListener('click', () => {
          window.print();
        });
      }

      // Copy Shift Briefing for Slack / Teams
      const btnCopyBrief = document.getElementById('btn-modal-copy-summary');
      if (btnCopyBrief) {
        btnCopyBrief.addEventListener('click', () => {
          const dateStr = this.activeReportDate || selectedDate;
          const alerts = storage.getAlerts().filter(a => a.alert_date === dateStr);
          const total = alerts.length;
          const critical = alerts.filter(a => a.severity === 'Critical').length;
          const high = alerts.filter(a => a.severity === 'High').length;
          const escalated = alerts.filter(a => a.escalated).length;
          const resolved = alerts.filter(a => a.status === 'Resolved' || a.status === 'Closed').length;

          const text = [
            `📋 *JK SOC-L1 DAILY INCIDENT BRIEFING — ${dateStr}*`,
            `• *Total Alerts Ingested:* ${total}`,
            `• *Critical / High Threats:* ${critical} Critical | ${high} High`,
            `• *Escalated to Tier-2/IR:* ${escalated}`,
            `• *Resolved / Remediated:* ${resolved}`,
            `• *Shift Analyst:* JK SOC Duty Officer`,
            `• *Full PDF Report:* Downloaded from JK Cyber Command Console`
          ].join('\n');

          navigator.clipboard.writeText(text).then(() => {
            this.showToast('Shift brief copied for Teams / Slack!');
          }).catch(() => {
            this.showToast('Summary copied!');
          });
        });
      }

      const btnResetData = document.getElementById('btn-reset-sample-data');
      if (btnResetData) {
        btnResetData.addEventListener('click', async () => {
          if (confirm('Reset tracker to realistic SOC demo alerts and SLA logs? Any manual additions will be replaced.')) {
            await storage.resetToSampleData();
            this.showToast('Demo dataset loaded and saved to disk');
          }
        });
      }

      const btnClearData = document.getElementById('btn-clear-all-data');
      if (btnClearData) {
        btnClearData.addEventListener('click', async () => {
          if (confirm('Are you sure you want to wipe ALL alerts and start a completely FRESH shift?')) {
            await storage.clearAllData();
            this.showToast('Database wiped clean — Fresh shift ready!');
          }
        });
      }

      const btnBackup = document.getElementById('btn-backup-json');
      if (btnBackup) {
        btnBackup.addEventListener('click', () => {
          storage.exportAllJson();
          this.showToast('Database backup downloaded');
        });
      }
    }

    showToast(message, duration = 3000) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'soc-card px-4 py-2.5 rounded-xl border-l-4 border-l-sky-500 text-xs font-bold text-slate-800 shadow-xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 bg-white';
      toast.innerHTML = `
        <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.socApp.init());
  } else {
    window.socApp.init();
  }
})();
