sap.ui.define([
    "sap/ui/core/UIComponent",
    "helphub/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("helphub.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

               // set the application data model
            const oAppData = models.createAppDataModel();
            this.setModel(oAppData, "appData");

            
            // Initial Geolocation
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