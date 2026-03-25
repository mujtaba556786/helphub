sap.ui.define([
    "helphub/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("helphub.controller.Dashboard", {

        onInit: function() {
            var oRouter = this.getRouter();
            if (oRouter) {
                oRouter.getRoute("dashboard").attachPatternMatched(this._onRouteMatched, this);
            }

            this.getView().addEventDelegate({
                onAfterRendering: function() {
                    var aTiles = document.querySelectorAll(".customServiceTile");
                    aTiles.forEach((el) => {
                        el.onclick = (e) => {
                            var oTile = sap.ui.getCore().byId(el.id);
                            if (oTile) {
                                this.onServicePress({ tile: oTile });
                            }
                        };
                    });

                    if (!this._mapInitialized) {
                        this._initMap();
                        this._mapInitialized = true;
                    }
                }.bind(this)
            }, this);
        },

        _onRouteMatched: function() {
            this._oModel = this.getModel("appData");

            // ✅ initialize provider list ONCE
            if (!this._oModel.getProperty("/filteredProviders").length) {
                this._oModel.setProperty(
                    "/filteredProviders",
                    this._oModel.getProperty("/providers")
                );
            }
        },

        onLogout: function () {
            MessageBox.confirm("Sign out of HelpHub?", {
                onClose: (oAction) => { 
                    if (oAction === "OK") {
                        this.navTo("login");
                    }
                }
            });
        },

        // TILE PRESS
      onServicePress: function(oEvent) {
    var oTile = oEvent.getSource(); // now always a UI5 Button
    var oContext = oTile.getBindingContext("appData");
    if (!oContext) return;

    var oService = oContext.getObject();

    // Animate circle button
    var $circle = oTile.$().find(".circleButton");
    $circle.addClass("circleActive");

    setTimeout(() => {
        $circle.removeClass("circleActive");
        this._navigateToResults(oService);
    }, 450);
},


        _navigateToResults: function(oService) {
            var oModel = this.getModel("appData");
            if (!oModel) { return; }

            oModel.setProperty("/selectedCategoryName", oService.name);

            var aFiltered = this._applyFiltersForService(oService.name);
            oModel.setProperty("/filteredProviders", aFiltered);

            this._updateProviderMarkers(aFiltered);

            var oNav = this.byId("navContainer");
            if (oNav) {
                oNav.to(this.byId("searchPage"));
            }
        },

        onEditProfile: function() {
            this.byId("navContainer").to(this.byId("editPage"));
        },

        onNavBack: function() {
            var oNavContainer = this.byId("navContainer");
            var sCurrentPageId = oNavContainer.getCurrentPage().getId();

            if (!sCurrentPageId.includes("dashboardPage")) {
                oNavContainer.back();
            } else {
                BaseController.prototype.onNavBack.apply(this);
            }
        },

        onSaveProfile: function() {
            MessageToast.show("Your profile has been updated.");
            this.onNavBack();
        },

        // FILTER HANDLERS
        onDistanceChange: function(oEvent) {
            var iVal = oEvent.getParameter("value");
            var oModel = this.getModel("appData");
            oModel.setProperty("/filters/distance", iVal);
            oModel.setProperty("/filters/distanceLabel", "Within " + iVal + " km");

            this._refreshCurrentFilters();
        },

        onFilterAll: function() {
            this.getModel("appData").setProperty("/filters/priceCategory", "all");
            this._refreshCurrentFilters();
        },

        onFilterTopRated: function() {
            this.getModel("appData").setProperty("/filters/priceCategory", "top");
            this._refreshCurrentFilters();
        },

        onFilterBudget: function() {
            this.getModel("appData").setProperty("/filters/priceCategory", "budget");
            this._refreshCurrentFilters();
        },

        onFilterToday: function() {
            MessageToast.show("Filter 'Today' (mock).");
        },

        onFilterThisWeek: function() {
            MessageToast.show("Filter 'This week' (mock).");
        },

        onFilterNow: function() {
            MessageToast.show("Filter 'Available now' (mock).");
        },

        _refreshCurrentFilters: function() {
            var oModel = this.getModel("appData");
            var sCategory = oModel.getProperty("/selectedCategoryName");
            if (sCategory) {
                var aFiltered = this._applyFiltersForService(sCategory);
                oModel.setProperty("/filteredProviders", aFiltered);
                this._updateProviderMarkers(aFiltered);
            }
        },

        _applyFiltersForService: function(sServiceName) {
            var oModel   = this.getModel("appData");
            var aAll     = oModel.getProperty("/providers") || [];
            var oFilters = oModel.getProperty("/filters");
            var oUserLoc = oModel.getProperty("/user/location");
            var that     = this;

            var aFiltered = aAll.filter(function(p) {
                if (p.serviceType !== sServiceName) { return false; }

                var fDist = that._calculateDistanceKm(oUserLoc, { lat: p.lat, lng: p.lng });
                if (fDist > oFilters.distance) { return false; }

                if (oFilters.priceCategory === "budget" && p.rate > 25) { return false; }
                if (oFilters.priceCategory === "top"    && p.rating < 4.8) { return false; }

                return true;
            });

            if (!aFiltered.length) {
                aFiltered = aAll.filter(function(p) {
                    return p.serviceType === sServiceName;
                });
                oModel.setProperty("/filters/distanceLabel", "Showing all helpers (no one close yet)");
            }

            aFiltered.sort(function(a, b) {
                var da = that._calculateDistanceKm(oUserLoc, { lat: a.lat, lng: a.lng });
                var db = that._calculateDistanceKm(oUserLoc, { lat: b.lat, lng: b.lng });
                return da - db;
            });

            return aFiltered;
        },

        _calculateDistanceKm: function(oA, oB) {
            if (!oA || !oB) { return 999; }
            var R = 6371;
            var dLat = (oB.lat - oA.lat) * Math.PI / 180;
            var dLon = (oB.lng - oA.lng) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(oA.lat * Math.PI / 180) * Math.cos(oB.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        },

        _initMap: function () {
            if (!window.google || !google.maps) return;

            var oModel = this.getModel("appData");
            var oUserLoc = oModel.getProperty("/user/location");

            this._oMap = new google.maps.Map(document.getElementById("googleMap"), {
                center: { lat: oUserLoc.lat, lng: oUserLoc.lng },
                zoom: 12
            });

            this._oUserMarker = new google.maps.Marker({
                position: oUserLoc,
                map: this._oMap,
                label: "You"
            });

            this._aProviderMarkers = [];
        },

        _updateProviderMarkers: function(aProviders) {
            if (!this._oMap || !window.google || !google.maps) return;

            if (this._aProviderMarkers) {
                this._aProviderMarkers.forEach(function(m) { m.setMap(null); });
            }
            this._aProviderMarkers = [];

            (aProviders || []).forEach(function(p) {
                var oMarker = new google.maps.Marker({
                    position: { lat: p.lat, lng: p.lng },
                    map: this._oMap,
                    title: p.name
                });
                this._aProviderMarkers.push(oMarker);
            }.bind(this));
        },

        // FORMATTERS
        formatDistance: function(oProvider) {
            if (!oProvider || !oProvider.lat) return "Distance unknown";
            var oModel = this.getModel("appData");
            var userLoc = oModel ? oModel.getProperty("/user/location") : null;
            if (!userLoc) return "Calculating...";

            var R = 6371;
            var dLat = (oProvider.lat - userLoc.lat) * Math.PI / 180;
            var dLon = (oProvider.lng - userLoc.lng) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(oProvider.lat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return (R * c).toFixed(1) + " km away";
        },

        formatPriceDisplay: function(oProvider) {
            if (!oProvider) return "";
            return (oProvider.currency || "$") + (oProvider.rate || "0") + "/hr";
        },

        formatAvailabilityStatus: function(oProvider) {
            return oProvider && oProvider.availability ? oProvider.availability : "Available Now";
        },

        formatAvailabilityState: function(oProvider) {
            var sStatus = this.formatAvailabilityStatus(oProvider);
            return sStatus === "Available Now" ? "Success" : "Warning";
        },

        onViewProfile: function (oEvent) {
            var oListItem = oEvent.getSource().getParent().getParent(); 
            var oCtx = oListItem.getBindingContext("appData");
            if (!oCtx) return;

            var oProvider = Object.assign({}, oCtx.getObject());

            if (oProvider.name && !oProvider.initials) {
                oProvider.initials = oProvider.name
                    .split(" ")
                    .map(p => p[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
            }

            var oModel = this.getModel("appData");
            oModel.setProperty("/selectedProfile", oProvider);

            var oDialog = this.byId("profileDialog");
            oDialog.bindElement("appData>/selectedProfile");
            oDialog.open();
        },

        onCloseProfile: function() {
            this.byId("profileDialog").close();
        }
    });
});
