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
            sessionStorage.setItem("helpmate_token", sAccessToken);
            if (oData.refreshToken) {
                sessionStorage.setItem("helphub_refresh_token", oData.refreshToken);
            }
            if (oData.user && oData.user.id) {
                sessionStorage.setItem("helpmate_user_id", oData.user.id);
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

            oModel.setProperty("/isLoggedIn", true);

            MessageToast.show("Welcome, " + (oUser.name || "User") + "!");
            this.navTo("dashboard");
        },

        // ── Step 1: Send OTP to email ──────────────────────────────────────────
        onSendOtp: function () {
            var sEmail = this.byId("emailInput").getValue().trim();
            if (!sEmail) {
                MessageToast.show("Please enter your email address.");
                return;
            }

            var that = this;
            this._oBusyDialog.open();

            fetch(API_BASE + "/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: sEmail })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                that._oBusyDialog.close();
                if (oData.success) {
                    // Switch to OTP step
                    that.byId("stepEmail").setVisible(false);
                    that.byId("stepOtp").setVisible(true);
                    that.byId("otpHintText").setText("We sent a 6-digit code to " + sEmail + ". It expires in 10 minutes.");
                    that._sPendingEmail = sEmail;
                    MessageToast.show("Verification code sent!");
                } else {
                    MessageToast.show(oData.error || "Could not send code. Try again.");
                }
            })
            .catch(function() {
                that._oBusyDialog.close();
                MessageToast.show("Could not reach the server. Please try again.");
            });
        },

        // ── Step 2: Verify OTP ─────────────────────────────────────────────────
        onVerifyOtp: function () {
            var sOtp = this.byId("otpInput").getValue().trim();
            if (!sOtp || sOtp.length < 6) {
                MessageToast.show("Please enter the 6-digit code from your email.");
                return;
            }

            var that = this;
            this._oBusyDialog.open();

            fetch(API_BASE + "/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: that._sPendingEmail, otp: sOtp })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                that._oBusyDialog.close();
                if (oData.success) {
                    that._applySession(oData);
                } else {
                    MessageToast.show(oData.error || "Invalid or expired code.");
                }
            })
            .catch(function() {
                that._oBusyDialog.close();
                MessageToast.show("Could not reach the server. Please try again.");
            });
        },

        // ── Resend OTP ─────────────────────────────────────────────────────────
        onResendOtp: function () {
            this.byId("stepOtp").setVisible(false);
            this.byId("stepEmail").setVisible(true);
            this.byId("otpInput").setValue("");
            this.onSendOtp();
        },

        // ── Back to email step ─────────────────────────────────────────────────
        onBackToEmail: function () {
            this.byId("stepOtp").setVisible(false);
            this.byId("stepEmail").setVisible(true);
            this.byId("otpInput").setValue("");
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
