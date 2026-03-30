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

                    // Apply service tile colors — small delay so list items are in DOM
                    setTimeout(this._applyTileColors.bind(this), 100);

                    // Map is initialized lazily on first navigate to searchPage
                }.bind(this)
            }, this);
        },

        _onRouteMatched: function() {
            this._oModel = this.getModel("appData");
            this._loadProvidersFromApi();
            this._loadSchedule();
            this._loadFavorites();
            if (!this._notifInterval) {
                this._startNotificationPolling();
            }
            setTimeout(this._checkOnboarding.bind(this), 350);
        },

        onTabSelect: function(oEvent) {
            var sKey = oEvent.getParameter("key");
            if (sKey === "mySchedule") {
                // Mark all bookings as seen → badge clears
                this._markBookingsSeen();
            }
        },

        _applyTileColors: function() {
            var aServices = this.getModel("appData").getProperty("/services") || [];

            // Inject a persistent <style> block so colors survive SAP re-renders
            var oStyle = document.getElementById("__hh-tile-colors");
            if (!oStyle) {
                oStyle = document.createElement("style");
                oStyle.id = "__hh-tile-colors";
                document.head.appendChild(oStyle);
            }
            var sCss = "";
            aServices.forEach(function(svc, i) {
                if (svc && svc.color) {
                    // Direct children of serviceTilesContainer are flex-item wrappers
                    sCss += ".serviceTilesContainer > *:nth-child(" + (i + 1) + ") .circleButton {" +
                            "background-color: " + svc.color + " !important; }\n";
                }
            });
            oStyle.textContent = sCss;
        },

        /** Toggle the small orange dot above the bell icon (avoids type="Emphasized" square) */
        _setNotifDot: function(bShow) {
            var oBtn = this.byId("notifBtn");
            if (!oBtn) return;
            var apply = function() {
                var oDom = oBtn.getDomRef();
                if (oDom) {
                    oDom.classList.toggle("notifDot", !!bShow);
                } else {
                    // Retry once after next rendering tick
                    setTimeout(apply, 150);
                }
            };
            apply();
        },

        _loadProvidersFromApi: function() {
            var oModel = this.getModel("appData");
            fetch(API_BASE + "/api/providers")
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success && oData.providers.length) {
                        oModel.setProperty("/providers", oData.providers);
                    }
                })
                .catch(function() { /* keep mock data on network error */ });
        },

        onLogout: function () {
            MessageBox.confirm("Sign out of HelpMate?", {
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

        onAvailabilityToggle: function(oEvent) {
            var oModel = this.getModel("appData");
            var sKey   = oEvent.getSource().data("availKey");
            var oFlags = Object.assign({}, oModel.getProperty("/user/availabilityFlags"));

            if (sKey === "all_day") {
                var bOn = !oFlags.all_day;
                oFlags.all_day = oFlags.weekdays = oFlags.weekends =
                    oFlags.morning = oFlags.afternoon = oFlags.evening = oFlags.night = bOn;
            } else {
                oFlags[sKey] = !oFlags[sKey];
                oFlags.all_day = oFlags.weekdays && oFlags.weekends &&
                    oFlags.morning && oFlags.afternoon && oFlags.evening && oFlags.night;
            }

            oModel.setProperty("/user/availabilityFlags", oFlags);

            // Keep availability array in sync for saving
            var aKeys = ["weekdays","weekends","morning","afternoon","evening","night"]
                .filter(function(k) { return oFlags[k]; });
            if (oFlags.all_day) aKeys.unshift("all_day");
            oModel.setProperty("/user/availability", aKeys);
        },

        onCountryChange: function(oEvent) {
            var sCode = oEvent.getParameter("selectedItem").getKey();
            var oModel = this.getModel("appData");
            oModel.setProperty("/user/address/country", sCode);
            oModel.setProperty("/stateOptions", CountryStates.getStates(sCode));
            oModel.setProperty("/user/address/state", "");
        },

        onChangePhoto: function() {
            // Programmatically open the FileUploader's native file picker
            var oUploader = this.byId("avatarFileUploader");
            if (!oUploader) { MessageToast.show("File uploader not ready."); return; }
            oUploader.getDomRef("fu").click();
        },

        onAvatarFileSelected: function(oEvent) {
            var that    = this;
            var oFiles  = oEvent.getParameter("files");
            var oFile   = oFiles && oFiles[0];
            if (!oFile) return;

            if (oFile.size > 5 * 1024 * 1024) {
                MessageToast.show("Image must be smaller than 5 MB.");
                return;
            }

            // Immediate local preview
            var oReader = new FileReader();
            oReader.onload = function(e) {
                that.getModel("appData").setProperty("/user/photo", e.target.result);
            };
            oReader.readAsDataURL(oFile);

            // Upload to server
            var sUserId = that.getModel("appData").getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");
            if (!sUserId) { MessageToast.show("Please log in again to upload a photo."); return; }

            var oForm = new FormData();
            oForm.append("avatar", oFile);

            fetch(API_BASE + "/api/users/" + encodeURIComponent(sUserId) + "/avatar", {
                method: "POST",
                body: oForm
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    that.getModel("appData").setProperty("/user/photo", API_BASE + oData.avatarUrl);
                    MessageToast.show("Profile photo updated.");
                } else {
                    MessageToast.show("Upload failed: " + (oData.error || "Unknown error"));
                }
            })
            .catch(function() { MessageToast.show("Could not reach the server."); });
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

            var sUserId = oUser.id || sessionStorage.getItem("helpmate_user_id");
            if (!sUserId) { MessageToast.show("Session expired. Please log in again."); return; }

            fetch(API_BASE + "/api/users/" + encodeURIComponent(sUserId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + (sessionStorage.getItem("helpmate_token") || "")
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

            var sQuery     = (oModel.getProperty("/searchQuery") || "").toLowerCase();
            var fMinRating = parseFloat(oFilters.minRating) || 0;
            var sLangFilter = (oFilters.language || "").trim().toLowerCase();
            var iMaxPrice  = parseFloat(oFilters.maxPrice);
            if (isNaN(iMaxPrice) || iMaxPrice >= 200) { iMaxPrice = Infinity; }

            var aFiltered = aAll.filter(function(p) {
                if (p.serviceType !== sServiceName) { return false; }

                var fDist = that._calculateDistanceKm(oUserLoc, { lat: p.lat, lng: p.lng });
                if (fDist > oFilters.distance) { return false; }

                if (oFilters.priceCategory === "budget" && p.rate > 25) { return false; }
                if (oFilters.priceCategory === "top"    && p.rating < 4.8) { return false; }

                if (sQuery) {
                    var sName = (p.name || "").toLowerCase();
                    var sType = (p.serviceType || "").toLowerCase();
                    if (!sName.includes(sQuery) && !sType.includes(sQuery)) { return false; }
                }

                if (fMinRating > 0 && (!p.rating || p.rating < fMinRating)) { return false; }

                if (sLangFilter) {
                    var sProvLang = (p.languages || "").toLowerCase();
                    if (!sProvLang.includes(sLangFilter)) { return false; }
                }

                if (iMaxPrice < Infinity && p.rate > iMaxPrice) { return false; }

                return true;
            });

            if (!aFiltered.length) {
                oModel.setProperty("/filters/distanceLabel", "No helpers within " + oFilters.distance + " km — try increasing the radius");
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
            // Button → VBox → HBox → CustomListItem
            var oListItem = oEvent.getSource().getParent().getParent().getParent();
            var oCtx = oListItem.getBindingContext("appData");
            if (!oCtx) return;

            var oProvider = Object.assign({}, oCtx.getObject());
            if (oProvider.name && !oProvider.initials) {
                oProvider.initials = oProvider.name
                    .split(" ").map(function(p) { return p[0]; })
                    .join("").substring(0, 2).toUpperCase();
            }
            oProvider.reviews = [];

            var oModel = this.getModel("appData");
            oModel.setProperty("/selectedProfile", oProvider);
            this._trackRecentlyViewed(oProvider);

            // Reset rating input
            var oStars = this.byId("newRatingStars");
            var oComment = this.byId("newRatingComment");
            if (oStars) oStars.setValue(0);
            if (oComment) oComment.setValue("");

            var oDialog = this.byId("profileDialog");
            oDialog.open();

            // Load real ratings from backend
            fetch(API_BASE + "/api/providers/" + encodeURIComponent(oProvider.id) + "/ratings")
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/selectedProfile/reviews", oData.ratings);
                    }
                })
                .catch(function() { /* keep empty */ });
        },

        onSubmitRating: function() {
            var oModel   = this.getModel("appData");
            var oStars   = this.byId("newRatingStars");
            var oComment = this.byId("newRatingComment");
            var iStars   = oStars ? oStars.getValue() : 0;

            if (!iStars || iStars < 1) {
                MessageToast.show("Please select at least 1 star.");
                return;
            }

            var sProviderId = oModel.getProperty("/selectedProfile/id");
            var sUserId     = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");
            var sName       = oModel.getProperty("/user/name") || "Anonymous";
            var sComment    = oComment ? oComment.getValue().trim() : "";

            fetch(API_BASE + "/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider_id:   sProviderId,
                    user_id:       sUserId,
                    reviewer_name: sName,
                    stars:         iStars,
                    comment:       sComment
                })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    MessageToast.show(oData.updated ? "Rating updated!" : "Thank you for your rating!");
                    if (oStars)   oStars.setValue(0);
                    if (oComment) oComment.setValue("");
                    if (oData.newAverage) {
                        oModel.setProperty("/selectedProfile/rating", oData.newAverage);
                    }
                    // Reload reviews from server to reflect the upsert correctly
                    var sId = oModel.getProperty("/selectedProfile/id");
                    fetch(API_BASE + "/api/providers/" + encodeURIComponent(sId) + "/ratings")
                        .then(function(r) { return r.json(); })
                        .then(function(d) {
                            if (d.success) oModel.setProperty("/selectedProfile/reviews", d.ratings);
                        });
                } else {
                    MessageToast.show(oData.error || "Could not submit rating.");
                }
            }.bind(this))
            .catch(function() { MessageToast.show("Could not reach the server."); });
        },

        onCloseProfile: function() {
            this.byId("profileDialog").close();
        },

        _renderChatBubbles: function(aMessages) {
            var oHtml   = this.byId("chatMessagesHtml");
            var oScroll = this.byId("chatScrollContainer");
            if (!oHtml) return;

            var iLast = aMessages.length - 1;
            var sHtml = aMessages.map(function(m, i) {
                var sEsc = (m.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
                if (m.role === "user") {
                    var bRead    = (i < iLast) || (aMessages[i + 1] && aMessages[i + 1].role === "assistant");
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

            // Scroll to bottom after SAP re-renders the HTML control
            if (oScroll) {
                setTimeout(function() { oScroll.scrollTo(0, 99999, 0); }, 50);
            }
        },

        onOpenChat: function() {
            var oModel = this.getModel("appData");
            var sName  = oModel.getProperty("/selectedProfile/name") || "Helper";

            this._chatMessages = [{
                role: "assistant",
                content: "Hi! I'm here to help you learn about " + sName + ". Ask me anything — availability, pricing, services, or anything else!"
            }];

            this.byId("profileDialog").close();
            var oDialog = this.byId("chatDialog");
            oDialog.setTitle("Chat with " + sName);
            oDialog.open();

            var that = this;
            setTimeout(function() { that._renderChatBubbles(that._chatMessages); }, 100);
        },

        onChatSend: function() {
            var oModel      = this.getModel("appData");
            var oInput      = this.byId("chatInput");
            var sText       = oInput.getValue().trim();
            if (!sText) return;

            var sProviderId = oModel.getProperty("/selectedProfile/id");
            if (!this._chatMessages) this._chatMessages = [];

            this._chatMessages.push({ role: "user", content: sText });
            this._renderChatBubbles(this._chatMessages);
            oInput.setValue("");

            var oTyping  = this.byId("chatTypingIndicator");
            var oSendBtn = this.byId("chatSendBtn");
            if (oTyping)  oTyping.setVisible(true);
            if (oSendBtn) oSendBtn.setEnabled(false);

            var aApiMessages = this._chatMessages.map(function(m) {
                return { role: m.role, content: m.content };
            });

            var that = this;
            var sFullReply   = "";
            var iPlaceholder = this._chatMessages.length;
            this._chatMessages.push({ role: "assistant", content: "" });

            var sUserId = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");

            fetch(API_BASE + "/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider_id: sProviderId, messages: aApiMessages, user_id: sUserId })
            })
            .then(function(res) {
                var oReader  = res.body.getReader();
                var oDecoder = new TextDecoder();
                function pump() {
                    return oReader.read().then(function(chunk) {
                        if (chunk.done) {
                            if (oTyping)  oTyping.setVisible(false);
                            if (oSendBtn) oSendBtn.setEnabled(true);
                            return;
                        }
                        oDecoder.decode(chunk.value, { stream: true }).split("\n").forEach(function(sLine) {
                            if (!sLine.startsWith("data: ")) return;
                            var sData = sLine.slice(6).trim();
                            if (sData === "[DONE]") return;
                            try {
                                var o = JSON.parse(sData);
                                if (o.text) {
                                    sFullReply += o.text;
                                    that._chatMessages[iPlaceholder].content = sFullReply;
                                    that._renderChatBubbles(that._chatMessages);
                                }
                            } catch (e) { /* skip */ }
                        });
                        return pump();
                    });
                }
                return pump();
            })
            .catch(function() {
                if (oTyping)  oTyping.setVisible(false);
                if (oSendBtn) oSendBtn.setEnabled(true);
                that._chatMessages[iPlaceholder].content = "Sorry, I couldn't reach the server. Please try again.";
                that._renderChatBubbles(that._chatMessages);
            });
        },

        onCloseChat: function() {
            this.byId("chatDialog").close();
        },

        // ── QUICK REPLIES ─────────────────────────────────────────────────────
        onQuickReply: function(oEvent) {
            var sText = oEvent.getSource().getText().replace(/[\uD800-\uDFFF]./g, "").replace(/[^\x00-\x7E]/g, "").trim();
            // Use full button text (with emoji) as the message
            sText = oEvent.getSource().getText().trim();
            var oInput = this.byId("chatInput");
            if (oInput) {
                oInput.setValue(sText);
                this.onChatSend();
            }
        },

        // ── IN-APP PUSH TOAST ─────────────────────────────────────────────────
        _showInAppToast: function(sIcon, sTitle, sMessage) {
            MessageToast.show(sIcon + " " + sTitle + "\n" + sMessage, {
                duration:    5000,
                width:       "20em",
                my:          "center top",
                at:          "center top",
                offset:      "0 64",
                autoClose:   true
            });
        },

        // Quick actions directly from the provider card (no profile dialog needed)
        _getProviderFromEvent: function(oEvent) {
            var oListItem = oEvent.getSource().getParent().getParent();
            var oCtx = oListItem.getBindingContext("appData");
            if (!oCtx) return null;
            var oProvider = Object.assign({}, oCtx.getObject());
            if (oProvider.name && !oProvider.initials) {
                oProvider.initials = oProvider.name.split(" ").map(function(p) { return p[0]; }).join("").substring(0, 2).toUpperCase();
            }
            return oProvider;
        },

        onQuickBook: function(oEvent) {
            var oProvider = this._getProviderFromEvent(oEvent);
            if (!oProvider) return;
            this.getModel("appData").setProperty("/selectedProfile", oProvider);
            this.onOpenBooking();
        },

        onQuickChat: function(oEvent) {
            var oProvider = this._getProviderFromEvent(oEvent);
            if (!oProvider) return;
            oProvider.reviews = [];
            this.getModel("appData").setProperty("/selectedProfile", oProvider);
            this.onOpenChat();
        },

        // ── BOOKING ───────────────────────────────────────────────────────────
        onOpenBooking: function() {
            var oModel = this.getModel("appData");
            oModel.setProperty("/bookingForm/date", "");
            oModel.setProperty("/bookingForm/time", "");
            oModel.setProperty("/bookingForm/message", "");
            this.byId("profileDialog").close();
            this.byId("bookingDialog").open();
        },

        onCloseBooking: function() {
            this.byId("bookingDialog").close();
        },

        onConfirmBooking: function() {
            var oModel      = this.getModel("appData");
            var sDate       = oModel.getProperty("/bookingForm/date");
            var sTime       = oModel.getProperty("/bookingForm/time");
            var sMessage    = oModel.getProperty("/bookingForm/message");
            var sProviderId = oModel.getProperty("/selectedProfile/id");
            var sService    = oModel.getProperty("/selectedProfile/serviceType");
            var sCustomerId = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");

            if (!sDate) { MessageToast.show("Please select a date."); return; }
            if (!sCustomerId) { MessageToast.show("Please log in to book a helper."); return; }

            fetch(API_BASE + "/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id:    sCustomerId,
                    provider_id:    sProviderId,
                    service:        sService,
                    scheduled_date: sDate,
                    scheduled_time: sTime,
                    message:        sMessage
                })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    this.byId("bookingDialog").close();
                    MessageBox.success("Booking request sent! The helper will confirm shortly.", {
                        title: "Request Sent",
                        onClose: function() {
                            this._loadSchedule();
                        }.bind(this)
                    });
                } else {
                    MessageToast.show("Booking failed: " + (oData.error || "Unknown error"));
                }
            }.bind(this))
            .catch(function() { MessageToast.show("Could not reach the server."); });
        },

        onAcceptBooking: function(oEvent) {
            this._updateBookingStatus(oEvent, "confirmed");
        },

        onDeclineBooking: function(oEvent) {
            this._updateBookingStatus(oEvent, "declined");
        },

        _updateBookingStatus: function(oEvent, sStatus) {
            var oCtx = oEvent.getSource().getParent().getParent().getBindingContext("appData");
            if (!oCtx) return;
            var sBookingId = oCtx.getObject().id;
            var sUserId    = this.getModel("appData").getProperty("/user/id");

            fetch(API_BASE + "/api/bookings/" + encodeURIComponent(sBookingId) + "/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: sStatus, user_id: sUserId })
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    MessageToast.show("Booking " + sStatus + ".");
                    this._loadSchedule();
                }
            }.bind(this))
            .catch(function() { MessageToast.show("Could not update booking."); });
        },

        _loadSchedule: function() {
            var oModel   = this.getModel("appData");
            var sUserId  = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");
            if (!sUserId) return;

            fetch(API_BASE + "/api/bookings/user/" + encodeURIComponent(sUserId))
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/upcomingBookings", oData.bookings);
                        // Only show badge count for NEW (unseen) bookings
                        oModel.setProperty("/bookingCount", oData.newCount || 0);
                    }
                })
                .catch(function() { /* keep empty */ });
        },

        _markBookingsSeen: function() {
            var oModel  = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");
            if (!sUserId) return;
            fetch(API_BASE + "/api/bookings/user/" + encodeURIComponent(sUserId) + "/mark-seen", { method: "PUT" })
                .then(function() {
                    oModel.setProperty("/bookingCount", 0);
                })
                .catch(function() { /* silent */ });
        },

        formatBookingState: function(sStatus) {
            switch (sStatus) {
                case "confirmed":  return "Success";
                case "declined":   return "Error";
                case "completed":  return "None";
                default:           return "Warning"; // pending
            }
        },

        // ── NOTIFICATIONS ─────────────────────────────────────────────────────
        _startNotificationPolling: function() {
            var that = this;
            this._loadNotificationCount();
            this._notifInterval = setInterval(function() {
                that._loadNotificationCount();
            }, 60000); // poll every 60s
        },

        _loadNotificationCount: function() {
            var oModel   = this.getModel("appData");
            var sUserId  = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");
            if (!sUserId) return;
            var iPrev    = oModel.getProperty("/unreadCount") || 0;

            fetch(API_BASE + "/api/notifications/" + encodeURIComponent(sUserId) + "/unread-count")
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        var iNew = oData.count || 0;
                        oModel.setProperty("/unreadCount", iNew);
                        this._setNotifDot(iNew > 0);
                        // Show in-app toast when new notification arrives
                        if (iNew > iPrev) {
                            this._showInAppToast("🔔", "New notification", "You have " + iNew + " unread notification" + (iNew > 1 ? "s" : ""));
                        }
                    }
                }.bind(this))
                .catch(function() { /* silent */ });
        },

        onShowNotifications: function() {
            var oModel  = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");
            if (!sUserId) { MessageToast.show("Please log in first."); return; }

            fetch(API_BASE + "/api/notifications/" + encodeURIComponent(sUserId))
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/notifications", oData.notifications);
                    }
                    this.byId("notificationsDialog").open();
                }.bind(this))
                .catch(function() { this.byId("notificationsDialog").open(); }.bind(this));
        },

        onMarkAllRead: function() {
            var oModel  = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || sessionStorage.getItem("helpmate_user_id");
            if (!sUserId) return;

            fetch(API_BASE + "/api/notifications/read-all/" + encodeURIComponent(sUserId), {
                method: "PUT"
            })
            .then(function(r) { return r.json(); })
            .then(function(oData) {
                if (oData.success) {
                    // Mark all as read in model
                    var aNotifs = oModel.getProperty("/notifications") || [];
                    aNotifs.forEach(function(n) { n.is_read = 1; });
                    oModel.setProperty("/notifications", aNotifs);
                    oModel.setProperty("/unreadCount", 0);
                    this._setNotifDot(false);
                    MessageToast.show("All notifications marked as read.");
                }
            }.bind(this))
            .catch(function() { /* silent */ });
        },

        onCloseNotifications: function() {
            this.byId("notificationsDialog").close();
        },

        // ── SEARCH ────────────────────────────────────────────────────────────
        onHelperSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("value") || "";
            this.getModel("appData").setProperty("/searchQuery", sQuery.trim().toLowerCase());
            this._refreshCurrentFilters();
        },

        // ── ADVANCED FILTERS ──────────────────────────────────────────────────
        onOpenFilters: function() {
            this.byId("filterDialog").open();
        },

        onApplyFilters: function() {
            this.byId("filterDialog").close();
            this._refreshCurrentFilters();
        },

        onResetFilters: function() {
            var oModel = this.getModel("appData");
            oModel.setProperty("/filters/minRating", 0);
            oModel.setProperty("/filters/language", "");
            oModel.setProperty("/filters/maxPrice", 200);
            this.byId("filterDialog").close();
            this._refreshCurrentFilters();
        },

        // ── ONBOARDING ────────────────────────────────────────────────────────
        _checkOnboarding: function() {
            if (!localStorage.getItem("hhOnboarded")) {
                var oModel = this.getModel("appData");
                oModel.setProperty("/onboarding/step", 1);
                oModel.setProperty("/onboarding/interests", []);
                this.byId("onboardingDialog").open();
            }
        },

        onOnboardingNext: function() {
            var oModel = this.getModel("appData");
            var iStep  = oModel.getProperty("/onboarding/step");
            if (iStep < 3) {
                oModel.setProperty("/onboarding/step", iStep + 1);
            } else {
                this._finishOnboarding();
            }
        },

        onOnboardingSkip: function() {
            this._finishOnboarding();
        },

        _finishOnboarding: function() {
            localStorage.setItem("hhOnboarded", "1");
            var aInterests = this.getModel("appData").getProperty("/onboarding/interests") || [];
            if (aInterests.length) {
                localStorage.setItem("hhInterests", JSON.stringify(aInterests));
            }
            this.byId("onboardingDialog").close();
        },

        onToggleInterest: function(oEvent) {
            var oBtn   = oEvent.getSource();
            var sKey   = oBtn.data("interestKey");
            var oModel = this.getModel("appData");
            var aInterests = (oModel.getProperty("/onboarding/interests") || []).slice();
            var iIdx = aInterests.indexOf(sKey);
            if (iIdx >= 0) {
                aInterests.splice(iIdx, 1);
                oBtn.setType("Default");
            } else {
                aInterests.push(sKey);
                oBtn.setType("Emphasized");
            }
            oModel.setProperty("/onboarding/interests", aInterests);
        },

        // ── FAVORITES ─────────────────────────────────────────────────────────
        _loadFavorites: function() {
            var oModel = this.getModel("appData");
            try {
                var aFavIds = JSON.parse(localStorage.getItem("hhFavorites") || "[]");
                oModel.setProperty("/favorites", aFavIds);
                this._syncFavoriteProviders();
            } catch(e) { /* ignore */ }
            try {
                var aRecent = JSON.parse(localStorage.getItem("hhRecentlyViewed") || "[]");
                oModel.setProperty("/recentlyViewed", aRecent);
            } catch(e) { /* ignore */ }
        },

        _syncFavoriteProviders: function() {
            var oModel = this.getModel("appData");
            var aIds   = oModel.getProperty("/favorites") || [];
            var aAll   = oModel.getProperty("/providers") || [];
            oModel.setProperty("/favoriteProviders", aAll.filter(function(p) {
                return aIds.indexOf(p.id) >= 0;
            }));
        },

        onToggleFavorite: function(oEvent) {
            var oModel  = this.getModel("appData");
            var oSource = oEvent.getSource();
            var oCtx    = oSource.getBindingContext("appData");
            if (!oCtx) {
                var oParent = oSource.getParent();
                while (oParent && !oCtx) {
                    oCtx = oParent.getBindingContext("appData");
                    oParent = oParent.getParent ? oParent.getParent() : null;
                }
            }
            if (!oCtx) return;
            var sId  = oCtx.getObject().id;
            var aFavs = (oModel.getProperty("/favorites") || []).slice();
            var iIdx  = aFavs.indexOf(sId);
            if (iIdx >= 0) {
                aFavs.splice(iIdx, 1);
                MessageToast.show("Removed from saved.");
            } else {
                aFavs.push(sId);
                MessageToast.show("Saved to your helpers!");
            }
            oModel.setProperty("/favorites", aFavs);
            localStorage.setItem("hhFavorites", JSON.stringify(aFavs));
            this._syncFavoriteProviders();
        },

        onViewFavoriteProfile: function(oEvent) {
            this._openProfileFromEvent(oEvent);
        },

        onViewRecentProfile: function(oEvent) {
            this._openProfileFromEvent(oEvent);
        },

        // Walk up the control tree to find binding context — works for any list structure
        _openProfileFromEvent: function(oEvent) {
            var oModel  = this.getModel("appData");
            var oControl = oEvent.getSource();
            var oCtx = null;
            while (oControl && !oCtx) {
                oCtx = oControl.getBindingContext("appData");
                oControl = oControl.getParent ? oControl.getParent() : null;
            }
            if (!oCtx) return;

            var oProvider = Object.assign({}, oCtx.getObject());
            if (oProvider.name && !oProvider.initials) {
                oProvider.initials = oProvider.name.split(" ")
                    .map(function(p) { return p[0]; }).join("").substring(0, 2).toUpperCase();
            }
            oProvider.reviews = [];
            oModel.setProperty("/selectedProfile", oProvider);
            this._trackRecentlyViewed(oProvider);

            var oStars = this.byId("newRatingStars");
            var oComment = this.byId("newRatingComment");
            if (oStars)   oStars.setValue(0);
            if (oComment) oComment.setValue("");

            this.byId("profileDialog").open();

            fetch(API_BASE + "/api/providers/" + encodeURIComponent(oProvider.id) + "/ratings")
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/selectedProfile/reviews", oData.ratings);
                    }
                })
                .catch(function() {});
        },

        // ── RECENTLY VIEWED ───────────────────────────────────────────────────
        _trackRecentlyViewed: function(oProvider) {
            var oModel  = this.getModel("appData");
            var aRecent = (oModel.getProperty("/recentlyViewed") || []).slice();
            aRecent = aRecent.filter(function(p) { return p.id !== oProvider.id; });
            aRecent.unshift({
                id:          oProvider.id,
                name:        oProvider.name,
                photo:       oProvider.photo,
                serviceType: oProvider.serviceType
            });
            if (aRecent.length > 5) { aRecent = aRecent.slice(0, 5); }
            oModel.setProperty("/recentlyViewed", aRecent);
            localStorage.setItem("hhRecentlyViewed", JSON.stringify(aRecent));
        }

    });
});
