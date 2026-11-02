import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runCleanup } from '../../backend/src/jobs/cleanup.job';
import { pasteService } from '../../backend/src/services/paste.service';

describe('Cleanup Job Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('purges expired pastes successfully and returns the deleted count', async () => {
    vi.spyOn(pasteService, 'cleanupExpired').mockResolvedValue(5);

    const count = await runCleanup();
    expect(count).toBe(5);
    expect(pasteService.cleanupExpired).toHaveBeenCalledOnce();
  });

  it('prevents overlapping cleanup execution', async () => {
    let resolveFirst: (val: number) => void;
    const firstPromise = new Promise<number>((res) => {
      resolveFirst = res;
    });

    vi.spyOn(pasteService, 'cleanupExpired').mockImplementation(() => firstPromise);

    const run1 = runCleanup();
    const run2 = runCleanup(); // Attempt overlapping run

    // Second run should skip immediately and return 0
    const count2 = await run2;
    expect(count2).toBe(0);

    resolveFirst!(3);
    const count1 = await run1;
    expect(count1).toBe(3);
  });

  it('handles database exceptions gracefully without crashing', async () => {
    vi.spyOn(pasteService, 'cleanupExpired').mockRejectedValue(new Error('DB disconnect'));

    const count = await runCleanup();
    expect(count).toBe(0); // Safely returns 0
  });
});

