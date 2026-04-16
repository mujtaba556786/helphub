sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function(MessageToast, Fragment) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return {

        // ── Terms Acceptance ─────────────────────────────────────────────────

        _checkTermsAccepted: function() {
            var oModel = this.getModel("appData");
            var sTermsAt = oModel.getProperty("/user/terms_accepted_at");
            if (!sTermsAt) {
                this._getTermsDialog().then(function(oDialog) {
                    oDialog.open();
                }.bind(this));
            }
        },

        onAcceptTerms: function() {
            this.apiFetch(API_BASE + "/api/auth/accept-terms", { method: "POST" })
                .then(function(oData) {
                    if (oData.success) {
                        this.getModel("appData").setProperty("/user/terms_accepted_at", new Date().toISOString());
                        this._getTermsDialog().then(function(oDialog) { oDialog.close(); });
                    }
                }.bind(this))
                .catch(function() {
                    MessageToast.show("Could not save acceptance. Please try again.");
                });
        },

        onTermsEscapeHandler: function(oPromise) {
            // Prevent dismissal — user must accept before using the app
            oPromise.reject();
        },

        // ── Blocking ─────────────────────────────────────────────────────────

        onBlockUser: function() {
            var oModel  = this.getModel("appData");
            var sId     = oModel.getProperty("/selectedProfile/id");
            var sName   = oModel.getProperty("/selectedProfile/name") || "this user";
            if (!sId) return;

            this.apiFetch(API_BASE + "/api/users/" + sId + "/block", { method: "POST" })
                .then(function(oData) {
                    if (oData.success) {
                        MessageToast.show(sName + " has been blocked.");
                        this._getProfileDialog().then(function(oDialog) { oDialog.close(); });
                    }
                }.bind(this))
                .catch(function() {
                    MessageToast.show("Could not block user. Please try again.");
                });
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
