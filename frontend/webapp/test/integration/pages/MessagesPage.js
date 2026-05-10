/**
 * OPA5 Page Object — Messages tab.
 *
 * Covers:
 *  - At least one conversation list section has items (msgToday / msgYesterday / msgEarlier)
 *  - Unread count badge visible when unread_count > 0
 *  - Messages tab navigation button
 */
sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/AggregationFilled"
], function (Opa5, Press, AggregationFilled) {
    "use strict";

    var DASHBOARD_VIEW = "helphub.view.Dashboard";

    Opa5.createPageObjects({
        onTheMessagesPage: {

            // ── Actions ──────────────────────────────────────────────────────

            actions: {

                iPressMessagesTab: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oBtn) {
                            var aData = oBtn.getCustomData();
                            return aData.some(function (d) {
                                return d.getKey() === "tab" && d.getValue() === "messages";
                            });
                        },
                        actions: new Press(),
                        errorMessage: "Messages nav-tab button not found"
                    });
                }
            },

            // ── Assertions ───────────────────────────────────────────────────

            assertions: {

                iSeeAtLeastOneConversation: function () {
                    // The DmMixin splits conversations into "today", "yesterday", "earlier"
                    // buckets.  We check that at least one List in the messages panel
                    // contains items rather than requiring a specific bucket.
                    return this.waitFor({
                        controlType: "sap.m.List",
                        viewName: DASHBOARD_VIEW,
                        matchers: new AggregationFilled({ name: "items" }),
                        success: function (aLists) {
                            var bAny = aLists.some(function (l) {
                                return l.getItems().length > 0;
                            });
                            Opa5.assert.ok(bAny, "At least one conversation list section has items");
                        },
                        errorMessage: "No conversation items found in any list section on Messages tab"
                    });
                },

                iSeeUnreadBadgeOnConversation: function () {
                    return this.waitFor({
                        controlType: "sap.m.Text",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oText) {
                            // Unread badge texts are numeric strings "1", "2", etc.
                            var sClass = (oText.aCustomStyleClasses || []).join(" ");
                            return sClass.indexOf("hhUnreadBadge") >= 0 &&
                                   parseInt(oText.getText(), 10) > 0;
                        },
                        success: function (aItems) {
                            Opa5.assert.ok(aItems.length > 0,
                                "At least one conversation shows an unread count badge");
                        },
                        errorMessage: "No unread badge found in conversations list"
                    });
                },

                iSeeMessagesTabButton: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oBtn) {
                            var aData = oBtn.getCustomData();
                            return aData.some(function (d) {
                                return d.getKey() === "tab" && d.getValue() === "messages";
                            });
                        },
                        success: function () {
                            Opa5.assert.ok(true, "Messages nav-tab button is present");
                        },
                        errorMessage: "Messages nav-tab button not found"
                    });
                }
            }
        }
    });
});
