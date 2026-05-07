const pool = require('../db/pool');

const FREE_SOFT_CAP = 300;
const FREE_HARD_CAP = 500;

async function getStatus(userId) {
    const [[user]] = await pool.query(
        `SELECT subscription_plan, monthly_booking_value, monthly_booking_reset_date
         FROM users WHERE id = ?`,
        [userId]
    );
    if (!user) throw { status: 404, message: 'User not found' };

    const monthly = parseFloat(user.monthly_booking_value) || 0;
    const percent = Math.round((monthly / FREE_HARD_CAP) * 100);

    return {
        plan:                  user.subscription_plan || 'free',
        monthly_booking_value: monthly,
        threshold:             FREE_HARD_CAP,
        threshold_percent:     Math.min(percent, 100),
        soft_cap_reached:      monthly >= FREE_SOFT_CAP,
        hard_cap_reached:      monthly >= FREE_HARD_CAP,
        days_until_reset:      _daysUntilMonthReset()
    };
}

async function setSubscriptionPlan(userId, plan) {
    if (!['free', 'pro'].includes(plan)) {
        throw { status: 400, message: 'Invalid plan. Must be free or pro.' };
    }
    await pool.query(
        'UPDATE users SET subscription_plan = ? WHERE id = ?',
        [plan, userId]
    );
    return { success: true, plan };
}

async function resetMonthlyValues() {
    const today = new Date().toISOString().slice(0, 10);
    await pool.query(
        `UPDATE users
         SET monthly_booking_value = 0,
             monthly_booking_reset_date = ?
         WHERE role = 'provider'`,
        [today]
    );
}

function _daysUntilMonthReset() {
    const now   = new Date();
    const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((reset - now) / 86400000);
}

module.exports = { getStatus, setSubscriptionPlan, resetMonthlyValues, FREE_SOFT_CAP, FREE_HARD_CAP };
