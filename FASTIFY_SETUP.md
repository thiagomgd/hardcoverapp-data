# Fastify + React Setup

This project now uses Fastify as the backend server with React frontend integration using `@fastify/react`.

## 🚀 Quick Start

### Development Mode (Recommended)
Run both frontend and backend together:
```bash
npm run dev:full
```

This will start:
- Vite dev server on `http://localhost:5173` (frontend)
- Fastify server on `http://localhost:3000` (backend)

### Alternative Development Commands

Run only the frontend:
```bash
npm run dev
```

Run only the backend:
```bash
npm run dev:server
```

### Production Mode
```bash
npm run build
npm start
```

## 📁 Project Structure

- `server.js` - Fastify server with React integration
- `src/` - React frontend code
- `dist/` - Built React app (created after `npm run build`)

## 🔧 API Endpoints

The Fastify server includes these sample endpoints:

- `GET /api/health` - Health check endpoint
- `GET /api/books` - Sample books data

## 🛠️ How It Works

1. **Development**: Vite serves the React app with hot reload, Fastify serves API routes
2. **Production**: Fastify serves both the built React app and API routes
3. **Proxy**: Vite proxies `/api/*` requests to the Fastify server during development

## 📝 Adding New API Routes

Add new routes in `server.js`:

```javascript
fastify.get('/api/your-endpoint', async (request, reply) => {
  return { message: 'Hello from Fastify!' };
});
```

## 🔄 Frontend API Calls

Use relative URLs in your React components:

```javascript
const response = await fetch('/api/your-endpoint');
const data = await response.json();
```

The Vite proxy will automatically forward these to the Fastify server.
