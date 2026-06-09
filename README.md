# FinAI 🤖

FinAI is an autonomous financial research agent that thinks, plans, and learns as it works. It performs analysis using task planning, self-reflection, and real-time market data. Think Claude Code, but built specifically for financial research.

<img width="665" height="452" alt="Screenshot 2026-04-02 at 4 16 57 PM" src="https://github.com/user-attachments/assets/02418111-5f48-4a66-be5d-dc9bf9806284" />

## Table of Contents

- [👋 Overview](#-overview)
- [✅ Prerequisites](#-prerequisites)
- [💻 How to Install](#-how-to-install)
- [🚀 How to Run](#-how-to-run)
- [📊 How to Evaluate](#-how-to-evaluate)
- [🐛 How to Debug](#-how-to-debug)
- [🤝 How to Contribute](#-how-to-contribute)
- [📄 License](#-license)

## ⚠️ Disclaimer

This project is for **educational, entertainment, and informational purposes only**. It is not intended for real trading or investment.

- Not financial, investment, tax, or legal advice
- No guarantees of accuracy, completeness, or fitness for any purpose
- Outputs may be incorrect, incomplete, or out of date
- Creator and contributors assume no liability for any financial losses or damages
- Consult a licensed financial advisor before making investment decisions
- Past performance does not indicate future results

By using this software, you agree to use it solely for learning and informational purposes and accept all risks associated with its use.

## 👋 Overview

FinAI takes complex financial questions and turns them into clear, step-by-step research plans. It runs those tasks using live market data, checks its own work, and refines the results until it has a confident, data-backed answer.  

**Key Capabilities:**
- **Intelligent Task Planning**: Automatically decomposes complex queries into structured research steps
- **Autonomous Execution**: Selects and executes the right tools to gather financial data
- **Self-Validation**: Checks its own work and iterates until tasks are complete
- **Real-Time Financial Data**: Access to income statements, balance sheets, and cash flow statements
- **Safety Features**: Built-in loop detection and step limits to prevent runaway execution

## ✅ Prerequisites

- Node.js (v20 or higher)
- OpenAI API key (get [here](https://platform.openai.com/api-keys))
- Financial Datasets API key (get [here](https://financialdatasets.ai))
- Exa API key (get [here](https://exa.ai)) - optional, for web search

## 💻 How to Install

1. Clone the repository:
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

Open `.env` and configure your API keys:
```env
OPENAI_API_KEY=your-openai-api-key
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key
EXASEARCH_API_KEY=your-exa-api-key
```

## 🚀 How to Run

Run FinAI in interactive mode:
```bash
npm start
```

Or with watch mode for development:
```bash
npm run dev
```

## 📊 How to Evaluate

FinAI includes an evaluation suite that tests the agent against a dataset of financial questions. Evals use LangSmith for tracking and an LLM-as-judge approach for scoring correctness.

**Run on all questions:**
```bash
npm run typecheck
npm run test
```

The eval runner displays a real-time UI showing progress, current question, and running accuracy statistics. Results are logged to LangSmith for analysis.

## 🐛 How to Debug

FinAI logs all tool calls to a scratchpad file for debugging and history tracking. Each query creates a new JSONL file in `.finai/scratchpad/`.

**Scratchpad location:**
```
.finai/scratchpad/
├── 2026-01-30-111400_9a8f10723f79.jsonl
└── ...
```

Each file contains newline-delimited JSON entries tracking:
- **init**: The original query
- **tool_result**: Each tool call with arguments, raw result, and LLM summary
- **thinking**: Agent reasoning steps

This makes it easy to inspect exactly what data the agent gathered and how it interpreted results.

## 🤝 How to Contribute

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

**Important**: Please keep your pull requests small and focused.  This will make it easier to review and merge.

## 📄 License

This project is licensed under the MIT License.
