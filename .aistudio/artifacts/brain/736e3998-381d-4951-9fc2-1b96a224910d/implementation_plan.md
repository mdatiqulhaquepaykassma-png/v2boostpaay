# Persistent Database Storage & Deployment Data Protection

Comprehensive solution to eliminate data loss upon redeployment, provide complete visibility into database storage operations, and empower administrators to inspect, test, backup, and restore user data at any time.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Why data reset occurred upon deployment**: In Cloud Run and containerized hosting environments, the container filesystem (`data/boostpay_db.json`) is ephemeral. Each new build/deploy spins up a fresh container instance with initial default data unless external persistence or automated client-server self-healing is in place.

- **Storage Architecture**: Dual-layer architecture:
  1. **Self-Healing Client-Server Sync**: Client devices permanently retain user credentials (12-word mnemonic, numeric ID, balance, transactions) and automatically re-register and re-populate the server database if a redeployment or server restart wiped the container filesystem.
  2. **Admin Database Inspector & Diagnostic Hub**: A dedicated management tab in the Admin Portal where the administrator can inspect real-time database contents, test disk writes, download complete JSON snapshots, and restore database state with 1-click.
  3. **Optional External PostgreSQL Support (`DATABASE_URL`)**: Support connecting to external persistent PostgreSQL instances (e.g. Dokploy, Supabase, Neon) when `DATABASE_URL` is supplied in environment variables.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Provides total transparency into where and how user data is saved.
  - Automatically heals and restores missing server users whenever they connect from their browser cache.
  - Equips the Administrator with a **Database Inspector & Health Console** to view row counts, verify write operations, download full database backups before deployments, and restore backups afterwards.
- **Target Audience**: App owners and administrators needing guaranteed data survival across deployments and real-time proof that registrations, balances, and transactions are being stored.

---

## 2. User Experience & Visual Design

### Key User & Admin Flows

1. **Admin Database Storage Inspector**:
   - Admin navigates to `/admin` -> new **Database Storage** tab (or card in Overview).
   - Card 1: **Storage Engine Status**:
     - Mode: `Server File Store (data/boostpay_db.json)` or `External PostgreSQL`.
     - Live metrics: Total users stored, Total transactions, Total SMS notifications, Database file size (KB), and Last Write Timestamp (e.g., `Just now`).
     - Live **"Run Storage Write Test"** button: instantly writes a test record and reads it back, showing green `✓ Storage Verified: Read/Write OK (Latency: 4ms)`.
   - Card 2: **Live Database Record Viewer**:
     - Real-time tabular inspector showing all users in the database with their ID, balance, boost status, and creation date.
   - Card 3: **Backup & Disaster Recovery**:
     - **Export Database (.json)**: Instantly downloads a complete timestamped snapshot (`boostpay_backup_YYYY-MM-DD.json`).
     - **Restore Snapshot**: Drag-and-drop or select a previously downloaded JSON backup to restore all users, balances, and transactions instantly.
2. **Seamless Self-Healing for Users**:
   - If a deployment happens and the container restarts empty, as soon as a user opens BoostPay, their local session detects that the server does not have their full record and re-syncs their balance, mnemonic, and transaction history to the server automatically.
   - Zero logout, zero lost wallets.

### Visual Styling

- Clean, authoritative dark fintech console aesthetic (`bg-zinc-950`, `border-zinc-800`, `text-zinc-100`).
- Status indicators with clear semantic text labels (never color alone).
- Tabular figures (`font-mono tabular-nums`) for byte counts, timestamps, and row counts.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Client-to-Server Self-Healing Sync**:
  - *Chosen Approach*: On client boot (`initSync`), if the server does not contain the user's ID or has fewer transactions than the user's verified local state, the client automatically pushes their account record to `/api/users/register` and `/api/sync`.
  - *Why*: Guarantees that even if an administrator deploys an update that resets the container disk, users never lose access to their funds or accounts.
- **Decision 2: 1-Click JSON Snapshot Export & Import in Admin Portal**:
  - *Chosen Approach*: Direct browser download of `/api/admin/db/export` and upload via `/api/admin/db/import`.
  - *Why*: Allows admins to take 2-second backups before updating their code and restore everything in one click if desired.
- **Decision 3: Storage Health Probe API (`GET /api/admin/storage/probe`)**:
  - *Chosen Approach*: An endpoint that verifies disk write permissions, tests write latency, and returns disk file stats.
  - *Why*: Gives direct, unmistakable proof that database writes are actively succeeding.

---

## 4. Technical Architecture & Data Strategy

### System Layout

```
┌────────────────────────────────────────────────────────┐
│                   Admin Portal UI                      │
│                                                        │
│  ┌───────────────────┐  ┌───────────────────────────┐  │
│  │ Storage Probe Card│  │ Live DB Inspector Table   │  │
│  │ (Status, Latency) │  │ (Users, Balances, Boosts) │  │
│  └────────▲──────────┘  └─────────────▲─────────────┘  │
│           │                           │                │
│  ┌────────┴───────────────────────────┴─────────────┐  │
│  │ Backup & Recovery: Download / Upload JSON        │  │
│  └────────────────────▲─────────────────────────────┘  │
└───────────────────────┼────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│               Express Server (server.ts)               │
│                                                        │
│  GET  /api/admin/storage/probe ──► Tests write & reads │
│  GET  /api/admin/db/export     ──► Full DB JSON dump   │
│  POST /api/admin/db/import     ──► Restores DB snapshot│
│  POST /api/sync                ──► Self-healing merge  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Storage Engine: data/boostpay_db.json            │  │
│  │ (or PostgreSQL pool if DATABASE_URL is set)      │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Key Implementation Steps

1. **Server Storage Enhancements (`server.ts`)**:
   - Add `/api/admin/storage/probe`: Performs a live read/write cycle, computes latency, and inspects file size and write timestamps.
   - Add `/api/admin/db/export`: Streams current database snapshot as downloadable JSON attachment.
   - Add `/api/admin/db/import`: Validates and restores complete database records (users, transactions, messages, notifications).
   - Strengthen `/api/sync` so that incoming client accounts are never wiped or discarded.
2. **Client Self-Healing (`src/services/store.ts`)**:
   - Enhance `initSync()` so that if the server has reset, the client immediately re-registers and restores all users, balances, and history from client cache to server.
3. **Admin Portal UI (`src/components/AdminPortal.tsx`)**:
   - Add a dedicated **Database Engine** tab and Inspector view.
   - Add live diagnostic write test, database table viewer, export button, and backup upload affordance.
