---
name: Gmail SMTP setup pending
description: User needs to configure Gmail SMTP for real OTP email delivery - remind when going to production
type: project
---

Gmail SMTP for OTP email verification is not yet configured — pending for later.

**Why:** User wants to set it up before production release, skipping for now during dev.

**How to apply:** Remind the user to set up Gmail SMTP in `backend/.env` before merging to production or doing a release. The backend code is already ready — just needs credentials.

Steps to remind:
1. Go to myaccount.google.com → Security → enable 2-Step Verification
2. Search "App Passwords" → create one named "HelpHub"
3. Add to `backend/.env`:
   - SMTP_USER=yourgmail@gmail.com
   - SMTP_PASS=xxxx xxxx xxxx xxxx
   - SMTP_FROM="HelpHub" <yourgmail@gmail.com>
4. Restart backend
