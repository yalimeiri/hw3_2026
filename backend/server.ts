import app from './expressApp';
import connectDB from './config/db';
import { PORT } from './consts';

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();