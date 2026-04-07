sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return {

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
            this._getProfileDialog().then(function(d) { d.close(); }.bind(this));
        }

    };
});
