/**
 * MockServer — stubs window.fetch so all /api/* calls return mock data.
 * Used by OPA5 integration tests and any unit test that triggers a fetch.
 * The real backend does NOT need to be running.
 */
sap.ui.define([
    "helphub/test/mockdata/data"
], function (MockData) {
    "use strict";

    var _originalFetch = null;
    var _started = false;

    function makeResponse(body, status) {
        var sBody = JSON.stringify(body);
        return Promise.resolve({
            ok: (status || 200) < 300,
            status: status || 200,
            json: function () { return Promise.resolve(body); },
            text: function () { return Promise.resolve(sBody); }
        });
    }

    function matchUrl(url, pattern) {
        return url.indexOf(pattern) >= 0;
    }

    function handleFetch(url, options) {
        var sMethod = (options && options.method) ? options.method.toUpperCase() : "GET";
        var sUrl = url.toString();

        // ── Auth ──────────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/auth/me")) {
            return makeResponse({ success: true, user: MockData.USER });
        }
        if (matchUrl(sUrl, "/api/auth/passwordless") || matchUrl(sUrl, "/api/auth/send-magic-link")) {
            return makeResponse({ success: true, user: MockData.USER, accessToken: MockData.ACCESS_TOKEN, refreshToken: MockData.REFRESH_TOKEN });
        }
        if (matchUrl(sUrl, "/api/auth/refresh")) {
            return makeResponse({ success: true, accessToken: MockData.ACCESS_TOKEN });
        }
        if (matchUrl(sUrl, "/api/auth/logout")) {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/auth/accept-terms")) {
            return makeResponse({ success: true, version: "1.0" });
        }

        // ── Home activity ─────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/home/activity")) {
            return makeResponse(MockData.HOME_ACTIVITY);
        }

        // ── Subscription ──────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/subscription/status")) {
            return makeResponse(MockData.SUBSCRIPTION_STATUS);
        }
        if (matchUrl(sUrl, "/api/subscription")) {
            return makeResponse({ success: true });
        }

        // ── Providers ─────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/providers") && sUrl.indexOf("/ratings") >= 0) {
            return makeResponse({ success: true, ratings: MockData.RATINGS });
        }
        if (matchUrl(sUrl, "/api/providers")) {
            // honour ?category= filter so OPA5 hero-category tests work
            var sCategory = sUrl.indexOf("category=") >= 0
                ? decodeURIComponent(sUrl.split("category=")[1].split("&")[0])
                : null;
            var aProviders = sCategory
                ? MockData.PROVIDERS.filter(function (p) {
                    return (p.service_categories || "").indexOf(sCategory) >= 0;
                  })
                : MockData.PROVIDERS;
            return makeResponse({ success: true, providers: aProviders });
        }

        // ── Services ──────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/services")) {
            return makeResponse({ success: true, services: MockData.SERVICES });
        }

        // ── Bookings ──────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/bookings") && sMethod === "POST") {
            return makeResponse({ success: true, bookingId: "B_MOCK_" + Date.now() });
        }
        if (matchUrl(sUrl, "/api/bookings") && matchUrl(sUrl, "/mark-seen")) {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/bookings") && matchUrl(sUrl, "/status")) {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/bookings")) {
            return makeResponse({ success: true, bookings: MockData.BOOKINGS, newCount: 1 });
        }

        // ── Notifications ─────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/unread-count") && matchUrl(sUrl, "/api/notifications")) {
            return makeResponse({ success: true, count: 1 });
        }
        if (matchUrl(sUrl, "/read-all") || (matchUrl(sUrl, "/api/notifications") && matchUrl(sUrl, "/read"))) {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/notifications")) {
            return makeResponse({ success: true, notifications: MockData.NOTIFICATIONS });
        }

        // ── Tasks ─────────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/tasks") && sMethod === "POST" && !matchUrl(sUrl, "/apply") && !matchUrl(sUrl, "/assign") && !matchUrl(sUrl, "/status")) {
            return makeResponse({ success: true, taskId: "T_MOCK_" + Date.now() });
        }
        if (matchUrl(sUrl, "/api/tasks") && matchUrl(sUrl, "/apply")) {
            return makeResponse({ success: true, applicationId: "TA_MOCK" });
        }
        if (matchUrl(sUrl, "/api/tasks") && matchUrl(sUrl, "/assign")) {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/tasks") && matchUrl(sUrl, "/status")) {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/tasks/")) {
            return makeResponse({ success: true, task: MockData.TASKS[0], applications: [] });
        }
        if (matchUrl(sUrl, "/api/tasks")) {
            return makeResponse({ success: true, tasks: MockData.TASKS });
        }

        // ── Messages / Conversations ──────────────────────────────────────────
        if (matchUrl(sUrl, "/api/conversations") && sMethod === "POST") {
            return makeResponse({ success: true, conversation: { id: "CONV_MOCK", participant_1: MockData.USER.id, participant_2: "p1" }, created: true });
        }
        if (matchUrl(sUrl, "/api/conversations")) {
            return makeResponse({ success: true, conversations: MockData.CONVERSATIONS, totalUnread: 1 });
        }
        if (matchUrl(sUrl, "/api/messages") && matchUrl(sUrl, "/read")) {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/messages") && matchUrl(sUrl, "unread-count")) {
            return makeResponse({ success: true, count: 1 });
        }
        if (matchUrl(sUrl, "/api/messages") && sMethod === "POST") {
            return makeResponse({ success: true, messageId: "DM_MOCK_" + Date.now() });
        }
        if (matchUrl(sUrl, "/api/messages")) {
            return makeResponse({ success: true, messages: [] });
        }

        // ── Ratings ───────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/ratings")) {
            return makeResponse({ success: true, newAverage: 4.9 });
        }

        // ── Reports / Blocks ──────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/reports") || matchUrl(sUrl, "/api/users") && matchUrl(sUrl, "/block")) {
            return makeResponse({ success: true });
        }

        // ── Users ─────────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/users") && matchUrl(sUrl, "/subscription") && sMethod === "PATCH") {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/users") && sMethod === "PUT") {
            return makeResponse({ success: true });
        }
        if (matchUrl(sUrl, "/api/users") && matchUrl(sUrl, "/avatar")) {
            return makeResponse({ success: true, avatarUrl: "/uploads/mock-avatar.jpg" });
        }
        if (matchUrl(sUrl, "/api/users") && matchUrl(sUrl, "/onboard")) {
            return makeResponse({ success: true, status: "Active" });
        }

        // ── Chat (SSE) ────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/chat")) {
            return makeResponse({ success: true, reply: "This is a mock AI response." });
        }

        // ── Push token ────────────────────────────────────────────────────────
        if (matchUrl(sUrl, "/api/notifications/device-token")) {
            return makeResponse({ success: true });
        }

        // Unknown — return 404
        console.warn("[MockServer] Unmatched request:", sMethod, sUrl);
        return makeResponse({ success: false, error: "Not found in mock" }, 404);
    }

    return {
        start: function () {
            if (_started) return;
            _originalFetch = window.fetch;
            window.fetch = function (url, options) {
                return handleFetch(url, options);
            };
            _started = true;
            jQuery.sap && jQuery.sap.log
                ? jQuery.sap.log.info("[MockServer] Started — all /api/* calls mocked")
                : console.info("[MockServer] Started — all /api/* calls mocked");
        },

        stop: function () {
            if (!_started) return;
            window.fetch = _originalFetch;
            _originalFetch = null;
            _started = false;
        },

        isStarted: function () { return _started; }
    };
});
