/**
 * OPA5 Journey — My Schedule tab (bookings list and status filters).
 *
 * Scenarios covered:
 *  1. My Schedule tab shows the bookings list control
 *  2. Bookings list is populated (has items from mock data)
 *  3. All 6 status filter chips are present (all / pending / confirmed / completed / declined / cancelled)
 *  4. Confirmed booking shows a "Success" state badge
 *  5. Pending booking shows a "Warning" state badge
 *  6. Completed booking shows a "None" state badge (grey/neutral)
 *  7. Declined booking shows an "Error" state badge
 *  8. Pressing "confirmed" filter chip limits list to confirmed bookings only
 *  9. Pressing "pending" filter chip limits list to pending bookings only
 * 10. Pressing "all" filter chip restores the full list (excluding cancelled)
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "helphub/test/integration/pages/DashboardPage",
    "helphub/test/integration/pages/SchedulePage",
    "helphub/test/mockserver/MockServer"
], function (opaTest, Opa5, DashboardPage, SchedulePage, MockServer) {
    "use strict";

    QUnit.module("My Schedule — bookings list and filters", {
        before: function () { MockServer.start(); },
        after:  function () { MockServer.stop(); }
    });

    // ── 1 & 2. Basic list rendering ───────────────────────────────────────

    opaTest("My Schedule tab shows the bookings list control", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.onTheSchedulePage.iSeeBookingsList();
        Then.iTeardownMyUIComponent();
    });

    opaTest("Bookings list is populated with items from mock data", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.onTheSchedulePage.iSeeBookingsListFilled();
        Then.iTeardownMyUIComponent();
    });

    // ── 3. Filter chips ───────────────────────────────────────────────────

    opaTest("All 6 booking status filter chips are present", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.onTheSchedulePage.iSeeAllFilterChips();
        Then.iTeardownMyUIComponent();
    });

    // ── 4. Booking status badges ──────────────────────────────────────────

    opaTest("Confirmed booking shows an ObjectStatus with state 'Success'", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.onTheSchedulePage.iSeeBookingStatusBadge("confirmed", "Success");
        Then.iTeardownMyUIComponent();
    });

    opaTest("Pending booking shows an ObjectStatus with state 'Warning'", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.onTheSchedulePage.iSeeBookingStatusBadge("pending", "Warning");
        Then.iTeardownMyUIComponent();
    });

    opaTest("Completed booking shows an ObjectStatus with state 'None'", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.onTheSchedulePage.iSeeBookingStatusBadge("completed", "None");
        Then.iTeardownMyUIComponent();
    });

    opaTest("Declined booking shows an ObjectStatus with state 'Error'", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.onTheSchedulePage.iSeeBookingStatusBadge("declined", "Error");
        Then.iTeardownMyUIComponent();
    });

    // ── 5. Filter interactions ────────────────────────────────────────────

    opaTest("Pressing 'confirmed' filter chip shows only confirmed bookings", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");
        When.onTheSchedulePage.iPressBookingFilter("confirmed");

        // After filtering, list should still be filled (we have B1 confirmed)
        Then.onTheSchedulePage.iSeeBookingsListFilled();

        // And the list should only contain confirmed status badges
        Then.waitFor({
            id: "bookingsList",
            viewName: "helphub.view.Dashboard",
            success: function (oList) {
                var aItems = oList.getItems();
                var bAllConfirmed = aItems.every(function (oItem) {
                    var aStatuses = oItem.findAggregatedObjects(true, function (o) {
                        return o.isA("sap.m.ObjectStatus");
                    });
                    return aStatuses.some(function (s) { return s.getText() === "confirmed"; });
                });
                Opa5.assert.ok(bAllConfirmed,
                    "After 'confirmed' filter all visible bookings have status 'confirmed'");
            },
            errorMessage: "Bookings list not found for filter verification"
        });

        Then.iTeardownMyUIComponent();
    });

    opaTest("Pressing 'pending' filter chip shows only pending bookings", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");
        When.onTheSchedulePage.iPressBookingFilter("pending");

        Then.onTheSchedulePage.iSeeBookingsListFilled();

        Then.waitFor({
            id: "bookingsList",
            viewName: "helphub.view.Dashboard",
            success: function (oList) {
                var aItems = oList.getItems();
                var bAllPending = aItems.every(function (oItem) {
                    var aStatuses = oItem.findAggregatedObjects(true, function (o) {
                        return o.isA("sap.m.ObjectStatus");
                    });
                    return aStatuses.some(function (s) { return s.getText() === "pending"; });
                });
                Opa5.assert.ok(bAllPending,
                    "After 'pending' filter all visible bookings have status 'pending'");
            },
            errorMessage: "Bookings list not found after pending filter"
        });

        Then.iTeardownMyUIComponent();
    });

    opaTest("Pressing 'all' filter chip restores the full (non-cancelled) list", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");
        When.onTheSchedulePage.iPressBookingFilter("confirmed"); // narrow first
        When.onTheSchedulePage.iPressBookingFilter("all");       // then reset

        // With 4 non-cancelled bookings in mock data (B1–B4), list should show 4 items
        Then.waitFor({
            id: "bookingsList",
            viewName: "helphub.view.Dashboard",
            success: function (oList) {
                Opa5.assert.ok(oList.getItems().length >= 4,
                    "After reset to 'all', at least 4 bookings visible (cancelled hidden by default)");
            },
            errorMessage: "Bookings list not found for 'all' filter verification"
        });

        Then.iTeardownMyUIComponent();
    });
});
