import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { callLlm } from '../src/model/llm.js';
import { getModelDisplayName } from '../src/utils/model.js';

// ANSI escape codes for beautiful styling
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

const MODELS_TO_COMPARE = [
  'nvidia:qwen/qwen3.5-397b-a17b',
  'nvidia:meta/llama-3.3-70b-instruct',
  'nvidia:meta/llama-3.1-70b-instruct',
  'nvidia:deepseek-ai/deepseek-v4-pro',
  'nvidia:mistralai/mistral-large-3-675b-instruct-2512',
  'nvidia:google/gemma-4-31b-it',
  'nvidia:nvidia/llama-3.3-nemotron-super-49b-v1.5',
];

interface ModelResult {
  modelId: string;
  displayName: string;
  response: string;
  latencyMs: number;
  wordCount: number;
  charCount: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  error?: string;
}

async function main() {
  const args = process.argv.slice(2);
  let prompt = args.join(' ');

  if (!prompt) {
    prompt = 'Analyze the key factors driving NVIDIA (NVDA) stock performance in the current market environment and evaluate its long-term growth prospects.';
  }

  console.log(`\n${colors.bright}${colors.cyan}═════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   FinAI Model Comparison CLI Utility${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`\n${colors.bright}Prompt:${colors.reset} "${colors.yellow}${prompt}${colors.reset}"`);
  console.log(`${colors.dim}Running ${MODELS_TO_COMPARE.length} models in parallel...${colors.reset}\n`);

  const startTimeAll = Date.now();

  const runPromises = MODELS_TO_COMPARE.map(async (modelId): Promise<ModelResult> => {
    const displayName = getModelDisplayName(modelId);
    console.log(`[${colors.blue}START${colors.reset}] ${colors.bright}${displayName}${colors.reset} is starting...`);
    const start = Date.now();
    try {
      const result = await callLlm(prompt, { model: modelId });
      const latencyMs = Date.now() - start;
      const text = typeof result.response === 'string' ? result.response : JSON.stringify(result.response);
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      
      console.log(`[${colors.green}SUCCESS${colors.reset}] ${colors.bright}${displayName}${colors.reset} finished in ${colors.green}${(latencyMs / 1000).toFixed(2)}s${colors.reset}`);
      
      return {
        modelId,
        displayName,
        response: text,
        latencyMs,
        wordCount: words,
        charCount: text.length,
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
        totalTokens: result.usage?.totalTokens,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.log(`[${colors.red}FAILED${colors.reset}] ${colors.bright}${displayName}${colors.reset} failed after ${colors.red}${(latencyMs / 1000).toFixed(2)}s${colors.reset}: ${colors.dim}${errorMsg}${colors.reset}`);
      return {
        modelId,
        displayName,
        response: '',
        latencyMs,
        wordCount: 0,
        charCount: 0,
        error: errorMsg,
      };
    }
  });

  const results = await Promise.all(runPromises);
  const totalDuration = Date.now() - startTimeAll;

  // Print Summary Table to CLI
  console.log(`\n\n${colors.bright}${colors.cyan}═════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   Comparison Summary Table (Total Time: ${(totalDuration / 1000).toFixed(2)}s)${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═════════════════════════════════════════════════════════════════════════${colors.reset}`);

  // Table header
  console.log(
    ` ${colors.bright}${'Model Name'.padEnd(30)} | ${'Status'.padEnd(10)} | ${'Time (s)'.padEnd(10)} | ${'Words'.padEnd(8)} | ${'Tokens (I/O/T)'}${colors.reset}`
  );
  console.log(`-`.repeat(85));

  for (const r of results) {
    const status = r.error ? `${colors.red}Failed${colors.reset}` : `${colors.green}Success${colors.reset}`;
    const timeStr = (r.latencyMs / 1000).toFixed(2) + 's';
    const tokenStr = r.error ? 'N/A' : `${r.inputTokens ?? '?'}/${r.outputTokens ?? '?'}/${r.totalTokens ?? '?'}`;
    console.log(
      ` ${r.displayName.padEnd(30)} | ${status.padEnd(20)} | ${timeStr.padEnd(10)} | ${String(r.wordCount).padEnd(8)} | ${tokenStr}`
    );
  }
  console.log(`-`.repeat(85));

  // Write MD report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `model_comparison_${timestamp}.md`);
  let mdContent = `# FinAI Model Comparison Report
**Date:** ${new Date().toLocaleString()}
**Prompt:** \`${prompt}\`
**Total Parallel Time:** ${(totalDuration / 1000).toFixed(2)} seconds

## Performance Summary Table

| Model Name | Status | Latency (s) | Word Count | Input Tokens | Output Tokens | Total Tokens |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  for (const r of results) {
    const status = r.error ? '❌ Failed' : '✅ Success';
    const latency = (r.latencyMs / 1000).toFixed(2);
    mdContent += `| **${r.displayName}** | ${status} | ${latency}s | ${r.wordCount} | ${r.inputTokens ?? 'N/A'} | ${r.outputTokens ?? 'N/A'} | ${r.totalTokens ?? 'N/A'} |\n`;
  }

  mdContent += `\n---\n\n## Side-by-Side Model Responses\n\n`;

  for (const r of results) {
    mdContent += `### 🤖 ${r.displayName}\n`;
    if (r.error) {
      mdContent += `> ❌ **Error during run:**\n> \`\`\`\n> ${r.error}\n> \`\`\`\n\n`;
    } else {
      mdContent += `**Stats:** Latency: \`${(r.latencyMs / 1000).toFixed(2)}s\`, Words: \`${r.wordCount}\`, Tokens: \`Input: ${r.inputTokens ?? 'N/A'} | Output: ${r.outputTokens ?? 'N/A'} | Total: ${r.totalTokens ?? 'N/A'}\`\n\n`;
      mdContent += `#### Response:\n${r.response.trim()}\n\n`;
    }
    mdContent += `* * *\n\n`;
  }

  fs.writeFileSync(reportPath, mdContent, 'utf-8');
  console.log(`\n${colors.bright}${colors.green}✔ Detailed comparison report saved to:${colors.reset} ${colors.dim}${reportPath}${colors.reset}\n`);
}

main().catch((err) => {
  console.error(`${colors.red}Fatal Error in Comparison Runner:${colors.reset}`, err);
});
