/**
 * OPA5 Page Object — Tasks tab.
 *
 * Covers:
 *  - Browse / My Tasks toggle buttons
 *  - Post Task CTA button on Tasks tab
 *  - Task feed list (id="taskFeedList")
 *  - My Tasks list (id="myTasksList")
 *  - Task search field (id="taskSearch")
 *  - Category filter button (id="taskCatBtn")
 *  - OPEN status badge on task cards
 */
sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/matchers/AggregationFilled"
], function (Opa5, Press, EnterText, PropertyStrictEquals, AggregationFilled) {
    "use strict";

    var DASHBOARD_VIEW = "helphub.view.Dashboard";

    Opa5.createPageObjects({
        onTheTasksPage: {

            // ── Actions ──────────────────────────────────────────────────────

            actions: {

                iPressToggle: function (sMode) {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oBtn) {
                            var aData = oBtn.getCustomData();
                            return aData.some(function (d) {
                                return d.getKey() === "mode" && d.getValue() === sMode;
                            });
                        },
                        actions: new Press(),
                        errorMessage: "Task-view toggle button '" + sMode + "' not found"
                    });
                },

                iPressPostTask: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oBtn) {
                            return (oBtn.getText() || "").indexOf("Post Task") >= 0;
                        },
                        actions: new Press(),
                        errorMessage: "Post Task button not found on Tasks tab"
                    });
                },

                iTypeInTaskSearch: function (sQuery) {
                    return this.waitFor({
                        id: "taskSearch",
                        viewName: DASHBOARD_VIEW,
                        actions: new EnterText({ text: sQuery, clearTextFirst: true }),
                        errorMessage: "Task search field (id='taskSearch') not found"
                    });
                },

                iPressTaskCategoryFilter: function () {
                    return this.waitFor({
                        id: "taskCatBtn",
                        viewName: DASHBOARD_VIEW,
                        actions: new Press(),
                        errorMessage: "Task category filter button not found"
                    });
                }
            },

            // ── Assertions ───────────────────────────────────────────────────

            assertions: {

                iSeeTaskFeedListFilled: function () {
                    return this.waitFor({
                        id: "taskFeedList",
                        viewName: DASHBOARD_VIEW,
                        matchers: new AggregationFilled({ name: "items" }),
                        success: function () {
                            Opa5.assert.ok(true, "Task feed list has items");
                        },
                        errorMessage: "Task feed list is empty"
                    });
                },

                iSeeTaskFeedList: function () {
                    return this.waitFor({
                        id: "taskFeedList",
                        viewName: DASHBOARD_VIEW,
                        success: function () {
                            Opa5.assert.ok(true, "Task feed list control exists");
                        },
                        errorMessage: "taskFeedList not found"
                    });
                },

                iSeeMyTasksList: function () {
                    return this.waitFor({
                        id: "myTasksList",
                        viewName: DASHBOARD_VIEW,
                        success: function () {
                            Opa5.assert.ok(true, "My Tasks list control exists");
                        },
                        errorMessage: "myTasksList not found"
                    });
                },

                iSeeMyTasksListFilled: function () {
                    return this.waitFor({
                        id: "myTasksList",
                        viewName: DASHBOARD_VIEW,
                        matchers: new AggregationFilled({ name: "items" }),
                        success: function () {
                            Opa5.assert.ok(true, "My Tasks list has at least one item");
                        },
                        errorMessage: "My Tasks list is empty"
                    });
                },

                iSeeTaskSearchField: function () {
                    return this.waitFor({
                        id: "taskSearch",
                        viewName: DASHBOARD_VIEW,
                        success: function () {
                            Opa5.assert.ok(true, "Task search field is present");
                        },
                        errorMessage: "Task search field not found"
                    });
                },

                iSeeTaskCategoryFilterButton: function () {
                    return this.waitFor({
                        id: "taskCatBtn",
                        viewName: DASHBOARD_VIEW,
                        success: function () {
                            Opa5.assert.ok(true, "Task category filter button is present");
                        },
                        errorMessage: "Task category filter button not found"
                    });
                },

                iSeeOpenTaskBadge: function () {
                    return this.waitFor({
                        controlType: "sap.m.ObjectStatus",
                        viewName: DASHBOARD_VIEW,
                        matchers: new PropertyStrictEquals({ name: "text", value: "OPEN" }),
                        success: function (aItems) {
                            Opa5.assert.ok(aItems.length > 0, "OPEN status badge found on at least one task card");
                        },
                        errorMessage: "OPEN status badge not found in task feed"
                    });
                },

                iSeePostTaskButton: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oBtn) {
                            return (oBtn.getText() || "").indexOf("Post Task") >= 0;
                        },
                        success: function () {
                            Opa5.assert.ok(true, "Post Task button exists on Tasks tab");
                        },
                        errorMessage: "Post Task button not found"
                    });
                },

                iBrowseToggleIsVisible: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oBtn) {
                            var aData = oBtn.getCustomData();
                            return aData.some(function (d) {
                                return d.getKey() === "mode" && d.getValue() === "browse";
                            });
                        },
                        success: function () {
                            Opa5.assert.ok(true, "Browse toggle button is visible");
                        },
                        errorMessage: "Browse toggle button not found"
                    });
                },

                iMyTasksToggleIsVisible: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewName: DASHBOARD_VIEW,
                        matchers: function (oBtn) {
                            var aData = oBtn.getCustomData();
                            return aData.some(function (d) {
                                return d.getKey() === "mode" && d.getValue() === "mine";
                            });
                        },
                        success: function () {
                            Opa5.assert.ok(true, "My Tasks toggle button is visible");
                        },
                        errorMessage: "My Tasks toggle button not found"
                    });
                }
            }
        }
    });
});
