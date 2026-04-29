sap.ui.define([
    "sap/m/MessageToast",
    "helphub/config"
], function (MessageToast, Config) {
    "use strict";

    var API_BASE = Config.API_BASE;

    return {

        _renderChatBubbles: function (aMessages) {
            var oHtml = this.byId("chatMessagesHtml");
            var oScroll = this.byId("chatScrollContainer");
            if (!oHtml) return;

            var iLast = aMessages.length - 1;
            var sHtml = aMessages.map(function (m, i) {
                var sEsc = (m.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
                if (m.role === "user") {
                    var bRead = (i < iLast) || (aMessages[i + 1] && aMessages[i + 1].role === "assistant");
                    var sReceipt = bRead
                        ? '<span style="font-size:11px;color:#93c5fd;margin-left:4px">✓✓</span>'
                        : '<span style="font-size:11px;color:#bfdbfe;margin-left:4px">✓</span>';
                    return '<div style="text-align:right;margin:4px 0">'
                        + '<span style="background:#3b82f6;color:white;padding:8px 12px;border-radius:16px 16px 4px 16px;display:inline-block;max-width:80%;word-wrap:break-word;text-align:left">'
                        + sEsc + '</span>' + sReceipt + '</div>';
                }
                return '<div style="text-align:left;margin:4px 0"><span style="background:#f1f5f9;color:#1e293b;padding:8px 12px;border-radius:16px 16px 16px 4px;display:inline-block;max-width:80%;word-wrap:break-word">' + sEsc + '</span></div>';
            }).join("");

            oHtml.setContent("<div>" + sHtml + "</div>");

            if (oScroll) {
                setTimeout(function () { oScroll.scrollTo(0, 99999, 0); }, 50);
            }
        },

        onOpenChat: function () {
            var oModel = this.getModel("appData");
            var sName = oModel.getProperty("/selectedProfile/name") || "Helper";

            this._chatMessages = [{
                role: "assistant",
                content: "Hi! I'm here to help you learn about " + sName + ". Ask me anything — availability, pricing, services, or anything else!"
            }];

            Promise.all([this._getProfileDialog(), this._getAiChatDialog()]).then(function (aDialogs) {
                aDialogs[0].close();
                aDialogs[1].setTitle("Chat with " + sName);
                aDialogs[1].open();
            }.bind(this));

            var that = this;
            setTimeout(function () { that._renderChatBubbles(that._chatMessages); }, 100);
        },

        onChatSend: function () {
            var oModel = this.getModel("appData");
            var oInput = this.byId("chatInput");
            var sText = oInput.getValue().trim();
            if (!sText) return;

            var sProviderId = oModel.getProperty("/selectedProfile/id");
            if (!this._chatMessages) this._chatMessages = [];

            this._chatMessages.push({ role: "user", content: sText });
            this._renderChatBubbles(this._chatMessages);
            oInput.setValue("");

            var oTyping = this.byId("chatTypingIndicator");
            var oSendBtn = this.byId("chatSendBtn");
            if (oTyping) oTyping.setVisible(true);
            if (oSendBtn) oSendBtn.setEnabled(false);

            var aApiMessages = this._chatMessages.map(function (m) {
                return { role: m.role, content: m.content };
            });

            var that = this;
            var sFullReply = "";
            var iPlaceholder = this._chatMessages.length;
            this._chatMessages.push({ role: "assistant", content: "" });

            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");

            fetch(API_BASE + "/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider_id: sProviderId, messages: aApiMessages, user_id: sUserId })
            })
                .then(function (res) {
                    var oReader = res.body.getReader();
                    var oDecoder = new TextDecoder();
                    function pump() {
                        return oReader.read().then(function (chunk) {
                            if (chunk.done) {
                                if (oTyping) oTyping.setVisible(false);
                                if (oSendBtn) oSendBtn.setEnabled(true);
                                return;
                            }
                            oDecoder.decode(chunk.value, { stream: true }).split("\n").forEach(function (sLine) {
                                if (!sLine.startsWith("data: ")) return;
                                var sData = sLine.slice(6).trim();
                                if (sData === "[DONE]") return;
                                try {
                                    var o = JSON.parse(sData);
                                    if (o.text) {
                                        sFullReply += o.text;
                                        that._chatMessages[iPlaceholder].content = sFullReply;
                                        that._renderChatBubbles(that._chatMessages);
                                    } else if (o.error) {
                                        that._chatMessages[iPlaceholder].content = "⚠️ " + o.error;
                                        that._renderChatBubbles(that._chatMessages);
                                    }
                                } catch (e) { /* skip */ }
                            });
                            return pump();
                        });
                    }
                    return pump();
                })
                .catch(function () {
                    if (oTyping) oTyping.setVisible(false);
                    if (oSendBtn) oSendBtn.setEnabled(true);
                    that._chatMessages[iPlaceholder].content = "Sorry, I couldn't reach the server. Please try again.";
                    that._renderChatBubbles(that._chatMessages);
                });
        },

        onCloseChat: function () {
            this._getAiChatDialog().then(function (d) { d.close(); }.bind(this));
        },

        onQuickReply: function (oEvent) {
            var sText = oEvent.getSource().getText().replace(/[\uD800-\uDFFF]./g, "").replace(/[^\x00-\x7E]/g, "").trim();
            sText = oEvent.getSource().getText().trim();
            var oInput = this.byId("chatInput");
            if (oInput) {
                oInput.setValue(sText);
                this.onChatSend();
            }
        },

        _showInAppToast: function (sIcon, sTitle, sMessage) {
            MessageToast.show(sIcon + " " + sTitle + "\n" + sMessage, {
                duration: 5000,
                width: "20em",
                my: "center top",
                at: "center top",
                offset: "0 64",
                autoClose: true
            });
        },

        _getProviderFromEvent: function (oEvent) {
            var oListItem = oEvent.getSource().getParent().getParent();
            var oCtx = oListItem.getBindingContext("appData");
            if (!oCtx) return null;
            var oProvider = Object.assign({}, oCtx.getObject());
            if (oProvider.name && !oProvider.initials) {
                oProvider.initials = oProvider.name.split(" ").map(function (p) { return p[0]; }).join("").substring(0, 2).toUpperCase();
            }
            return oProvider;
        },

        onQuickBook: function (oEvent) {
            var oProvider = this._getProviderFromEvent(oEvent);
            if (!oProvider) return;
            this.getModel("appData").setProperty("/selectedProfile", oProvider);
            this.onOpenBooking();
        },

        onQuickChat: function (oEvent) {
            var oProvider = this._getProviderFromEvent(oEvent);
            if (!oProvider) return;
            oProvider.reviews = [];
            this.getModel("appData").setProperty("/selectedProfile", oProvider);
            this.onOpenChat();
        },

        onQuickMessage: function (oEvent) {
            var oProvider = this._getProviderFromEvent(oEvent);
            if (!oProvider) return;
            this.getModel("appData").setProperty("/selectedProfile", oProvider);
            this.onStartDm();
        }

    };
});
