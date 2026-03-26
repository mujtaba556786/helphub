sap.ui.define([
    "helphub/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/BusyDialog"
], function (BaseController, MessageToast, BusyDialog) {
    "use strict";

    // ── Config ──────────────────────────────────────────────────────────────────
    // Replace with your actual Google Client ID (same value as in index.html)
    var GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

    // Backend base URL — change if your Express server runs on a different port
    var API_BASE = "http://localhost:3000";

    return BaseController.extend("helphub.controller.Login", {

        // ── Lifecycle ──────────────────────────────────────────────────────────
        onInit: function () {
            this._oBusyDialog = new BusyDialog({ title: "Signing you in…" });
        },

        // ── Internal: apply user data from backend response to the app model ──
        _applySession: function (oData) {
            // Backend returns accessToken + refreshToken (or legacy token field)
            var sAccessToken = oData.accessToken || oData.token;
            sessionStorage.setItem("helphub_token", sAccessToken);
            if (oData.refreshToken) {
                sessionStorage.setItem("helphub_refresh_token", oData.refreshToken);
            }

            var oModel = this.getModel("appData");
            var oUser  = oData.user || {};

            oModel.setProperty("/user/id",    oUser.id    || "");
            oModel.setProperty("/user/name",  oUser.name  || "");
            oModel.setProperty("/user/email", oUser.email || "");
            oModel.setProperty("/user/photo", oUser.avatar || "");
            oModel.setProperty("/user/avatar", oUser.avatar || (oUser.name || "?").substring(0, 2).toUpperCase());
            oModel.setProperty("/user/bio",      oUser.bio       || "");
            oModel.setProperty("/user/phone",    oUser.phone     || "");
            oModel.setProperty("/user/languages", oUser.languages || "");
            oModel.setProperty("/user/years",    oUser.years     || 0);
            oModel.setProperty("/user/rate",     oUser.rate      || 0);
            oModel.setProperty("/user/availability",     (oUser.availability     || "").split(",").filter(Boolean));
            oModel.setProperty("/user/serviceCategories",(oUser.service_categories || "").split(",").filter(Boolean));

            // Structured address from DB columns
            oModel.setProperty("/user/address/street",     oUser.street_name   || "");
            oModel.setProperty("/user/address/houseNumber", oUser.street_number || "");
            oModel.setProperty("/user/address/city",       oUser.city          || "");
            oModel.setProperty("/user/address/state",      oUser.state         || "");
            oModel.setProperty("/user/address/country",    oUser.country       || "");
            oModel.setProperty("/user/address/postalCode", oUser.pincode       || "");

            oModel.setProperty("/isLoggedIn", true);

            MessageToast.show("Welcome, " + (oUser.name || "User") + "!");
            this.navTo("dashboard");
        },

        // ── Internal: POST to a backend auth endpoint ─────────────────────────
        _postToBackend: function (sPath, oBody) {
            var that = this;
            this._oBusyDialog.open();

            return fetch(API_BASE + sPath, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oBody)
            })
            .then(function (oRes) { return oRes.json(); })
            .then(function (oData) {
                that._oBusyDialog.close();
                if (oData.success) {
                    that._applySession(oData);
                } else {
                    MessageToast.show("Login failed: " + (oData.error || "Unknown error"));
                }
            })
            .catch(function (oErr) {
                that._oBusyDialog.close();
                console.error("Auth error:", oErr);
                MessageToast.show("Could not reach the server. Please try again.");
            });
        },

        // ── Google Sign-In ─────────────────────────────────────────────────────
        onGoogleLogin: function () {
            var that = this;

            if (!window.google || !google.accounts) {
                MessageToast.show("Google SDK not loaded yet. Please wait a moment and try again.");
                return;
            }

            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: function (oResponse) {
                    // oResponse.credential is the ID token (JWT from Google)
                    that._postToBackend("/api/auth/google", { idToken: oResponse.credential });
                },
                cancel_on_tap_outside: true
            });

            // Show the One-Tap prompt; if it is suppressed by the browser show
            // the popup flow instead as a fallback.
            google.accounts.id.prompt(function (oNotification) {
                if (oNotification.isNotDisplayed() || oNotification.isSkippedMoment()) {
                    // Fallback: render the sign-in popup manually
                    google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID,
                        scope: "openid email profile",
                        callback: function () {} // handled by id.initialize callback above
                    });
                    google.accounts.id.renderButton(
                        document.getElementById("googleSignInFallback") || document.body,
                        { theme: "outline", size: "large" }
                    );
                }
            });
        },

        // ── Facebook Sign-In ───────────────────────────────────────────────────
        onFacebookLogin: function () {
            var that = this;

            if (!window.FB) {
                MessageToast.show("Facebook SDK not loaded yet. Please wait a moment and try again.");
                return;
            }

            FB.login(function (oResponse) {
                if (oResponse.status === "connected" && oResponse.authResponse) {
                    that._postToBackend("/api/auth/facebook", {
                        accessToken: oResponse.authResponse.accessToken
                    });
                } else {
                    MessageToast.show("Facebook login was cancelled or not authorised.");
                }
            }, { scope: "public_profile,email" });
        },

        // ── Demo Login (one-click, no credentials needed) ──────────────────────
        onDemoLogin: function () {
            this._postToBackend("/api/auth/passwordless", {
                email: "demo@helphub.app",
                provider: "Email"
            });
        },

        // ── Email / Password Sign-In ────────────────────────────────────────────
        onEmailLogin: function () {
            var sEmail = this.byId("emailInput").getValue();

            if (!sEmail) {
                MessageToast.show("Please enter an email address.");
                return;
            }

            // Use the existing passwordless endpoint; extend later with real passwords
            this._postToBackend("/api/auth/passwordless", {
                email: sEmail,
                provider: "Email"
            });
        }
    });
});
