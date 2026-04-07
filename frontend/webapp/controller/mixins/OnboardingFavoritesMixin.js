sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return {

        _checkOnboarding: function() {
            if (!localStorage.getItem("hhOnboarded")) {
                var oModel = this.getModel("appData");
                oModel.setProperty("/onboarding/step", 1);
                oModel.setProperty("/onboarding/interests", []);
                this._getOnboardingDialog().then(function(d) { d.open(); }.bind(this));
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
            this._getOnboardingDialog().then(function(d) { d.close(); }.bind(this));
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
            var sId   = oCtx.getObject().id;
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

        _openProfileFromEvent: function(oEvent) {
            var oModel   = this.getModel("appData");
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
                .catch(function() {});
        },

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

    };
});
