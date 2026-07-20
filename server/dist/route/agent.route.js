"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const runAgent_controller_1 = require("../controllers/agent/runAgent.controller");
const approveAgent_controller_1 = require("../controllers/agent/approveAgent.controller");
const router = (0, express_1.Router)();
router.post('/run', runAgent_controller_1.runAgentController);
router.post('/approve/:threadId', approveAgent_controller_1.approveAgentController);
exports.default = router;
//# sourceMappingURL=agent.route.js.map