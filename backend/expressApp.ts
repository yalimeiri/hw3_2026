import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import noteRoutes from './routes/noteRoutes';
import logger from './middlewares/logger';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  exposedHeaders: ['X-Total-Count']
}));
app.use(express.json());
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

// Routes
app.use('/notes', noteRoutes);

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

export default app;