import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import agentRouter from './route/agent.route';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', agentRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Newsletter Agent backend running on http://localhost:${PORT}`);
});