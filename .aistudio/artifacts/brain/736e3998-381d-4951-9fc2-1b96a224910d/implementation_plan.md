# Real-Time P2P Toast Alerts & SMS Notification Inbox

Comprehensive notification system delivering silent auto-dismissing floating toasts for real-time incoming P2P transfers, an official bank-grade SMS alert inbox tab with unread count badges, and automated notification triggers for transfers, compounding yield claims, and system announcements.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Key product preferences confirmed with the user during Phase 1:
> - **Inbox Placement**: Integrated as a dedicated **Inbox** tab in the bottom navigation bar with an unread badge indicator.
> - **Toast Behavior**: Elegant **silent floating toast notifications** with smooth enter/exit animations and auto-dismiss timer (no noisy intrusive chimes).
> - **Scope of Events**: Covers **P2P Transfers (inbound & outbound)**, **Compounding Yield Claims / Rewards**, and **System & Administrator Announcements**.

- **Confirmed Decision 1**: New bottom navigation tab labeled "Inbox" with real-time unread badge counter.
- **Confirmed Decision 2**: Floating toast alert slides down from the top viewport upon receiving a P2P transfer, displaying sender ID, amount, and an action to jump directly to the transaction in the inbox.
- **Confirmed Decision 3**: Bank/telecom-grade SMS card styling for notification messages, including reference codes, timestamps, and one-tap copy/mark-as-read affordances.

---

## 1. Overview & Core Concept

- **What It Does**: Whenever funds are transferred between users in BoostPay, the recipient instantly receives an onscreen floating toast alert. All transaction events (received money, sent money, accrued compounding rewards, and admin balance adjustments) generate structured, persistent "SMS Alert" messages stored in the user's personal Notification Inbox.
- **Target Audience / Persona**: Mobile & web fintech users who expect real-time feedback when peer funds arrive and want an auditable, SMS-like feed of financial notifications with clear credit/debit receipts.
- **Key Value**: Eliminates uncertainty around transfer delivery, prevents phantom balances, and provides reassuring transaction receipts mirroring real-world banking apps.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Incoming P2P Transfer in Real Time**:
   - User Alice sends $50.00 to User Bob (#849201).
   - Bob's app detects the new transaction via the background sync listener.
   - Bob's balance updates automatically and a sleek floating toast notification slides in from the top:
     `+ $50.00 Received from #109283 · Ref: TX-748921`
   - Bob can tap "View" to open the Inbox or let it smoothly auto-dismiss after 4.5 seconds.
2. **Browsing the SMS Inbox Tab**:
   - Bob taps the "Inbox" tab in the bottom navigation (which displays an unread badge dot or number).
   - The view shows an SMS-style message feed:
     - Header: "Notification Inbox" with total alerts, unread filter, and "Mark All as Read" button.
     - Filter tabs: All, Credits, Debits, Rewards, System.
     - Message items styled like official carrier/banking transaction SMS alerts:
       - Header: `BOOSTPAY-ALERTS` · `Just now`
       - Body: `CREDIT ALERT: $50.00 has been credited to your wallet from Peer #109283. Available Balance: $300.00. Ref: TX-748921.`
       - Quick copy reference number button and unread status indicator.
3. **Yield Accrual & System Alerts**:
   - Compounding yield claims and admin deposits automatically generate inbox SMS notifications so users never miss an account update.

### Visual Identity & Theme Tokens

- **Palette**: Dark slate aesthetic matching BoostPay's core theme (`bg-zinc-950`, `border-zinc-800`, `text-zinc-100`).
- **Accents**:
  - Emerald (`text-emerald-400`, `border-emerald-500/20`, `bg-emerald-500/10`) for incoming peer credits and yield rewards.
  - Amber (`text-amber-400`) for active tabs, warnings, and system notices.
  - Rose (`text-rose-400`) for sent debits and fees.
- **Typography & Formatting**:
  - Monospace tabular figures (`font-mono tabular-nums`) for currency amounts, timestamps, and transaction references (`TX-XXXXXX`).
  - SMS telecom title styling (`BOOSTPAY-ALERT` / `FIN-TXN`) for authentic fintech credibility.
- **Zero-Pill Compliance**: Clean unboxed typographic separators (`·`, `/`) for timestamps and reference numbers.
- **Touch Target Ergonomics**: Minimum $44\text{px}$ touch targets for all tab buttons and action chips.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Bottom Nav Navigation Integration**:
  - *Chosen Approach*: Expand bottom navigation from 4 to 5 slots: `Wallet`, `Leaderboard`, `Inbox` (with badge), `Messages`, and `Open/Install`.
  - *Why*: Direct, single-thumb access to transaction notifications without hiding critical financial alerts behind modal popovers or dropdown menus.
  - *Alternatives Considered*: Top navigation bell drawer was considered, but bottom tab matches modern mobile banking apps (like bKash, Revolut, Cash App) and keeps all navigation in the primary thumb zone.
- **Decision 2: Floating Toast Engine with Queue & Auto-Dismiss**:
  - *Chosen Approach*: Lightweight client toast manager supporting multiple queued toasts with automatic 4.5s slide-out and swipe/click dismiss.
  - *Why*: Non-blocking, frictionless alert experience that does not interrupt ongoing wallet interactions or typing.
- **Decision 3: Server-Authoritative SMS Inbox Record Generation**:
  - *Chosen Approach*: When `/api/transfer` is executed, the server automatically appends structured SMS notification objects into the database for both parties. The existing `/api/users/:id` and `/api/sync` endpoints seamlessly distribute notifications to clients.
  - *Why*: Ensures notifications persist across refreshes, devices, and session restarts.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      Client Application                      │
│                                                              │
│  ┌───────────────┐   ┌─────────────────┐   ┌───────────────┐ │
│  │ FloatingToast │   │    InboxView    │   │  WalletView   │ │
│  │ Component     │   │ (SMS Card Feed) │   │ (Balance/P2P) │ │
│  └───────▲───────┘   └────────▲────────┘   └───────▲───────┘ │
│          │                    │                    │         │
│  ┌───────┴────────────────────┴────────────────────┴───────┐ │
│  │             BoostPayStore (Client Store)                │ │
│  │   - Real-time poll & transfer detector                  │ │
│  │   - Toast event dispatcher                              │ │
│  │   - Unread inbox notifications counter                  │ │
│  └────────────────────────────▲────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────┘
                                │ HTTP Polling / Sync (every 2s)
┌───────────────────────────────▼──────────────────────────────┐
│                    Express Backend Server                    │
│                                                              │
│  POST /api/transfer ──► Writes Sent & Received Transactions   │
│                     ──► Generates Recipient & Sender SMS      │
│  GET  /api/notifications/:userId ──► Fetches User SMS items  │
│  POST /api/notifications/read    ──► Marks items as read     │
│  POST /api/sync                  ──► Authoritative DB Sync   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Data Store (data/boostpay_db.json)                     │  │
│  │  - users: []                                           │  │
│  │  - transactions: []                                    │  │
│  │  - notifications: [                                    │  │
│  │      { id, userId, title, body, type, amount, ref, ... }│  │
│  │    ]                                                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Model & Notification Schema

```typescript
export type NotificationType = 'TRANSFER_RECEIVED' | 'TRANSFER_SENT' | 'YIELD_REWARD' | 'SYSTEM_ALERT';

export interface InboxNotification {
  id: string;              // "NOTIF-XXXXXX"
  userId: string;          // Target user ID
  type: NotificationType;
  title: string;           // "BOOSTPAY-ALERT" or "CREDIT RECEIVED"
  message: string;         // Official SMS style message body
  amount?: number;         // e.g. 50.00
  referenceId?: string;    // e.g. "TX-891024"
  timestamp: number;
  isRead: boolean;
  metadata?: {
    senderId?: string;
    recipientId?: string;
    balanceAfter?: number;
  };
}
```

### Key Execution Sequence

1. **Backend Enhancement (`server.ts`)**:
   - Add `notifications: []` array to `INITIAL_DB` and `readDb()`.
   - In `/api/transfer`: automatically construct `TRANSFER_RECEIVED` SMS notification for recipient and `TRANSFER_SENT` for sender.
   - In `/api/boost/claim` (or yield credit): generate `YIELD_REWARD` notification.
   - Add endpoints: `GET /api/notifications/:userId`, `POST /api/notifications/mark-read`, `POST /api/notifications/clear`.
2. **Store Layer (`src/services/store.ts` & `src/types.ts`)**:
   - Add `InboxNotification` type.
   - Maintain client notification state and track latest seen transaction ID to trigger floating toasts in real-time.
   - Expose notification listener subscriptions for instant UI reactivity.
3. **Toast Engine (`src/components/FloatingToast.tsx`)**:
   - Elegant top-fixed notification pill with emerald credit accent, sender identifier, formatted amount, auto-dismiss progress bar, and dismiss click.
4. **Inbox View (`src/components/InboxView.tsx`)**:
   - SMS telecom terminal visual treatment with clean unboxed metadata, search/filter segmented control, mark-all-read action, and empty states.
5. **Main Navigation (`src/App.tsx`)**:
   - Add `INBOX` to `activeTab` state.
   - Mount `FloatingToast` at the root layout.
   - Render tab button with real-time unread badge counter in the bottom bar.
