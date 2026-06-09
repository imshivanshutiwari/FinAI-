# ROADMAP: Integrating NVIDIA NIM Provider

## Phase 1: Model Registry & Metadata
- [x] Add `nvidia` provider definition in `src/providers.ts`.
- [x] List all the 14 proposed models under `nvidia` provider in `src/utils/model.ts`.
- [x] Update `getModelDisplayName` in `src/utils/model.ts` to normalize the `nvidia:` prefix.

## Phase 2: LLM Factory & Integration
- [x] Add `nvidia` entry in `MODEL_FACTORIES` in `src/model/llm.ts`.
- [x] Set `baseURL` to `https://integrate.api.nvidia.com/v1` and use `NVIDIA_API_KEY`.
- [x] Ensure `nvidia:` prefix is stripped before sending the model name to the API.

## Phase 3: Environment Configuration
- [x] Add `NVIDIA_API_KEY` to `env.example`.

## Phase 4: Compilation & Verification
- [x] Typecheck/build the project to verify compilation (`npm run build` or typecheck compiler).
- [x] Launch `npm start`, test selecting the NVIDIA provider and one of the models, and verify it prompts for the key or runs successfully.

## Phase 5: Parallel Model Comparison Tool
- [x] Create a parallel comparison utility in `scripts/compare-models.ts`.
- [x] Test models against live NVIDIA API and correct the active model IDs registry.
- [x] Run parallel prompt execution successfully and output detailed markdown reports.
