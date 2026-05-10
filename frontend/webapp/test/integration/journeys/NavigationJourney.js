/**
 * OPA5 Journey — Navigation flows across tabs and pages.
 *
 * Scenarios covered:
 *  1. App starts on the Find Help tab (dashboardPage is visible)
 *  2. Navigating to My Schedule tab shows bookingsList
 *  3. Navigating to Tasks tab shows taskFeedList
 *  4. Navigating to Messages tab and back to Find Help keeps state
 *  5. All four nav-tab buttons are present
 *  6. Pressing a service tile navigates to searchPage
 *  7. Back-navigation from searchPage returns to dashboardPage
 *  8. Direct tab-switching: findHelp → tasks → mySchedule → messages → findHelp
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "helphub/test/integration/pages/DashboardPage",
    "helphub/test/integration/pages/SearchPage",
    "helphub/test/mockserver/MockServer"
], function (opaTest, Opa5, Press, PropertyStrictEquals, DashboardPage, SearchPage, MockServer) {
    "use strict";

    QUnit.module("Navigation — tab switching and page transitions", {
        before: function () { MockServer.start(); },
        after:  function () { MockServer.stop(); }
    });

    // ── 1. Initial state ──────────────────────────────────────────────────

    opaTest("App starts with dashboardPage as the visible page", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        Then.waitFor({
            id: "dashboardPage",
            viewName: "helphub.view.Dashboard",
            success: function () {
                Opa5.assert.ok(true, "dashboardPage is the initial visible page");
            },
            errorMessage: "dashboardPage not found on load"
        });

        Then.iTeardownMyUIComponent();
    });

    // ── 2. All four nav-tab buttons exist ─────────────────────────────────

    var aExpectedTabs = ["findHelp", "tasks", "messages", "mySchedule"];

    aExpectedTabs.forEach(function (sTabKey) {
        opaTest("Nav-tab button for '" + sTabKey + "' is present", function (Given, When, Then) {
            Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

            Then.waitFor({
                controlType: "sap.m.Button",
                viewName: "helphub.view.Dashboard",
                matchers: function (oBtn) {
                    var aData = oBtn.getCustomData();
                    return aData.some(function (d) {
                        return d.getKey() === "tab" && d.getValue() === sTabKey;
                    });
                },
                success: function () {
                    Opa5.assert.ok(true, "Nav-tab button '" + sTabKey + "' found");
                },
                errorMessage: "Nav-tab button '" + sTabKey + "' not found"
            });

            Then.iTeardownMyUIComponent();
        });
    });

    // ── 3. Navigate to each tab ───────────────────────────────────────────

    opaTest("Navigating to My Schedule tab shows bookings list", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("mySchedule");

        Then.waitFor({
            id: "bookingsList",
            viewName: "helphub.view.Dashboard",
            success: function () {
                Opa5.assert.ok(true, "bookingsList found on My Schedule tab");
            },
            errorMessage: "bookingsList not found after navigating to mySchedule tab"
        });

        Then.iTeardownMyUIComponent();
    });

    opaTest("Navigating to Tasks tab shows task feed list", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");

        Then.waitFor({
            id: "taskFeedList",
            viewName: "helphub.view.Dashboard",
            success: function () {
                Opa5.assert.ok(true, "taskFeedList found on Tasks tab");
            },
            errorMessage: "taskFeedList not found after navigating to tasks tab"
        });

        Then.iTeardownMyUIComponent();
    });

    // ── 4. Tab cycle ──────────────────────────────────────────────────────

    opaTest("Full tab cycle findHelp→tasks→mySchedule→messages completes without error", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");
        When.onTheDashboard.iPressNavTab("mySchedule");
        When.onTheDashboard.iPressNavTab("messages");
        When.onTheDashboard.iPressNavTab("findHelp");

        // Back on Find Help — activity strip and CTA should be visible
        Then.onTheDashboard.iSeeActivityStrip();
        Then.onTheDashboard.iSeePostTaskCta();
        Then.iTeardownMyUIComponent();
    });

    // ── 5. Service tile → search page → back ──────────────────────────────

    opaTest("Pressing Cleaning tile navigates to searchPage", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressServiceTile("Cleaning");

        Then.onTheSearchPage.iSeeSearchPage();
        Then.iTeardownMyUIComponent();
    });

    opaTest("Back button on search page returns to dashboardPage", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressServiceTile("Cleaning");

        // Verify we are on the search page first
        Then.onTheSearchPage.iSeeSearchPage();

        // Press the header nav-back button
        When.onTheSearchPage.iPressNavBack();

        // We should be back at the dashboard page with the service grid
        Then.waitFor({
            id: "dashboardPage",
            viewName: "helphub.view.Dashboard",
            success: function () {
                Opa5.assert.ok(true, "Returned to dashboardPage after pressing back on search page");
            },
            errorMessage: "dashboardPage not visible after pressing back"
        });

        Then.iTeardownMyUIComponent();
    });

    // ── 6. NavContainer page objects exist ────────────────────────────────

    var aExpectedPages = ["dashboardPage", "searchPage", "editPage"];

    aExpectedPages.forEach(function (sPageId) {
        opaTest("NavContainer contains page '" + sPageId + "'", function (Given, When, Then) {
            Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

            Then.waitFor({
                id: sPageId,
                viewName: "helphub.view.Dashboard",
                visible: false,
                success: function () {
                    Opa5.assert.ok(true, "Page '" + sPageId + "' exists inside NavContainer");
                },
                errorMessage: "Page '" + sPageId + "' not found"
            });

            Then.iTeardownMyUIComponent();
        });
    });
});
