import { Router } from 'express';
import { runAgentController } from '../controllers/agent/runAgent.controller';
import { approveAgentController } from '../controllers/agent/approveAgent.controller';

const router = Router();

router.post('/run', runAgentController);
router.post('/approve/:threadId', approveAgentController);

export default router;