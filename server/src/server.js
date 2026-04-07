import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/database.js';
import { startAlertScheduler } from './jobs/alertScheduler.js';

const PORT = process.env.PORT || 3000;

connectDB();

startAlertScheduler();

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
