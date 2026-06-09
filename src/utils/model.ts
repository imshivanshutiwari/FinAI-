import { PROVIDERS as PROVIDER_DEFS } from '@/providers';

export interface Model {
  id: string;
  displayName: string;
}

interface Provider {
  displayName: string;
  providerId: string;
  models: Model[];
}

const PROVIDER_MODELS: Record<string, Model[]> = {
  openai: [
    { id: 'gpt-5.5', displayName: 'GPT 5.5' },
    { id: 'gpt-5.4', displayName: 'GPT 5.4' },
    { id: 'openai/gpt-oss-120b', displayName: 'GPT OSS 120B (Nvidia)' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-6', displayName: 'Sonnet 4.6' },
    { id: 'claude-opus-4-8', displayName: 'Opus 4.8' },
  ],
  google: [
    { id: 'gemini-3.5-flash', displayName: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.1-pro', displayName: 'Gemini 3.1 Pro' },
    { id: 'gemini-3-flash-preview', displayName: 'Gemini 3.1 Flash Preview' },
    { id: 'gemini-3.1-pro-preview', displayName: 'Gemini 3.1 Pro Preview' },
  ],
  xai: [
    { id: 'grok-4-0709', displayName: 'Grok 4' },
    { id: 'grok-4-1-fast-reasoning', displayName: 'Grok 4.1 Fast Reasoning' },
  ],
  moonshot: [
    { id: 'kimi-k2-5', displayName: 'Kimi K2.5' },
    { id: 'moonshotai/kimi-k2.6', displayName: 'Kimi K2.6 (Nvidia)' },
  ],
  deepseek: [
    { id: 'deepseek-v4-pro', displayName: 'DeepSeek V4 Pro' },
    { id: 'deepseek-v4-flash', displayName: 'DeepSeek V4 Flash' },
    { id: 'deepseek-ai/deepseek-v4-flash', displayName: 'DeepSeek V4 Flash (Nvidia)' },
  ],
  nvidia: [
    { id: 'nvidia:qwen/qwen3.5-397b-a17b', displayName: 'Qwen 3.5 397B' },
    { id: 'nvidia:qwen/qwen2.5-72b-instruct', displayName: 'Qwen 2.5 72B Instruct' },
    { id: 'nvidia:meta/llama-3.1-405b-instruct', displayName: 'Llama 3.1 405B Instruct' },
    { id: 'nvidia:meta/llama-3.1-70b-instruct', displayName: 'Llama 3.1 70B Instruct' },
    { id: 'nvidia:meta/llama-3.1-8b-instruct', displayName: 'Llama 3.1 8B Instruct' },
    { id: 'nvidia:meta/llama-3.3-70b-instruct', displayName: 'Llama 3.3 70B Instruct' },
    { id: 'nvidia:mistralai/mistral-large-2-instruct', displayName: 'Mistral Large 2 Instruct' },
    { id: 'nvidia:mistralai/mixtral-8x22b-instruct-v0.1', displayName: 'Mixtral 8x22B Instruct' },
    { id: 'nvidia:microsoft/phi-3-medium-128k-instruct', displayName: 'Phi-3 Medium Instruct' },
    { id: 'nvidia:google/gemma-2-27b-it', displayName: 'Gemma 2 27B IT' },
    { id: 'nvidia:google/gemma-2-9b-it', displayName: 'Gemma 2 9B IT' },
    { id: 'nvidia:deepseek-ai/deepseek-r1', displayName: 'DeepSeek R1' },
    { id: 'nvidia:deepseek-ai/deepseek-v3', displayName: 'DeepSeek V3' },
    { id: 'nvidia:nvidia/llama-3.1-nemotron-70b-instruct', displayName: 'Llama 3.1 Nemotron 70B Instruct' },
    { id: 'nvidia:nvidia/nemotron-4-340b-instruct', displayName: 'Nemotron-4 340B Instruct' },
  ],
};

export const PROVIDERS: Provider[] = PROVIDER_DEFS.map((provider) => ({
  displayName: provider.displayName,
  providerId: provider.id,
  models: PROVIDER_MODELS[provider.id] ?? [],
}));

export function getModelsForProvider(providerId: string): Model[] {
  const provider = PROVIDERS.find((entry) => entry.providerId === providerId);
  return provider?.models ?? [];
}

export function getModelIdsForProvider(providerId: string): string[] {
  return getModelsForProvider(providerId).map((model) => model.id);
}

export function getDefaultModelForProvider(providerId: string): string | undefined {
  const models = getModelsForProvider(providerId);
  return models[0]?.id;
}

export function getModelDisplayName(modelId: string): string {
  const normalizedId = modelId.replace(/^(ollama|openrouter|nvidia):/, '');

  for (const provider of PROVIDERS) {
    const model = provider.models.find((entry) => entry.id === normalizedId || entry.id === modelId);
    if (model) {
      return model.displayName;
    }
  }

  return normalizedId;
}
