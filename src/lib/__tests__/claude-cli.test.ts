import { describe, test, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { EventEmitter } from 'events';
import { Readable, Writable } from 'stream';

vi.mock('child_process', () => ({ spawn: vi.fn() }));
import { spawn } from 'child_process';
import { runClaude } from '../claude-cli';

type FakeChild = EventEmitter & {
  stdin: Writable;
  stdout: Readable;
  stderr: Readable;
  kill: Mock;
};

function makeFakeChild(): { child: FakeChild; stdinChunks: Buffer[] } {
  const child = new EventEmitter() as FakeChild;
  const stdinChunks: Buffer[] = [];
  child.stdin = new Writable({
    write(chunk, _enc, cb) {
      stdinChunks.push(Buffer.from(chunk));
      cb();
    },
    final(cb) {
      cb();
    },
  });
  child.stdout = new Readable({ read() {} });
  child.stderr = new Readable({ read() {} });
  child.kill = vi.fn(() => true);
  return { child, stdinChunks };
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('runClaude', () => {
  test('writes prompt to stdin and resolves with stdout on exit 0', async () => {
    const { child, stdinChunks } = makeFakeChild();
    (spawn as unknown as Mock).mockReturnValue(child);

    const p = runClaude('hello', { timeoutMs: 5000 });

    setImmediate(() => {
      child.stdout.push('world');
      child.stdout.push(null);
      setImmediate(() => child.emit('close', 0));
    });

    await expect(p).resolves.toBe('world');
    expect(Buffer.concat(stdinChunks).toString()).toBe('hello');
  });

  test('rejects on non-zero exit with stderr included', async () => {
    const { child } = makeFakeChild();
    (spawn as unknown as Mock).mockReturnValue(child);

    const p = runClaude('x', { timeoutMs: 5000 });
    setImmediate(() => {
      child.stderr.push('boom');
      child.stderr.push(null);
      setImmediate(() => child.emit('close', 2));
    });

    await expect(p).rejects.toThrow(/exit code 2.*boom/);
  });

  test('rejects and kills on timeout', async () => {
    vi.useFakeTimers();
    const { child } = makeFakeChild();
    (spawn as unknown as Mock).mockReturnValue(child);

    const p = runClaude('x', { timeoutMs: 100 });
    p.catch(() => {});
    await vi.advanceTimersByTimeAsync(101);

    await expect(p).rejects.toThrow(/timed out/);
    expect(child.kill).toHaveBeenCalled();
  });

  test('rejects when stdout exceeds maxBufferBytes', async () => {
    const { child } = makeFakeChild();
    (spawn as unknown as Mock).mockReturnValue(child);

    const p = runClaude('x', { timeoutMs: 5000, maxBufferBytes: 4 });
    queueMicrotask(() => {
      child.stdout.push('123456');
    });

    await expect(p).rejects.toThrow(/buffer/i);
  });

  test('strips ANTHROPIC_API_KEY and forwards CLAUDE_CODE_OAUTH_TOKEN', async () => {
    const { child } = makeFakeChild();
    (spawn as unknown as Mock).mockReturnValue(child);
    process.env.ANTHROPIC_API_KEY = 'should-not-leak';
    process.env.CLAUDE_CODE_OAUTH_TOKEN = 'ok-token';

    const p = runClaude('x', { timeoutMs: 5000 });
    queueMicrotask(() => {
      child.stdout.push('done');
      child.stdout.push(null);
      child.emit('close', 0);
    });
    await p;

    const call = (spawn as unknown as Mock).mock.calls[0];
    const env = call[2].env;
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(env.CLAUDE_CODE_OAUTH_TOKEN).toBe('ok-token');
  });
});
