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
            sessionStorage.setItem("helphub_token", oData.token);

            var oModel = this.getModel("appData");
            oModel.setProperty("/user/name",   oData.user.name);
            oModel.setProperty("/user/email",  oData.user.email);
            oModel.setProperty("/user/avatar", oData.user.avatar || oData.user.name.substring(0, 2).toUpperCase());
            oModel.setProperty("/isLoggedIn",  true);

            MessageToast.show("Welcome, " + oData.user.name + "!");
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
