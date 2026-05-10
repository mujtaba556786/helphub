/**
 * OPA5 Journey — Tasks tab (Browse feed, My Tasks, search, category filter, post task).
 *
 * Scenarios covered:
 *  1.  Tasks tab shows the Browse toggle and My Tasks toggle buttons
 *  2.  Tasks tab shows a Post Task button
 *  3.  Browse view shows the task feed list populated
 *  4.  Task cards show OPEN status badge
 *  5.  Task search field is present
 *  6.  Task category filter button is present
 *  7.  Switching to My Tasks view shows the myTasksList control
 *  8.  My Tasks list is populated (mock data has a task posted by U_TEST_001)
 *  9.  Switching back to Browse view shows the task feed list again
 * 10.  Post Task dialog opens when pressing the CTA (dialog is detectable)
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "helphub/test/integration/pages/DashboardPage",
    "helphub/test/integration/pages/TasksPage",
    "helphub/test/mockserver/MockServer"
], function (opaTest, Opa5, DashboardPage, TasksPage, MockServer) {
    "use strict";

    QUnit.module("Tasks tab — feed, my tasks, search, post", {
        before: function () { MockServer.start(); },
        after:  function () { MockServer.stop(); }
    });

    // ── 1. Toggle buttons ─────────────────────────────────────────────────

    opaTest("Tasks tab shows Browse and My Tasks toggle buttons", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");

        Then.onTheTasksPage.iBrowseToggleIsVisible();
        Then.onTheTasksPage.iMyTasksToggleIsVisible();
        Then.iTeardownMyUIComponent();
    });

    // ── 2. Post Task CTA ──────────────────────────────────────────────────

    opaTest("Tasks tab shows a Post Task CTA button", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");

        Then.onTheTasksPage.iSeePostTaskButton();
        Then.iTeardownMyUIComponent();
    });

    // ── 3. Task feed list ─────────────────────────────────────────────────

    opaTest("Browse view shows the task feed list with items", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");

        Then.onTheTasksPage.iSeeTaskFeedListFilled();
        Then.iTeardownMyUIComponent();
    });

    // ── 4. OPEN status badge ──────────────────────────────────────────────

    opaTest("Task cards in the feed show OPEN status badge", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");

        Then.onTheTasksPage.iSeeOpenTaskBadge();
        Then.iTeardownMyUIComponent();
    });

    // ── 5. Search field ───────────────────────────────────────────────────

    opaTest("Task search field is present in Browse view", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");

        Then.onTheTasksPage.iSeeTaskSearchField();
        Then.iTeardownMyUIComponent();
    });

    // ── 6. Category filter button ─────────────────────────────────────────

    opaTest("Task category filter button is present", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");

        Then.onTheTasksPage.iSeeTaskCategoryFilterButton();
        Then.iTeardownMyUIComponent();
    });

    // ── 7 & 8. My Tasks view ──────────────────────────────────────────────

    opaTest("Switching to My Tasks view shows the myTasksList control", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");
        When.onTheTasksPage.iPressToggle("mine");

        Then.onTheTasksPage.iSeeMyTasksList();
        Then.iTeardownMyUIComponent();
    });

    opaTest("My Tasks list is populated for the logged-in user", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");
        When.onTheTasksPage.iPressToggle("mine");

        Then.onTheTasksPage.iSeeMyTasksListFilled();
        Then.iTeardownMyUIComponent();
    });

    // ── 9. Toggle back to Browse ──────────────────────────────────────────

    opaTest("Switching back from My Tasks to Browse re-shows task feed", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");
        When.onTheTasksPage.iPressToggle("mine");
        When.onTheTasksPage.iPressToggle("browse");

        Then.onTheTasksPage.iSeeTaskFeedList();
        Then.iTeardownMyUIComponent();
    });

    // ── 10. Post Task dialog ──────────────────────────────────────────────

    opaTest("Pressing Post Task opens the PostTask dialog", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("tasks");
        When.onTheTasksPage.iPressPostTask();

        Then.waitFor({
            controlType: "sap.m.Dialog",
            success: function (aDialogs) {
                var bOpen = aDialogs.some(function (d) { return d.isOpen(); });
                Opa5.assert.ok(bOpen, "A dialog (Post Task) is open after pressing the CTA");
            },
            errorMessage: "Post Task dialog did not open"
        });

        Then.iTeardownMyUIComponent();
    });
});
