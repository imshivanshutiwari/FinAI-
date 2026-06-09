# ROADMAP: Project Rebranding to FinAI

## Phase 1: Configuration & Workspace
- [x] Update `package.json` metadata (name, description, main bin script name).
- [x] Rename `.dexter` references to `.finai` in `src/utils/paths.ts`.
- [x] Implement seamless settings migration (if `.dexter` exists and `.finai` does not, copy settings over).

## Phase 2: CLI Interface & Prompts
- [x] Design and implement new ASCII banner logo for "FinAI" in `src/components/intro.ts`.
- [x] Update display messages, greeting text, and help descriptions in CLI files.
- [x] Review and update agent system prompts where the agent identifies as "Dexter" (`src/agent/prompts.ts`).

## Phase 3: Documentation & Verification
- [x] Rebrand `README.md`, `SOUL.md`, and `AGENTS.md` by replacing "Dexter" with "FinAI".
- [x] Verify clean compilation and successful local execution under the new project name.
