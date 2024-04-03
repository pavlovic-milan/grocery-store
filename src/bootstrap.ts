import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import registerRoutes from './routes';
import errorHandler from './middewares/errorHandler';

export async function bootstrap(mongoURL: string, host: string, port: number) {
  const app = express();

  try {
    await mongoose.connect(mongoURL);

    console.log('Connected to MongoDB');

    app.use(bodyParser.json());

    app.use('/api', registerRoutes(express.Router()));

    app.use(errorHandler);

    app.listen(port, host, () => {
      console.log(`Server is running on http://${host}:${port}`);
    });
  } catch (err) {
    console.error('Error occured:', err);
  }
}
