/**
 * OPA5 Journey — About & Legal page (Settings tab on edit profile page).
 *
 * Scenarios covered:
 *  1. Settings tab exists in the edit-profile page
 *  2. Settings tab contains the app hero with "HelpMate" title
 *  3. Settings tab contains a Terms & Conditions list item
 *  4. Settings tab contains a Privacy Policy list item
 *  5. Settings tab contains Help & FAQ list item
 *  6. Settings tab contains Contact Support list item
 *  7. Settings tab contains the App version info row
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "helphub/test/integration/pages/DashboardPage",
    "helphub/test/mockserver/MockServer"
], function (opaTest, Opa5, Press, PropertyStrictEquals, DashboardPage, MockServer) {
    "use strict";

    QUnit.module("About & Legal — Settings tab on edit profile page", {
        before: function () { MockServer.start(); },
        after:  function () { MockServer.stop(); }
    });

    // ── Helper: navigate to Settings tab ──────────────────────────────────────
    // The Settings tab is the second tab in the edit-profile IconTabBar.
    // We open the edit page via the header avatar action sheet.

    function iNavigateToSettingsTab(When) {
        When.waitFor({
            id: "headerAvatar",
            viewName: "helphub.view.Dashboard",
            actions: new Press(),
            errorMessage: "Header avatar not found"
        });
        When.waitFor({
            controlType: "sap.m.Button",
            viewName: "helphub.view.Dashboard",
            matchers: new PropertyStrictEquals({ name: "icon", value: "sap-icon://person-placeholder" }),
            actions: new Press(),
            errorMessage: "Edit Profile button not found in action sheet"
        });
        // Press the Settings tab (key="settings")
        When.waitFor({
            controlType: "sap.m.IconTabFilter",
            viewName: "helphub.view.Dashboard",
            matchers: new PropertyStrictEquals({ name: "key", value: "settings" }),
            actions: new Press(),
            errorMessage: "Settings tab not found in edit profile page"
        });
    }

    // ── 1. Settings tab exists ────────────────────────────────────────────────

    opaTest("Settings tab exists in the edit-profile IconTabBar", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.waitFor({
            id: "headerAvatar",
            viewName: "helphub.view.Dashboard",
            actions: new Press(),
            errorMessage: "Header avatar not found"
        });
        When.waitFor({
            controlType: "sap.m.Button",
            viewName: "helphub.view.Dashboard",
            matchers: new PropertyStrictEquals({ name: "icon", value: "sap-icon://person-placeholder" }),
            actions: new Press(),
            errorMessage: "Edit Profile button not found"
        });

        Then.waitFor({
            controlType: "sap.m.IconTabFilter",
            viewName: "helphub.view.Dashboard",
            matchers: new PropertyStrictEquals({ name: "key", value: "settings" }),
            success: function () {
                Opa5.assert.ok(true, "Settings tab (key='settings') exists in edit-profile page");
            },
            errorMessage: "Settings tab not found"
        });

        Then.iTeardownMyUIComponent();
    });

    // ── 2. Hero title shows "HelpMate" ────────────────────────────────────────

    opaTest("Settings tab hero shows 'HelpMate' title", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        iNavigateToSettingsTab(When);

        Then.waitFor({
            controlType: "sap.m.Title",
            viewName: "helphub.view.Dashboard",
            matchers: new PropertyStrictEquals({ name: "text", value: "HelpMate" }),
            success: function () {
                Opa5.assert.ok(true, "'HelpMate' title found in Settings tab hero");
            },
            errorMessage: "'HelpMate' title not found in Settings tab"
        });

        Then.iTeardownMyUIComponent();
    });

    // ── 3 & 4. Legal list items ───────────────────────────────────────────────

    ["Terms & Conditions", "Privacy Policy"].forEach(function (sTitle) {
        opaTest("Settings tab contains '" + sTitle + "' list item", function (Given, When, Then) {
            Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

            iNavigateToSettingsTab(When);

            Then.waitFor({
                controlType: "sap.m.StandardListItem",
                viewName: "helphub.view.Dashboard",
                matchers: new PropertyStrictEquals({ name: "title", value: sTitle }),
                success: function () {
                    Opa5.assert.ok(true, "'" + sTitle + "' list item found in Settings tab");
                },
                errorMessage: "'" + sTitle + "' list item not found in Settings tab"
            });

            Then.iTeardownMyUIComponent();
        });
    });

    // ── 5 & 6. Support list items ─────────────────────────────────────────────

    ["Help & FAQ", "Contact Support"].forEach(function (sTitle) {
        opaTest("Settings tab contains '" + sTitle + "' list item", function (Given, When, Then) {
            Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

            iNavigateToSettingsTab(When);

            Then.waitFor({
                controlType: "sap.m.StandardListItem",
                viewName: "helphub.view.Dashboard",
                matchers: new PropertyStrictEquals({ name: "title", value: sTitle }),
                success: function () {
                    Opa5.assert.ok(true, "'" + sTitle + "' list item found in Settings tab");
                },
                errorMessage: "'" + sTitle + "' list item not found in Settings tab"
            });

            Then.iTeardownMyUIComponent();
        });
    });

    // ── 7. App version row ────────────────────────────────────────────────────

    opaTest("Settings tab About section shows app version '2.21'", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        iNavigateToSettingsTab(When);

        Then.waitFor({
            controlType: "sap.m.Text",
            viewName: "helphub.view.Dashboard",
            matchers: new PropertyStrictEquals({ name: "text", value: "2.21" }),
            success: function () {
                Opa5.assert.ok(true, "App version '2.21' found in Settings tab About section");
            },
            errorMessage: "App version text '2.21' not found"
        });

        Then.iTeardownMyUIComponent();
    });

});
