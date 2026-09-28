const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'soc_database.json');

// Ensure database directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Default clean initial dataset (0 logs, completely fresh)
function getInitialData() {
  return {
    metadata: {
      app: 'JK SOC-L1 Cyber Tracker',
      version: '2.0.0',
      created_at: new Date().toISOString(),
      last_saved: new Date().toISOString()
    },
    settings: {
      target_sla_pct: 90,
      sources: [
        'Wazuh', 'Sophos', 'CrowdStrike'
      ],
      clients: {
        Wazuh: ['Giib', 'Indicosmic', 'Quantique'],
        Sophos: ['NGM', 'Brysa', 'mirror'],
        CrowdStrike: ['Internal Enterprise', 'Tenant Alpha', 'Tenant Beta']
      },
      alert_types: [
        'Malware Detection', 'Phishing', 'Brute Force', 'Multiple Failed Login',
        'Successful Login', 'Unauthorized Access', 'Port Scan', 'Suspicious Network Traffic',
        'Privilege Escalation', 'Endpoint Security', 'Policy Violation', 'Data Exfiltration', 'Other'
      ],
      escalated_teams: [
        'SOC L2', 'SOC Lead', 'Incident Response Team', 'IT Team', 'Network Team', 'Security Team', 'Other'
      ]
    },
    daily_notes: {},
    sla_logs: [],
    alerts: []
  };
}

// Sample dataset only used when user clicks "Seed Demo"
function getSampleDemoData() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

  const year = now.getFullYear();
  const month = now.getMonth();
  const currentDay = now.getDate();

  const slaLogs = [];
  for (let day = 1; day <= Math.max(currentDay, 15); day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const logDate = `${year}-${monthStr}-${dayStr}`;

    let slaPct = 90 + ((day * 7) % 9) - 3;
    if (day === 4) slaPct = 86.5;
    if (day === 11) slaPct = 98.2;
    if (day > currentDay) continue;

    slaLogs.push({
      id: `SLA-${year}${monthStr}${dayStr}`,
      log_date: logDate,
      daily_sla_pct: Number(slaPct.toFixed(1)),
      notes: day === 4 ? 'Morning queue surge; delayed response triage' : 'Met standard queue response thresholds'
    });
  }

  return {
    metadata: {
      app: 'JK SOC-L1 Cyber Tracker',
      version: '2.0.0',
      created_at: new Date().toISOString(),
      last_saved: new Date().toISOString()
    },
    settings: {
      target_sla_pct: 90,
      sources: ['Wazuh', 'Sophos', 'CrowdStrike'],
      clients: {
        Wazuh: ['Giib', 'Indicosmic', 'Quantique'],
        Sophos: ['NGM', 'Brysa', 'mirror'],
        CrowdStrike: ['Internal Enterprise', 'Tenant Alpha', 'Tenant Beta']
      },
      alert_types: [
        'Malware Detection', 'Phishing', 'Brute Force', 'Multiple Failed Login',
        'Successful Login', 'Unauthorized Access', 'Port Scan', 'Suspicious Network Traffic',
        'Privilege Escalation', 'Endpoint Security', 'Policy Violation', 'Data Exfiltration', 'Other'
      ],
      escalated_teams: [
        'SOC L2', 'SOC Lead', 'Incident Response Team', 'IT Team', 'Network Team', 'Security Team', 'Other'
      ]
    },
    daily_notes: {
      [today]: 'Standard shift handover: CrowdStrike and Sophos telemetry active. Monitored external perimeter and IAM authentications.'
    },
    sla_logs: slaLogs,
    alerts: [
      {
        id: 'ALT-0001',
        alert_date: today,
        alert_time: '08:14:22 AM',
        source: 'Wazuh',
        client: 'Indicosmic',
        endpoint_name: 'BASTION-01',
        ip_address: '198.51.100.44',
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
        alert_time: '09:05:10 AM',
        source: 'Email Security',
        client: 'Internal Enterprise',
        endpoint_name: 'MAIL-GW-02',
        ip_address: '203.0.113.19',
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
        alert_time: '09:42:15 AM',
        source: 'CrowdStrike',
        client: 'Internal Enterprise',
        endpoint_name: 'WS-FIN-09',
        ip_address: '10.200.4.52',
        alert_type: 'Malware Detection',
        severity: 'Critical',
        status: 'Escalated',
        escalated: true,
        escalated_to: 'SOC L2',
        resolution_time: null,
        remarks: 'CrowdStrike Falcon detected Cobalt Strike beacon staging in %TEMP% on workstation WS-FIN-09.',
        created_at: new Date(Date.now() - 9000000).toISOString(),
        updated_at: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: 'ALT-0004',
        alert_date: today,
        alert_time: '10:18:40 AM',
        source: 'Sophos',
        client: 'NGM',
        endpoint_name: 'EP-CORP-44',
        ip_address: '192.168.10.88',
        alert_type: 'Suspicious Network Traffic',
        severity: 'High',
        status: 'Investigating',
        escalated: false,
        escalated_to: null,
        resolution_time: null,
        remarks: 'Sophos Intercept X flagged unusual outbound C2 traffic over port 8443.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 5400000).toISOString()
      },
      {
        id: 'ALT-0005',
        alert_date: today,
        alert_time: '11:02:05 AM',
        source: 'Firewall',
        client: 'Internal Enterprise',
        endpoint_name: 'EDGE-FW-01',
        ip_address: '185.220.101.5',
        alert_type: 'Port Scan',
        severity: 'Low',
        status: 'Closed',
        escalated: false,
        escalated_to: null,
        resolution_time: '10m',
        remarks: 'External reconnaissance scan blocked by edge firewall perimeter rule 104.',
        created_at: new Date(Date.now() - 5000000).toISOString(),
        updated_at: new Date(Date.now() - 4000000).toISOString()
      },
      {
        id: 'ALT-0006',
        alert_date: today,
        alert_time: '11:45:30 AM',
        source: 'ManageEngine',
        client: 'Internal Enterprise',
        endpoint_name: 'SRV-MGMT-03',
        ip_address: '10.0.1.20',
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
        alert_time: '12:20:18 PM',
        source: 'AWS',
        client: 'Internal Enterprise',
        endpoint_name: 'AWS-IAM-ROLE',
        ip_address: '54.210.12.77',
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
        alert_time: '01:05:00 PM',
        source: 'VPN',
        client: 'Internal Enterprise',
        endpoint_name: 'VPN-CONC-01',
        ip_address: '194.26.29.11',
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
      {
        id: 'ALT-0009',
        alert_date: yesterday,
        alert_time: '02:10:00 PM',
        source: 'CrowdStrike',
        client: 'Internal Enterprise',
        endpoint_name: 'WS-DEV-12',
        ip_address: '10.200.5.89',
        alert_type: 'Privilege Escalation',
        severity: 'Critical',
        status: 'Resolved',
        escalated: true,
        escalated_to: 'Security Team',
        resolution_time: '1h 15m',
        remarks: 'Unquoted service path exploitation attempted and contained by CrowdStrike agent.',
        created_at: new Date(Date.now() - 90000000).toISOString(),
        updated_at: new Date(Date.now() - 80000000).toISOString()
      },
      {
        id: 'ALT-0010',
        alert_date: yesterday,
        alert_time: '04:30:45 PM',
        source: 'Sophos',
        client: 'Brysa',
        endpoint_name: 'FILE-SRV-02',
        ip_address: '192.168.20.15',
        alert_type: 'Malware Detection',
        severity: 'Critical',
        status: 'Resolved',
        escalated: true,
        escalated_to: 'Incident Response Team',
        resolution_time: '45m',
        remarks: 'Sophos clean-up routine neutralized Trojan.Dropper on file share.',
        created_at: new Date(Date.now() - 75000000).toISOString(),
        updated_at: new Date(Date.now() - 70000000).toISOString()
      },
      {
        id: 'ALT-0011',
        alert_date: twoDaysAgo,
        alert_time: '04:12:00 AM',
        source: 'Wazuh',
        client: 'Giib',
        endpoint_name: 'DB-PROD-01',
        ip_address: '10.0.8.44',
        alert_type: 'Data Exfiltration',
        severity: 'Critical',
        status: 'Resolved',
        escalated: true,
        escalated_to: 'Incident Response Team',
        resolution_time: '3h 20m',
        remarks: 'Anomalous outbound archive upload detected. Endpoint quarantined.',
        created_at: new Date(Date.now() - 170000000).toISOString(),
        updated_at: new Date(Date.now() - 150000000).toISOString()
      }
    ]
  };
}

// Database Engine
class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialData();
        this.saveSync();
      }
    } catch (e) {
      console.error('Error loading database, initializing default:', e);
      this.data = getInitialData();
      this.saveSync();
    }
  }

  saveSync() {
    try {
      this.data.metadata.last_saved = new Date().toISOString();
      const content = JSON.stringify(this.data, null, 2);
      // Atomic write to prevent file corruption
      const tempPath = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, content, 'utf-8');
      fs.renameSync(tempPath, this.filePath);

      // Periodically or on significant changes, save a backup
      this.maybeBackup();
    } catch (e) {
      console.error('Failed to save database file:', e);
    }
  }

  maybeBackup() {
    try {
      const now = new Date();
      const dateTag = now.toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUPS_DIR, `soc_db_backup_${dateTag}.json`);
      fs.copyFileSync(this.filePath, backupFile);

      // Keep maximum 15 recent backups
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.startsWith('soc_db_backup_'))
        .sort();
      while (files.length > 15) {
        const oldFile = files.shift();
        fs.unlinkSync(path.join(BACKUPS_DIR, oldFile));
      }
    } catch (e) {
      // Non-fatal
    }
  }

  getAll() {
    return this.data;
  }

  getAlerts() {
    return this.data.alerts || [];
  }

  getNextAlertId() {
    const alerts = this.getAlerts();
    let max = 0;
    alerts.forEach(a => {
      if (a.id && a.id.startsWith('ALT-')) {
        const num = parseInt(a.id.replace('ALT-', ''), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return `ALT-${String(max + 1).padStart(4, '0')}`;
  }

  createAlert(alertData) {
    const newAlert = {
      ...alertData,
      id: alertData.id || this.getNextAlertId(),
      created_at: alertData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.alerts.unshift(newAlert);
    this.saveSync();
    return newAlert;
  }

  updateAlert(id, fields) {
    const idx = this.data.alerts.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.alerts[idx] = {
      ...this.data.alerts[idx],
      ...fields,
      updated_at: new Date().toISOString()
    };
    this.saveSync();
    return this.data.alerts[idx];
  }

  deleteAlert(id) {
    const initialLen = this.data.alerts.length;
    this.data.alerts = this.data.alerts.filter(a => a.id !== id);
    if (this.data.alerts.length !== initialLen) {
      this.saveSync();
      return true;
    }
    return false;
  }

  upsertSlaLog(logEntry) {
    if (!this.data.sla_logs) this.data.sla_logs = [];
    const idx = this.data.sla_logs.findIndex(l => l.log_date === logEntry.log_date);
    if (idx >= 0) {
      this.data.sla_logs[idx] = { ...this.data.sla_logs[idx], ...logEntry };
    } else {
      const entry = {
        id: logEntry.id || `SLA-${logEntry.log_date.replace(/-/g, '')}`,
        ...logEntry
      };
      this.data.sla_logs.push(entry);
    }
    this.data.sla_logs.sort((a, b) => b.log_date.localeCompare(a.log_date));
    this.saveSync();
    return true;
  }

  deleteSlaLog(idOrDate) {
    if (!this.data.sla_logs) return false;
    const initialLen = this.data.sla_logs.length;
    this.data.sla_logs = this.data.sla_logs.filter(l => l.id !== idOrDate && l.log_date !== idOrDate);
    if (this.data.sla_logs.length !== initialLen) {
      this.saveSync();
      return true;
    }
    return false;
  }

  updateSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveSync();
    return this.data.settings;
  }

  saveNote(dateStr, noteText) {
    if (!this.data.daily_notes) this.data.daily_notes = {};
    this.data.daily_notes[dateStr] = noteText;
    this.saveSync();
    return true;
  }

  resetDemo() {
    this.data = getSampleDemoData();
    this.saveSync();
    return this.data;
  }

  clearAll() {
    this.data.alerts = [];
    this.data.sla_logs = [];
    this.data.daily_notes = {};
    this.saveSync();
    return this.data;
  }
}

const db = new JsonDatabase(DB_FILE);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // --- API ROUTES (PERSISTENT DATABASE) ---
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    try {
      // GET /api/status
      if (req.method === 'GET' && pathname === '/api/status') {
        const stats = fs.statSync(DB_FILE);
        res.writeHead(200);
        res.end(JSON.stringify({
          status: 'ok',
          database: 'active',
          file: DB_FILE,
          size_bytes: stats.size,
          total_alerts: db.getAlerts().length,
          total_sla_logs: (db.data.sla_logs || []).length,
          last_saved: db.data.metadata.last_saved
        }));
        return;
      }

      // GET /api/db (Full Database retrieval)
      if (req.method === 'GET' && pathname === '/api/db') {
        res.writeHead(200);
        res.end(JSON.stringify(db.getAll()));
        return;
      }

      // POST /api/alerts (Add Alert)
      if (req.method === 'POST' && pathname === '/api/alerts') {
        const body = await readRequestBody(req);
        const created = db.createAlert(body);
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, alert: created }));
        return;
      }

      // PUT /api/alerts/:id (Update Alert)
      if (req.method === 'PUT' && pathname.startsWith('/api/alerts/')) {
        const alertId = pathname.replace('/api/alerts/', '');
        const body = await readRequestBody(req);
        const updated = db.updateAlert(alertId, body);
        if (updated) {
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, alert: updated }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Alert not found' }));
        }
        return;
      }

      // DELETE /api/alerts/:id (Delete Alert)
      if (req.method === 'DELETE' && pathname.startsWith('/api/alerts/')) {
        const alertId = pathname.replace('/api/alerts/', '');
        const deleted = db.deleteAlert(alertId);
        res.writeHead(deleted ? 200 : 404);
        res.end(JSON.stringify({ success: deleted }));
        return;
      }

      // POST /api/sla-logs (Upsert SLA entry)
      if (req.method === 'POST' && pathname === '/api/sla-logs') {
        const body = await readRequestBody(req);
        db.upsertSlaLog(body);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // DELETE /api/sla-logs/:id
      if (req.method === 'DELETE' && pathname.startsWith('/api/sla-logs/')) {
        const id = pathname.replace('/api/sla-logs/', '');
        const deleted = db.deleteSlaLog(id);
        res.writeHead(deleted ? 200 : 404);
        res.end(JSON.stringify({ success: deleted }));
        return;
      }

      // GET /api/settings
      if (req.method === 'GET' && pathname === '/api/settings') {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, settings: db.data.settings || {} }));
        return;
      }

      // POST /api/settings
      if (req.method === 'POST' && pathname === '/api/settings') {
        const body = await readRequestBody(req);
        const saved = db.updateSettings(body);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, settings: saved }));
        return;
      }

      // POST /api/notes
      if (req.method === 'POST' && pathname === '/api/notes') {
        const body = await readRequestBody(req);
        if (body.date) {
          db.saveNote(body.date, body.notes || '');
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing date' }));
        }
        return;
      }

      // POST /api/seed (Reset to demo)
      if (req.method === 'POST' && pathname === '/api/seed') {
        const fresh = db.resetDemo();
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: fresh }));
        return;
      }

      // POST /api/clear (Clear all)
      if (req.method === 'POST' && pathname === '/api/clear') {
        const cleared = db.clearAll();
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: cleared }));
        return;
      }

      // GET /api/backup (Download backup JSON)
      if (req.method === 'GET' && pathname === '/api/backup') {
        res.setHeader('Content-Disposition', `attachment; filename="jk-soc-db-backup-${new Date().toISOString().split('T')[0]}.json"`);
        res.writeHead(200);
        res.end(JSON.stringify(db.getAll(), null, 2));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API route not found' }));
      return;
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error', details: apiErr.message }));
      return;
    }
  }

  // --- STATIC FILE SERVING ---
  let safePath = path.normalize(decodeURIComponent(pathname));
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT, safePath);

  // Security check to avoid directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + safePath);
      return;
    }

    let finalPath = filePath;
    if (stats.isDirectory()) {
      finalPath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(finalPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(finalPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🛡️  JK SOC Alert Tracker & Database Engine LIVE!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`💾 Persistent DB File: ${DB_FILE}`);
  console.log(`🔒 Data is SAFE & permanently saved to disk!`);
  console.log('====================================================');
});
