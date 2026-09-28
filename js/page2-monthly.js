// SOC L1 Alert Tracker - Page 2: Monthly SLA & Severity Summary
import { storage } from './storage.js';
import {
  SEVERITIES,
  SEVERITY_COLORS,
  getTodayDateStr
} from './models.js';

let selectedMonth = new Date().getMonth() + 1; // 1-12
let selectedYear = new Date().getFullYear();
let chartInstance = null;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function initPage2() {
  const container = document.getElementById('page2-container');
  if (!container) return;

  renderPage2Layout(container);
  setupPage2EventListeners();
  updatePage2Data();
}

function renderPage2Layout(container) {
  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  container.innerHTML = `
    <!-- Top Month/Year Control Bar -->
    <div class="soc-card rounded-xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-blue-500">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Monthly Reporting Period</span>
          <div class="flex items-center gap-2">
            <!-- Month Selector -->
            <select id="monthly-select-month" class="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 font-medium cursor-pointer">
              ${MONTH_NAMES.map((m, idx) => `
                <option value="${idx + 1}" ${idx + 1 === selectedMonth ? 'selected' : ''}>${m}</option>
              `).join('')}
            </select>

            <!-- Year Selector -->
            <select id="monthly-select-year" class="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 font-medium font-mono-code cursor-pointer">
              ${years.map(y => `
                <option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>
              `).join('')}
            </select>

            <button id="btn-quick-this-month" class="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-2.5 py-2 rounded-lg transition-colors">
              Current Month
            </button>
          </div>
        </div>

        <div class="hidden sm:block border-r border-slate-800 h-10 mx-2"></div>

        <div>
          <span class="text-xs text-slate-400 block leading-tight">Selected Summary Period</span>
          <span id="monthly-period-display" class="text-sm font-bold text-cyan-400 font-mono-code">
            ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}
          </span>
        </div>
      </div>

      <!-- Quick Nav back to Daily -->
      <button id="btn-nav-to-daily" class="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all">
        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to Daily Dashboard
      </button>
    </div>

    <!-- SECTION 1: MONTHLY SLA SUMMARY (4 KPI Cards) -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Monthly SLA Summary
        </h3>
        <span class="text-xs text-slate-400 italic">Aggregated from daily SLA log entries</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="monthly-sla-kpis">
        <!-- Injected via JS -->
      </div>
    </div>

    <!-- SECTION 2: MONTHLY SEVERITY SUMMARY (Table + Recharts/Chart.js Pie Chart) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      
      <!-- Severity Counts Table (6 cols) -->
      <div class="lg:col-span-6 soc-card rounded-xl p-5 border-t-2 border-t-amber-500 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Monthly Severity Distribution Table
            </h3>
            <span class="text-xs text-slate-400 font-mono-code" id="monthly-alert-total-badge">Total: 0</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th class="py-2.5 px-3">Severity Level</th>
                  <th class="py-2.5 px-3 text-right">Alert Count</th>
                  <th class="py-2.5 px-3 text-right">% of Month</th>
                  <th class="py-2.5 px-3">Share Bar</th>
                </tr>
              </thead>
              <tbody id="monthly-severity-table-body" class="divide-y divide-slate-800">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>* Computed live from all alerts logged in selected month</span>
          <span class="font-mono-code text-cyan-400" id="monthly-sev-date-range"></span>
        </div>
      </div>

      <!-- Severity Pie Chart (6 cols) -->
      <div class="lg:col-span-6 soc-card rounded-xl p-5 border-t-2 border-t-cyan-500 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
              Severity Distribution (Pie Chart)
            </h3>
            <span class="text-xs text-slate-400 italic">Percentages shown on slices</span>
          </div>

          <div class="relative w-full flex flex-col items-center justify-center min-h-[260px] py-2">
            <canvas id="monthly-pie-chart" width="280" height="240" class="max-w-full max-h-[240px]"></canvas>
            
            <!-- Fallback / Empty Chart Notice -->
            <div id="chart-empty-notice" class="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-900/80 rounded-lg">
              <svg class="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <p class="text-xs text-slate-300 font-semibold">No alerts logged for this month</p>
              <p class="text-[11px] text-slate-500 mt-0.5">Log alerts on the daily tracker to visualize distribution</p>
            </div>
          </div>
        </div>

        <!-- Custom Severity Legend -->
        <div class="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-xs" id="pie-chart-legend">
          <!-- Injected via JS -->
        </div>
      </div>

    </div>

    <!-- SECTION 3: DAILY SLA LOG TABLE & LOGGING FORM -->
    <div class="soc-card rounded-xl border border-slate-800 shadow-xl overflow-hidden mb-8">
      
      <!-- Header & Add Row Form -->
      <div class="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 class="text-base font-bold text-white tracking-wide">Daily SLA Log</h3>
            <p class="text-xs text-slate-400 mt-0.5">Track daily SLA performance percentage for each calendar day in ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}</p>
          </div>
        </div>

        <!-- Inline Log Entry Form -->
        <form id="form-log-sla-day" class="p-3 bg-slate-900/90 rounded-lg border border-slate-700/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div class="sm:col-span-3">
            <label for="input-sla-date" class="block text-[11px] font-semibold text-slate-300 mb-1">Date</label>
            <input 
              type="date" 
              id="input-sla-date" 
              required
              value="${getTodayDateStr()}"
              class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 font-mono-code focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div class="sm:col-span-3">
            <label for="input-sla-pct" class="block text-[11px] font-semibold text-slate-300 mb-1">Daily SLA % (0 – 100)</label>
            <div class="relative">
              <input 
                type="number" 
                id="input-sla-pct" 
                required 
                min="0" 
                max="100" 
                step="0.1" 
                placeholder="e.g. 94.5"
                class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 pr-7 font-mono-code focus:ring-cyan-500 focus:border-cyan-500"
              />
              <span class="absolute right-2.5 top-2 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div class="sm:col-span-4">
            <label for="input-sla-notes" class="block text-[11px] font-semibold text-slate-300 mb-1">Notes (Optional)</label>
            <input 
              type="text" 
              id="input-sla-notes" 
              placeholder="e.g. Morning shift queue load handled smoothly..."
              class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div class="sm:col-span-2">
            <button 
              type="submit" 
              class="w-full py-2 px-3 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Save Day Log
            </button>
          </div>
        </form>
      </div>

      <!-- SLA Log Table -->
      <div class="overflow-x-auto max-h-[450px]">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="sticky-table-header uppercase text-[11px] font-semibold text-slate-400 tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" class="px-4 py-3">Log Date</th>
              <th scope="col" class="px-4 py-3">Daily SLA %</th>
              <th scope="col" class="px-4 py-3">Target Comparison</th>
              <th scope="col" class="px-4 py-3">Status</th>
              <th scope="col" class="px-4 py-3 min-w-[250px]">Notes</th>
              <th scope="col" class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="daily-sla-table-body" class="divide-y divide-slate-800 text-slate-300">
            <!-- Injected via JS -->
          </tbody>
        </table>
      </div>

      <!-- SLA Log Empty State -->
      <div id="sla-log-empty-state" class="hidden py-12 px-4 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h4 class="text-sm font-semibold text-slate-200">No SLA entries logged for this month yet</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Use the form above to log the daily SLA percentage for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}.</p>
      </div>

    </div>
  `;
}

function setupPage2EventListeners() {
  const monthSelect = document.getElementById('monthly-select-month');
  if (monthSelect) {
    monthSelect.addEventListener('change', (e) => {
      selectedMonth = parseInt(e.target.value, 10);
      updatePage2Data();
    });
  }

  const yearSelect = document.getElementById('monthly-select-year');
  if (yearSelect) {
    yearSelect.addEventListener('change', (e) => {
      selectedYear = parseInt(e.target.value, 10);
      updatePage2Data();
    });
  }

  const btnThisMonth = document.getElementById('btn-quick-this-month');
  if (btnThisMonth) {
    btnThisMonth.addEventListener('click', () => {
      selectedMonth = new Date().getMonth() + 1;
      selectedYear = new Date().getFullYear();
      if (monthSelect) monthSelect.value = selectedMonth;
      if (yearSelect) yearSelect.value = selectedYear;
      updatePage2Data();
    });
  }

  const btnBack = document.getElementById('btn-nav-to-daily');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      window.socApp.switchTab('page1');
    });
  }

  // SLA Log Form Submit
  const formSla = document.getElementById('form-log-sla-day');
  if (formSla) {
    formSla.addEventListener('submit', (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('input-sla-date').value;
      const pctVal = parseFloat(document.getElementById('input-sla-pct').value);
      const notesVal = document.getElementById('input-sla-notes').value.trim();

      if (isNaN(pctVal) || pctVal < 0 || pctVal > 100) {
        alert('Please enter a valid SLA percentage between 0 and 100.');
        return;
      }

      storage.upsertSlaLog({
        log_date: dateVal,
        daily_sla_pct: Number(pctVal.toFixed(1)),
        notes: notesVal
      });

      // Reset form fields
      document.getElementById('input-sla-pct').value = '';
      document.getElementById('input-sla-notes').value = '';

      updatePage2Data();
    });
  }
}

export function updatePage2Data() {
  const periodDisplay = document.getElementById('monthly-period-display');
  if (periodDisplay) {
    periodDisplay.textContent = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
  }

  const dateRangeEl = document.getElementById('monthly-sev-date-range');
  if (dateRangeEl) {
    const monthStr = String(selectedMonth).padStart(2, '0');
    dateRangeEl.textContent = `${selectedYear}-${monthStr}-01 to ${selectedYear}-${monthStr}-31`;
  }

  const monthStr = String(selectedMonth).padStart(2, '0');
  const monthPrefix = `${selectedYear}-${monthStr}`;

  const allAlerts = storage.getAlerts();
  const monthAlerts = allAlerts.filter(a => a.alert_date && a.alert_date.startsWith(monthPrefix));

  const allSlaLogs = storage.getSlaLogs();
  const monthSlaLogs = allSlaLogs.filter(l => l.log_date && l.log_date.startsWith(monthPrefix));
  monthSlaLogs.sort((a, b) => b.log_date.localeCompare(a.log_date));

  const settings = storage.getSettings();
  const targetSla = settings.target_sla_pct !== undefined ? settings.target_sla_pct : 90;

  // 1. Render Monthly SLA KPI Cards
  renderMonthlySlaKpis(monthSlaLogs, targetSla);

  // 2. Render Monthly Severity Summary Table & Pie Chart
  renderMonthlySeveritySummary(monthAlerts);

  // 3. Render Daily SLA Log Table
  renderDailySlaTable(monthSlaLogs, targetSla);
}

function renderMonthlySlaKpis(monthSlaLogs, targetSla) {
  const kpiContainer = document.getElementById('monthly-sla-kpis');
  if (!kpiContainer) return;

  const daysLogged = monthSlaLogs.length;

  let overallMonthSla = null;
  if (daysLogged > 0) {
    const totalSla = monthSlaLogs.reduce((acc, curr) => acc + (Number(curr.daily_sla_pct) || 0), 0);
    overallMonthSla = (totalSla / daysLogged).toFixed(1);
  }

  // SLA Status logic:
  // "MET" (green) if Overall Month SLA % >= Target SLA %, else "BREACHED" (red).
  // Show "No data" state gracefully when there are zero days logged yet (do not show a false "Breached").
  let slaStatusText = 'No Data';
  let slaStatusClass = 'border-l-slate-500 text-slate-400 bg-slate-500/10';
  let slaBadgeText = 'No days logged';

  if (overallMonthSla !== null) {
    const isMet = parseFloat(overallMonthSla) >= targetSla;
    if (isMet) {
      slaStatusText = 'MET';
      slaStatusClass = 'border-l-emerald-500 text-emerald-400 bg-emerald-500/10';
      slaBadgeText = `Above target (≥ ${targetSla}%)`;
    } else {
      slaStatusText = 'BREACHED';
      slaStatusClass = 'border-l-rose-500 text-rose-400 bg-rose-500/10';
      slaBadgeText = `Below target (< ${targetSla}%)`;
    }
  }

  kpiContainer.innerHTML = `
    <!-- Card 1: Target SLA % (Editable) -->
    <div class="soc-card rounded-xl p-4 border-l-4 border-l-cyan-500 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Target SLA %</span>
        <span class="text-[10px] text-cyan-400 font-mono-code bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">Configurable</span>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <div class="relative w-28">
          <input 
            type="number" 
            id="input-target-sla-edit" 
            value="${targetSla}" 
            min="1" 
            max="100" 
            step="0.5"
            class="bg-slate-900 border border-slate-700 text-2xl font-extrabold font-mono-code text-cyan-400 rounded-lg px-2.5 py-1 w-full focus:ring-2 focus:ring-cyan-500"
          />
          <span class="absolute right-2 top-2 text-sm font-bold text-slate-400">%</span>
        </div>
        <button id="btn-save-target-sla" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-2 rounded border border-slate-700 transition-colors" title="Save Target SLA">
          Save
        </button>
      </div>
      <span class="text-[10px] text-slate-500 mt-2 block">Company threshold across all daily logs</span>
    </div>

    <!-- Card 2: Overall Month SLA % -->
    <div class="soc-card rounded-xl p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Month SLA %</span>
        <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      </div>
      <div class="mt-2 text-3xl font-extrabold font-mono-code ${overallMonthSla !== null ? 'text-white' : 'text-slate-500'}">
        ${overallMonthSla !== null ? `${overallMonthSla}%` : '—'}
      </div>
      <span class="text-[10px] text-slate-400 mt-2 block">Average of daily logs in ${MONTH_NAMES[selectedMonth - 1]}</span>
    </div>

    <!-- Card 3: Days Logged -->
    <div class="soc-card rounded-xl p-4 border-l-4 border-l-purple-500 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Days Logged</span>
        <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      </div>
      <div class="mt-2 text-3xl font-extrabold font-mono-code text-purple-400">
        ${daysLogged}
      </div>
      <span class="text-[10px] text-slate-400 mt-2 block">Calendar days recorded this month</span>
    </div>

    <!-- Card 4: SLA Status (MET / BREACHED / NO DATA) -->
    <div class="soc-card rounded-xl p-4 border-l-4 ${slaStatusClass} flex flex-col justify-between">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly SLA Status</span>
        <span class="w-2.5 h-2.5 rounded-full ${slaStatusText === 'MET' ? 'bg-emerald-500' : (slaStatusText === 'BREACHED' ? 'bg-rose-500' : 'bg-slate-500')}"></span>
      </div>
      <div class="mt-2 text-3xl font-extrabold font-mono-code tracking-tight">
        ${slaStatusText}
      </div>
      <span class="text-[10px] text-slate-400 mt-2 block">${slaBadgeText}</span>
    </div>
  `;

  // Attach Target SLA save button listener
  const btnSaveTarget = document.getElementById('btn-save-target-sla');
  if (btnSaveTarget) {
    btnSaveTarget.addEventListener('click', () => {
      const input = document.getElementById('input-target-sla-edit');
      const val = parseFloat(input.value);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        storage.updateSettings({ target_sla_pct: val });
        updatePage2Data();
      } else {
        alert('Please enter a target SLA between 0% and 100%.');
      }
    });
  }
}

function renderMonthlySeveritySummary(monthAlerts) {
  const tbody = document.getElementById('monthly-severity-table-body');
  const totalBadge = document.getElementById('monthly-alert-total-badge');
  const emptyNotice = document.getElementById('chart-empty-notice');
  const legendContainer = document.getElementById('pie-chart-legend');

  const total = monthAlerts.length;
  if (totalBadge) totalBadge.textContent = `Total Alerts: ${total}`;

  const counts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Informational: 0
  };

  monthAlerts.forEach(a => {
    if (counts[a.severity] !== undefined) {
      counts[a.severity]++;
    }
  });

  // Table rows
  if (tbody) {
    const rowsHtml = SEVERITIES.map(sev => {
      const count = counts[sev] || 0;
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      const color = SEVERITY_COLORS[sev];

      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="py-2.5 px-3 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color.hex}"></span>
              <span class="font-semibold text-slate-200">${sev}</span>
            </div>
          </td>
          <td class="py-2.5 px-3 text-right font-mono-code font-bold text-slate-100">${count}</td>
          <td class="py-2.5 px-3 text-right font-mono-code text-slate-300">${pct}%</td>
          <td class="py-2.5 px-3 min-w-[100px]">
            <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div class="h-1.5 rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${color.hex}"></div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Add TOTAL row at the bottom
    const totalRow = `
      <tr class="bg-slate-900/60 font-bold border-t border-slate-700 text-slate-100">
        <td class="py-2.5 px-3">TOTAL</td>
        <td class="py-2.5 px-3 text-right font-mono-code text-cyan-400">${total}</td>
        <td class="py-2.5 px-3 text-right font-mono-code text-cyan-400">100.0%</td>
        <td class="py-2.5 px-3"></td>
      </tr>
    `;

    tbody.innerHTML = rowsHtml + totalRow;
  }

  // Legend for pie chart
  if (legendContainer) {
    legendContainer.innerHTML = SEVERITIES.map(sev => {
      const color = SEVERITY_COLORS[sev];
      const count = counts[sev] || 0;
      return `
        <div class="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          <span class="w-2 h-2 rounded-full" style="background-color: ${color.hex}"></span>
          <span class="font-medium text-slate-300 text-[11px]">${sev}</span>
          <span class="font-mono-code text-slate-400 text-[10px]">(${count})</span>
        </div>
      `;
    }).join('');
  }

  // Render Pie Chart
  if (total === 0) {
    if (emptyNotice) emptyNotice.classList.remove('hidden');
    drawEmptyCanvas();
  } else {
    if (emptyNotice) emptyNotice.classList.add('hidden');
    renderPieChartWithLabels(counts, total);
  }
}

function drawEmptyCanvas() {
  const canvas = document.getElementById('monthly-pie-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function renderPieChartWithLabels(counts, total) {
  const canvas = document.getElementById('monthly-pie-chart');
  if (!canvas) return;

  // Check if Chart.js is loaded
  if (window.Chart) {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = SEVERITIES;
    const dataValues = SEVERITIES.map(s => counts[s] || 0);
    const backgroundColors = SEVERITIES.map(s => SEVERITY_COLORS[s].hex);

    const ctx = canvas.getContext('2d');

    // Register a custom plugin to draw percentage labels directly on each slice
    const slicePercentagePlugin = {
      id: 'slicePercentagePlugin',
      afterDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((element, index) => {
            const val = dataset.data[index];
            if (val === 0) return;
            const pct = Math.round((val / total) * 100);
            if (pct < 4) return; // skip tiny slices for clarity

            const { x, y } = element.tooltipPosition();
            ctx.save();
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(`${pct}%`, x, y);
            ctx.restore();
          });
        });
      }
    };

    chartInstance = new window.Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Prompt specifies: "category names shown in the legend only (separate) / no clutter"
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return ` ${label}: ${value} alerts (${percentage}%)`;
              }
            }
          }
        }
      },
      plugins: [slicePercentagePlugin]
    });
  } else {
    // High-precision custom Canvas fallback rendering when Chart.js CDN is unavailable
    renderNativeCanvasPie(canvas, counts, total);
  }
}

function renderNativeCanvasPie(canvas, counts, total) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  let currentAngle = -0.5 * Math.PI;

  SEVERITIES.forEach(sev => {
    const count = counts[sev] || 0;
    if (count === 0) return;

    const sliceAngle = (count / total) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = SEVERITY_COLORS[sev].hex;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Percentage Label on Slice
    const pct = Math.round((count / total) * 100);
    if (pct >= 5) {
      const midAngle = currentAngle + sliceAngle / 2;
      const textX = centerX + Math.cos(midAngle) * (radius * 0.65);
      const textY = centerY + Math.sin(midAngle) * (radius * 0.65);

      ctx.save();
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(`${pct}%`, textX, textY);
      ctx.restore();
    }

    currentAngle = endAngle;
  });
}

function renderDailySlaTable(monthSlaLogs, targetSla) {
  const tbody = document.getElementById('daily-sla-table-body');
  const emptyState = document.getElementById('sla-log-empty-state');
  if (!tbody) return;

  if (monthSlaLogs.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = monthSlaLogs.map(log => {
    // Status column per row:
    // Auto: "Met" / "Breached" compared against Target SLA %, blank when the row has no SLA % entered yet
    // (must NOT default to "Breached" for empty rows).
    let statusBadge = '<span class="text-slate-500">—</span>';
    let comparisonText = '<span class="text-slate-500">—</span>';

    if (log.daily_sla_pct !== undefined && log.daily_sla_pct !== null && !isNaN(log.daily_sla_pct)) {
      const diff = (log.daily_sla_pct - targetSla).toFixed(1);
      const diffStr = diff > 0 ? `+${diff}%` : `${diff}%`;

      if (log.daily_sla_pct >= targetSla) {
        statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Met</span>';
        comparisonText = `<span class="text-emerald-400 font-mono-code font-semibold">${diffStr}</span>`;
      } else {
        statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Breached</span>';
        comparisonText = `<span class="text-rose-400 font-mono-code font-semibold">${diffStr}</span>`;
      }
    }

    return `
      <tr class="table-row-hover" data-log-id="${log.id}">
        <!-- Log Date -->
        <td class="px-4 py-3 font-mono-code font-bold text-slate-200 whitespace-nowrap">
          ${log.log_date}
        </td>

        <!-- Daily SLA % -->
        <td class="px-4 py-3 font-mono-code text-cyan-400 font-bold whitespace-nowrap text-sm">
          ${log.daily_sla_pct !== undefined ? `${log.daily_sla_pct}%` : '—'}
        </td>

        <!-- Target Comparison -->
        <td class="px-4 py-3 text-xs whitespace-nowrap">
          ${comparisonText}
        </td>

        <!-- Status (Met / Breached) -->
        <td class="px-4 py-3 whitespace-nowrap">
          ${statusBadge}
        </td>

        <!-- Notes -->
        <td class="px-4 py-3 text-slate-300 max-w-sm truncate" title="${(log.notes || '').replace(/"/g, '&quot;')}">
          ${log.notes || '<span class="text-slate-600 italic">No notes</span>'}
        </td>

        <!-- Actions -->
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <button class="btn-delete-sla text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors" data-id="${log.id}" title="Delete Row">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Delete listener
  document.querySelectorAll('.btn-delete-sla').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`Delete SLA log entry ${id}?`)) {
        storage.deleteSlaLog(id);
        updatePage2Data();
      }
    });
  });
}
