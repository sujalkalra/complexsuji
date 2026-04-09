import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Provide __dirname fallback for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(express.json());

// Database connection logic for Serverless environments
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI is not set in environment variables. Database operations will fail.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Middleware to ensure DB connection before handling routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/analysis', analysisRoutes);

// Basic route for testing
app.get('/api', (req, res) => {
  res.send('ComplexSuji API is running');
});
app.get('/', (req, res) => {
  res.send('ComplexSuji API is running');
});

export default app;