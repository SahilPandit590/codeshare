import { pasteService } from '../services/paste.service';
import { env } from '../config/env';

let cleanupTimer: NodeJS.Timeout | null = null;
let isCleanupRunning = false;

export async function runCleanup(): Promise<number> {
  if (isCleanupRunning) {
    console.warn('[CleanupJob] Cleanup is already running. Skipping this cycle.');
    return 0;
  }

  isCleanupRunning = true;
  try {
    const deletedCount = await pasteService.cleanupExpired();
    if (deletedCount > 0) {
      console.log(`[CleanupJob] Successfully purged ${deletedCount} expired paste(s).`);
    }
    return deletedCount;
  } catch (error) {
    // Crucial: cleanup failures must never crash the server or compromise API-level expiration checks
    console.error('[CleanupJob] Error during periodic cleanup:', error instanceof Error ? error.message : error);
    return 0;
  } finally {
    isCleanupRunning = false;
  }
}

export function startCleanupJob(): void {
  if (cleanupTimer) {
    return;
  }

  const intervalMs = env.CLEANUP_INTERVAL_MINUTES * 60 * 1000;
  console.log(`[CleanupJob] Initialized to run every ${env.CLEANUP_INTERVAL_MINUTES} minute(s).`);

  // Run on startup
  runCleanup().catch(() => {});

  cleanupTimer = setInterval(() => {
    runCleanup().catch(() => {});
  }, intervalMs);

  // Unref so it doesn't hold open test runners
  if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }
}

export function stopCleanupJob(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    console.log('[CleanupJob] Cleanup timer stopped.');
  }
}

