import app from './app.js';
import dotenv, { configDotenv } from 'dotenv';

process.on('uncaughtException', (err) => {
  process.exit(1);
});

import mongoose from 'mongoose';
const PORT = process.env.PORT || 3000;

dotenv.config({
  path: './env',
});

mongoose.connect(process.env.DATABASE).then((con) => {
  console.log('DB connection successfull!');
});


const server = app.listen(PORT, () => {
  console.log(`App is running at PORT:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  server.close(() => {
    process.exit(1);
  });
});
