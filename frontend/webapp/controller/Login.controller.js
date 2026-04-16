sap.ui.define([
    "helphub/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/BusyDialog"
], function (BaseController, MessageToast, BusyDialog) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return BaseController.extend("helphub.controller.Login", {

        onInit: function () {
            this._oBusyDialog = new BusyDialog({ title: "Please wait…" });
        },

        // ── Apply session data from backend response ────────────────────────────
        _applySession: function (oData) {
            var sAccessToken = oData.accessToken || oData.token;
            window.HelpHubStorage.set("helpmate_token", sAccessToken);
            if (oData.refreshToken) {
                window.HelpHubStorage.set("helphub_refresh_token", oData.refreshToken);
            }
            if (oData.user && oData.user.id) {
                window.HelpHubStorage.set("helpmate_user_id", String(oData.user.id));
            }

            var oModel = this.getModel("appData");
            var oUser  = oData.user || {};

            oModel.setProperty("/user/id",    oUser.id    || "");
            oModel.setProperty("/user/name",  oUser.name  || "");
            oModel.setProperty("/user/email", oUser.email || "");
            var sAvatar = oUser.avatar || "";
            if (sAvatar && sAvatar.startsWith("/uploads/")) sAvatar = API_BASE + sAvatar;
            oModel.setProperty("/user/photo", sAvatar);
            var sInitials = (oUser.name || "?")
                .split(" ").filter(Boolean)
                .map(function(w) { return w[0]; })
                .join("").substring(0, 2).toUpperCase();
            oModel.setProperty("/user/initials", sInitials);
            oModel.setProperty("/user/bio",      oUser.bio       || "");
            oModel.setProperty("/user/phone",    oUser.phone     || "");
            oModel.setProperty("/user/languages", oUser.languages || "");
            oModel.setProperty("/user/years",    oUser.years     || 0);
            oModel.setProperty("/user/rate",     oUser.rate      || 0);
            var aAvail = (oUser.availability || "").split(",").filter(Boolean);
            oModel.setProperty("/user/availability", aAvail);
            oModel.setProperty("/user/serviceCategories",(oUser.service_categories || "").split(",").filter(Boolean));

            var oFlags = { all_day: false, weekdays: false, weekends: false, morning: false, afternoon: false, evening: false, night: false };
            aAvail.forEach(function(k) { if (oFlags.hasOwnProperty(k)) oFlags[k] = true; });
            oModel.setProperty("/user/availabilityFlags", oFlags);

            oModel.setProperty("/user/address/street",      oUser.street_name   || "");
            oModel.setProperty("/user/address/houseNumber", oUser.street_number || "");
            oModel.setProperty("/user/address/city",        oUser.city          || "");
            oModel.setProperty("/user/address/state",       oUser.state         || "");
            oModel.setProperty("/user/address/country",     oUser.country       || "");
            oModel.setProperty("/user/address/postalCode",  oUser.pincode       || "");
            oModel.setProperty("/user/terms_accepted_at",  oUser.terms_accepted_at || null);
            oModel.setProperty("/user/trust_level",        oUser.trust_level   || "new_user");
            oModel.setProperty("/user/trust_score",        oUser.trust_score   || 0);

            oModel.setProperty("/isLoggedIn", true);

            MessageToast.show("Welcome, " + (oUser.name || "User") + "!");
            this.navTo("dashboard");
        },

        // ── Send magic link to email ───────────────────────────────────────────
        onSendMagicLink: function () {
            var sEmail = this.byId("emailInput").getValue().trim();
            if (!sEmail) {
                MessageToast.show("Please enter your email address.");
                return;
            }

            var that = this;
            this._oBusyDialog.open();

            fetch(API_BASE + "/api/auth/send-magic-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: sEmail })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                that._oBusyDialog.close();
                if (oData.success) {
                    that.byId("stepEmail").setVisible(false);
                    that.byId("stepLinkSent").setVisible(true);
                    var sHint = that.getResourceBundle().getText("loginLinkSentHint", [sEmail]);
                    that.byId("linkSentHint").setText(sHint);
                } else {
                    MessageToast.show(oData.error || "Could not send link. Try again.");
                }
            })
            .catch(function() {
                that._oBusyDialog.close();
                MessageToast.show("Could not reach the server. Please try again.");
            });
        },

        // ── Resend magic link to same email ───────────────────────────────────
        onResendMagicLink: function () {
            this.byId("linkSentHint").setText("");
            this.onSendMagicLink();
        },

        // ── Back to email step ─────────────────────────────────────────────────
        onBackToEmail: function () {
            this.byId("stepLinkSent").setVisible(false);
            this.byId("stepEmail").setVisible(true);
        },

        // ── Demo Login ─────────────────────────────────────────────────────────
        onDemoLogin: function () {
            var that = this;
            this._oBusyDialog.open();

            fetch(API_BASE + "/api/auth/passwordless", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "demo@helphub.app", provider: "Email" })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                that._oBusyDialog.close();
                if (oData.success) {
                    that._applySession(oData);
                } else {
                    MessageToast.show(oData.error || "Demo login failed.");
                }
            })
            .catch(function() {
                that._oBusyDialog.close();
                MessageToast.show("Could not reach the server.");
            });
        }
    });
});
