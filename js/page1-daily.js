// SOC L1 Alert Tracker - Page 1: Daily Dashboard ("SOC Alert Tracker")
import { storage } from './storage.js';
import {
  SOURCES,
  ALERT_TYPES,
  SEVERITIES,
  STATUSES,
  ESCALATED_TEAMS,
  SEVERITY_COLORS,
  STATUS_COLORS,
  getTodayDateStr,
  getCurrentTimeStr
} from './models.js';

let selectedDate = getTodayDateStr();
let sortField = 'alert_time';
let sortDirection = 'desc'; // 'asc' or 'desc'
let filterSearch = '';
let filterSeverity = 'ALL';
let filterStatus = 'ALL';
let filterSource = 'ALL';
let editingAlertId = null;

export function initPage1() {
  const container = document.getElementById('page1-container');
  if (!container) return;

  // Render static structure if not already rendered
  renderPage1Layout(container);
  setupPage1EventListeners();
  updatePage1Data();
}

function renderPage1Layout(container) {
  container.innerHTML = `
    <!-- Top Controls Bar -->
    <div class="soc-card rounded-xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-cyan-500">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Report Date</span>
          <div class="relative flex items-center">
            <input 
              type="date" 
              id="report-date-picker" 
              value="${selectedDate}"
              class="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block px-3 py-2 font-mono-code shadow-inner cursor-pointer"
            />
            <button id="btn-quick-today" title="Jump to today" class="ml-2 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-2.5 py-2 rounded-lg transition-colors">
              Today
            </button>
          </div>
        </div>

        <div class="hidden sm:block border-r border-slate-800 h-10 mx-2"></div>

        <div class="flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <span class="text-xs text-slate-400 block leading-tight">Live Status Engine</span>
            <span id="last-refreshed-time" class="text-xs text-slate-300 font-mono-code">Refreshed just now</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button id="btn-export-csv" class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all shadow">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export Date CSV
        </button>

        <button id="btn-open-add-alert-modal" class="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-lg shadow-cyan-900/30 transition-all transform active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Log New Alert
        </button>
      </div>
    </div>

    <!-- 7 KPI CARDS FOR SELECTED REPORT DATE -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6" id="kpi-cards-grid">
      <!-- Injected via JS -->
    </div>

    <!-- 2-COLUMN SUMMARY WIDGETS: Severity Distribution + Source Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      
      <!-- Today's Severity Summary (5 cols) -->
      <div class="lg:col-span-6 soc-card rounded-xl p-5 border-t-2 border-t-amber-500 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Today's Severity Summary
            </h3>
            <span class="text-xs text-slate-400 font-mono-code" id="sev-summary-total">Total: 0</span>
          </div>
          <div class="space-y-3" id="severity-summary-list">
            <!-- Injected via JS -->
          </div>
        </div>
      </div>

      <!-- Today's Source Summary (7 cols) -->
      <div class="lg:col-span-6 soc-card rounded-xl p-5 border-t-2 border-t-blue-500 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Today's Source Summary
            </h3>
            <span class="text-xs text-slate-400 font-mono-code" id="source-summary-total">Sources: 9</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="source-summary-grid">
            <!-- Injected via JS -->
          </div>
        </div>
      </div>

    </div>

    <!-- REMARKS / OBSERVATIONS FOR TL -->
    <div class="soc-card rounded-xl p-5 mb-6 border-l-4 border-l-rose-500">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <h3 class="text-sm font-semibold text-slate-200 uppercase tracking-wider">Remarks / Observations for Team Lead (TL)</h3>
        </div>
        <span id="notes-save-indicator" class="text-xs text-slate-400 italic">Saved automatically</span>
      </div>

      <!-- Auto-generated Warning Line -->
      <div id="tl-auto-warning" class="px-4 py-3 rounded-lg mb-3 text-sm font-medium transition-all">
        <!-- Injected via JS -->
      </div>

      <!-- Free text notes box persisted per day -->
      <div>
        <label for="tl-daily-notes" class="block text-xs text-slate-400 mb-1.5 font-medium">Analyst Daily Handover / Investigation Notes (Date: <span id="notes-date-label" class="font-mono-code text-cyan-400"></span>):</label>
        <textarea 
          id="tl-daily-notes" 
          rows="3" 
          placeholder="Enter shift handover notes, root cause findings, pending analyst reviews, or follow-ups for TL..."
          class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
        ></textarea>
      </div>
    </div>

    <!-- ALERT LOG TABLE SECTION -->
    <div class="soc-card rounded-xl border border-slate-800 shadow-2xl overflow-hidden mb-8">
      
      <!-- Table Header & Filter Bar -->
      <div class="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-white tracking-wide">SOC Alert Log Table</h2>
            <span id="table-row-count-badge" class="px-2 py-0.5 text-xs rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono-code">0 alerts</span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Full CRUD alert log table with inline editing, conditional badges, and multi-filters</p>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <!-- Search box -->
          <div class="relative">
            <input 
              type="text" 
              id="filter-search" 
              placeholder="Search ID, remarks, type..." 
              class="bg-slate-900 border border-slate-700 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs focus:ring-cyan-500 focus:border-cyan-500 w-44 sm:w-56"
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <!-- Severity Filter -->
          <select id="filter-severity" class="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs focus:ring-cyan-500 focus:border-cyan-500">
            <option value="ALL">Severity: All</option>
            ${SEVERITIES.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>

          <!-- Status Filter -->
          <select id="filter-status" class="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs focus:ring-cyan-500 focus:border-cyan-500">
            <option value="ALL">Status: All</option>
            ${STATUSES.map(st => `<option value="${st}">${st}</option>`).join('')}
          </select>

          <!-- Source Filter -->
          <select id="filter-source" class="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs focus:ring-cyan-500 focus:border-cyan-500">
            <option value="ALL">Source: All</option>
            ${SOURCES.map(sc => `<option value="${sc}">${sc}</option>`).join('')}
          </select>

          <!-- Reset Filter Button -->
          <button id="btn-reset-filters" class="text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Table Scroll Container with Sticky Header -->
      <div class="overflow-x-auto max-h-[580px] relative">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="sticky-table-header uppercase text-[11px] font-semibold text-slate-400 tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-cyan-400 transition-colors" data-sort="id">
                <div class="flex items-center gap-1">ID <span class="sort-icon font-normal opacity-50" data-col="id">↕</span></div>
              </th>
              <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-cyan-400 transition-colors" data-sort="alert_date">
                <div class="flex items-center gap-1">Date <span class="sort-icon font-normal opacity-50" data-col="alert_date">↕</span></div>
              </th>
              <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-cyan-400 transition-colors" data-sort="alert_time">
                <div class="flex items-center gap-1">Time <span class="sort-icon font-normal opacity-50" data-col="alert_time">↕</span></div>
              </th>
              <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-cyan-400 transition-colors" data-sort="source">
                <div class="flex items-center gap-1">Source <span class="sort-icon font-normal opacity-50" data-col="source">↕</span></div>
              </th>
              <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-cyan-400 transition-colors" data-sort="alert_type">
                <div class="flex items-center gap-1">Alert Type <span class="sort-icon font-normal opacity-50" data-col="alert_type">↕</span></div>
              </th>
              <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-cyan-400 transition-colors" data-sort="severity">
                <div class="flex items-center gap-1">Severity <span class="sort-icon font-normal opacity-50" data-col="severity">↕</span></div>
              </th>
              <th scope="col" class="px-3.5 py-3 cursor-pointer hover:text-cyan-400 transition-colors" data-sort="status">
                <div class="flex items-center gap-1">Status <span class="sort-icon font-normal opacity-50" data-col="status">↕</span></div>
              </th>
              <th scope="col" class="px-3 py-3">Escalated?</th>
              <th scope="col" class="px-3.5 py-3">Escalated To</th>
              <th scope="col" class="px-3.5 py-3">Resolution Time</th>
              <th scope="col" class="px-4 py-3 min-w-[200px]">Remarks / Analysis</th>
              <th scope="col" class="px-3.5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="alerts-table-body" class="divide-y divide-slate-800 text-slate-300">
            <!-- Injected via JS -->
          </tbody>
        </table>
      </div>

      <!-- Empty state container -->
      <div id="table-empty-state" class="hidden py-14 px-4 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <h4 class="text-sm font-semibold text-slate-200">No alerts found for this date & filter</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">There are no security alerts logged for ${selectedDate} or matching your current search filters.</p>
        <button id="btn-empty-add-alert" class="mt-4 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors">
          + Add First Alert For This Date
        </button>
      </div>

      <!-- Table Footer Status -->
      <div class="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
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
  if (datePicker) {
    datePicker.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      updatePage1Data();
    });
  }

  const btnToday = document.getElementById('btn-quick-today');
  if (btnToday) {
    btnToday.addEventListener('click', () => {
      selectedDate = getTodayDateStr();
      const dp = document.getElementById('report-date-picker');
      if (dp) dp.value = selectedDate;
      updatePage1Data();
    });
  }

  // TL Notes auto-save
  const notesTextarea = document.getElementById('tl-daily-notes');
  if (notesTextarea) {
    let saveTimeout = null;
    notesTextarea.addEventListener('input', (e) => {
      const indicator = document.getElementById('notes-save-indicator');
      if (indicator) indicator.textContent = 'Saving...';
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        storage.saveRemarkForDate(selectedDate, e.target.value);
        if (indicator) indicator.textContent = 'Saved automatically';
      }, 500);
    });
  }

  // Export CSV
  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      storage.exportAlertsCsv(selectedDate);
    });
  }

  // Open Add Alert Modal
  const btnAdd = document.getElementById('btn-open-add-alert-modal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      window.socApp.openAlertModal(null, selectedDate);
    });
  }

  const btnEmptyAdd = document.getElementById('btn-empty-add-alert');
  if (btnEmptyAdd) {
    btnEmptyAdd.addEventListener('click', () => {
      window.socApp.openAlertModal(null, selectedDate);
    });
  }

  // Search & Filter listeners
  const searchInput = document.getElementById('filter-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterSearch = e.target.value.toLowerCase();
      renderAlertsTable();
    });
  }

  const sevFilter = document.getElementById('filter-severity');
  if (sevFilter) {
    sevFilter.addEventListener('change', (e) => {
      filterSeverity = e.target.value;
      renderAlertsTable();
    });
  }

  const statusFilter = document.getElementById('filter-status');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      renderAlertsTable();
    });
  }

  const sourceFilter = document.getElementById('filter-source');
  if (sourceFilter) {
    sourceFilter.addEventListener('change', (e) => {
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
      if (searchInput) searchInput.value = '';
      if (sevFilter) sevFilter.value = 'ALL';
      if (statusFilter) statusFilter.value = 'ALL';
      if (sourceFilter) sourceFilter.value = 'ALL';
      renderAlertsTable();
    });
  }

  // Table header sorting
  const sortHeaders = document.querySelectorAll('th[data-sort]');
  sortHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDirection = 'desc';
      }
      updateSortIndicators();
      renderAlertsTable();
    });
  });
}

function updateSortIndicators() {
  document.querySelectorAll('.sort-icon').forEach(icon => {
    const col = icon.getAttribute('data-col');
    if (col === sortField) {
      icon.textContent = sortDirection === 'asc' ? '▲' : '▼';
      icon.classList.remove('opacity-50');
      icon.classList.add('text-cyan-400', 'font-bold');
    } else {
      icon.textContent = '↕';
      icon.classList.add('opacity-50');
      icon.classList.remove('text-cyan-400', 'font-bold');
    }
  });
}

export function updatePage1Data() {
  const allAlerts = storage.getAlerts();
  const dateAlerts = allAlerts.filter(a => a.alert_date === selectedDate);

  // Update Last Refreshed
  const refreshedEl = document.getElementById('last-refreshed-time');
  if (refreshedEl) {
    refreshedEl.textContent = `Refreshed ${getCurrentTimeStr()}`;
  }

  // Update Notes for Selected Date
  const notesTextarea = document.getElementById('tl-daily-notes');
  const dateLabel = document.getElementById('notes-date-label');
  if (dateLabel) dateLabel.textContent = selectedDate;
  if (notesTextarea) {
    notesTextarea.value = storage.getRemarkForDate(selectedDate);
  }

  // 1. Render 7 KPI Cards
  renderKpiCards(dateAlerts);

  // 2. Render Severity Summary
  renderSeveritySummary(dateAlerts);

  // 3. Render Source Summary
  renderSourceSummary(dateAlerts);

  // 4. Render TL Warning Line
  renderTlWarningLine(dateAlerts);

  // 5. Render Alert Log Table
  renderAlertsTable();
}

function renderKpiCards(dateAlerts) {
  const total = dateAlerts.length;
  const countNew = dateAlerts.filter(a => a.status === 'New').length;
  const countInProgress = dateAlerts.filter(a => a.status === 'Investigating').length;
  const countEscalated = dateAlerts.filter(a => a.status === 'Escalated' || a.escalated === true).length;
  const countResolved = dateAlerts.filter(a => a.status === 'Resolved').length;
  const countClosed = dateAlerts.filter(a => a.status === 'Closed').length;
  const countFalsePositive = dateAlerts.filter(a => a.status === 'False Positive').length;

  const kpis = [
    {
      title: 'Total Alerts',
      count: total,
      color: 'border-l-cyan-500 text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
    },
    {
      title: 'New',
      count: countNew,
      color: 'border-l-blue-500 text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>'
    },
    {
      title: 'In Progress',
      subtitle: '(Investigating)',
      count: countInProgress,
      color: 'border-l-amber-500 text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>'
    },
    {
      title: 'Escalated',
      count: countEscalated,
      color: 'border-l-rose-500 text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'
    },
    {
      title: 'Resolved',
      count: countResolved,
      color: 'border-l-emerald-500 text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
    },
    {
      title: 'Closed',
      count: countClosed,
      color: 'border-l-slate-400 text-slate-400',
      badgeBg: 'bg-slate-500/10 text-slate-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
    },
    {
      title: 'False Positive',
      count: countFalsePositive,
      color: 'border-l-purple-500 text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-300',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>'
    }
  ];

  const grid = document.getElementById('kpi-cards-grid');
  if (!grid) return;

  grid.innerHTML = kpis.map(kpi => `
    <div class="soc-card rounded-xl p-3.5 sm:p-4 border-l-4 ${kpi.color} flex flex-col justify-between relative overflow-hidden group">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">${kpi.title}</span>
        <svg class="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">${kpi.icon}</svg>
      </div>
      <div class="mt-2 flex items-baseline justify-between">
        <div class="text-2xl sm:text-3xl font-extrabold font-mono-code tracking-tight">${kpi.count}</div>
        ${kpi.subtitle ? `<span class="text-[10px] text-slate-500 italic">${kpi.subtitle}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function renderSeveritySummary(dateAlerts) {
  const container = document.getElementById('severity-summary-list');
  const totalEl = document.getElementById('sev-summary-total');
  if (!container) return;

  const total = dateAlerts.length;
  if (totalEl) totalEl.textContent = `Total: ${total}`;

  const counts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Informational: 0
  };

  dateAlerts.forEach(a => {
    if (counts[a.severity] !== undefined) {
      counts[a.severity]++;
    }
  });

  container.innerHTML = SEVERITIES.map(sev => {
    const count = counts[sev] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const color = SEVERITY_COLORS[sev];

    return `
      <div>
        <div class="flex items-center justify-between text-xs mb-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color.hex}"></span>
            <span class="font-medium text-slate-200">${sev}</span>
          </div>
          <div class="flex items-center gap-2 font-mono-code">
            <span class="font-bold text-slate-100">${count}</span>
            <span class="text-slate-500 text-[10px]">(${pct}%)</span>
          </div>
        </div>
        <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div class="h-1.5 rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${color.hex}"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSourceSummary(dateAlerts) {
  const grid = document.getElementById('source-summary-grid');
  const totalEl = document.getElementById('source-summary-total');
  if (!grid) return;

  const sourceCounts = {};
  SOURCES.forEach(s => { sourceCounts[s] = 0; });
  dateAlerts.forEach(a => {
    if (sourceCounts[a.source] !== undefined) {
      sourceCounts[a.source]++;
    } else {
      sourceCounts['Other'] = (sourceCounts['Other'] || 0) + 1;
    }
  });

  const activeSources = Object.values(sourceCounts).filter(c => c > 0).length;
  if (totalEl) totalEl.textContent = `Active Sources: ${activeSources}`;

  grid.innerHTML = SOURCES.map(src => {
    const count = sourceCounts[src] || 0;
    const isZero = count === 0;

    return `
      <div class="p-2.5 rounded-lg border ${isZero ? 'bg-slate-900/40 border-slate-800/60 opacity-60' : 'bg-slate-900/90 border-slate-700/80'} flex items-center justify-between transition-all">
        <span class="text-xs font-medium text-slate-300 truncate mr-2" title="${src}">${src}</span>
        <span class="px-2 py-0.5 text-xs font-bold font-mono-code rounded ${count > 0 ? 'bg-blue-500/20 text-cyan-300 border border-blue-500/30' : 'bg-slate-800 text-slate-500'}">
          ${count}
        </span>
      </div>
    `;
  }).join('');
}

function renderTlWarningLine(dateAlerts) {
  const warningContainer = document.getElementById('tl-auto-warning');
  if (!warningContainer) return;

  // N = count of Critical severity + Escalated status alerts today
  // Let's identify alerts that are Critical OR Escalated
  const criticalOrEscalated = dateAlerts.filter(a => a.severity === 'Critical' || a.status === 'Escalated' || a.escalated === true);
  const n = criticalOrEscalated.length;

  if (n > 0) {
    warningContainer.className = 'px-4 py-3 rounded-lg mb-3 text-xs sm:text-sm font-semibold bg-rose-950/40 border border-rose-600/40 text-rose-300 flex items-center justify-between gap-3';
    warningContainer.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="text-lg">⚠</span>
        <span><strong>${n} Critical / Escalated alert(s)</strong> logged for ${selectedDate} — please review the Remarks & escalated teams below.</span>
      </div>
      <button id="btn-filter-urgent" class="text-xs bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded font-sans transition-colors whitespace-nowrap">
        Filter Urgent
      </button>
    `;

    const btnUrgent = document.getElementById('btn-filter-urgent');
    if (btnUrgent) {
      btnUrgent.addEventListener('click', () => {
        filterSeverity = 'Critical';
        const sevSelect = document.getElementById('filter-severity');
        if (sevSelect) sevSelect.value = 'Critical';
        renderAlertsTable();
      });
    }
  } else {
    warningContainer.className = 'px-4 py-3 rounded-lg mb-3 text-xs sm:text-sm font-semibold bg-emerald-950/30 border border-emerald-600/30 text-emerald-300 flex items-center gap-2.5';
    warningContainer.innerHTML = `
      <span class="text-base text-emerald-400">✓</span>
      <span>No Critical or Escalated alerts logged for ${selectedDate}. Operations running within normal baseline.</span>
    `;
  }
}

function renderAlertsTable() {
  const allAlerts = storage.getAlerts();
  let dateAlerts = allAlerts.filter(a => a.alert_date === selectedDate);

  // Apply filters
  if (filterSearch) {
    dateAlerts = dateAlerts.filter(a => 
      (a.id && a.id.toLowerCase().includes(filterSearch)) ||
      (a.remarks && a.remarks.toLowerCase().includes(filterSearch)) ||
      (a.alert_type && a.alert_type.toLowerCase().includes(filterSearch)) ||
      (a.source && a.source.toLowerCase().includes(filterSearch)) ||
      (a.escalated_to && a.escalated_to.toLowerCase().includes(filterSearch))
    );
  }

  if (filterSeverity !== 'ALL') {
    dateAlerts = dateAlerts.filter(a => a.severity === filterSeverity);
  }

  if (filterStatus !== 'ALL') {
    dateAlerts = dateAlerts.filter(a => a.status === filterStatus);
  }

  if (filterSource !== 'ALL') {
    dateAlerts = dateAlerts.filter(a => a.source === filterSource);
  }

  // Sorting
  dateAlerts.sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (sortField === 'severity') {
      const order = { Critical: 4, High: 3, Medium: 2, Low: 1, Informational: 0 };
      valA = order[valA] !== undefined ? order[valA] : -1;
      valB = order[valB] !== undefined ? order[valB] : -1;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const tbody = document.getElementById('alerts-table-body');
  const emptyState = document.getElementById('table-empty-state');
  const rowCountBadge = document.getElementById('table-row-count-badge');
  const summaryStatus = document.getElementById('table-summary-status');

  if (rowCountBadge) {
    rowCountBadge.textContent = `${dateAlerts.length} alert${dateAlerts.length === 1 ? '' : 's'}`;
  }

  if (summaryStatus) {
    summaryStatus.textContent = `Showing ${dateAlerts.length} alert(s) for ${selectedDate}`;
  }

  if (!tbody) return;

  if (dateAlerts.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = dateAlerts.map(alert => {
    const isInlineEditing = editingAlertId === alert.id;
    const sevColor = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.Informational;
    const stColor = STATUS_COLORS[alert.status] || STATUS_COLORS.Closed;

    if (isInlineEditing) {
      // INLINE EDIT ROW
      return `
        <tr class="inline-editing" data-alert-id="${alert.id}">
          <td class="px-3.5 py-2.5 font-mono-code font-bold text-cyan-400">${alert.id}</td>
          <td class="px-3.5 py-2.5">
            <input type="date" id="inline-date-${alert.id}" value="${alert.alert_date}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100 font-mono-code w-32" />
          </td>
          <td class="px-3.5 py-2.5">
            <input type="text" id="inline-time-${alert.id}" value="${alert.alert_time}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100 font-mono-code w-24" />
          </td>
          <td class="px-3.5 py-2.5">
            <select id="inline-source-${alert.id}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100">
              ${SOURCES.map(s => `<option value="${s}" ${s === alert.source ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
          <td class="px-3.5 py-2.5">
            <select id="inline-type-${alert.id}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100 max-w-[160px]">
              ${ALERT_TYPES.map(t => `<option value="${t}" ${t === alert.alert_type ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </td>
          <td class="px-3.5 py-2.5">
            <select id="inline-severity-${alert.id}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100 font-bold">
              ${SEVERITIES.map(sev => `<option value="${sev}" ${sev === alert.severity ? 'selected' : ''}>${sev}</option>`).join('')}
            </select>
          </td>
          <td class="px-3.5 py-2.5">
            <select id="inline-status-${alert.id}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100 font-bold">
              ${STATUSES.map(st => `<option value="${st}" ${st === alert.status ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </td>
          <td class="px-3 py-2.5">
            <select id="inline-escalated-${alert.id}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100">
              <option value="false" ${!alert.escalated ? 'selected' : ''}>No</option>
              <option value="true" ${alert.escalated ? 'selected' : ''}>Yes</option>
            </select>
          </td>
          <td class="px-3.5 py-2.5">
            <select id="inline-escalated-to-${alert.id}" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100">
              <option value="">None</option>
              ${ESCALATED_TEAMS.map(team => `<option value="${team}" ${team === alert.escalated_to ? 'selected' : ''}>${team}</option>`).join('')}
            </select>
          </td>
          <td class="px-3.5 py-2.5">
            <input type="text" id="inline-resolution-${alert.id}" value="${alert.resolution_time || ''}" placeholder="e.g. 25m" class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100 w-20" />
          </td>
          <td class="px-4 py-2.5">
            <input type="text" id="inline-remarks-${alert.id}" value="${alert.remarks || ''}" placeholder="Analyst remarks..." class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-100 w-full" />
          </td>
          <td class="px-3.5 py-2.5 text-right whitespace-nowrap">
            <button class="btn-save-inline text-emerald-400 hover:text-emerald-300 font-bold text-xs mr-2 px-2 py-1 bg-emerald-950/60 border border-emerald-800 rounded" data-id="${alert.id}">
              Save
            </button>
            <button class="btn-cancel-inline text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-slate-800 rounded" data-id="${alert.id}">
              Cancel
            </button>
          </td>
        </tr>
      `;
    }

    // STANDARD READ ROW
    return `
      <tr class="table-row-hover ${alert.severity === 'Critical' ? 'bg-red-950/10' : ''}" data-alert-id="${alert.id}">
        <!-- 1. ID -->
        <td class="px-3.5 py-3 font-mono-code font-bold text-cyan-400 whitespace-nowrap">
          ${alert.id}
        </td>

        <!-- 2. Alert Date -->
        <td class="px-3.5 py-3 font-mono-code text-slate-300 whitespace-nowrap">
          ${alert.alert_date}
        </td>

        <!-- 3. Alert Time -->
        <td class="px-3.5 py-3 font-mono-code text-slate-300 whitespace-nowrap">
          ${alert.alert_time}
        </td>

        <!-- 4. Source -->
        <td class="px-3.5 py-3 whitespace-nowrap">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700">
            ${alert.source}
          </span>
        </td>

        <!-- 5. Alert Type -->
        <td class="px-3.5 py-3 font-medium text-slate-200 whitespace-nowrap">
          ${alert.alert_type}
        </td>

        <!-- 6. Severity Badge -->
        <td class="px-3.5 py-3 whitespace-nowrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${sevColor.bg} ${sevColor.text} border ${sevColor.border}">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${sevColor.hex}"></span>
            ${alert.severity}
          </span>
        </td>

        <!-- 7. Status Badge -->
        <td class="px-3.5 py-3 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${stColor.bg} ${stColor.text} border ${stColor.border}">
            ${alert.status}
          </span>
        </td>

        <!-- 8. Escalated -->
        <td class="px-3 py-3 text-center whitespace-nowrap">
          ${alert.escalated 
            ? '<span class="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">YES</span>' 
            : '<span class="text-slate-500 text-xs">No</span>'}
        </td>

        <!-- 9. Escalated To -->
        <td class="px-3.5 py-3 whitespace-nowrap text-slate-300">
          ${alert.escalated_to ? `<span class="text-amber-400 font-medium">${alert.escalated_to}</span>` : '<span class="text-slate-600">—</span>'}
        </td>

        <!-- 10. Resolution Time -->
        <td class="px-3.5 py-3 font-mono-code text-slate-300 whitespace-nowrap">
          ${alert.resolution_time ? `<span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">${alert.resolution_time}</span>` : '<span class="text-slate-600">—</span>'}
        </td>

        <!-- 11. Remarks -->
        <td class="px-4 py-3 text-slate-300 max-w-xs truncate" title="${(alert.remarks || '').replace(/"/g, '&quot;')}">
          ${alert.remarks || '<span class="text-slate-600 italic">No notes</span>'}
        </td>

        <!-- 12. Actions -->
        <td class="px-3.5 py-3 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            <button class="btn-quick-inline-edit text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 transition-colors" title="Inline Edit" data-id="${alert.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn-modal-edit text-slate-400 hover:text-blue-400 p-1 rounded hover:bg-slate-800 transition-colors" title="Full Edit Modal" data-id="${alert.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </button>
            <button class="btn-delete-alert text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors" title="Delete Alert" data-id="${alert.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachTableActionListeners();
}

function attachTableActionListeners() {
  // Inline edit toggle
  document.querySelectorAll('.btn-quick-inline-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      editingAlertId = id;
      renderAlertsTable();
    });
  });

  // Cancel inline edit
  document.querySelectorAll('.btn-cancel-inline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      editingAlertId = null;
      renderAlertsTable();
    });
  });

  // Save inline edit
  document.querySelectorAll('.btn-save-inline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const updatedFields = {
        alert_date: document.getElementById(`inline-date-${id}`).value,
        alert_time: document.getElementById(`inline-time-${id}`).value,
        source: document.getElementById(`inline-source-${id}`).value,
        alert_type: document.getElementById(`inline-type-${id}`).value,
        severity: document.getElementById(`inline-severity-${id}`).value,
        status: document.getElementById(`inline-status-${id}`).value,
        escalated: document.getElementById(`inline-escalated-${id}`).value === 'true',
        escalated_to: document.getElementById(`inline-escalated-to-${id}`).value || null,
        resolution_time: document.getElementById(`inline-resolution-${id}`).value.trim() || null,
        remarks: document.getElementById(`inline-remarks-${id}`).value.trim()
      };

      storage.updateAlert(id, updatedFields);
      editingAlertId = null;
      updatePage1Data();
    });
  });

  // Modal edit button
  document.querySelectorAll('.btn-modal-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const allAlerts = storage.getAlerts();
      const alert = allAlerts.find(a => a.id === id);
      if (alert) {
        window.socApp.openAlertModal(alert);
      }
    });
  });

  // Delete button
  document.querySelectorAll('.btn-delete-alert').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (confirm(`Are you sure you want to delete alert ${id}?`)) {
        storage.deleteAlert(id);
        updatePage1Data();
      }
    });
  });
}
