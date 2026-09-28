# JK SOC-L1 Cyber Command — Alert Status Tracker & Live Console

A professional, mission-ready **Security Operations Center (SOC) L1 Web Application & Database** designed for SOC L1 analysts to log daily security alerts, alter/inspect previous calendar days, track SLAs, and present a live status dashboard to the SOC Team Lead (TL).

---

## 🚀 Quick Launch

### 1. Launch via Local Server (Port 3000) — Permanent Database Enabled
Simply double-click **[`start-server.bat`](file:///c:/Users/jeeva/Downloads/Soc%20Tracker/start-server.bat)** or run in terminal:
```powershell
.\node.exe server.js
```
Then open:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛡️ Key Features & Enhancements

### 1. 📄 Executive Team Lead (TL) Daily Report & PDF Export
- **Dedicated Daily Incident Report**: Designed specifically for the **Team Lead (TL)** to instantly understand the shift's operational status.
- **Zero SLA or Monthly Bloat**: Strictly focuses on today's alerts, severities, telemetry sources, and containment actions without distracting monthly percentages.
- **What is in the PDF Report**:
  - **Executive Summary Box**: Narrative summary detailing total ingested alerts, critical/high risks, escalations, and resolution status.
  - **5 Key KPI Cards**: Total Alerts Logged, Escalated (Urgent), Under Investigation, Resolved/Closed, False Positives.
  - **Severity Breakdown Matrix**: Critical, High, Medium, Low, Informational counts, percentages, and response protocols.
  - **Telemetry Sources Breakdown**: Live ingestion counts for CrowdStrike, Sophos, Wazuh, Firewall, VPN, etc.
  - **Shift Incident Triage Roster**: Full table showing Alert ID, Time, Source, Alert Type, Severity, Status/Escalation, and Analyst Notes.
  - **Sign-off Block**: Duty Analyst signature line and Team Lead (TL) Review & Approval box.
- **Standalone Local PDF Engine**: Uses standalone `js/jspdf.umd.min.js` and `js/jspdf.plugin.autotable.min.js` for instant, offline PDF generation and browser printing.

### 2. 🧹 Fresh Clean Start Ready for Analyst Entry
- Pre-seeded data wiped clean so analysts can begin inputting real shift records right away.
- One-click **Seed Demo** button still available anytime to populate sample data for testing.
- One-click **Fresh Start / Clear** button to wipe records and start a new shift clean.

### 3. 🛡️ Dynamic Mixed Cyber "JK" Crest Logo
- Layered heraldic cyber shield with double-beveled border, rotating radar orbit ring, live green reactor beacon, and metallic gradient monogram.
- Branded as **JK DEFENSE SOC-L1 COMMAND**.

### 4. 🌌 Sleek Enterprise Cyber Command Background
- Clean, high-contrast obsidian cockpit theme with a precision 44px tactical cyber grid and subtle top radial ambient glow.
- Removed distracting particle lines and blurry orbs for professional 8+ hour shift viewing comfort.

### 5. 🔒 Safe Persistent Database Engine (Never Loses Data)
- **Database File**: Stored directly on disk at [`data/soc_database.json`](file:///c:/Users/jeeva/Downloads/Soc%20Tracker/data/soc_database.json).
- **Auto-Backups**: Every update automatically creates a timestamped safety backup in [`data/backups/`](file:///c:/Users/jeeva/Downloads/Soc%20Tracker/data/backups/).
- **Dual Persistence**: Data syncs to the server JSON database via REST APIs (`/api/alerts`, `/api/sla-logs`, `/api/notes`, `/api/settings`) and mirrors to browser local storage for offline resilience.
- **Safety Badge**: Displays `DB SAFE: DISK ON` in the header indicating active database persistence.

### 5. 📊 Accurate Monthly Reporting & Severity Aggregation
- **Multi-day Aggregation**:
  - Counts all alerts across every single day in the selected month.
  - **Example**: If 5 Critical alerts are logged today and 3 Critical tomorrow, the monthly total for Critical displays **8 Alerts** (and correctly sums across all other severities: High, Medium, Low, Informational).
  - Monthly Severity Table displays:
    1. Severity Name & Badge
    2. Total Month Count
    3. Percentage Share of Month
    4. Progress Bar
  - Quick summary pill bar shows month totals for each severity.

### 6. 🔄 Dynamic Rotating Severity Pie Chart
- **Rotational Motion**:
  - Chart.js rotation animation (`animateRotate: true`, `duration: 1400ms`).
  - Dual cyber glowing rings (`.pie-chart-cyber-ring`) around the chart with continuous counter-rotating motion.
  - **Re-spin Button**: Click `[Re-spin]` anytime to re-trigger the rotation animation.
  - Native Canvas fallback with smooth frame-by-frame rotational easing.

### 7. ⏱️ Monthly SLA Calculation Engine
- Computes overall monthly SLA percentage as the mathematical average of all daily SLA logs in that month.
- Compares against configurable **Target SLA %** (defaults to 90%).
- Automatically displays **MET** or **BREACHED** with color-coded status badges, or "No Data" if no days are logged.
