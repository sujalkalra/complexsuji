import express from 'express';
import Analysis from '../models/Analysis.js';

const router = express.Router();

router.post('/feedback', async (req, res) => {
  try {
    const {
      code,
      timeComplexity,
      spaceComplexity,
      timeExplanation,
      spaceExplanation,
      suggestions,
      isCorrect,
    } = req.body;

    const newAnalysis = new Analysis({
      code,
      timeComplexity,
      spaceComplexity,
      timeExplanation,
      spaceExplanation,
      suggestions,
      isCorrect,
    });

    await newAnalysis.save();

    res.status(201).json({ message: 'Feedback saved successfully', data: newAnalysis });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

export default router;
