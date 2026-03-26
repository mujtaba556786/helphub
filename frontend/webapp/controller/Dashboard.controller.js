sap.ui.define([
    "helphub/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "helphub/model/countryStates"
], function (BaseController, MessageToast, MessageBox, CountryStates) {
    "use strict";

    var API_BASE = "http://localhost:3000";

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

                    // Map is initialized lazily on first navigate to searchPage
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

            var oNav = this.byId("navContainer");
            if (oNav) {
                oNav.to(this.byId("searchPage"));
                // Init map after SAP UI5 renders + slide animation completes (~400ms)
                if (!this._mapInitialized) {
                    setTimeout(function() {
                        this._initMap();
                        this._mapInitialized = true;
                        this._updateProviderMarkers(aFiltered);
                        // Fix grey tiles caused by container size change during animation
                        if (this._oMap) {
                            setTimeout(function() {
                                this._oMap.invalidateSize();
                            }.bind(this), 200);
                        }
                    }.bind(this), 400);
                } else {
                    this._updateProviderMarkers(aFiltered);
                }
            }
        },

        onEditProfile: function() {
            var oModel = this.getModel("appData");

            // Load countries if not yet loaded
            if (!oModel.getProperty("/countries").length) {
                oModel.setProperty("/countries", CountryStates.getCountries());
            }

            // Auto-detect country if not already set
            var sCountry = oModel.getProperty("/user/address/country");
            if (!sCountry) {
                sCountry = CountryStates.detectCountryCode();
                oModel.setProperty("/user/address/country", sCountry);
            }

            // Populate states for detected/saved country
            oModel.setProperty("/stateOptions", CountryStates.getStates(sCountry));

            this.byId("navContainer").to(this.byId("editPage"));
        },

        onCountryChange: function(oEvent) {
            var sCode = oEvent.getParameter("selectedItem").getKey();
            var oModel = this.getModel("appData");
            oModel.setProperty("/user/address/country", sCode);
            oModel.setProperty("/stateOptions", CountryStates.getStates(sCode));
            oModel.setProperty("/user/address/state", "");
        },

        onChangePhoto: function() {
            var oInput = document.getElementById("avatarFileInput");
            if (!oInput) return;

            oInput.onchange = function(oEvt) {
                var oFile = oEvt.target.files && oEvt.target.files[0];
                if (!oFile) return;

                var aAllowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
                if (!aAllowed.includes(oFile.type)) {
                    var oErrText = sap.ui.getCore().byId(
                        this.getView().createId("photoError")
                    );
                    if (oErrText) { oErrText.setText("Only JPG, PNG, GIF or WebP images are allowed."); oErrText.setVisible(true); }
                    return;
                }
                if (oFile.size > 5 * 1024 * 1024) {
                    MessageToast.show("Image must be smaller than 5 MB.");
                    return;
                }

                // Immediate local preview
                var oReader = new FileReader();
                oReader.onload = function(e) {
                    this.getModel("appData").setProperty("/user/photo", e.target.result);
                }.bind(this);
                oReader.readAsDataURL(oFile);

                // Upload to server
                var sUserId = this.getModel("appData").getProperty("/user/id");
                if (!sUserId) { MessageToast.show("Please log in again to upload a photo."); return; }

                var oForm = new FormData();
                oForm.append("avatar", oFile);

                fetch(API_BASE + "/api/users/" + encodeURIComponent(sUserId) + "/avatar", {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + (sessionStorage.getItem("helphub_token") || "") },
                    body: oForm
                })
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        this.getModel("appData").setProperty("/user/photo", API_BASE + oData.avatarUrl);
                        MessageToast.show("Profile photo updated.");
                    } else {
                        MessageToast.show("Upload failed: " + (oData.error || "Unknown error"));
                    }
                }.bind(this))
                .catch(function() { MessageToast.show("Could not reach the server."); });
            }.bind(this);

            oInput.click();
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
            var oModel = this.getModel("appData");
            var oUser  = oModel.getProperty("/user");
            var oAddr  = oUser.address || {};

            // Reset validation
            var oVal = { name: "None", street: "None", houseNumber: "None", city: "None", state: "None", postalCode: "None", country: "None" };
            var bValid = true;

            if (!oUser.name || !oUser.name.trim()) { oVal.name = "Error"; bValid = false; }
            if (!oAddr.street || !oAddr.street.trim()) { oVal.street = "Error"; bValid = false; }
            if (!oAddr.houseNumber || !oAddr.houseNumber.trim()) { oVal.houseNumber = "Error"; bValid = false; }
            if (!oAddr.city || !oAddr.city.trim()) { oVal.city = "Error"; bValid = false; }
            if (!oAddr.state || !oAddr.state.trim()) { oVal.state = "Error"; bValid = false; }
            if (!oAddr.country || !oAddr.country.trim()) { oVal.country = "Error"; bValid = false; }

            var sPostal = (oAddr.postalCode || "").trim();
            if (!sPostal || !/^[A-Za-z0-9\s\-]{3,10}$/.test(sPostal)) { oVal.postalCode = "Error"; bValid = false; }

            oModel.setProperty("/validation", oVal);

            if (!bValid) {
                MessageToast.show("Please fill in all required fields correctly.");
                return;
            }

            var sUserId = oUser.id;
            if (!sUserId) { MessageToast.show("Session expired. Please log in again."); return; }

            fetch(API_BASE + "/api/users/" + encodeURIComponent(sUserId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + (sessionStorage.getItem("helphub_token") || "")
                },
                body: JSON.stringify({
                    name:             oUser.name,
                    bio:              oUser.bio,
                    languages:        oUser.languages,
                    years:            oUser.years,
                    phone:            oUser.phone,
                    rate:             oUser.rate,
                    availability:     oUser.availability,
                    serviceCategories: oUser.serviceCategories,
                    street_name:      oAddr.street,
                    street_number:    oAddr.houseNumber,
                    city:             oAddr.city,
                    state:            oAddr.state,
                    country:          oAddr.country,
                    pincode:          oAddr.postalCode
                })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    MessageToast.show("Profile saved successfully.");
                    this.onNavBack();
                } else {
                    MessageToast.show("Save failed: " + (oData.error || "Unknown error"));
                }
            }.bind(this))
            .catch(function() { MessageToast.show("Could not reach the server."); });
        },

        // FILTER HANDLERS
        onDistanceChange: function(oEvent) {
            var iVal = oEvent.getParameter("value");
            var oModel = this.getModel("appData");
            oModel.setProperty("/filters/distance", iVal);
            oModel.setProperty("/filters/distanceLabel", "Within " + iVal + " km");

            // Update circle radius live
            if (this._oRadiusCircle) {
                this._oRadiusCircle.setRadius(iVal * 1000);
            }

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
            if (!window.L) return;

            var oModel  = this.getModel("appData");
            var oUserLoc = oModel.getProperty("/user/location") || { lat: 52.52, lng: 13.405 };
            var iRadius  = (oModel.getProperty("/filters/distance") || 10) * 1000; // km → metres

            // Build the map
            this._oMap = L.map("googleMap", { zoomControl: true }).setView(
                [oUserLoc.lat, oUserLoc.lng], 13
            );

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                maxZoom: 19
            }).addTo(this._oMap);

            // "You are here" marker
            this._oUserMarker = L.marker([oUserLoc.lat, oUserLoc.lng])
                .addTo(this._oMap)
                .bindPopup("<b>You are here</b>")
                .openPopup();

            // Radius circle
            this._oRadiusCircle = L.circle([oUserLoc.lat, oUserLoc.lng], {
                radius: iRadius,
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.08,
                weight: 2
            }).addTo(this._oMap);

            this._aProviderMarkers = [];

            // Try to get real GPS position
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    var oRealLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    oModel.setProperty("/user/location", oRealLoc);
                    this._oMap.setView([oRealLoc.lat, oRealLoc.lng], 13);
                    this._oUserMarker.setLatLng([oRealLoc.lat, oRealLoc.lng]);
                    this._oRadiusCircle.setLatLng([oRealLoc.lat, oRealLoc.lng]);
                }.bind(this), function() {
                    // Permission denied or unavailable — keep Berlin default
                });
            }
        },

        _updateProviderMarkers: function(aProviders) {
            if (!this._oMap || !window.L) return;

            // Remove old markers
            (this._aProviderMarkers || []).forEach(function(m) { m.remove(); });
            this._aProviderMarkers = [];

            // Update radius circle size
            var oModel  = this.getModel("appData");
            var iRadius = (oModel.getProperty("/filters/distance") || 10) * 1000;
            if (this._oRadiusCircle) {
                this._oRadiusCircle.setRadius(iRadius);
            }

            // Add new markers
            (aProviders || []).forEach(function(p) {
                var oMarker = L.marker([p.lat, p.lng])
                    .addTo(this._oMap)
                    .bindPopup(
                        "<b>" + p.name + "</b><br>" +
                        (p.serviceType || "") + "<br>" +
                        "$" + (p.rate || 0) + "/hr • ⭐ " + (p.rating || "")
                    );
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
