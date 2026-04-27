# HelpHub (ServiceLink) — Architecture Refactor Guide & Master Prompt

## 🧠 Core Insight

HelpHub is a **feature-rich, production-capable marketplace**, but currently suffers from **architecture drift**:

* Monolithic `server.js` (~1972 lines)
* Mixed concerns (routes + logic + DB)
* No domain separation
* Scaling risks (performance, maintainability)

👉 **Goal:** Transition to Clean Architecture **without breaking existing APIs**

---

# 🚨 Key Problems Identified

## 1. Monolithic Backend

* All logic lives in `server.js`
* Hard to test, debug, or extend

## 2. No Domain Separation

Missing clear modules like:

* BookingService
* TrustService
* MessageService

## 3. Logic Duplication

* UI5 Mixins + Backend both contain logic
* Risk of inconsistency

## 4. In-Memory Rate Limiting

```js
otpStore, msgRateStore, taskRateStore
```

* Lost on restart
* Not scalable

## 5. Fragmented Auth System

* Multiple auth methods without abstraction

## 6. Mixed Frontend Architectures

* SAP UI5 (main app)
* React (admin panel)

## 7. No Data Access Layer

* Raw queries scattered everywhere

---

# 🏗️ Target Architecture

```
backend/
├── controllers/
│   ├── bookingController.js
│   ├── userController.js
│   └── ...
├── services/
│   ├── BookingService.js
│   ├── TrustService.js
│   └── ...
├── routes/
│   ├── bookingRoutes.js
│   └── ...
├── middleware/
├── db/
│   └── pool.js
└── server.js (bootstrapping only)
```

---

# 🥇 Refactor Priorities

## 1. Break the Monolith

* Extract logic from `server.js`
* Keep server.js minimal

## 2. Service Layer

Move all business logic into:

* Services (pure logic)
* Controllers (HTTP only)

## 3. Validation Layer

Use:

* `express-validator` or `zod`

## 4. Scalable Rate Limiting

Replace memory stores with:

* Redis (preferred)
* or DB-backed solution

## 5. API Consistency

* Enforce `types.ts`
* No inconsistent responses

## 6. UI5 Improvements

* JSONModel = single source of truth
* Mixins = logic only

---

# 🚀 MASTER ARCHITECT PROMPT (FINAL)

Use this every time you refactor or build a feature:

---

## 📌 Prompt Template

**Context:**
We are working on HelpHub (ServiceLink), a mature full-stack marketplace (Node.js/Express + MySQL + SAP UI5).
The backend currently has a monolithic server.js (~1972 lines) that must be incrementally refactored without breaking existing APIs.

---

**The Goal:**
[Insert goal, e.g. "Refactor Booking system into Clean Architecture"]

---

## 🏗️ Architecture Requirements

* Apply Clean Architecture:

  * Controllers → HTTP only
  * Services → business logic
  * Routes → modular
* DO NOT add logic to server.js
* Keep code production-ready

---

## 🗄️ Database

* Use mysql2/promise
* Parameterized queries only
* Keep compatibility with `servicelink_db`

---

## 🔁 Consistency

* Responses MUST match `types.ts`
* No breaking API changes
* Preserve existing endpoint behavior

---

## 🔐 Security & Validation

* Validate all inputs
* Respect JWT/auth middleware
* Prevent injection & unauthorized access

---

## ⚡ Performance

* Avoid N+1 queries
* Optimize DB usage
* Consider scalability

---

## 📱 Frontend (SAP UI5)

* Use JSONModel for state
* Mixins = logic only (no duplicated state)
* Keep compatibility with existing views/fragments

---

## 🔄 Migration Strategy

* Do NOT break existing routes
* Show incremental migration steps
* Keep system functional during refactor

---

## 🧩 Task

Provide:

1. Service layer (e.g., BookingService.js)
2. Controller (bookingController.js)
3. Route module (bookingRoutes.js)
4. UI5 Controller logic (JSONModel-based)
5. Migration plan (step-by-step)

---

## ✅ Requirements

* Error handling (try/catch, proper status codes)
* Scalable rate limiting (NOT in-memory)
* Clear comments

---

## 🎯 Tone

Concise, structured, production-ready.
No pseudo-code.

---

# 🧠 Strategy Going Forward

## DO:

* Refactor **one domain at a time**
* Start with **Booking**
* Use it as a template

## DON'T:

* Add new features inside `server.js`
* Mix UI logic with backend logic
* Ignore migration safety

---

# 🏁 Immediate Next Step

👉 Refactor **Booking System** into:

* `BookingService.js`
* `bookingController.js`
* `bookingRoutes.js`

This becomes your **architecture blueprint** for:

* Tasks
* Messaging
* Trust System

---

# 💡 Final Note

You are not early-stage anymore.

You are transitioning from:

> “feature-building mode”
> to
> “system design & scalability mode”

That shift is what turns projects into **real products**.
