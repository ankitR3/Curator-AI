"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveAgentController = approveAgentController;
const newsletterAgentService_1 = require("../../services/newsletterAgentService");
async function approveAgentController(req, res) {
    try {
        const { threadId } = req.params;
        const { approve, feedback } = req.body;
        const result = await (0, newsletterAgentService_1.approveNewsletter)(threadId, approve, feedback);
        res.json(result);
    }
    catch (err) {
        console.error('approveAgentController failed:', err);
        res.status(500).json({ error: err.message || 'Approval step failed' });
    }
}
//# sourceMappingURL=approveAgent.controller.js.map