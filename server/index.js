import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.js';

// Load environment variables based on location
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analysis', analysisRoutes);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI is not set in .env file. Database operations will fail.');
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Basic route for testing
app.get('/', (req, res) => {
  res.send('ComplexSuji API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
