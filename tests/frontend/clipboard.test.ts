/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../../frontend/src/hooks/useClipboard';

describe('useClipboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('copies text using navigator.clipboard when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });

    const { result } = renderHook(() => useClipboard(100));

    let success = false;
    await act(async () => {
      success = await result.current.copy('Hello World');
    });

    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('Hello World');
    expect(result.current.copied).toBe(true);
  });

  it('falls back to document.execCommand when navigator.clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: undefined });
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const { result } = renderHook(() => useClipboard(100));

    let success = false;
    await act(async () => {
      success = await result.current.copy('Fallback Text');
    });

    expect(success).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(result.current.copied).toBe(true);
  });
});

