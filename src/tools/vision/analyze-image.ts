/**
 * analyze_image tool — Send images to a vision-capable LLM for analysis.
 *
 * Designed for parsing charts, tables, graphs, and visual data from financial
 * documents (earnings reports, analyst presentations, SEC filings with embedded
 * visuals). Supports both local file paths and URLs.
 */
import { DynamicStructuredTool } from '@langchain/core/tools';
import type { RunnableConfig } from '@langchain/core/runnables';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { HumanMessage } from '@langchain/core/messages';
import { formatToolResult } from '../types.js';
import { callLlm } from '../../model/llm.js';
import { resolveProvider } from '../../providers.js';

export const ANALYZE_IMAGE_DESCRIPTION = `
Analyze an image using a vision-capable AI model.

## When to Use

- **Financial charts**: Bar charts, line graphs, candlestick charts from earnings reports or analyst presentations.
- **Data tables in images**: Tables embedded in PDFs or screenshots that cannot be parsed as text.
- **Screenshots**: Analyze web page screenshots, trading platform views, or dashboards.
- **Diagrams**: Organizational charts, process flows, financial model diagrams.

## When NOT to Use

- Text-only content that can be fetched with web_fetch or read_file.
- When the content is already available as structured data via get_financials or get_market_data.

## Input

Provide either:
- A local file path to an image (PNG, JPG, JPEG, GIF, WebP)
- A URL pointing to an image

Plus a prompt describing what to analyze or extract from the image.

## Output

Returns the vision model's analysis as structured text. For tables, it attempts
to return markdown-formatted tables. For charts, it describes trends, values,
and key data points.
`;

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
};

/**
 * Vision-capable models by provider. Used to select the right model for
 * image analysis regardless of what the user's primary model is.
 */
const VISION_MODELS: Record<string, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  google: 'gemini-2.5-flash',
};

function getVisionModel(primaryModel: string): string {
  const provider = resolveProvider(primaryModel);
  return VISION_MODELS[provider.id] ?? VISION_MODELS.openai ?? 'gpt-4o';
}

async function loadImageAsBase64(filePath: string): Promise<{ base64: string; mimeType: string }> {
  const ext = extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    throw new Error(`Unsupported image format: ${ext}. Supported: ${Object.keys(MIME_TYPES).join(', ')}`);
  }

  const buffer = await readFile(filePath);
  const base64 = buffer.toString('base64');
  return { base64, mimeType };
}

function isUrl(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://');
}

const AnalyzeImageInputSchema = z.object({
  image: z
    .string()
    .describe('Path to a local image file OR a URL to an image. Supported formats: PNG, JPG, GIF, WebP.'),
  prompt: z
    .string()
    .describe(
      'What to analyze or extract from the image. Be specific: "Extract all data from this table as markdown" or "Describe the trend shown in this chart with specific values".',
    ),
});

const VISION_SYSTEM_PROMPT = `You are a financial document vision analyst. Your job is to extract precise, structured information from images of financial documents, charts, tables, and graphs.

Rules:
- For TABLES: Extract all data and format as a markdown table. Include all rows and columns.
- For CHARTS: Identify the chart type, describe trends, note specific values at key data points, and identify axes labels.
- For DIAGRAMS: Describe the structure, relationships, and any text labels.
- Always be PRECISE with numbers. Do not round or approximate unless the image is too blurry to read.
- If you cannot read something clearly, say so explicitly rather than guessing.
- Return structured data (markdown tables, JSON) whenever possible.`;

export function createAnalyzeImage(model: string): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'analyze_image',
    description: 'Analyze an image (chart, table, screenshot) using a vision-capable AI model.',
    schema: AnalyzeImageInputSchema,
    func: async (input, _runManager, config?: RunnableConfig) => {
      const start = Date.now();
      const signal = config?.signal as AbortSignal | undefined;

      try {
        const { image, prompt } = input;
        const visionModel = getVisionModel(model);

        // Build the multimodal message content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contentParts: any[] = [
          { type: 'text', text: prompt },
        ];

        if (isUrl(image)) {
          // URL-based image
          contentParts.push({
            type: 'image_url',
            image_url: { url: image, detail: 'high' },
          });
        } else {
          // Local file — read and encode as base64
          const { base64, mimeType } = await loadImageAsBase64(image);
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: 'high',
            },
          });
        }

        const result = await callLlm(
          '', // prompt is embedded in the message content
          {
            model: visionModel,
            systemPrompt: VISION_SYSTEM_PROMPT,
            signal,
          },
        );

        // For vision, we need to use the raw LLM with multimodal message
        // The callLlm helper doesn't support multimodal yet, so we use
        // callLlmWithMessages-style approach via getChatModel directly
        const { getChatModel } = await import('../../model/llm.js');
        const llm = getChatModel(visionModel, false);

        const message = new HumanMessage({ content: contentParts });
        const response = await llm.invoke(
          [message],
          signal ? { signal } : undefined,
        );

        const answer = typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

        return formatToolResult({
          analysis: answer,
          model: visionModel,
          imageSource: isUrl(image) ? 'url' : 'file',
          durationMs: Date.now() - start,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return formatToolResult({
          error: `[analyze_image] ${message}`,
          durationMs: Date.now() - start,
        });
      }
    },
  });
}
