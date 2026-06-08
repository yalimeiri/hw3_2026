import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGODB_CONNECTION_URL;
  
  if (!mongoUrl) {
    throw new Error('MONGODB_CONNECTION_URL is not defined in .env file');
  }

  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');
};

export default connectDB;