# High-Precision Micro Compounding & Custom Decimal Rate Engine (0.000001%)

Enable setting ultra-fine global hourly rates like `0.000001` in the SuperAdmin console without browser input blocking, and align the entire applet (yield calculations, live session tickers, wallet balances, transaction records, SMS notification receipts, and table views) to support up to 8 decimal places with numerical stability.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements have been confirmed through user clarification:
> - **Precision Scope**: Display up to 8 decimal places (`0.00000001`) across wallet balances, live yield tickers, transaction logs, and SMS receipts so micro compounding returns are clearly visible rather than rounding down to `$0.00`.
> - **Admin Input Control**: Keep pure custom manual decimal typing in the SuperAdmin panel without quick-select preset rate buttons, removing step constraints (`step="any"`) to allow any arbitrary fractional percentage.

- **Confirmed Decision 1**: Up to 8 decimal places for wallet balances, compounding yield rewards, and live tickers to capture micro rewards accurately without truncation to $0.00.
- **Confirmed Decision 2**: Pure custom manual decimal typing without preset buttons in the Admin Panel, supporting `step="any"` and direct text/decimal typing.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Fixes the Admin Panel's `Global Hourly Rate Percent (%)` input by replacing restrictive `step="0.1"` with `step="any"` and removing any form validation barriers that prevented setting micro decimals like `0.000001%`.
  - Replaces lossy floating-point math `startingBal * (Math.pow(1 + ratePerMs, target) - 1)` with numerically stable `Math.expm1(target * Math.log1p(ratePerMs))` in both server-side 24/7 background compounding ticker and client-side live interpolation ticker.
  - Standardizes currency and balance formatting across all views to display 8 decimal places, preventing micro yields from displaying as `$0.00`.
  - Updates SMS notification text generators to include micro amounts in deposit receipts, compounding completion alerts, and treasury adjustments.
- **Target Audience / Persona**:
  - Administrators configuring micro interest rates and testing fine-grained compounding economics.
  - Users tracking micro yield accruals in real-time with sub-cent precision.
- **Key Value**:
  - Complete fidelity and precision: setting `0.000001` works smoothly without browser rejection, and users see their balances and profits increment down to `0.00000001` USD.

---

### 2. User Experience & Visual Design

- **Admin Portal (System Parameters Tab)**:
  - Input field for `Global Hourly Rate Percent (%)` updated with `step="any"`, allowing values like `0.000001` or `0.0005`.
  - Helper note updated to reflect micro-decimal capability: *"Supports micro percentages down to 0.000001% / hr for high-precision testing."*
  - Live Database Record Table updated from `.toFixed(2)` to up to 8 decimal places so admins can inspect exact account balances down to the satoshi/micro level.
- **Wallet View (Main Balance & Yield Display)**:
  - Main balance large display updated from 6 decimals to 8 decimal places (`0.00000000`), formatted cleanly with `tabular-nums`.
  - Accruing live yield ticker in the dynamic compounding card formatted to 8 decimals (`+$0.00000000 USD`), ticking smoothly every 100ms.
  - Profit metrics (Today, 7 Days, Lifetime) updated to display up to 8 decimal places.
  - Completion toast and banner formatted with 8 decimal places.
- **Transactions & SMS Receipts**:
  - Recent transactions list and detail modal display up to 8 decimal places.
  - Inbox SMS notifications and alert badges display exact micro amounts.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: HTML Input Step & Validation**:
  - *Chosen Approach*: Change `<input type="number" step="0.1" ... />` to `<input type="number" step="any" min="0" ... />` and accept decimal string states without early scientific notation conversion.
  - *Why*: Browsers enforce `(value - min) % step === 0`. With `step="0.1"`, any number with more than 1 decimal place like `0.000001` triggers native validation failure. `step="any"` permits arbitrary floating point precision.
- **Decision 2: Compounding Math Numerical Stability**:
  - *Chosen Approach*: Use `Math.expm1(durationMs * Math.log1p(ratePerMs))` instead of `Math.pow(1 + ratePerMs, durationMs) - 1`.
  - *Why*: At an hourly rate of `0.000001%`, `ratePerMs` is `2.7777777777777777e-15`. In IEEE-754 double precision (`53` bits of mantissa), `1 + 2.77e-15` suffers catastrophic cancellation and loss of significant digits. `Math.log1p` and `Math.expm1` are designed specifically to preserve full machine precision for numbers near zero.
- **Decision 3: Display Precision (8 Decimals)**:
  - *Chosen Approach*: Standardize on 8 decimal places for wallet balances, compounding rewards, and live counters, with a reusable formatting utility `formatPrecisionAmount(val, 8)`.
  - *Why*: 8 decimal places accommodates micro rates down to `0.000001%` without truncating rewards to `$0.00`.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│               Admin Portal Rate Config                 │
│  <input type="number" step="any" value="0.000001" />   │
└──────────────────────────┬─────────────────────────────┘
                           │ POST /api/admin/config
                           ▼
┌────────────────────────────────────────────────────────┐
│             Server-Side Config & DB File               │
│  hourlyRatePercent: 0.000001 (Stored in boostpay_db)   │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ Server Background Ticker │  │ Client Interpolation     │
│ Math.expm1(...) formula  │  │ Math.expm1(...) formula  │
│ 24/7 reward credit       │  │ 100ms smooth visual tick │
└────────────┬─────────────┘  └──────────┬───────────────┘
             │                           │
             ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ SMS Alert & Transactions │  │ WalletView UI            │
│ Ref & 8-decimal reward   │  │ 8-decimal balance display│
└──────────────────────────┘  └──────────────────────────┘
```

#### Component & State Modifications
1. **`src/components/AdminPortal.tsx`**:
   - Change `step="0.1"` to `step="any"` in the rate input.
   - Adjust input validation and rate display to format small decimals cleanly without scientific notation unless necessary.
   - Update user table balance and profit columns to 8 decimal places.
2. **`server.ts`**:
   - Update background yield formula in `setInterval` using `Math.expm1(target * Math.log1p(ratePerMs))` to calculate exact micro yield.
   - Update SMS notification message text to display up to 8 decimal places for `finalYield` and `balanceAfter`.
   - Update `/api/admin/rate` and `/api/admin/config` endpoints to ensure small decimal numbers are preserved cleanly in JSON.
3. **`src/components/WalletView.tsx`**:
   - Change balance split from `.toFixed(6)` to `.toFixed(8)` for the main balance card.
   - Change `liveYield.toFixed(6)` to `.toFixed(8)`.
   - Update client interpolation ticker math using `Math.expm1(next * Math.log1p(ratePerMs))`.
   - Update profit metrics and completion banner to 8 decimal places.
4. **`src/components/RecentTransactionsSection.tsx`**:
   - Update transaction amount displays to format up to 8 decimal places for `REWARD` and micro transfers.
5. **`src/components/InboxView.tsx`**:
   - Update notification card amount badge and messages to display up to 8 decimal places.
6. **`src/components/LeaderboardView.tsx`**:
   - Update user balance and profit displays in the rank spotlight and table to support up to 8 decimal places.
