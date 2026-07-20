"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const agent_route_1 = __importDefault(require("./route/agent.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1', agent_route_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Newsletter Agent backend running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map