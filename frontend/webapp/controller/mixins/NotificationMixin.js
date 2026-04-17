sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return {

        _startNotificationPolling: function () {
            var that = this;
            this._loadNotificationCount();
            this._notifInterval = setInterval(function () {
                that._loadNotificationCount();
                that._loadUnreadDmCount();
            }, 30000); // poll every 30s
        },

        _loadNotificationCount: function () {
            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) return;
            var iPrev = oModel.getProperty("/unreadCount") || 0;

            fetch(API_BASE + "/api/notifications/" + encodeURIComponent(sUserId) + "/unread-count")
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oData.success) {
                        var iNew = oData.count || 0;
                        oModel.setProperty("/unreadCount", iNew);
                        this._setNotifDot(iNew > 0);
                        if (iNew > iPrev) {
                            this._showInAppToast("🔔", "New notification", "You have " + iNew + " unread notification" + (iNew > 1 ? "s" : ""));
                        }
                    }
                }.bind(this))
                .catch(function () { /* silent */ });
        },

        onShowNotifications: function () {
            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) { MessageToast.show("Please log in first."); return; }

            fetch(API_BASE + "/api/notifications/" + encodeURIComponent(sUserId))
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oData.success) {
                        oModel.setProperty("/notifications", oData.notifications);
                    }
                    this._getNotificationsDialog().then(function (d) { d.open(); }.bind(this));
                }.bind(this))
                .catch(function () { this._getNotificationsDialog().then(function (d) { d.open(); }.bind(this)); }.bind(this));
        },

        onMarkAllRead: function () {
            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) return;

            fetch(API_BASE + "/api/notifications/read-all/" + encodeURIComponent(sUserId), {
                method: "PUT"
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oData.success) {
                        var aNotifs = oModel.getProperty("/notifications") || [];
                        aNotifs.forEach(function (n) { n.is_read = 1; });
                        oModel.setProperty("/notifications", aNotifs);
                        oModel.setProperty("/unreadCount", 0);
                        this._setNotifDot(false);
                        MessageToast.show("All notifications marked as read.");
                    }
                }.bind(this))
                .catch(function () { /* silent */ });
        },

        onCloseNotifications: function () {
            this._getNotificationsDialog().then(function (d) { d.close(); }.bind(this));
        },

        onExit: function () {
            if (this._notifInterval) {
                clearInterval(this._notifInterval);
                this._notifInterval = null;
            }
        }

    };
});
