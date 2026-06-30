sap.ui.define([], function () {
    "use strict";

    return {
        API_BASE: "https://helphub-production.up.railway.app", // production URL
        // TESTING ONLY — shows a one-tap "Demo Login" button (no email/OTP). Set to
        // false at launch. The backend also gates it behind ALLOW_DEMO_LOGIN, so BOTH
        // must be on for demo login to work.
        DEMO_LOGIN: true
    };
});
