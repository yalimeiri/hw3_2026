export const POSTS_PER_PAGE = 10;
export const PORT = 3001;
export const SALT_ROUNDS = 10;
export const TOKEN_EXPIRY = '1h';
export const MAX_ROUND_TRIPS = 3;
export const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
export const AI_MODEL = process.env.AI_MODEL ?? 'qwen2.5:3b';