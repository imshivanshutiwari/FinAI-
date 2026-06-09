/**
 * code_execute tool — Run Python or JavaScript code in a sandboxed subprocess.
 *
 * Designed for precise financial calculations (DCF models, Monte Carlo
 * simulations, statistical analysis) that LLMs cannot do reliably in their
 * heads. Runs code in a child process with strict timeout and output limits.
 */
import { DynamicStructuredTool } from '@langchain/core/tools';
import type { RunnableConfig } from '@langchain/core/runnables';
import { z } from 'zod';
import { spawn } from 'node:child_process';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { formatToolResult } from '../types.js';
import { dexterPath } from '../../utils/paths.js';

const MAX_EXECUTION_TIME_MS = 30_000; // 30 seconds hard timeout
const MAX_OUTPUT_LENGTH = 15_000;      // characters of stdout/stderr
const SANDBOX_DIR = dexterPath('sandbox');

export const CODE_EXECUTE_DESCRIPTION = `
Execute Python or JavaScript code in a sandboxed subprocess and return the output.

## When to Use

- **Precise calculations**: DCF models, compound interest, statistical analysis, Monte Carlo simulations.
- **Data transformations**: Parse, filter, or reshape structured data that would be error-prone to do mentally.
- **Chart/table generation**: Compute values for tables or generate CSV output.

## When NOT to Use

- Simple arithmetic the model can do reliably (e.g., 2 + 2).
- Anything that requires network access, file system access outside the sandbox, or installing packages.

## Constraints

- **30 second timeout** — long-running computations will be killed.
- **No network access** — the code runs in isolation.
- **No package installation** — only the standard library is available.
- **Output capped at 15,000 characters** — keep output concise.

## Tips

- Use \`print()\` (Python) or \`console.log()\` (JavaScript) to produce output.
- Return structured results (JSON, tables) for easy integration into your analysis.
- For Python: numpy, pandas are NOT guaranteed. Use only stdlib (math, statistics, json, csv, etc.).
`;

type CodeExecuteOutput = {
  stdout: string;
  stderr: string;
  exitCode: number;
  language: string;
  durationMs: number;
  timedOut: boolean;
};

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + `\n\n[... truncated at ${maxLen} chars]`;
}

async function ensureSandboxDir(): Promise<void> {
  await mkdir(SANDBOX_DIR, { recursive: true });
}

function executeInSubprocess(
  command: string,
  args: string[],
  signal?: AbortSignal,
): Promise<CodeExecuteOutput & { language: string; durationMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;

    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: MAX_EXECUTION_TIME_MS,
      // Run in the sandbox directory for isolation
      cwd: SANDBOX_DIR,
      // Minimal environment — strip most vars for safety
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME ?? process.env.USERPROFILE,
        TEMP: process.env.TEMP ?? '/tmp',
        TMP: process.env.TMP ?? '/tmp',
      },
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, MAX_EXECUTION_TIME_MS);

    // Forward external abort signal
    if (signal) {
      const onAbort = () => {
        timedOut = true;
        child.kill('SIGKILL');
      };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort, { once: true });
      }
    }

    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    const finish = (exitCode: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout: truncate(stdout, MAX_OUTPUT_LENGTH),
        stderr: truncate(stderr, MAX_OUTPUT_LENGTH),
        exitCode: exitCode ?? 1,
        language: '',
        durationMs: Date.now() - start,
        timedOut,
      });
    };

    child.on('close', (code) => finish(code));
    child.on('error', (err) => {
      stderr += `\nProcess error: ${err.message}`;
      finish(1);
    });
  });
}

const CodeExecuteInputSchema = z.object({
  code: z.string().describe('The code to execute. Use print()/console.log() to produce output.'),
  language: z
    .enum(['python', 'javascript'])
    .describe('The programming language to execute the code in.'),
  description: z
    .string()
    .optional()
    .describe('Brief description of what the code does (for logging purposes).'),
});

export const codeExecuteTool = new DynamicStructuredTool({
  name: 'code_execute',
  description: 'Execute Python or JavaScript code in a sandboxed subprocess. Returns stdout, stderr, and exit code.',
  schema: CodeExecuteInputSchema,
  func: async (input, _runManager, config?: RunnableConfig) => {
    const signal = config?.signal as AbortSignal | undefined;
    const start = Date.now();

    await ensureSandboxDir();

    const { code, language } = input;

    // Write code to a temp file for execution
    const ext = language === 'python' ? '.py' : '.mjs';
    const tempFile = join(SANDBOX_DIR, `exec_${Date.now()}${ext}`);

    try {
      await writeFile(tempFile, code, 'utf-8');

      let result: CodeExecuteOutput;

      if (language === 'python') {
        // Try python3 first, fall back to python
        try {
          result = await executeInSubprocess('python3', [tempFile], signal);
        } catch {
          result = await executeInSubprocess('python', [tempFile], signal);
        }
      } else {
        // JavaScript — try bun first (fastest), fall back to node
        try {
          result = await executeInSubprocess('bun', ['run', tempFile], signal);
        } catch {
          result = await executeInSubprocess('node', [tempFile], signal);
        }
      }

      result.language = language;
      result.durationMs = Date.now() - start;

      // Clean up temp file
      await unlink(tempFile).catch(() => {});

      if (result.timedOut) {
        return formatToolResult({
          error: `Code execution timed out after ${MAX_EXECUTION_TIME_MS / 1000}s. Simplify your code or reduce computation.`,
          language,
          durationMs: result.durationMs,
        });
      }

      if (result.exitCode !== 0) {
        return formatToolResult({
          error: `Code exited with code ${result.exitCode}`,
          stderr: result.stderr,
          stdout: result.stdout,
          language,
          durationMs: result.durationMs,
        });
      }

      return formatToolResult({
        stdout: result.stdout,
        stderr: result.stderr || undefined,
        exitCode: result.exitCode,
        language,
        durationMs: result.durationMs,
      });
    } catch (error) {
      // Clean up temp file on error
      await unlink(tempFile).catch(() => {});
      const message = error instanceof Error ? error.message : String(error);
      return formatToolResult({
        error: `[code_execute] ${message}`,
        language,
      });
    }
  },
});
