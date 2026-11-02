import { createApp } from './app';
import { env } from './config/env';
import { prisma, checkDatabaseHealth } from './prisma/client';
import { startCleanupJob, stopCleanupJob } from './jobs/cleanup.job';

async function bootstrap() {
  const app = createApp();

  // Verify database connectivity on startup
  const isDbConnected = await checkDatabaseHealth();
  if (isDbConnected) {
    console.log('[Database] PostgreSQL connection established successfully.');
  } else {
    console.warn('[Database] WARNING: Initial database connection check failed. Requests needing DB may fail until connection is ready.');
  }

  // Start periodic cleanup job
  startCleanupJob();

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`  CodeShare Server running on 0.0.0.0:${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`  App URL:     ${env.APP_BASE_URL}`);
    console.log(`===============================================`);
  });

  // Graceful shutdown handler
  let isShuttingDown = false;
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);

    stopCleanupJob();

    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await prisma.$disconnect();
        console.log('[Database] Prisma client disconnected.');
      } catch (err) {
        console.error('[Database] Error disconnecting Prisma:', err);
      }
      process.exit(0);
    });

    // Force exit if cleanup takes longer than 10s
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Catch unhandled rejections and uncaught exceptions
  process.on('unhandledRejection', (reason) => {
    console.error('[Process] Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('[Process] Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});

