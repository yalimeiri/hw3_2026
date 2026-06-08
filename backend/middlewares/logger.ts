import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, '..', 'log.txt');

const logger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const route = req.originalUrl;
  const body = req.body ? JSON.stringify(req.body) : '';

  const logEntry = `[${timestamp}] ${method} ${route} ${body}\n`;

  fs.appendFileSync(logFilePath, logEntry);

  next();
};

export default logger;