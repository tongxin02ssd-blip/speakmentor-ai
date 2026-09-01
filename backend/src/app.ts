import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import dialogueRoutes from './routes/dialogueRoutes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendOrigin,
  }),
);

app.use(express.json());

app.use(healthRoutes);
app.use(dialogueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;