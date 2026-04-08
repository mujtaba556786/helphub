sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    "use strict";

    var API_BASE = "http://localhost:3000";

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

            var oStars   = this.byId("newRatingStars");
            var oComment = this.byId("newRatingComment");
            if (oStars)   oStars.setValue(0);
            if (oComment) oComment.setValue("");

            this._getProfileDialog().then(function(oDialog) { oDialog.open(); }.bind(this));

            fetch(API_BASE + "/api/providers/" + encodeURIComponent(oProvider.id) + "/ratings")
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        var oProfile = oModel.getProperty("/selectedProfile");
                        oProfile.reviews = this._formatReviews(oData.ratings);
                        oModel.setProperty("/selectedProfile", oProfile);
                    }
                }.bind(this))
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
                    MessageToast.show("Your review has been submitted and is pending approval.");
                    if (oStars)   oStars.setValue(0);
                    if (oComment) oComment.setValue("");
                    // Note: average and review list only update after admin approval
                    var sId = oModel.getProperty("/selectedProfile/id");
                    fetch(API_BASE + "/api/providers/" + encodeURIComponent(sId) + "/ratings")
                        .then(function(r) { return r.json(); })
                        .then(function(d) {
                            if (d.success) oModel.setProperty("/selectedProfile/reviews", this._formatReviews(d.ratings));
                        });
                } else {
                    MessageToast.show(oData.error || "Could not submit rating.");
                }
            }.bind(this))
            .catch(function() { MessageToast.show("Could not reach the server."); });
        },

        onCloseProfile: function() {
            this._getProfileDialog().then(function(d) { d.close(); }.bind(this));
        }

    };
});
