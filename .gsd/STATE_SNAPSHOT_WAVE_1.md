# Wave 1 Summary: NVIDIA NIM Integration

**Objective:** Integrate NVIDIA NIM (build.nvidia.com) as a supported provider, configure the user's custom Qwen model, write their API key to the environment, and run a test query.

**Changes:**
- Registered `nvidia` provider config with `modelPrefix: 'nvidia:'` and `apiKeyEnvVar: 'NVIDIA_API_KEY'` in `src/providers.ts`.
- Listed 14 NVIDIA models (including `nvidia:qwen/qwen3.5-397b-a17b`) in `PROVIDER_MODELS` in `src/utils/model.ts`.
- Normalized model displays by updating `getModelDisplayName` in `src/utils/model.ts` to recognize `nvidia:`.
- Configured a dedicated model factory for `nvidia` inside `MODEL_FACTORIES` in `src/model/llm.ts`, using OpenAI-compatible configuration pointing to `https://integrate.api.nvidia.com/v1`.
- Added the user's specific API key (`NVIDIA_API_KEY`) to the local `.env` and added it as a placeholder to `env.example`.

**Files Touched:**
- `src/providers.ts`
- `src/utils/model.ts`
- `src/model/llm.ts`
- `.env`
- `env.example`
- `.gsd/STATE.md`
- `.gsd/ROADMAP.md`

**Verification:**
- `npm run typecheck`: Compiled with code 0.
- Executed `npx tsx src/test_nvidia.ts` using `nvidia:qwen/qwen3.5-397b-a17b`:
  ```
  Testing NVIDIA NIM integration with Qwen...
  LLM Result:
  Hello! I'm FinAI, running on the FinAI provider. How can I assist you today?
  Tokens used: { inputTokens: 373, outputTokens: 22, totalTokens: 395 }
  ```

**Risks/Debt:**
- None. API keys are managed securely and routing handles stripping prefixes correctly.

**Next Wave TODO:**
- None. The feature is complete and fully functional.
