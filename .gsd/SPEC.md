# SPEC: Integrating NVIDIA NIM Provider

**Status: FINALIZED**

## Objective
Integrate the NVIDIA NIM API (build.nvidia.com) as a first-class model provider in FinAI, allowing the user to select and run financial research queries using NVIDIA-hosted models.

## Requirements
1. **Provider Definition**:
   - Add a new provider entry for `nvidia` in `src/providers.ts`.
   - Display name: `NVIDIA`.
   - API Key environment variable: `NVIDIA_API_KEY`.
   - Default context window: `128,000` tokens.
   - Fast model variant: `meta/llama-3.1-8b-instruct`.
   - Model prefix: `nvidia:`.

2. **Model Registry**:
   - Add a comprehensive list of NVIDIA NIM models in `PROVIDER_MODELS` in `src/utils/model.ts`.
   - The list should include:
     - **Qwen**: `qwen/qwen3.5-397b-a17b`, `qwen/qwen2.5-72b-instruct`
     - **Meta Llama**: `meta/llama-3.1-405b-instruct`, `meta/llama-3.1-70b-instruct`, `meta/llama-3.1-8b-instruct`, `meta/llama-3.3-70b-instruct`
     - **Mistral**: `mistralai/mistral-large-2-instruct`, `mistralai/mixtral-8x22b-instruct-v0.1`
     - **Microsoft**: `microsoft/phi-3-medium-128k-instruct`
     - **Google**: `google/gemma-2-27b-it`, `google/gemma-2-9b-it`
     - **DeepSeek**: `deepseek-ai/deepseek-r1`, `deepseek-ai/deepseek-v3`
     - **NVIDIA**: `nvidia/llama-3.1-nemotron-70b-instruct`, `nvidia/nemotron-4-340b-instruct`

3. **LLM Factory & Routing**:
   - Add a factory for the `nvidia` provider in `MODEL_FACTORIES` in `src/model/llm.ts`.
   - Base URL for the NVIDIA endpoint: `https://integrate.api.nvidia.com/v1`.
   - The factory should extract `NVIDIA_API_KEY` from the environment.
   - Ensure `resolveProvider` routes models starting with `nvidia:` to the `nvidia` provider definition.

4. **Environment & UI Configuration**:
   - Update `src/utils/env.ts` to support checking, saving, and getting display names for `NVIDIA_API_KEY`.
   - Update `env.example` to document `NVIDIA_API_KEY`.
   - Add `NVIDIA_API_KEY` to local `.env`.

## Verification Plan
1. Compile and typecheck the codebase (`npm run build` or typecheck compiler).
2. Start the interactive CLI, select the `NVIDIA` provider, choose `qwen/qwen3.5-397b-a17b`, and run a test query to verify integration works.
