import connectDb from './config/db.js';
import app from './app.js';
import config from './config/config.js';
import { createServer } from 'http';

const main = async () => {
  try {
    await connectDb();
    const server = createServer(app);
    server.listen(config.port, () => {
      console.log(`${config.env} server listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('Server failed to start:', err.message || err);
    process.exit(1);
  }
};

main();
