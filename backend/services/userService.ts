import User from '../models/User';

export const getUserById = async (id: string) => {
  return await User.findById(id);
};
