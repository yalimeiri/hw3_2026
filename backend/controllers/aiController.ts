import { Request, Response } from 'express';
import { runAgent } from '../services/agentService';

export const complete = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  const result = await runAgent({ prompt });
  res.status(200).json(result);
};
