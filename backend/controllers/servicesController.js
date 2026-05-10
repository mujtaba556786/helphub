const svc = require('../services/ServicesService');

async function getAll(req, res) {
    const services = await svc.getAll();
    res.json(services);
}

async function create(req, res) {
    const id = await svc.create(req.body);
    res.json({ success: true, id });
}

async function update(req, res) {
    await svc.update(req.params.id, req.body);
    res.json({ success: true });
}

async function remove(req, res) {
    await svc.remove(req.params.id);
    res.json({ success: true });
}

module.exports = { getAll, create, update, remove };
