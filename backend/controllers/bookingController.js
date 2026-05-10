const BookingService = require('../services/BookingService');

async function createBooking(req, res) {
    const { customer_id, provider_id, service, scheduled_date, scheduled_time, message } = req.body;
    const result = await BookingService.createBooking({ customer_id, provider_id, service, scheduled_date, scheduled_time, message });
    res.json({ success: true, bookingId: result.bookingId });
}

async function getByUser(req, res) {
    const { bookings, newCount } = await BookingService.getBookingsByUser(req.params.id);
    res.json({ success: true, bookings, newCount });
}

async function markSeen(req, res) {
    await BookingService.markSeen(req.params.id);
    res.json({ success: true });
}

async function updateStatus(req, res) {
    const { status } = req.body;
    await BookingService.updateStatus(req.params.id, status);
    res.json({ success: true });
}

async function getAllAdmin(req, res) {
    const rows = await BookingService.getAllBookings();
    res.json(rows);
}

module.exports = { createBooking, getByUser, markSeen, updateStatus, getAllAdmin };
