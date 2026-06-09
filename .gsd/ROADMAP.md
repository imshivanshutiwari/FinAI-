# ROADMAP: Project Rebranding to FinAI

## Phase 1: Configuration & Workspace
- [ ] Update `package.json` metadata (name, description, main bin script name).
- [ ] Rename `.dexter` references to `.finai` in `src/utils/paths.ts`.
- [ ] Implement seamless settings migration (if `.dexter` exists and `.finai` does not, copy settings over).

## Phase 2: CLI Interface & Prompts
- [ ] Design and implement new ASCII banner logo for "FinAI" in `src/components/intro.ts`.
- [ ] Update display messages, greeting text, and help descriptions in CLI files.
- [ ] Review and update agent system prompts where the agent identifies as "Dexter" (`src/agent/prompts.ts`).

## Phase 3: Documentation & Verification
- [ ] Rebrand `README.md`, `SOUL.md`, and `AGENTS.md` by replacing "Dexter" with "FinAI".
- [ ] Verify clean compilation and successful local execution under the new project name.
