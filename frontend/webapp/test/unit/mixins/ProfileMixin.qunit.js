sap.ui.define([
    "helphub/controller/mixins/ProfileMixin"
], function (ProfileMixin) {
    "use strict";

    // ── _formatReviews ────────────────────────────────────────────────────────

    QUnit.module("ProfileMixin — _formatReviews");

    QUnit.test("returns empty array for null input", function (assert) {
        var aResult = ProfileMixin._formatReviews(null);
        assert.deepEqual(aResult, [], "null → []");
    });

    QUnit.test("returns empty array for undefined input", function (assert) {
        var aResult = ProfileMixin._formatReviews(undefined);
        assert.deepEqual(aResult, [], "undefined → []");
    });

    QUnit.test("returns empty array for empty array input", function (assert) {
        var aResult = ProfileMixin._formatReviews([]);
        assert.deepEqual(aResult, [], "[] → []");
    });

    QUnit.test("preserves original review fields (stars, comment)", function (assert) {
        var aInput = [{ reviewer_name: "Alice", stars: 4, comment: "Great!", created_at: new Date().toISOString() }];
        var aResult = ProfileMixin._formatReviews(aInput);
        assert.strictEqual(aResult[0].stars, 4, "stars preserved");
        assert.strictEqual(aResult[0].comment, "Great!", "comment preserved");
        assert.strictEqual(aResult[0].reviewer_name, "Alice", "reviewer_name preserved");
    });

    QUnit.test("derives initials from reviewer_name (two-word name)", function (assert) {
        var aInput = [{ reviewer_name: "John Doe", stars: 3, created_at: new Date().toISOString() }];
        var aResult = ProfileMixin._formatReviews(aInput);
        assert.strictEqual(aResult[0].reviewer_initials, "JD", "John Doe → JD");
    });

    QUnit.test("derives initials from single-word reviewer_name", function (assert) {
        var aInput = [{ reviewer_name: "Alice", stars: 5, created_at: new Date().toISOString() }];
        var aResult = ProfileMixin._formatReviews(aInput);
        assert.strictEqual(aResult[0].reviewer_initials, "A", "Alice → A");
    });

    QUnit.test("uses 'Anonymous' and '?' initials when reviewer_name is missing", function (assert) {
        var aInput = [{ stars: 2, created_at: new Date().toISOString() }];
        var aResult = ProfileMixin._formatReviews(aInput);
        assert.strictEqual(aResult[0].reviewer_initials, "AN", "no name → AN (Anonymous)");
    });

    QUnit.test("created_at < 60 seconds ago → 'just now'", function (assert) {
        var sTs = new Date(Date.now() - 30000).toISOString(); // 30 s ago
        var aResult = ProfileMixin._formatReviews([{ reviewer_name: "X", stars: 1, created_at: sTs }]);
        assert.strictEqual(aResult[0].created_at_relative, "just now", "30s → just now");
    });

    QUnit.test("created_at 5 minutes ago → 'X min ago'", function (assert) {
        var sTs = new Date(Date.now() - 300000).toISOString(); // 5 min ago
        var aResult = ProfileMixin._formatReviews([{ reviewer_name: "X", stars: 1, created_at: sTs }]);
        var sRel = aResult[0].created_at_relative;
        assert.ok(sRel.indexOf("min ago") >= 0, "5 min ago contains 'min ago' (got: " + sRel + ")");
        assert.ok(sRel.indexOf("5") >= 0, "shows 5 minutes");
    });

    QUnit.test("created_at 3 hours ago → 'X hr ago'", function (assert) {
        var sTs = new Date(Date.now() - 10800000).toISOString(); // 3 hr ago
        var aResult = ProfileMixin._formatReviews([{ reviewer_name: "X", stars: 1, created_at: sTs }]);
        var sRel = aResult[0].created_at_relative;
        assert.ok(sRel.indexOf("hr ago") >= 0, "3hr → 'hr ago' (got: " + sRel + ")");
        assert.ok(sRel.indexOf("3") >= 0, "shows 3 hours");
    });

    QUnit.test("created_at 5 days ago → 'X days ago'", function (assert) {
        var sTs = new Date(Date.now() - 432000000).toISOString(); // 5 days ago
        var aResult = ProfileMixin._formatReviews([{ reviewer_name: "X", stars: 1, created_at: sTs }]);
        var sRel = aResult[0].created_at_relative;
        assert.ok(sRel.indexOf("days ago") >= 0, "5 days → 'days ago' (got: " + sRel + ")");
    });

    QUnit.test("created_at > 30 days ago → formatted date string", function (assert) {
        var sTs = new Date(Date.now() - 5184000000).toISOString(); // 60 days ago
        var aResult = ProfileMixin._formatReviews([{ reviewer_name: "X", stars: 1, created_at: sTs }]);
        var sRel = aResult[0].created_at_relative;
        assert.ok(sRel.length > 0, "returns non-empty string");
        assert.notOk(sRel.indexOf("days ago") >= 0, "does NOT show 'days ago' for very old date");
        assert.notOk(sRel.indexOf("hr ago") >= 0, "does NOT show 'hr ago' for very old date");
    });

    QUnit.test("null created_at → empty relative string", function (assert) {
        var aResult = ProfileMixin._formatReviews([{ reviewer_name: "X", stars: 1, created_at: null }]);
        assert.strictEqual(aResult[0].created_at_relative, "", "null date → empty relative");
    });

    QUnit.test("invalid created_at → empty relative string", function (assert) {
        var aResult = ProfileMixin._formatReviews([{ reviewer_name: "X", stars: 1, created_at: "not-a-date" }]);
        assert.strictEqual(aResult[0].created_at_relative, "", "invalid date → empty relative");
    });

    QUnit.test("processes multiple reviews independently", function (assert) {
        var aInput = [
            { reviewer_name: "Alice Smith", stars: 5, comment: "Excellent", created_at: new Date(Date.now() - 30000).toISOString() },
            { reviewer_name: "Bob Jones",  stars: 3, comment: "OK",        created_at: new Date(Date.now() - 10800000).toISOString() }
        ];
        var aResult = ProfileMixin._formatReviews(aInput);
        assert.strictEqual(aResult.length, 2, "two inputs → two outputs");
        assert.strictEqual(aResult[0].reviewer_initials, "AS", "Alice Smith → AS");
        assert.strictEqual(aResult[1].reviewer_initials, "BJ", "Bob Jones → BJ");
        assert.strictEqual(aResult[0].created_at_relative, "just now", "first → just now");
        assert.ok(aResult[1].created_at_relative.indexOf("hr ago") >= 0, "second → hr ago");
    });
});
