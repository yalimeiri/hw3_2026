import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const createUser = async (req: Request, res: Response) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) {
    res.status(400).json({ error: 'name, email, username and password are required' });
    return;
  }

  const user = await authService.createUser({ name, email, username, password });
  res.status(201).json(user);
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const user = await authService.verifyLogin(username, password);
  if (!user) {
    res.status(401).json({ error: 'invalid username or password' });
    return;
  }

  const token = authService.signToken(user);
  res.status(200).json({
    token,
    username: user.username,
    name: user.name,
    email: user.email,
  });
};
