# FinAI 🤖

FinAI is an autonomous financial research agent that thinks, plans, and learns as it works. It performs deep analysis using task planning, self-reflection, and real-time market data. Think Claude Code, but built specifically for financial research.

## 👋 Overview

FinAI takes complex financial queries and turns them into clear, step-by-step research plans. It executes tasks using live institutional-grade market data, checks its own work, and refines the results until it has a confident, data-backed answer.  

**Key Capabilities:**
- **Intelligent Task Planning**: Automatically decomposes complex queries into structured research steps.
- **Autonomous Execution**: Selects and executes the right tools to gather financial data.
- **Self-Validation**: Checks its own work and iterates until tasks are complete.
- **Real-Time Financial Data**: Access to income statements, balance sheets, and cash flow statements.
- **Safety Features**: Built-in loop detection and step limits to prevent runaway execution.

---

## ✅ Prerequisites

- **Node.js** (v20 or higher)
- **OpenAI API Key** (get [here](https://platform.openai.com/api-keys))
- **Financial Datasets API Key** (get [here](https://financialdatasets.ai))
- **Exa API Key** (get [here](https://exa.ai)) - optional, for web search

---

## 💻 Installation

1. Clone your repository:
```bash
git clone https://github.com/imshivanshutiwari/FinAI-.git
cd FinAI-
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
# Copy the example environment file
cp env.example .env
```

Open `.env` and fill in your credentials:
```env
OPENAI_API_KEY=your-openai-api-key
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key
EXASEARCH_API_KEY=your-exa-api-key
```

---

## 🚀 How to Run

Run FinAI in interactive mode:
```bash
npm start
```

Or run with watch mode for development:
```bash
npm run dev
```

---

## 📊 Evaluation Suite

FinAI includes an evaluation suite that tests the agent against a dataset of financial questions. Evals use LangSmith for tracking and an LLM-as-judge approach for scoring correctness.

**Run on all questions:**
```bash
npm run typecheck
npm run test
```

---

## 🐛 Debugging & Scratchpad

FinAI logs all tool calls to a scratchpad file for debugging and history tracking. Each query creates a new JSONL file in `.finai/scratchpad/`.

Each file tracks:
- **init**: The original query
- **tool_result**: Each tool call with arguments, raw result, and LLM summary
- **thinking**: Agent reasoning steps

This makes it easy to inspect exactly what data the agent gathered and how it interpreted results.

---

## 📄 License

This project is licensed under the MIT License.
