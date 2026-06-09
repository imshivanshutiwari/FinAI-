# SPEC: Project Rebranding to FinAI

**Status: FINALIZED**

## Objective
Rebrand the "Dexter" financial research agent codebase to "FinAI" across all user-facing names, package names, configuration directories, ASCII logos, and documentation.

## Requirements
1. **Package Configuration**: Update `package.json` to rename the project to `finai` (cli name: `finai`).
2. **Settings and Caching Directory**: Change the configuration directory from `.dexter` to `.finai` in path utilities (`src/utils/paths.ts`) and migration helpers.
3. **CLI Brand Elements**:
   - Update `src/components/intro.ts` to show "FinAI" instead of "Dexter".
   - Generate and replace the ASCII banner logo with "FinAI".
   - Update descriptions and display names.
4. **Documentation**: Rename "Dexter" to "FinAI" in all documentation (`README.md`, `SOUL.md`, `AGENTS.md`).
5. **Code References**: Rename internal code instances of "dexter" (variables, comments, prompts) where appropriate, ensuring backward compatibility for existing settings.

## Constraints
- Do not break existing API credentials or command-line execution.
- Maintain existing settings file compatibility (migrate from `.dexter/settings.json` to `.finai/settings.json` if possible, or support the new path smoothly).
- Ensure all tool registry references are unchanged unless they specifically expose the old brand name to the LLM.
