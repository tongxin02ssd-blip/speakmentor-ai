import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

const frontendOrigins = (
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed'));
    },
  }),
);

app.use(express.json({ limit: '100kb' }));

app.use(healthRoutes);
app.use(chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
