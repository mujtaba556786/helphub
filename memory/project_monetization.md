---
name: Monetization strategy
description: Decided monetization model for HelpHub - implement before release
type: project
---

Monetization plan decided. Three pillars:

1. **Free users** → Non-intrusive ads (Google AdMob on Android, Apple Ads on iOS) — implement later
2. **Helper/Provider** → €9.99/month subscription (no ads, boosted visibility, verified badge)
3. **Booking fee** → 5% platform cut on every completed booking

**Why:** Keep app free for users to grow the user base, monetize on the provider/helper side who are earning money through the platform.

**How to apply:** When implementing payments or provider onboarding, enforce the subscription gate. When implementing booking payment flow, add 5% platform fee calculation. Remind user to implement AdMob before production release.
