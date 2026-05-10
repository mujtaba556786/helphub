const { streamChat } = require('../services/ChatService');

async function chat(req, res) {
    await streamChat(res, req.body);
}

module.exports = { chat };
