sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return {

        _loadConversations: function () {
            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) return;

            fetch(API_BASE + "/api/conversations/" + encodeURIComponent(sUserId))
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oData.success) {
                        oModel.setProperty("/conversations", oData.conversations);
                        oModel.setProperty("/unreadDmCount", oData.totalUnread || 0);
                    }
                })
                .catch(function () { /* silent */ });
        },

        _loadUnreadDmCount: function () {
            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) return;

            fetch(API_BASE + "/api/messages/unread-count/" + encodeURIComponent(sUserId))
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oData.success) {
                        oModel.setProperty("/unreadDmCount", oData.count || 0);
                    }
                })
                .catch(function () { /* silent */ });
        },

        onStartDm: function () {
            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            var sProviderId = oModel.getProperty("/selectedProfile/id");
            var sProviderName = oModel.getProperty("/selectedProfile/name") || "Helper";

            if (!sUserId) { MessageToast.show("Please log in first."); return; }
            if (sUserId === sProviderId) { MessageToast.show("You can't message yourself."); return; }

            var that = this;
            fetch(API_BASE + "/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user1_id: sUserId, user2_id: sProviderId })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oData.success) {
                        that._getProfileDialog().then(function (d) { d.close(); });
                        that._currentConvoId = oData.conversation.id;
                        that._currentConvoOtherName = sProviderName;
                        that._currentConvoOtherId = sProviderId;
                        that._openDmChatForConversation(oData.conversation.id, sProviderName);
                    }
                })
                .catch(function () { MessageToast.show("Could not start conversation."); });
        },

        onOpenDmChat: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("appData");
            if (!oCtx) return;
            var oConvo = oCtx.getObject();
            this._currentConvoId = oConvo.id;
            this._currentConvoOtherName = oConvo.other_name;
            this._currentConvoOtherId = oConvo.other_id;
            this._openDmChatForConversation(oConvo.id, oConvo.other_name);
        },

        _openDmChatForConversation: function (sConvoId, sOtherName) {
            var that = this;
            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");

            oModel.setProperty("/currentDmOtherName", sOtherName || "");

            this._getDmChatDialog().then(function (oDialog) {
                oDialog.open();
            }.bind(this));

            fetch(API_BASE + "/api/messages/" + encodeURIComponent(sConvoId))
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (oData.success) {
                        that._dmMessages = oData.messages;
                        that._renderDmBubbles();
                        fetch(API_BASE + "/api/messages/" + encodeURIComponent(sConvoId) + "/read", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ user_id: sUserId })
                        }).catch(function () { });
                        that._loadUnreadDmCount();
                    }
                })
                .catch(function () { that._dmMessages = []; that._renderDmBubbles(); });
        },

        _renderDmBubbles: function () {
            var oHtml = this.byId("dmBubblesHtml");
            var oScroll = this.byId("dmScrollContainer");
            if (!oHtml) return;

            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            var aMessages = this._dmMessages || [];

            var sHtml = aMessages.map(function (m) {
                var sEsc = (m.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
                var sTime = m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                if (m.sender_id === sUserId) {
                    var sRead = m.is_read
                        ? '<span style="font-size:11px;color:#93c5fd;margin-left:4px">✓✓</span>'
                        : '<span style="font-size:11px;color:#bfdbfe;margin-left:4px">✓</span>';
                    return '<div style="text-align:right;margin:4px 0">'
                        + '<span style="background:#3b82f6;color:white;padding:8px 12px;border-radius:16px 16px 4px 16px;display:inline-block;max-width:80%;word-wrap:break-word;text-align:left">'
                        + sEsc + '</span>' + sRead
                        + '<div style="font-size:10px;color:#94a3b8;margin-top:2px">' + sTime + '</div></div>';
                }
                return '<div style="text-align:left;margin:4px 0">'
                    + '<span style="background:#f1f5f9;color:#1e293b;padding:8px 12px;border-radius:16px 16px 16px 4px;display:inline-block;max-width:80%;word-wrap:break-word">'
                    + sEsc + '</span>'
                    + '<div style="font-size:10px;color:#94a3b8;margin-top:2px">' + sTime + '</div></div>';
            }).join("");

            oHtml.setContent("<div style='display:flex;flex-direction:column;gap:8px;padding:12px'>" + sHtml + "</div>");

            if (oScroll) {
                setTimeout(function () { oScroll.scrollTo(0, 99999, 0); }, 50);
            }
        },

        onDmSend: function () {
            var oInput = this.byId("dmInput");
            var sText = oInput.getValue().trim();
            if (!sText) return;

            var oModel = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            var sConvoId = this._currentConvoId;
            if (!sConvoId || !sUserId) return;

            oInput.setValue("");

            this._dmMessages.push({
                sender_id: sUserId,
                content: sText,
                is_read: 0,
                created_at: new Date().toISOString()
            });
            this._renderDmBubbles();

            var that = this;
            fetch(API_BASE + "/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversation_id: sConvoId,
                    sender_id: sUserId,
                    content: sText
                })
            })
                .then(function (r) { return r.json(); })
                .then(function (oData) {
                    if (!oData.success) {
                        MessageToast.show("Message failed to send.");
                    }
                })
                .catch(function () { MessageToast.show("Could not reach the server."); });
        },

        onDmQuickReply: function (oEvent) {
            var sText = oEvent.getSource().getText().replace(/\s*[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]+$/u, "").trim();
            this.byId("dmInput").setValue(sText);
            this.onDmSend();
        },

        onCloseDmChat: function () {
            this._getDmChatDialog().then(function (d) { d.close(); }.bind(this));
            this._loadConversations();
        },

        formatConvoTime: function (sTime) {
            if (!sTime) return "";
            var d = new Date(sTime);
            var now = new Date();
            if (d.toDateString() === now.toDateString()) {
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

    };
});
