"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgentController = runAgentController;
const newsletterAgentService_1 = require("../../services/newsletterAgentService");
async function runAgentController(req, res) {
    try {
        const { goal, mode } = req.body;
        if (!goal) {
            return res.status(400).json({ error: 'goal is required' });
        }
        const result = await (0, newsletterAgentService_1.runNewsletterAgent)(goal, mode || 'auto');
        res.json(result);
    }
    catch (err) {
        console.error('runAgentController failed:', err);
        res.status(500).json({ error: err.message || 'Agent run failed' });
    }
}
//# sourceMappingURL=runAgent.controller.js.map