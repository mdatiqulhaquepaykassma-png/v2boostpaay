# 100% Real-Time Synchronized Engine

Make the entire applet 100% real-time across all sessions, tabs, and administrative actions with an ultra-fast 500ms background polling and cross-session event synchronization.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following preferences:
> - **Sync Interval**: 500ms ultra-fast sync interval.
> - **Scope**: All features including chat, SMS alerts, admin portal, wallet balances, yield tickers, and leaderboards.

## 1. Overview & Core Concept

- **What It Does**: Upgrades all state stores, backend API endpoints, and client-side components to poll and synchronize state every 500ms. Whenever an admin adjusts rates, credits/debits balances, or sends a notification, or whenever a user performs a boost/deposit/withdrawal, all open browser tabs and sessions reflect the changes instantly without manual refresh.
- **Key Value**: True real-time multi-user synchronization and zero lag across wallet tracking, compounding yield tickers, SMS receipts, chat channels, and superadmin telemetry.

## 2. User Experience & Visual Design

- **Visual Indicators**: Clean, subtle WebSocket-style live indicator ("Live Sync Active") in header with tabular-nums latency counter.
- **Smooth Updates**: All balance tickers, recent transactions list, inbox notifications, and admin telemetry tables update smoothly every 500ms without layout jitter.

## 3. Key Product Decisions & Trade-Offs

- **Polling vs WebSockets**: Polling every 500ms against the server file database (`server.ts`) ensures absolute reliability in the containerized preview environment without dropped WebSocket connections.
- **Optimistic UI + Server Reconciliation**: Client actions update local state immediately and reconcile with server state on the next 500ms tick.

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────┐
│                Client Tabs                   │
│  (WalletView, AdminPortal, Inbox, Chat)      │
└──────────────────────┬───────────────────────┘
                       │ 500ms polling / fetch
                       ▼
┌──────────────────────────────────────────────┐
│               Express Server                 │
│                 (server.ts)                  │
│       - Background 24/7 Yield Ticker         │
│       - Real-time DB state read/write        │
└──────────────────────┬───────────────────────┘
                       │ JSON file persistence
                       ▼
┌──────────────────────────────────────────────┐
│           JSON Database (`db.json`)          │
└──────────────────────────────────────────────┘
```

- **State Store Upgrades**: Update `src/services/store.ts` to poll server state every 500ms for user sessions, system config, transactions, notifications, and chat messages.
- **Server Endpoint Enhancements**: Ensure all admin operations, user boosts, and chat endpoints instantly persist to `db.json` and broadcast on the next fetch cycle.
