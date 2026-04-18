sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/ActionSheet",
    "sap/m/Button"
], function(MessageToast, MessageBox, ActionSheet, Button) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return {

        _loadTasksFeed: function() {
            var oModel    = this.getModel("appData");
            var sSearch   = oModel.getProperty("/taskSearchQuery") || "";
            var sCategory = oModel.getProperty("/taskCategoryFilter") || "";
            var sUrl = API_BASE + "/api/tasks?status=open";
            if (sCategory) { sUrl += "&category=" + encodeURIComponent(sCategory); }
            if (sSearch)   { sUrl += "&search="   + encodeURIComponent(sSearch); }

            fetch(sUrl)
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/_allTasksFeed", oData.tasks);
                        oModel.setProperty("/openTaskCount", oData.tasks.length || 0);
                        this._updateTaskMarkers(oData.tasks);
                        this._applyTaskFilters();
                    }
                }.bind(this))
                .catch(function() { /* silent */ });
        },

        _loadMyTasks: function() {
            var oModel  = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) return;

            fetch(API_BASE + "/api/tasks?poster_id=" + encodeURIComponent(sUserId))
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/myTasks", oData.tasks);
                    }
                })
                .catch(function() { /* silent */ });
        },

        onToggleTaskView: function(oEvent) {
            var sMode  = oEvent.getSource().data("mode");
            var oModel = this.getModel("appData");
            oModel.setProperty("/taskViewMode", sMode);
            if (sMode === "mine") {
                this._loadMyTasks();
            } else {
                this._loadTasksFeed();
            }
        },

        onTaskSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
            this.getModel("appData").setProperty("/taskSearchQuery", sQuery.trim());
            clearTimeout(this._taskSearchTimer);
            var that = this;
            this._taskSearchTimer = setTimeout(function() { that._loadTasksFeed(); }, 300);
        },

        onTaskCategoryFilter: function(oEvent) {
            var sCat = oEvent.getSource().data("cat");
            this.getModel("appData").setProperty("/taskCategoryFilter", sCat);
            this._loadTasksFeed();
        },

        onTaskCategoryMore: function() {
            var oModel    = this.getModel("appData");
            var aServices = oModel.getProperty("/services") || [];
            var aNames    = aServices.map(function(s) { return s.name; });

            var oActionSheet = new ActionSheet({ placement: "Bottom" });
            var that = this;
            aNames.forEach(function(name) {
                oActionSheet.addButton(new Button({
                    text: name,
                    press: function() {
                        oModel.setProperty("/taskCategoryFilter", name);
                        that._loadTasksFeed();
                    }
                }));
            });
            oActionSheet.openBy(this.byId("taskSearch") || this.getView());
        },

        onOpenPostTask: function() {
            var oModel = this.getModel("appData");
            oModel.setProperty("/taskForm", {
                title: "", description: "", category: "", budget: "", task_date: "", location: ""
            });
            this._getPostTaskDialog().then(function(d) { d.open(); }.bind(this));
        },

        onConfirmPostTask: function() {
            var oModel  = this.getModel("appData");
            var oForm   = oModel.getProperty("/taskForm");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");

            if (!oForm.title || !oForm.title.trim()) { MessageToast.show("Please enter a title."); return; }
            if (!oForm.category) { MessageToast.show("Please select a category."); return; }
            if (!sUserId) { MessageToast.show("Please log in first."); return; }

            var that     = this;
            var oUserLoc = oModel.getProperty("/user/location");
            fetch(API_BASE + "/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    poster_id:   sUserId,
                    title:       oForm.title.trim(),
                    description: oForm.description,
                    category:    oForm.category,
                    budget:      oForm.budget ? parseFloat(oForm.budget) : null,
                    task_date:   oForm.task_date || null,
                    location:    oForm.location,
                    lat:         oUserLoc ? oUserLoc.lat : null,
                    lng:         oUserLoc ? oUserLoc.lng : null
                })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    that._getPostTaskDialog().then(function(d) { d.close(); });
                    MessageToast.show("Task posted!");
                    that._loadTasksFeed();
                    that._loadMyTasks();
                } else {
                    MessageToast.show("Failed: " + (oData.error || "Unknown error"));
                }
            })
            .catch(function() { MessageToast.show("Could not reach the server."); });
        },

        onClosePostTask: function() {
            this._getPostTaskDialog().then(function(d) { d.close(); }.bind(this));
        },

        onTaskPress: function(oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("appData");
            if (!oCtx) return;
            var oTask  = oCtx.getObject();
            var oModel = this.getModel("appData");
            oModel.setProperty("/selectedTask", oTask);
            oModel.setProperty("/taskApplications", []);

            var that = this;
            fetch(API_BASE + "/api/tasks/" + encodeURIComponent(oTask.id))
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/selectedTask", oData.task);
                        oModel.setProperty("/taskApplications", oData.applications || []);
                    }
                    that._getTaskDetailDialog().then(function(d) { d.open(); });
                })
                .catch(function() { that._getTaskDetailDialog().then(function(d) { d.open(); }); });
        },

        onApplyToTask: function() {
            var oModel  = this.getModel("appData");
            var sTaskId = oModel.getProperty("/selectedTask/id");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");

            if (!sUserId) { MessageToast.show("Please log in first."); return; }

            var that = this;
            fetch(API_BASE + "/api/tasks/" + encodeURIComponent(sTaskId) + "/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider_id: sUserId })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    MessageToast.show("Applied! The poster will review your application.");
                    that._getTaskDetailDialog().then(function(d) { d.close(); });
                    that._loadTasksFeed();
                } else {
                    MessageToast.show(oData.error || "Could not apply.");
                }
            })
            .catch(function() { MessageToast.show("Could not reach the server."); });
        },

        onAssignProvider: function(oEvent) {
            var oCtx = oEvent.getSource().getParent().getParent().getBindingContext("appData");
            if (!oCtx) return;
            var sProviderId = oCtx.getObject().provider_id;
            var oModel      = this.getModel("appData");
            var sTaskId     = oModel.getProperty("/selectedTask/id");

            var that = this;
            fetch(API_BASE + "/api/tasks/" + encodeURIComponent(sTaskId) + "/assign", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider_id: sProviderId })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    MessageToast.show("Provider assigned!");
                    that._getTaskDetailDialog().then(function(d) { d.close(); });
                    that._loadTasksFeed();
                    that._loadMyTasks();
                }
            })
            .catch(function() { MessageToast.show("Could not assign provider."); });
        },

        onCompleteTask: function() {
            var oModel  = this.getModel("appData");
            var sTaskId = oModel.getProperty("/selectedTask/id");

            var that = this;
            fetch(API_BASE + "/api/tasks/" + encodeURIComponent(sTaskId) + "/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "completed" })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    MessageToast.show("Task completed!");
                    that._getTaskDetailDialog().then(function(d) { d.close(); });
                    that._loadTasksFeed();
                    that._loadMyTasks();
                }
            })
            .catch(function() { MessageToast.show("Could not update task."); });
        },

        onDeleteTask: function() {
            var oModel  = this.getModel("appData");
            var sTaskId = oModel.getProperty("/selectedTask/id");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            var sTitle  = oModel.getProperty("/selectedTask/title") || "this task";

            if (!sUserId) { MessageToast.show("Please log in first."); return; }

            var that = this;
            MessageBox.confirm("Delete \"" + sTitle + "\"? This cannot be undone.", {
                title: "Delete Task",
                onClose: function(sAction) {
                    if (sAction !== MessageBox.Action.OK) return;
                    fetch(API_BASE + "/api/tasks/" + encodeURIComponent(sTaskId), {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: sUserId })
                    })
                    .then(function(r) { return r.json(); })
                    .then(function(oData) {
                        if (oData.success) {
                            MessageToast.show("Task deleted.");
                            that._getTaskDetailDialog().then(function(d) { d.close(); });
                            that._loadTasksFeed();
                            that._loadMyTasks();
                        } else {
                            MessageToast.show(oData.error || "Could not delete task.");
                        }
                    })
                    .catch(function() { MessageToast.show("Could not reach the server."); });
                }
            });
        },

        onCloseTaskDetail: function() {
            this._getTaskDetailDialog().then(function(d) { d.close(); }.bind(this));
        },

        onMessageTaskPoster: function() {
            var oModel      = this.getModel("appData");
            var sUserId     = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            var sPosterId   = oModel.getProperty("/selectedTask/poster_id");
            var sPosterName = oModel.getProperty("/selectedTask/poster_name") || "Task Poster";

            if (!sUserId) { MessageToast.show("Please log in first."); return; }
            if (sUserId === sPosterId) { MessageToast.show("This is your own task."); return; }

            var that = this;
            this._getTaskDetailDialog().then(function(d) { d.close(); }.bind(this));
            fetch(API_BASE + "/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user1_id: sUserId, user2_id: sPosterId })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    that._currentConvoId = oData.conversation.id;
                    that._currentConvoOtherName = sPosterName;
                    that._currentConvoOtherId = sPosterId;
                    that._openDmChatForConversation(oData.conversation.id, sPosterName);
                }
            })
            .catch(function() { MessageToast.show("Could not start conversation."); });
        },

        onMessageApplicant: function(oEvent) {
            var oCtx = oEvent.getSource().getParent().getParent().getParent().getBindingContext("appData");
            if (!oCtx) return;
            var oApplicant    = oCtx.getObject();
            var oModel        = this.getModel("appData");
            var sUserId       = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            var sProviderId   = oApplicant.provider_id;
            var sProviderName = oApplicant.provider_name || "Applicant";

            if (!sUserId) { MessageToast.show("Please log in first."); return; }

            var that = this;
            this._getTaskDetailDialog().then(function(d) { d.close(); }.bind(this));
            fetch(API_BASE + "/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user1_id: sUserId, user2_id: sProviderId })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    that._currentConvoId = oData.conversation.id;
                    that._currentConvoOtherName = sProviderName;
                    that._currentConvoOtherId = sProviderId;
                    that._openDmChatForConversation(oData.conversation.id, sProviderName);
                }
            })
            .catch(function() { MessageToast.show("Could not start conversation."); });
        },

        formatTaskState: function(sStatus) {
            switch (sStatus) {
                case "open":      return "Success";
                case "assigned":  return "Warning";
                case "completed": return "None";
                default:          return "Information";
            }
        },

        formatPostedTime: function(sCreatedAt) {
            if (!sCreatedAt) return "";
            var oNow  = new Date();
            var oDate = new Date(sCreatedAt);
            var iDiff = Math.floor((oNow - oDate) / 1000); // seconds
            if (iDiff < 60)   return "Just now";
            if (iDiff < 3600) return Math.floor(iDiff / 60) + " min ago";
            if (iDiff < 86400) return Math.floor(iDiff / 3600) + " hr ago";
            if (iDiff < 172800) return "Yesterday";
            if (iDiff < 604800) return Math.floor(iDiff / 86400) + " days ago";
            return oDate.toLocaleDateString([], { month: "short", day: "numeric" });
        },

        formatTaskDue: function(sDate) {
            if (!sDate) return "";
            var oNow  = new Date();
            var oDue  = new Date(sDate);
            var iDiff = Math.floor((oDue - oNow) / 86400000);
            if (iDiff === 0)  return "📅 Today";
            if (iDiff === 1)  return "📅 Tomorrow";
            if (iDiff < 0)   return "Overdue";
            if (iDiff < 7)   return "📅 In " + iDiff + " days";
            return "📅 " + oDue.toLocaleDateString([], { month: "short", day: "numeric" });
        },

        onTaskBudgetMenu: function(oEvent) {
            var oModel = this.getModel("appData");
            var that   = this;
            sap.ui.require(["sap/m/ActionSheet", "sap/m/Button"], function(ActionSheet, Button) {
                var oSheet = new ActionSheet({
                    title: "Filter by Budget",
                    showCancelButton: true,
                    buttons: [
                        new Button({ text: "Any budget",   press: function() { oModel.setProperty("/taskBudgetFilter", "");      that._applyTaskFilters(); oSheet.close(); } }),
                        new Button({ text: "Under €50",    press: function() { oModel.setProperty("/taskBudgetFilter", "<€50");   that._applyTaskFilters(); oSheet.close(); } }),
                        new Button({ text: "€50 – €100",  press: function() { oModel.setProperty("/taskBudgetFilter", "€50–100"); that._applyTaskFilters(); oSheet.close(); } }),
                        new Button({ text: "Over €100",   press: function() { oModel.setProperty("/taskBudgetFilter", ">€100");   that._applyTaskFilters(); oSheet.close(); } })
                    ]
                });
                oSheet.openBy(oEvent.getSource());
            });
        },

        onTaskSortMenu: function(oEvent) {
            var oModel = this.getModel("appData");
            var that   = this;
            sap.ui.require(["sap/m/ActionSheet", "sap/m/Button"], function(ActionSheet, Button) {
                var oSheet = new ActionSheet({
                    title: "Sort Tasks",
                    showCancelButton: true,
                    buttons: [
                        new Button({ text: "🕒 Newest first",  press: function() { oModel.setProperty("/taskSort", "newest");      that._applyTaskFilters(); oSheet.close(); } }),
                        new Button({ text: "💎 Highest pay",   press: function() { oModel.setProperty("/taskSort", "budget_high"); that._applyTaskFilters(); oSheet.close(); } }),
                        new Button({ text: "💸 Lowest pay",    press: function() { oModel.setProperty("/taskSort", "budget_low");  that._applyTaskFilters(); oSheet.close(); } })
                    ]
                });
                oSheet.openBy(oEvent.getSource());
            });
        },

        _applyTaskFilters: function() {
            var oModel  = this.getModel("appData");
            var sBudget = oModel.getProperty("/taskBudgetFilter") || "";
            var sSort   = oModel.getProperty("/taskSort") || "newest";
            var aAll    = (oModel.getProperty("/_allTasksFeed") || []).slice();

            // Budget filter
            if (sBudget === "<€50") {
                aAll = aAll.filter(function(t) { return !t.budget || t.budget < 50; });
            } else if (sBudget === "€50–100") {
                aAll = aAll.filter(function(t) { return t.budget >= 50 && t.budget <= 100; });
            } else if (sBudget === ">€100") {
                aAll = aAll.filter(function(t) { return t.budget > 100; });
            }

            // Sort
            if (sSort === "budget_high") {
                aAll.sort(function(a, b) { return (b.budget || 0) - (a.budget || 0); });
            } else if (sSort === "budget_low") {
                aAll.sort(function(a, b) { return (a.budget || 0) - (b.budget || 0); });
            } else {
                aAll.sort(function(a, b) { return new Date(b.created_at || 0) - new Date(a.created_at || 0); });
            }

            oModel.setProperty("/tasksFeed", aAll);
        }

    };
});
