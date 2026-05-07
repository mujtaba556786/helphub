sap.ui.define([
    "helphub/controller/mixins/NotificationMixin"
], function (NotificationMixin) {
    "use strict";

    // ── formatNotifTime ───────────────────────────────────────────────────────

    QUnit.module("NotificationMixin — formatNotifTime");

    QUnit.test("returns empty string for null", function (assert) {
        assert.strictEqual(NotificationMixin.formatNotifTime(null), "", "null → empty string");
    });

    QUnit.test("returns empty string for undefined", function (assert) {
        assert.strictEqual(NotificationMixin.formatNotifTime(undefined), "", "undefined → empty string");
    });

    QUnit.test("returns 'Just now' for timestamp < 60 seconds ago", function (assert) {
        var sNow = new Date(Date.now() - 20000).toISOString(); // 20 seconds ago
        assert.strictEqual(NotificationMixin.formatNotifTime(sNow), "Just now");
    });

    QUnit.test("returns 'X min ago' for timestamp < 1 hour ago", function (assert) {
        var s30min = new Date(Date.now() - 1800000).toISOString(); // 30 minutes ago
        var result = NotificationMixin.formatNotifTime(s30min);
        assert.ok(result.indexOf("min ago") >= 0, "shows minutes (got: " + result + ")");
        assert.ok(result.indexOf("30") >= 0, "shows 30 minutes");
    });

    QUnit.test("returns 'X hr ago' for timestamp < 24 hours ago", function (assert) {
        var s3hr = new Date(Date.now() - 10800000).toISOString(); // 3 hours ago
        var result = NotificationMixin.formatNotifTime(s3hr);
        assert.ok(result.indexOf("hr ago") >= 0, "shows hours (got: " + result + ")");
        assert.ok(result.indexOf("3") >= 0, "shows 3 hours");
    });

    QUnit.test("returns 'Yesterday' for timestamp 25–47 hours ago", function (assert) {
        var sYesterday = new Date(Date.now() - 90000000).toISOString(); // ~25 hours ago
        var result = NotificationMixin.formatNotifTime(sYesterday);
        assert.strictEqual(result, "Yesterday", "shows Yesterday");
    });

    QUnit.test("returns 'X days ago' for timestamp 2–6 days ago", function (assert) {
        var s3days = new Date(Date.now() - 259200000).toISOString(); // 3 days ago
        var result = NotificationMixin.formatNotifTime(s3days);
        assert.ok(result.indexOf("days ago") >= 0, "shows days ago (got: " + result + ")");
    });

    QUnit.test("returns formatted date for timestamp > 7 days ago", function (assert) {
        var sOld = new Date(Date.now() - 864000000).toISOString(); // 10 days ago
        var result = NotificationMixin.formatNotifTime(sOld);
        assert.ok(result.length > 0, "returns non-empty string for old date");
        // Should be a localeDateString like "Dec 5" not "X days ago"
        assert.notOk(result.indexOf("days ago") >= 0, "does NOT show days ago for very old date");
    });

    // ── formatNotifIconSrc ────────────────────────────────────────────────────

    QUnit.module("NotificationMixin — formatNotifIconSrc");

    QUnit.test("booking_request returns calendar icon", function (assert) {
        var result = NotificationMixin.formatNotifIconSrc("booking_request");
        assert.ok(result.indexOf("calendar") >= 0, "booking_request → calendar icon");
    });

    QUnit.test("direct_message returns discussion icon", function (assert) {
        var result = NotificationMixin.formatNotifIconSrc("direct_message");
        assert.ok(result.indexOf("discussion") >= 0, "direct_message → discussion icon");
    });

    QUnit.test("unknown type returns default bell icon", function (assert) {
        var result = NotificationMixin.formatNotifIconSrc("unknown_type_xyz");
        assert.ok(result.indexOf("bell") >= 0, "unknown → bell icon");
    });

    QUnit.test("booking_accepted returns appointment icon", function (assert) {
        var result = NotificationMixin.formatNotifIconSrc("booking_accepted");
        assert.ok(result.indexOf("appointment") >= 0, "booking_accepted → appointment icon");
    });

    // ── formatNotifIconColor ──────────────────────────────────────────────────

    QUnit.module("NotificationMixin — formatNotifIconColor");

    QUnit.test("booking_request returns orange colour", function (assert) {
        var result = NotificationMixin.formatNotifIconColor("booking_request");
        assert.strictEqual(result, "#f97316", "booking_request → #f97316");
    });

    QUnit.test("booking_declined returns red colour", function (assert) {
        var result = NotificationMixin.formatNotifIconColor("booking_declined");
        assert.strictEqual(result, "#ef4444", "booking_declined → #ef4444");
    });

    QUnit.test("booking_accepted returns green colour", function (assert) {
        var result = NotificationMixin.formatNotifIconColor("booking_accepted");
        assert.strictEqual(result, "#16a34a", "booking_accepted → #16a34a");
    });

    QUnit.test("direct_message returns purple colour", function (assert) {
        var result = NotificationMixin.formatNotifIconColor("direct_message");
        assert.strictEqual(result, "#8b5cf6", "direct_message → #8b5cf6");
    });

    QUnit.test("unknown type returns default grey colour", function (assert) {
        var result = NotificationMixin.formatNotifIconColor("xyz_unknown");
        assert.strictEqual(result, "#94a3b8", "unknown → default grey #94a3b8");
    });
});
