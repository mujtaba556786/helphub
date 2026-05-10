---
name: Feature suggestions backlog
description: All suggested features and improvements for HelpHub - reference when planning next work
type: project
---

## Branding & Theme
- App name alternatives: Neighborly, HelpMate, LocalHands, TaskNest, HelpLoop
- Theme colors: consider warmer tone (orange/amber) — feels more human & friendly
- Dark mode support
- Custom app icon + splash screen for mobile

## User Experience
- Onboarding flow — 3-step intro for new users (what is HelpHub, how it works, pick interests)
- Search bar on helper list — find by name or skill
- Helper filters — filter by price range, language, rating, distance
- Favorites / Saved helpers — bookmark helpers you like
- Recently viewed helpers

## Communication
- In-app push notifications (not just bell icon)
- Read receipts in chat
- Quick reply templates ("On my way", "I'm available", "Can we reschedule?")

## Payments
- Stripe integration for booking payments
- 5% platform fee automatic deduction on payout
- Refund flow if helper cancels
- Wallet / balance for providers to track earnings

## Trust & Safety
- ID verification for helpers (upload ID)
- Background check badge
- Response rate % shown on helper card ("Replies within 1 hr")
- Report user button
- Insurance badge — helper has personal liability

## Provider Dashboard
- Earnings graph (weekly/monthly)
- Booking acceptance rate
- Profile views count
- Reviews summary

## Growth
- Referral system — "Invite a friend, get €5 credit"
- Promo codes support
- Multi-language (German, Turkish, Arabic — fits Berlin market)
- SEO landing page for each service category

## Mobile (future)
- React Native or Capacitor wrap for iOS/Android
- GPS-based "Helper nearby" notification
- Offline mode — view saved helpers without internet

Direct messaging — without it, your marketplace leaks users
Payments (Stripe) — no money flow = no real business
Post a Task — doubles your marketplace by letting demand find supply
Map view + distance sorting — location is everything for local services
Real push notifications — replace the 5-second polling
Want me to start implementing any of these?

Fresh Ideas (Beyond Your Backlog)
Idea	Why It Matters
"Instant Book" vs "Request"	Let top-rated providers enable instant booking (no approval needed) — reduces friction
Service Bundles	"Moving + Cleaning" package at a discount
Availability Status	Real-time "Available Now" green dot — like Uber
Photo Proof of Work	Provider uploads before/after photos when job is done — builds trust
Tipping	Post-booking tip option — providers love this
Repeat Customer Discount	Auto-discount for customers who book same provider 3+ times
Emergency/Urgent Flag	"Need help TODAY" with higher rate — providers opt into urgent requests
Provider Portfolio	Photo gallery of past work (especially for handyman, gardening, cooking)
Group Bookings	Multiple neighbors book same provider (e.g., group cooking class)
Seasonal Highlights	Auto-promote snow removal in winter, gardening in spring

---

## Frontend Field Validation Highlighting (Option B)

**Status:** Deferred — implement later  
**Priority:** Polish / UX improvement

**What:** The backend now returns `{ success: false, error: "...", field: "fieldName" }` on validation failures. The frontend currently shows the error message via `MessageToast` (Option A — good enough for now). 

**Goal:** Use the `field` property to highlight the specific SAP UI5 input with `ValueState.Error` + `ValueStateText`.

**Pattern to implement in each mixin/controller:**
```js
// After a failed API call that returns oData.field:
if (!oData.success && oData.field) {
    var oInput = this.byId(fieldToInputIdMap[oData.field]);
    if (oInput) {
        oInput.setValueState("Error");
        oInput.setValueStateText(oData.error);
    }
}
// On dialog close / re-open: reset ValueState to None
```

**Affected files to update:**
- `controller/Login.controller.js` → `emailInput`
- `controller/mixins/BookingMixin.js` → booking dialog inputs
- `controller/mixins/TaskMixin.js` → PostTaskDialog inputs  
- `controller/mixins/ProfileMixin.js` → profile/rating inputs
- `controller/mixins/TrustSafetyMixin.js` → report dialog inputs

**Prerequisites:** Read each fragment XML to map field names → input IDs before coding.
