/**
 * Plan Evaluator — Tree of Thoughts (ToT) lite implementation.
 *
 * Instead of a single ReAct step (think → act), this module generates multiple
 * candidate strategies, scores each one, and picks the optimal path before
 * executing. This is a practical approximation of Monte Carlo Tree Search
 * adapted for LLM agent loops.
 *
 * The evaluator is triggered when the agent faces a complex, multi-step
 * research question. Simple queries bypass evaluation entirely.
 *
 * Reference: Yao et al., "Tree of Thoughts: Deliberate Problem Solving
 * with Large Language Models" (2023)
 */
import { z } from 'zod';
import { callLlm } from '../model/llm.js';
import { logger } from '../utils/index.js';

const NUM_CANDIDATE_PLANS = 3;

/** A single candidate strategy with its self-evaluated score. */
export interface CandidatePlan {
  /** Short title for the strategy (e.g., "Bottom-up financial analysis") */
  title: string;
  /** Detailed step-by-step plan */
  steps: string[];
  /** Which tools to use in what order */
  toolSequence: string[];
  /** Self-evaluated score from 1-10 with reasoning */
  score: number;
  /** Why this score was assigned */
  scoreReasoning: string;
}

/** Result of plan evaluation. */
export interface PlanEvaluationResult {
  /** The chosen best plan */
  bestPlan: CandidatePlan;
  /** All candidate plans (for debugging/transparency) */
  allPlans: CandidatePlan[];
  /** Whether evaluation was skipped (simple query) */
  skipped: boolean;
  /** Reason for skipping, if applicable */
  skipReason?: string;
}

const PlanSchema = z.object({
  plans: z.array(
    z.object({
      title: z.string(),
      steps: z.array(z.string()),
      toolSequence: z.array(z.string()),
      score: z.number().min(1).max(10),
      scoreReasoning: z.string(),
    }),
  ),
});

/**
 * Heuristic to determine if a query is complex enough to warrant
 * multi-plan evaluation. Simple queries skip the evaluator entirely
 * to avoid latency overhead.
 */
export function isComplexQuery(query: string): boolean {
  const wordCount = query.split(/\s+/).length;

  // Short queries are almost never complex enough for ToT
  if (wordCount < 10) return false;

  // Check for complexity signals
  const complexitySignals = [
    /compar/i,        // compare, comparison
    /analyz/i,        // analyze, analysis
    /evaluat/i,       // evaluate, evaluation
    /research/i,      // research
    /deep dive/i,     // deep dive
    /comprehensive/i, // comprehensive
    /multiple/i,      // multiple companies, multiple metrics
    /vs\.?|versus/i,  // A vs B comparisons
    /pros?\s+and\s+cons?/i, // pros and cons
    /should\s+i/i,    // decision-making questions
    /which\s+is\s+better/i,
    /investment\s+thesis/i,
    /due\s+diligence/i,
    /dcf|discounted\s+cash/i,
    /monte\s+carlo/i,
    /risk\s+assess/i,
    /valuation/i,
    /portfolio/i,
  ];

  const signalCount = complexitySignals.filter((re) => re.test(query)).length;

  // Need at least 2 complexity signals OR 1 signal + long query
  return signalCount >= 2 || (signalCount >= 1 && wordCount >= 25);
}

const PLAN_GENERATION_PROMPT = `You are a strategic planning module for a financial research AI agent. Given the user's research question, generate exactly ${NUM_CANDIDATE_PLANS} DIFFERENT strategies to answer it.

For each strategy:
1. Give it a short descriptive title
2. List the concrete steps (3-8 steps each)
3. List which tools to use and in what order
4. Score the strategy from 1-10 based on:
   - Thoroughness: Does it cover all aspects of the question?
   - Efficiency: Does it minimize redundant tool calls?
   - Reliability: Will it produce accurate, evidence-based conclusions?
   - Depth: Does it go beyond surface-level analysis?
5. Explain why you gave that score

Available tools: get_financials, get_market_data, read_filings, stock_screener, web_search, x_search, web_fetch, code_execute, analyze_image, spawn_subagent, memory_search

IMPORTANT: Make the strategies genuinely different approaches, not slight variations of the same plan. Think about different angles of analysis (top-down vs bottom-up, quantitative vs qualitative, historical vs forward-looking).

Return your response as valid JSON matching this schema:
{
  "plans": [
    {
      "title": "Strategy name",
      "steps": ["Step 1", "Step 2", ...],
      "toolSequence": ["tool1", "tool2", ...],
      "score": 8,
      "scoreReasoning": "Why this score"
    }
  ]
}`;

/**
 * Generate and evaluate multiple candidate strategies for a complex query.
 * Returns the highest-scored plan.
 */
export async function evaluatePlans(params: {
  query: string;
  model: string;
  signal?: AbortSignal;
}): Promise<PlanEvaluationResult> {
  // Skip for simple queries
  if (!isComplexQuery(params.query)) {
    return {
      bestPlan: {
        title: 'Direct execution',
        steps: ['Execute query directly using available tools'],
        toolSequence: [],
        score: 10,
        scoreReasoning: 'Simple query — direct execution is optimal.',
      },
      allPlans: [],
      skipped: true,
      skipReason: 'Query is not complex enough to warrant multi-plan evaluation.',
    };
  }

  try {
    const result = await callLlm(
      `Research question: ${params.query}`,
      {
        model: params.model,
        systemPrompt: PLAN_GENERATION_PROMPT,
        outputSchema: PlanSchema,
        signal: params.signal,
      },
    );

    const parsed = result.response as unknown as z.infer<typeof PlanSchema>;

    if (!parsed?.plans || parsed.plans.length === 0) {
      logger.warn('[PlanEvaluator] No plans generated, falling back to direct execution.');
      return {
        bestPlan: {
          title: 'Direct execution (fallback)',
          steps: ['Execute query directly'],
          toolSequence: [],
          score: 7,
          scoreReasoning: 'Plan generation returned no results.',
        },
        allPlans: [],
        skipped: true,
        skipReason: 'Plan generation failed.',
      };
    }

    const plans: CandidatePlan[] = parsed.plans;

    // Sort by score descending, pick the best
    const sorted = [...plans].sort((a, b) => b.score - a.score);
    const bestPlan = sorted[0]!;

    logger.info(
      `[PlanEvaluator] Evaluated ${plans.length} strategies. Best: "${bestPlan.title}" (score: ${bestPlan.score}/10)`,
    );

    return {
      bestPlan,
      allPlans: plans,
      skipped: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[PlanEvaluator] Error: ${message}. Falling back to direct execution.`);

    return {
      bestPlan: {
        title: 'Direct execution (error fallback)',
        steps: ['Execute query directly'],
        toolSequence: [],
        score: 7,
        scoreReasoning: `Plan evaluation error: ${message}`,
      },
      allPlans: [],
      skipped: true,
      skipReason: `Plan evaluation error: ${message}`,
    };
  }
}
