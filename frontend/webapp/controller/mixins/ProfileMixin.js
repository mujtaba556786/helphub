sap.ui.define([
    "sap/m/MessageToast",
    "helphub/config"
], function(MessageToast, Config) {
    "use strict";

    var API_BASE = Config.API_BASE;

    return {

        // Shared helper — exposed as this.this._formatReviews() so other mixins can use it
        _formatReviews: function(aRatings) {
            var now = new Date();
            return (aRatings || []).map(function(r) {
                var sName     = r.reviewer_name || "Anonymous";
                var sInitials = sName.split(" ").map(function(p) { return p[0] || ""; })
                    .join("").substring(0, 2).toUpperCase() || "?";

                var d = r.created_at ? new Date(r.created_at) : null;
                var sRelative = "";
                if (d && !isNaN(d.getTime())) {
                    var iDiff = Math.floor((now - d) / 1000);
                    if (iDiff < 60)           { sRelative = "just now"; }
                    else if (iDiff < 3600)    { sRelative = Math.floor(iDiff / 60) + " min ago"; }
                    else if (iDiff < 86400)   { sRelative = Math.floor(iDiff / 3600) + " hr ago"; }
                    else if (iDiff < 2592000) { sRelative = Math.floor(iDiff / 86400) + " days ago"; }
                    else {
                        sRelative = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    }
                }
                return Object.assign({}, r, {
                    reviewer_initials:  sInitials,
                    created_at_relative: sRelative
                });
            });
        },

        onViewProfile: function(oEvent) {
            // Button → HBox(hhExpertActions) → VBox(hhExpertCard) → CustomListItem
            var oListItem = oEvent.getSource().getParent().getParent().getParent();
            var oCtx = oListItem.getBindingContext("appData");
            if (!oCtx) return;

            var oProvider = Object.assign({}, oCtx.getObject());
            if (oProvider.name && !oProvider.initials) {
                oProvider.initials = oProvider.name
                    .split(" ").map(function(p) { return p[0]; })
                    .join("").substring(0, 2).toUpperCase();
            }

            // Normalise any embedded mock reviews (format: {user, stars, comment})
            // so the dialog has something to show while the API fetch is in-flight.
            var aEmbedded = (oProvider.reviews || []).map(function(r) {
                var sName = r.reviewer_name || r.user || "Anonymous";
                var sInitials = sName.split(" ")
                    .map(function(p) { return p[0] || ""; })
                    .join("").substring(0, 2).toUpperCase() || "?";
                return {
                    reviewer_name:     sName,
                    reviewer_initials: sInitials,
                    stars:             r.stars || 0,
                    comment:           r.comment || "",
                    created_at_relative: r.created_at_relative || ""
                };
            });
            oProvider.reviews = aEmbedded;

            var oModel = this.getModel("appData");
            oModel.setProperty("/selectedProfile", oProvider);
            this._trackRecentlyViewed(oProvider);

            var oStars   = this.byId("newRatingStars");
            var oComment = this.byId("newRatingComment");
            if (oStars)   oStars.setValue(0);
            if (oComment) oComment.setValue("");

            this._getProfileDialog().then(function(oDialog) { oDialog.open(); }.bind(this));

            fetch(API_BASE + "/api/providers/" + encodeURIComponent(oProvider.id) + "/ratings")
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success && oData.ratings && oData.ratings.length > 0) {
                        // Replace with live DB reviews (may include pending ones)
                        oModel.setProperty("/selectedProfile/reviews", this._formatReviews(oData.ratings));
                    }
                    // If API returns empty, keep the embedded mock reviews already set above
                }.bind(this))
                .catch(function() { /* keep embedded reviews on network error */ });
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
            var sUserId     = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
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
                    MessageToast.show("Your review has been submitted and is pending approval.");
                    if (oStars)   oStars.setValue(0);
                    if (oComment) oComment.setValue("");
                    // Note: average and review list only update after admin approval
                    var sId = oModel.getProperty("/selectedProfile/id");
                    fetch(API_BASE + "/api/providers/" + encodeURIComponent(sId) + "/ratings")
                        .then(function(r) { return r.json(); })
                        .then(function(d) {
                            if (d.success) oModel.setProperty("/selectedProfile/reviews", this._formatReviews(d.ratings));
                        }.bind(this));
                } else {
                    MessageToast.show(oData.error || "Could not submit rating.");
                }
            }.bind(this))
            .catch(function() { MessageToast.show("Could not reach the server."); });
        },

        onOpenMyProfile: function() {
            var oModel = this.getModel("appData");
            var oUser  = oModel.getProperty("/user") || {};
            var oProfile = Object.assign({}, oUser);

            if (oProfile.name && !oProfile.initials) {
                oProfile.initials = oProfile.name
                    .split(" ").map(function(p) { return p[0]; })
                    .join("").substring(0, 2).toUpperCase();
            }
            oProfile.reviews = oProfile.reviews || [];
            oModel.setProperty("/selectedProfile", oProfile);

            var oStars   = this.byId("newRatingStars");
            var oComment = this.byId("newRatingComment");
            if (oStars)   oStars.setValue(0);
            if (oComment) oComment.setValue("");

            this._getProfileDialog().then(function(oDialog) { oDialog.open(); }.bind(this));
        },

        onEditProfileFromDialog: function() {
            var that = this;
            this._getProfileDialog().then(function(d) {
                d.close();
                that.onEditProfile();
            });
        },

        onViewBookingProfile: function(oEvent) {
            var oCtx = oEvent.getSource().getParent().getParent().getBindingContext("appData");
            if (!oCtx) return;
            var oBooking = oCtx.getObject();
            var sProviderId = oBooking.provider_id;
            if (!sProviderId) { MessageToast.show("Provider not found."); return; }

            var oModel = this.getModel("appData");
            var oProfile = {
                id:          sProviderId,
                name:        oBooking.provider_name || "Provider",
                serviceType: oBooking.service || "",
                reviews:     []
            };
            oProfile.initials = oProfile.name
                .split(" ").map(function(p) { return p[0]; })
                .join("").substring(0, 2).toUpperCase();

            oModel.setProperty("/selectedProfile", oProfile);
            this._trackRecentlyViewed(oProfile);

            var oStars   = this.byId("newRatingStars");
            var oComment = this.byId("newRatingComment");
            if (oStars)   oStars.setValue(0);
            if (oComment) oComment.setValue("");

            this._getProfileDialog().then(function(oDialog) { oDialog.open(); }.bind(this));

            var that = this;
            fetch(API_BASE + "/api/providers/" + encodeURIComponent(sProviderId))
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success && oData.provider) {
                        var oFull = Object.assign({}, oProfile, oData.provider);
                        if (!oFull.initials) {
                            oFull.initials = (oFull.name || "").split(" ")
                                .map(function(p) { return p[0]; })
                                .join("").substring(0, 2).toUpperCase();
                        }
                        oModel.setProperty("/selectedProfile", oFull);
                    }
                })
                .catch(function() { /* keep stub data on error */ });

            fetch(API_BASE + "/api/providers/" + encodeURIComponent(sProviderId) + "/ratings")
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/selectedProfile/reviews", that._formatReviews(oData.ratings || []));
                    }
                })
                .catch(function() { });
        },

        onCloseProfile: function() {
            this._getProfileDialog().then(function(d) { d.close(); }.bind(this));
        }

    };
});
