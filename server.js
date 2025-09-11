import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: true
});

// API Routes
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', message: 'Fastify server is running!' };
});

fastify.get('/api/books', async (request, reply) => {
  // Sample book data - you can replace this with your actual data source
  return {
    books: [
      { id: 1, title: 'Sample Book 1', author: 'Author 1' },
      { id: 2, title: 'Sample Book 2', author: 'Author 2' }
    ]
  };
});

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
