import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { SALT_ROUNDS, TOKEN_EXPIRY } from '../consts';

interface CreateUserInput {
  name: string;
  email: string;
  username: string;
  password: string;
}

export const createUser = async ({ name, email, username, password }: CreateUserInput) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ name, email, username, passwordHash });
  return await user.save();
};

export const verifyLogin = async (username: string, password: string) => {
  const user = await User.findOne({ username });
  if (!user) {
    return null;
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!passwordCorrect) {
    return null;
  }

  return user;
};

export const signToken = (user: { _id: unknown; username: string }): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in .env file');
  }

  const payload = {
    id: String(user._id),
    username: user.username,
  };

  return jwt.sign(payload, secret, { expiresIn: TOKEN_EXPIRY });
};
