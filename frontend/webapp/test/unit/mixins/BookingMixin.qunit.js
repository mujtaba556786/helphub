sap.ui.define([
    "helphub/controller/mixins/BookingMixin"
], function (BookingMixin) {
    "use strict";

    // ── formatBookingDate ─────────────────────────────────────────────────────

    QUnit.module("BookingMixin — formatBookingDate");

    QUnit.test("formats a valid ISO date string", function (assert) {
        var result = BookingMixin.formatBookingDate("2024-12-20");
        assert.ok(result.length > 0, "returns a non-empty string");
        assert.ok(result.indexOf("Dec") >= 0 || result.indexOf("20") >= 0, "contains date info");
    });

    QUnit.test("returns empty string for null input", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingDate(null), "", "null → empty string");
    });

    QUnit.test("returns empty string for undefined input", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingDate(undefined), "", "undefined → empty string");
    });

    QUnit.test("returns the original string for an invalid date", function (assert) {
        var result = BookingMixin.formatBookingDate("not-a-date");
        assert.strictEqual(result, "not-a-date", "invalid date → returns original string");
    });

    QUnit.test("formats full ISO timestamp", function (assert) {
        var result = BookingMixin.formatBookingDate("2024-06-15T08:30:00.000Z");
        assert.ok(result.length > 0, "ISO timestamp is formatted");
        assert.ok(result.indexOf("15") >= 0 || result.indexOf("Jun") >= 0, "contains day or month");
    });

    // ── formatBookingState ────────────────────────────────────────────────────

    QUnit.module("BookingMixin — formatBookingState");

    QUnit.test("confirmed → Success", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingState("confirmed"), "Success");
    });

    QUnit.test("declined → Error", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingState("declined"), "Error");
    });

    QUnit.test("cancelled → Error", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingState("cancelled"), "Error");
    });

    QUnit.test("completed → None", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingState("completed"), "None");
    });

    QUnit.test("pending (default) → Warning", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingState("pending"), "Warning");
    });

    QUnit.test("unknown status → Warning", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingState("something_else"), "Warning");
    });

    QUnit.test("undefined → Warning", function (assert) {
        assert.strictEqual(BookingMixin.formatBookingState(undefined), "Warning");
    });
});
