# Wave 2 Summary: Parallel Model Comparison

**Objective:** Implement a parallel testing utility to query all added NVIDIA models simultaneously, log performance (latency, token usage, word count), verify active model IDs via a live fetch from the `/v1/models` endpoint, and export results to markdown reports.

**Changes:**
- Created a robust parallel testing CLI tool `scripts/compare-models.ts` that hits registered NVIDIA models in parallel and displays comparative tables.
- Wrote a temporary model scanner script to fetch active models from the `/v1/models` endpoint and printed current IDs.
- Aligned registry in `src/utils/model.ts` and `scripts/compare-models.ts` to replace 404/non-existent model keys with active models (e.g. `gemma-4-31b-it`, `llama-3.3-nemotron-super-49b-v1.5`, `deepseek-v4-pro`, `mistral-large-3-675b-instruct-2512`).
- Saved markdown-formatted reports inside `reports/` showing latency tables and side-by-side responses.

**Files Touched:**
- `src/utils/model.ts`
- `scripts/compare-models.ts`
- `.gsd/STATE.md`
- `.gsd/ROADMAP.md`

**Verification:**
- Executed parallel evaluation with prompt: `"Suggest three tech stocks for AI hardware and compute in 2026."`
- All 7 active models succeeded, writing comparison data successfully to `reports/model_comparison_2026-06-09T20-20-31-059Z.md`.

**Risks/Debt:**
- None. Rate limits are handled gracefully and inactive models have been pruned from the default comparisons.
