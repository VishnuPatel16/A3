import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import employeesRouter from './server/routes/employees';
import inventoryRouter from './server/routes/inventory';
import transactionsRouter from './server/routes/transactions';
import attendanceRouter from './server/routes/attendance';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log incoming API calls
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/employees', employeesRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/attendance', attendanceRouter);

  // Vite Middleware integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static asset server running.');
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server launched successfully at  http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Failed to startup main application server', err);
});
