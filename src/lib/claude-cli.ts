import { spawn } from 'child_process';

export interface RunClaudeOptions {
  timeoutMs: number;
  maxBufferBytes?: number;
}

export async function runClaude(
  prompt: string,
  { timeoutMs, maxBufferBytes = 1_048_576 }: RunClaudeOptions,
): Promise<string> {
  const { ANTHROPIC_API_KEY: _drop, ...safeEnv } = process.env;
  void _drop;
  const env = {
    ...safeEnv,
    CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN ?? '',
  };

  const child = spawn('claude', ['-p', '-'], { env });

  return new Promise<string>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let stdoutBytes = 0;
    let settled = false;

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      settle(() => {
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 2000).unref();
        reject(new Error(`claude CLI timed out after ${timeoutMs}ms`));
      });
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > maxBufferBytes) {
        settle(() => {
          child.kill('SIGTERM');
          reject(new Error(`claude CLI stdout exceeded buffer (${maxBufferBytes} bytes)`));
        });
        return;
      }
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', (err) => {
      settle(() => reject(err));
    });

    child.on('close', (code) => {
      settle(() => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(`claude CLI exit code ${code}: ${stderr.trim()}`));
      });
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}
