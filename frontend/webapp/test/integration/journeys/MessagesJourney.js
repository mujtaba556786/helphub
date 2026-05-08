/**
 * OPA5 Journey — Messages tab (conversations list, unread badge).
 *
 * Scenarios covered:
 *  1. Messages nav-tab button exists in the bottom navigation bar
 *  2. Switching to Messages tab shows at least one conversation
 *  3. A conversation with unread_count > 0 shows an unread badge
 *  4. DM Chat dialog opens when pressing a conversation item
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/AggregationFilled",
    "helphub/test/integration/pages/DashboardPage",
    "helphub/test/integration/pages/MessagesPage",
    "helphub/test/mockserver/MockServer"
], function (opaTest, Opa5, Press, AggregationFilled, DashboardPage, MessagesPage, MockServer) {
    "use strict";

    QUnit.module("Messages tab — conversations and unread counts", {
        before: function () { MockServer.start(); },
        after:  function () { MockServer.stop(); }
    });

    // ── 1. Tab button ─────────────────────────────────────────────────────

    opaTest("Messages nav-tab button is present in the bottom bar", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        Then.onTheMessagesPage.iSeeMessagesTabButton();
        Then.iTeardownMyUIComponent();
    });

    // ── 2. Conversations list ─────────────────────────────────────────────

    opaTest("Switching to Messages tab shows at least one conversation", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("messages");

        Then.onTheMessagesPage.iSeeAtLeastOneConversation();
        Then.iTeardownMyUIComponent();
    });

    // ── 3. Unread badge ───────────────────────────────────────────────────

    opaTest("A conversation with unread messages shows an unread count badge", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("messages");

        Then.onTheMessagesPage.iSeeUnreadBadgeOnConversation();
        Then.iTeardownMyUIComponent();
    });

    // ── 4. Open DM chat dialog ────────────────────────────────────────────

    opaTest("Pressing a conversation item opens the DM chat dialog", function (Given, When, Then) {
        Given.iStartMyUIComponent({ componentConfig: { name: "helphub", manifest: true } });

        When.onTheDashboard.iPressNavTab("messages");

        // Press the first active CustomListItem inside the messages panel
        When.waitFor({
            controlType: "sap.m.CustomListItem",
            viewName: "helphub.view.Dashboard",
            matchers: function (oItem) {
                // Items inside messages lists carry the press handler onOpenDmChat
                var sClass = (oItem.aCustomStyleClasses || []).join(" ");
                return sClass.indexOf("hhMsgItem") >= 0;
            },
            actions: new Press(),
            errorMessage: "No conversation list item found to press"
        });

        Then.waitFor({
            controlType: "sap.m.Dialog",
            success: function (aDialogs) {
                var bOpen = aDialogs.some(function (d) { return d.isOpen(); });
                Opa5.assert.ok(bOpen, "DM chat dialog opened after pressing a conversation");
            },
            errorMessage: "DM chat dialog did not open after pressing conversation item"
        });

        Then.iTeardownMyUIComponent();
    });
});
