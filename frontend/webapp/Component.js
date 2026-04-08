sap.ui.define([
    "sap/ui/core/UIComponent",
    "helphub/model/models"
], (UIComponent, models) => {
    "use strict";

    var API_BASE = "http://localhost:3000";

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

            // Restore session from token if available
            var sToken = sessionStorage.getItem("helpmate_token") || sessionStorage.getItem("helphub_token");
            if (sToken) {
                fetch(API_BASE + "/api/auth/me", {
                    headers: { "Authorization": "Bearer " + sToken }
                })
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (!oData.success) return;
                    var u = oData.user;
                    oAppData.setProperty("/user/id",    u.id    || "");
                    oAppData.setProperty("/user/name",  u.name  || "");
                    oAppData.setProperty("/user/email", u.email || "");
                    var sAvatar = u.avatar || "";
                    if (sAvatar && sAvatar.startsWith("/uploads/")) sAvatar = API_BASE + sAvatar;
                    oAppData.setProperty("/user/photo", sAvatar);
                    oAppData.setProperty("/user/bio",   u.bio   || "");
                    oAppData.setProperty("/user/phone", u.phone || "");
                    oAppData.setProperty("/user/languages", u.languages || "");
                    oAppData.setProperty("/user/years", u.years || 0);
                    oAppData.setProperty("/user/rate",  u.rate  || 0);
                    oAppData.setProperty("/user/availability",      (u.availability       || "").split(",").filter(Boolean));
                    oAppData.setProperty("/user/serviceCategories", (u.service_categories || "").split(",").filter(Boolean));
                    oAppData.setProperty("/user/address/street",      u.street_name   || "");
                    oAppData.setProperty("/user/address/houseNumber", u.street_number || "");
                    oAppData.setProperty("/user/address/city",        u.city          || "");
                    oAppData.setProperty("/user/address/state",       u.state         || "");
                    oAppData.setProperty("/user/address/country",     u.country       || "");
                    oAppData.setProperty("/user/address/postalCode",  u.pincode       || "");
                    oAppData.setProperty("/user/role",  u.role  || "Customer");
                    oAppData.setProperty("/isLoggedIn", true);
                })
                .catch(function() { /* token invalid, stay on login */ });
            }

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