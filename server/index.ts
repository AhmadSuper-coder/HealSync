import next from 'next';
import { createServer } from 'http';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '5000', 10);

// Create Next.js app
const app = next({ dev, port });
const handle = app.getRequestHandler();

(async () => {
  try {
    // Prepare Next.js app
    await app.prepare();
    
    // Create HTTP server
    const server = createServer((req, res) => {
      // Let Next.js handle all requests
      handle(req, res);
    });

    // Start server
    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Next.js app ready on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Error starting Next.js server:', error);
    process.exit(1);
  }
})();
