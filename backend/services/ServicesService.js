const pool = require('../db/pool');

async function getAll() {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY category ASC, name ASC');
    return rows;
}

async function create({ id, name, category, icon, description, status }) {
    if (!name || !category) throw Object.assign(new Error('name and category are required'), { status: 400 });
    const serviceId = id || 'S' + Date.now();
    await pool.execute(
        'INSERT INTO services (id, name, category, icon, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [serviceId, name, category, icon || '📦', description || '', status || 'Active']
    );
    return serviceId;
}

async function update(id, { name, category, icon, description, status }) {
    if (!name || !category) throw Object.assign(new Error('name and category are required'), { status: 400 });
    await pool.execute(
        'UPDATE services SET name = ?, category = ?, icon = ?, description = ?, status = ? WHERE id = ?',
        [name, category, icon || '📦', description || '', status || 'Active', id]
    );
}

async function remove(id) {
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
}

module.exports = { getAll, create, update, remove };
