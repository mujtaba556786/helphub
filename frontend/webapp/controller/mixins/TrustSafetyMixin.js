sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "helphub/config"
], function(MessageToast, Fragment, Config) {
    "use strict";

    var API_BASE = Config.API_BASE;

    // Must match CURRENT_TERMS_VERSION in backend/server.js.
    // Bump both when T&C or Privacy Policy change — existing users will be re-prompted.
    var CURRENT_TERMS_VERSION = "1.0";

    return {

        // ── Terms Acceptance ─────────────────────────────────────────────────

        _checkTermsAccepted: function() {
            var oModel       = this.getModel("appData");
            var sTermsAt     = oModel.getProperty("/user/terms_accepted_at");
            var sUserVersion = oModel.getProperty("/user/terms_version");
            var bNeedsAccept = !sTermsAt || sUserVersion !== CURRENT_TERMS_VERSION;

            if (bNeedsAccept) {
                // Terms needed — show terms dialog, hold onboarding until accepted
                var bIsUpdate = !!sTermsAt && sUserVersion !== CURRENT_TERMS_VERSION;
                oModel.setProperty("/user/termsUpdateRequired", bIsUpdate);
                oModel.setProperty("/termsCheckbox", false);

                this._getTermsDialog().then(function(oDialog) {
                    oDialog.open();
                }.bind(this));
            } else {
                // Terms already accepted — safe to check onboarding now
                setTimeout(this._checkOnboarding.bind(this), 150);
            }
        },

        onAcceptTerms: function() {
            this.apiFetch(API_BASE + "/api/auth/accept-terms", { method: "POST" })
                .then(function(oData) {
                    if (oData.success) {
                        var oModel = this.getModel("appData");
                        oModel.setProperty("/user/terms_accepted_at", new Date().toISOString());
                        oModel.setProperty("/user/terms_version", CURRENT_TERMS_VERSION);
                        oModel.setProperty("/user/termsUpdateRequired", false);
                        this._getTermsDialog().then(function(oDialog) { oDialog.close(); });
                        // Terms just accepted — now check onboarding
                        setTimeout(this._checkOnboarding.bind(this), 300);
                    }
                }.bind(this))
                .catch(function() {
                    MessageToast.show("Could not save acceptance. Please try again.");
                });
        },

        onViewTerms: function() {
            // Opens terms dialog in review mode (from profile/settings Legal section)
            var oModel = this.getModel("appData");
            oModel.setProperty("/user/termsUpdateRequired", false);
            oModel.setProperty("/termsCheckbox", false);
            this._getTermsDialog().then(function(oDialog) { oDialog.open(); });
        },

        onViewPrivacy: function() {
            sap.m.MessageToast.show("Privacy Policy — coming soon.");
        },

        // Called from links INSIDE the terms dialog itself (can't re-open the same dialog)
        onViewTermsInline: function() {
            sap.m.MessageToast.show("Full Terms & Conditions available in Profile → Settings.");
        },

        onViewPrivacyInline: function() {
            sap.m.MessageToast.show("Privacy Policy available in Profile → Settings.");
        },

        // ── Settings tab helpers ──────────────────────────────────────────────

        onOpenHelp: function() {
            var oModel = this.getModel("appData");
            oModel.setProperty("/onboarding/step", 1);
            oModel.setProperty("/onboarding/interests", []);
            this._getOnboardingDialog().then(function(d) { d.open(); });
        },

        onContactSupport: function() {
            // Future: open support email / ticket form
            sap.m.MessageToast.show("Contact Support — coming soon.");
        },

        onTermsEscapeHandler: function(oPromise) {
            // Prevent dismissal — user must accept before using the app
            oPromise.reject();
        },

        onDeclineTerms: function() {
            // User declined — clear session and return to login
            window.HelpHubStorage.clear();
            this._getTermsDialog().then(function(oDialog) { oDialog.close(); });
            this.getRouter().navTo("login", {}, true);
        },

        // ── Blocking ─────────────────────────────────────────────────────────

        onBlockUser: function() {
            var oModel  = this.getModel("appData");
            var sId     = oModel.getProperty("/selectedProfile/id");
            var sName   = oModel.getProperty("/selectedProfile/name") || "this user";
            if (!sId) return;

            var that = this;
            sap.m.MessageBox.confirm(
                "Block " + sName + "? They will no longer be able to message or book with you.",
                {
                    title: "Block User",
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.CANCEL,
                    onClose: function(sAction) {
                        if (sAction !== sap.m.MessageBox.Action.OK) return;
                        that.apiFetch(API_BASE + "/api/users/" + sId + "/block", { method: "POST" })
                            .then(function(oData) {
                                if (oData.success) {
                                    MessageToast.show(sName + " has been blocked.");
                                    that._getProfileDialog().then(function(oDialog) { oDialog.close(); });
                                }
                            })
                            .catch(function() {
                                MessageToast.show("Could not block user. Please try again.");
                            });
                    }
                }
            );
        },

        onBlockCurrentDm: function() {
            var sOtherId = this._currentConvoOtherId;
            var sName    = this._currentConvoOtherName || "this user";
            if (!sOtherId) return;

            this.apiFetch(API_BASE + "/api/users/" + sOtherId + "/block", { method: "POST" })
                .then(function(oData) {
                    if (oData.success) {
                        MessageToast.show(sName + " has been blocked.");
                        this._getDmChatDialog().then(function(oDialog) { oDialog.close(); });
                    }
                }.bind(this))
                .catch(function() {
                    MessageToast.show("Could not block user. Please try again.");
                });
        },

        // ── Reporting ─────────────────────────────────────────────────────────

        onReportUser: function() {
            var oModel = this.getModel("appData");
            var sId    = oModel.getProperty("/selectedProfile/id");
            if (!sId) return;
            oModel.setProperty("/report", { type: "user", id: sId, category: "", description: "" });
            this._getReportDialog().then(function(oDialog) { oDialog.open(); });
        },

        onReportCurrentDm: function() {
            var oModel = this.getModel("appData");
            if (!this._currentConvoOtherId) return;
            oModel.setProperty("/report", { type: "user", id: this._currentConvoOtherId, category: "", description: "" });
            this._getReportDialog().then(function(oDialog) { oDialog.open(); });
        },

        onSubmitReport: function() {
            var oReport = this.getModel("appData").getProperty("/report") || {};
            if (!oReport.category) {
                MessageToast.show("Please select a report category.");
                return;
            }
            this.apiFetch(API_BASE + "/api/reports", {
                method: "POST",
                body: JSON.stringify({
                    reported_type: oReport.type,
                    reported_id:   oReport.id,
                    category:      oReport.category,
                    description:   oReport.description || ""
                })
            })
            .then(function(oData) {
                if (oData.success) {
                    this._getReportDialog().then(function(oDialog) { oDialog.close(); });
                    MessageToast.show("Report submitted. Thank you for keeping HelpHub safe.");
                } else {
                    MessageToast.show(oData.error || "Could not submit report.");
                }
            }.bind(this))
            .catch(function() {
                MessageToast.show("Could not submit report. Please try again.");
            });
        },

        onCloseReport: function() {
            this._getReportDialog().then(function(oDialog) { oDialog.close(); });
        },

        // ── Lazy dialog loaders ───────────────────────────────────────────────

        _getTermsDialog: function() {
            if (!this._pTermsDialog) {
                this._pTermsDialog = Fragment.load({
                    id:         this.getView().getId(),
                    name:       "helphub.view.fragments.TermsAcceptanceDialog",
                    controller: this
                }).then(function(oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return this._pTermsDialog;
        },

        _getReportDialog: function() {
            if (!this._pReportDialog) {
                this._pReportDialog = Fragment.load({
                    id:         this.getView().getId(),
                    name:       "helphub.view.fragments.ReportDialog",
                    controller: this
                }).then(function(oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return this._pReportDialog;
        }

    };
});
