sap.ui.define([
    "sap/ui/core/UIComponent",
    "helphub/model/models"
], (UIComponent, models) => {
    "use strict";

    var API_BASE = "http://localhost:3000";

    // ── StorageHelper ──────────────────────────────────────────────────────────
    // Uses Cordova NativeStorage (iOS/Android) when available, falls back to
    // localStorage for browser/dev. Swap NativeStorage → cordova-plugin-secure-key-store
    // for encrypted Keychain/Keystore storage in production.
    var StorageHelper = {
        set: function(k, v) {
            if (window.NativeStorage) {
                window.NativeStorage.setItem(k, v, function() {}, function() {});
            } else {
                localStorage.setItem(k, v);
            }
        },
        get: function(k, cb) {
            if (window.NativeStorage) {
                window.NativeStorage.getItem(k, cb, function() { cb(null); });
            } else {
                cb(localStorage.getItem(k));
            }
        },
        remove: function(k) {
            if (window.NativeStorage) {
                window.NativeStorage.remove(k, function() {}, function() {});
            } else {
                localStorage.removeItem(k);
            }
        },
        clear: function() {
            ["helpmate_token", "helphub_refresh_token", "helpmate_user_id"].forEach(function(k) {
                StorageHelper.remove(k);
            });
        }
    };

    return UIComponent.extend("helphub.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");
            this.getRouter().initialize();

            const oAppData = models.createAppDataModel();
            this.setModel(oAppData, "appData");

            // Expose StorageHelper globally so all controllers can use it
            window.HelpHubStorage = StorageHelper;

            // Pick up tokens injected by magic link redirect (?accessToken=...&refreshToken=...)
            var oUrlParams = new URLSearchParams(window.location.search);
            var sMagicAccess  = oUrlParams.get("accessToken");
            var sMagicRefresh = oUrlParams.get("refreshToken");
            if (sMagicAccess) {
                StorageHelper.set("helpmate_token", sMagicAccess);
                if (sMagicRefresh) StorageHelper.set("helphub_refresh_token", sMagicRefresh);
                window.history.replaceState({}, "", window.location.pathname);
            }

            var oRouter = this.getRouter();

            // ── Apply user data to model after successful auth ─────────────────
            function applyUser(u) {
                var sAvatar = u.avatar || "";
                if (sAvatar && sAvatar.startsWith("/uploads/")) sAvatar = API_BASE + sAvatar;
                oAppData.setProperty("/user/id",       u.id    || "");
                oAppData.setProperty("/user/name",     u.name  || "");
                oAppData.setProperty("/user/email",    u.email || "");
                oAppData.setProperty("/user/photo",    sAvatar);
                oAppData.setProperty("/user/bio",      u.bio       || "");
                oAppData.setProperty("/user/phone",    u.phone     || "");
                oAppData.setProperty("/user/languages", u.languages || "");
                oAppData.setProperty("/user/years",    u.years     || 0);
                oAppData.setProperty("/user/rate",     u.rate      || 0);
                oAppData.setProperty("/user/availability",      (u.availability       || "").split(",").filter(Boolean));
                oAppData.setProperty("/user/serviceCategories", (u.service_categories || "").split(",").filter(Boolean));
                oAppData.setProperty("/user/address/street",      u.street_name   || "");
                oAppData.setProperty("/user/address/houseNumber", u.street_number || "");
                oAppData.setProperty("/user/address/city",        u.city          || "");
                oAppData.setProperty("/user/address/state",       u.state         || "");
                oAppData.setProperty("/user/address/country",     u.country       || "");
                oAppData.setProperty("/user/address/postalCode",  u.pincode       || "");
                oAppData.setProperty("/user/role",     u.role  || "Customer");
                oAppData.setProperty("/isLoggedIn",    true);
                oRouter.navTo("dashboard", {}, true);
            }

            // ── Try silent refresh when access token is expired ────────────────
            function trySilentRefresh() {
                StorageHelper.get("helphub_refresh_token", function(sRefresh) {
                    if (!sRefresh) { StorageHelper.clear(); return; }
                    fetch(API_BASE + "/api/auth/refresh", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken: sRefresh })
                    })
                    .then(function(r) { return r.json(); })
                    .then(function(d) {
                        if (d.success && d.accessToken) {
                            StorageHelper.set("helpmate_token", d.accessToken);
                            // Retry /me with new token
                            return fetch(API_BASE + "/api/auth/me", {
                                headers: { "Authorization": "Bearer " + d.accessToken }
                            }).then(function(r) { return r.json(); })
                              .then(function(oData) {
                                  if (oData.success) applyUser(oData.user);
                                  else StorageHelper.clear();
                              });
                        }
                        StorageHelper.clear();
                    })
                    .catch(function() { StorageHelper.clear(); });
                });
            }

            // ── Auto-login on app open ─────────────────────────────────────────
            StorageHelper.get("helpmate_token", function(sToken) {
                if (!sToken) return; // no session — stay on login
                fetch(API_BASE + "/api/auth/me", {
                    headers: { "Authorization": "Bearer " + sToken }
                })
                .then(function(r) {
                    if (r.status === 401) { trySilentRefresh(); return null; }
                    return r.json();
                })
                .then(function(oData) {
                    if (!oData || !oData.success) return;
                    applyUser(oData.user);
                })
                .catch(function() { trySilentRefresh(); });
            });

            // Geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    oAppData.setProperty("/user/location", {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                });
            }
        }
    });
});