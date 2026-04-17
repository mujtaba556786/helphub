sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(MessageToast, MessageBox) {
    "use strict";

    var API_BASE = "http://localhost:3000";

    return {

        onOpenBooking: function() {
            var oModel = this.getModel("appData");
            oModel.setProperty("/bookingForm/date", "");
            oModel.setProperty("/bookingForm/time", "");
            oModel.setProperty("/bookingForm/message", "");
            Promise.all([this._getProfileDialog(), this._getBookingDialog()]).then(function(aDialogs) {
                aDialogs[0].close();
                aDialogs[1].open();
            }.bind(this));
        },

        onCloseBooking: function() {
            this._getBookingDialog().then(function(d) { d.close(); }.bind(this));
        },

        onConfirmBooking: function() {
            var oModel      = this.getModel("appData");
            var sDate       = oModel.getProperty("/bookingForm/date");
            var sTime       = oModel.getProperty("/bookingForm/time");
            var sMessage    = oModel.getProperty("/bookingForm/message");
            var sProviderId = oModel.getProperty("/selectedProfile/id");
            var sService    = oModel.getProperty("/selectedProfile/serviceType");
            var sCustomerId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");

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
                    var sProviderName = oModel.getProperty("/selectedProfile/name") || "the helper";
                    this._getBookingDialog().then(function(d) { d.close(); }.bind(this));
                    MessageBox.success(
                        "Your request has been sent to " + sProviderName + ".\nYou'll be notified once they confirm.",
                        {
                            title: "Booking Request Sent!",
                            onClose: function() {
                                this._loadSchedule();
                            }.bind(this)
                        }
                    );
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

        onCancelBooking: function(oEvent) {
            // getBindingContext walks the parent tree automatically — no fragile getParent() chain
            var oCtx = oEvent.getSource().getBindingContext("appData");
            if (!oCtx) return;
            var oBooking = oCtx.getObject();
            var sBookingId = oBooking && oBooking.id;
            if (!sBookingId) return;
            var sUserId = this.getModel("appData").getProperty("/user/id");
            var that = this;

            // Use explicit actions so sAction reliably equals MessageBox.Action.OK on confirm
            MessageBox.confirm("Are you sure you want to cancel this booking?", {
                title: "Cancel Booking",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.CANCEL,
                onClose: function(sAction) {
                    if (sAction !== MessageBox.Action.OK) return;
                    fetch(API_BASE + "/api/bookings/" + encodeURIComponent(sBookingId) + "/status", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "cancelled", user_id: sUserId })
                    })
                    .then(function(r) { return r.json(); })
                    .then(function(oData) {
                        if (oData.success) {
                            MessageToast.show("Booking cancelled.");
                            that._loadSchedule();
                        } else {
                            MessageToast.show(oData.error || "Could not cancel booking.");
                        }
                    })
                    .catch(function() { MessageToast.show("Could not reach the server."); });
                }
            });
        },

        _updateBookingStatus: function(oEvent, sStatus) {
            var oCtx = oEvent.getSource().getBindingContext("appData");
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

        onBookingFilter: function(oEvent) {
            var sStatus = oEvent.getSource().data("status");
            var oModel = this.getModel("appData");
            oModel.setProperty("/bookingStatusFilter", sStatus);
            this._applyBookingFilter();
        },

        _applyBookingFilter: function() {
            var oModel = this.getModel("appData");
            var sFilter = oModel.getProperty("/bookingStatusFilter") || "all";
            var aAll = oModel.getProperty("/upcomingBookings") || [];
            var aFiltered;
            if (sFilter === "all") {
                // Hide cancelled bookings from the default view — they are terminal
                aFiltered = aAll.filter(function(b) { return b.status !== "cancelled"; });
            } else {
                aFiltered = aAll.filter(function(b) { return b.status === sFilter; });
            }
            oModel.setProperty("/filteredBookings", aFiltered);
        },

        _loadSchedule: function() {
            var oModel   = this.getModel("appData");
            var sUserId  = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) return;

            fetch(API_BASE + "/api/bookings/user/" + encodeURIComponent(sUserId))
                .then(function(r) { return r.json(); })
                .then(function(oData) {
                    if (oData.success) {
                        oModel.setProperty("/upcomingBookings", oData.bookings);
                        oModel.setProperty("/bookingCount", oData.newCount || 0);
                        this._applyBookingFilter();
                    }
                }.bind(this))
                .catch(function() { /* keep empty */ });
        },

        _markBookingsSeen: function() {
            var oModel  = this.getModel("appData");
            var sUserId = oModel.getProperty("/user/id") || localStorage.getItem("helpmate_user_id");
            if (!sUserId) return;
            fetch(API_BASE + "/api/bookings/user/" + encodeURIComponent(sUserId) + "/mark-seen", { method: "PUT" })
                .then(function() {
                    oModel.setProperty("/bookingCount", 0);
                })
                .catch(function() { /* silent */ });
        },

        formatBookingDate: function(sDate) {
            if (!sDate) return "";
            try {
                var d = new Date(sDate);
                if (isNaN(d.getTime())) return sDate;
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            } catch (e) { return sDate; }
        },

        formatBookingState: function(sStatus) {
            switch (sStatus) {
                case "confirmed":  return "Success";
                case "declined":   return "Error";
                case "cancelled":  return "Error";
                case "completed":  return "None";
                default:           return "Warning"; // pending
            }
        }

    };
});
