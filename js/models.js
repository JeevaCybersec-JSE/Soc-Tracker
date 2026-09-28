// SOC L1 Alert Tracker - Data Models, Enums & Initial Seed Data

export const SOURCES = [
  'Wazuh',
  'Sophos',
  'CrowdStrike'
];

export const CLIENT_PRESETS = {
  Wazuh: ['Giib', 'Indicosmic', 'Quantique'],
  Sophos: ['NGM', 'Brysa', 'mirror'],
  CrowdStrike: ['Internal Enterprise', 'Tenant Alpha', 'Tenant Beta']
};

export const ALERT_TYPES = [
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

export const SEVERITIES = [
  'Critical',
  'High',
  'Medium',
  'Low',
  'Informational'
];

export const STATUSES = [
  'New',
  'Acknowledged',
  'Investigating',
  'Escalated',
  'Resolved',
  'Closed',
  'False Positive'
];

export const ESCALATED_TEAMS = [
  'SOC L2',
  'SOC Lead',
  'Incident Response Team',
  'IT Team',
  'Network Team',
  'Security Team',
  'Other'
];

export const SEVERITY_COLORS = {
  Critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', hex: '#ef4444' },
  High: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', hex: '#f97316' },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#f59e0b' },
  Low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10b981' },
  Informational: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', hex: '#64748b' }
};

export const STATUS_COLORS = {
  New: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', hex: '#3b82f6' },
  Acknowledged: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', hex: '#6366f1' },
  Investigating: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#f59e0b' },
  Escalated: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', hex: '#f43f5e' },
  Resolved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10b981' },
  Closed: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', hex: '#64748b' },
  'False Positive': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', hex: '#a855f7' }
};

export function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeStr() {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
}

export function generateInitialAlerts() {
  const today = getTodayDateStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

  return [
    {
      id: 'ALT-0001',
      alert_date: today,
      alert_time: '08:14:22',
      source: 'Wazuh',
      alert_type: 'Brute Force',
      severity: 'High',
      status: 'Investigating',
      escalated: false,
      escalated_to: null,
      resolution_time: null,
      remarks: 'Multiple failed SSH attempts from IP 198.51.100.44 targeting bastion host.',
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'ALT-0002',
      alert_date: today,
      alert_time: '09:05:10',
      source: 'Email Security',
      alert_type: 'Phishing',
      severity: 'Critical',
      status: 'Escalated',
      escalated: true,
      escalated_to: 'Incident Response Team',
      resolution_time: null,
      remarks: 'Credential harvesting campaign mimicking internal HR payroll portal. 3 clicks identified.',
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'ALT-0003',
      alert_date: today,
      alert_time: '09:42:15',
      source: 'EDR',
      alert_type: 'Malware Detection',
      severity: 'Critical',
      status: 'Escalated',
      escalated: true,
      escalated_to: 'SOC L2',
      resolution_time: null,
      remarks: 'Cobalt Strike beacon staging detected in %TEMP% on workstation WS-FIN-09.',
      created_at: new Date(Date.now() - 9000000).toISOString(),
      updated_at: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: 'ALT-0004',
      alert_date: today,
      alert_time: '10:18:40',
      source: 'Microsoft 365',
      alert_type: 'Multiple Failed Login',
      severity: 'Medium',
      status: 'Resolved',
      escalated: false,
      escalated_to: null,
      resolution_time: '25m',
      remarks: 'User forgot password after return from PTO. Verified with IT Helpdesk.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 5400000).toISOString()
    },
    {
      id: 'ALT-0005',
      alert_date: today,
      alert_time: '11:02:05',
      source: 'Firewall',
      alert_type: 'Port Scan',
      severity: 'Low',
      status: 'Closed',
      escalated: false,
      escalated_to: null,
      resolution_time: '10m',
      remarks: 'External scan blocked by edge firewall perimeter rule 104.',
      created_at: new Date(Date.now() - 5000000).toISOString(),
      updated_at: new Date(Date.now() - 4000000).toISOString()
    },
    {
      id: 'ALT-0006',
      alert_date: today,
      alert_time: '11:45:30',
      source: 'ManageEngine',
      alert_type: 'Policy Violation',
      severity: 'Medium',
      status: 'False Positive',
      escalated: false,
      escalated_to: null,
      resolution_time: '15m',
      remarks: 'Scheduled admin maintenance script flagged as unauthorized service stop.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 2500000).toISOString()
    },
    {
      id: 'ALT-0007',
      alert_date: today,
      alert_time: '12:20:18',
      source: 'AWS',
      alert_type: 'Unauthorized Access',
      severity: 'High',
      status: 'New',
      escalated: false,
      escalated_to: null,
      resolution_time: null,
      remarks: 'GuardDuty alert: IAM role assumed from unusual geolocated IP.',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'ALT-0008',
      alert_date: today,
      alert_time: '13:05:00',
      source: 'VPN',
      alert_type: 'Successful Login',
      severity: 'Informational',
      status: 'Closed',
      escalated: false,
      escalated_to: null,
      resolution_time: '5m',
      remarks: 'Standard MFA-verified connection from London engineering branch.',
      created_at: new Date(Date.now() - 900000).toISOString(),
      updated_at: new Date(Date.now() - 600000).toISOString()
    },
    // Historical for yesterday
    {
      id: 'ALT-0009',
      alert_date: yesterday,
      alert_time: '14:10:00',
      source: 'EDR',
      alert_type: 'Privilege Escalation',
      severity: 'High',
      status: 'Resolved',
      escalated: true,
      escalated_to: 'Security Team',
      resolution_time: '1h 15m',
      remarks: 'Unquoted service path exploitation attempted and contained.',
      created_at: new Date(Date.now() - 90000000).toISOString(),
      updated_at: new Date(Date.now() - 80000000).toISOString()
    },
    {
      id: 'ALT-0010',
      alert_date: yesterday,
      alert_time: '16:30:45',
      source: 'Firewall',
      alert_type: 'Suspicious Network Traffic',
      severity: 'Medium',
      status: 'Resolved',
      escalated: false,
      escalated_to: null,
      resolution_time: '45m',
      remarks: 'DNS tunneling probe detected; destination domain sinkholed.',
      created_at: new Date(Date.now() - 75000000).toISOString(),
      updated_at: new Date(Date.now() - 70000000).toISOString()
    },
    {
      id: 'ALT-0011',
      alert_date: twoDaysAgo,
      alert_time: '04:12:00',
      source: 'Wazuh',
      alert_type: 'Data Exfiltration',
      severity: 'Critical',
      status: 'Resolved',
      escalated: true,
      escalated_to: 'Incident Response Team',
      resolution_time: '3h 20m',
      remarks: 'Anomalous outbound archive upload to mega.nz. Endpoint quarantined.',
      created_at: new Date(Date.now() - 170000000).toISOString(),
      updated_at: new Date(Date.now() - 150000000).toISOString()
    }
  ];
}

export function generateInitialSlaLogs() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed

  const logs = [];
  // Populate previous days of this month
  const currentDay = d.getDate();
  for (let day = 1; day <= Math.max(currentDay, 15); day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const logDate = `${year}-${monthStr}-${dayStr}`;

    // Sample realistic SLA percentages: 92%, 95%, 88%, 96%, 91%, 89%, etc.
    let slaPct = 90 + ((day * 7) % 9) - 3;
    if (day === 4) slaPct = 86.5; // one breached sample
    if (day === 11) slaPct = 98.2;
    if (day > currentDay) {
      // Future days don't have SLA yet, or skip
      continue;
    }

    logs.push({
      id: `SLA-${year}${monthStr}${dayStr}`,
      log_date: logDate,
      daily_sla_pct: Number(slaPct.toFixed(1)),
      notes: day === 4 ? 'Spike in phishing tickets during morning shift; delayed triage' : 'Met standard queue response thresholds'
    });
  }

  return logs;
}

export const DEFAULT_SETTINGS = {
  target_sla_pct: 90
};
