# AutoOps Mini 🚀

## What it does
**AutoOps Mini** is an autonomous AI operator that actively monitors your system, diagnoses issues using advanced LLMs (Llama-3/GPT-4o), and **autonomously executes fixes**. 

It’s not just a dashboard—it’s an engineer that never sleeps.

## Why it matters
Traditional dashboards only *show* you the problems. AutoOps **solves** them. 
In a world of microservices and complex distributed systems, human reaction time is the bottleneck. AutoOps removes that bottleneck.

## Agent Architecture
The system is composed of 4 specialized autonomous agents:

1.  **Metrics Ingestion Agent**: Continuously streams telemetry (Errors, Latency, KPIs).
2.  **Summary Agent**: Uses LLMs to translate complex JSON metrics into plain English situational analysis.
3.  **Decision Agent**: An autonomous reasoning engine that selects the optimal recovery strategy (e.g., `fix_code`, `rollback`, `scale_up`).
4.  **Execution Agent**: The "hands" of the system. It safely applies code fixes, modifies configurations, or triggers rollback workflows.

## Tech Stack
-   **Cline CLI**: For autonomous coding and file modifications.
-   **Kestra**: For reliable workflow orchestration and decision loops.
-   **Vercel**: For instant, global frontend deployment.
-   **Together AI / OpenAI**: Powering the cognitive decision-making capabilities.
-   **CodeRabbit**: Ensuring code quality and pull request reviews.
-   **Oumi**: Conceptual framework for agent evaluation.

## Demo Flow
1.  **Ingestion**: System detects critical latency spike (1800ms).
2.  **Analysis**: Summary Agent identifies the correlation with conversion drop.
3.  **Decision**: Decision Agent opts to `optimize_performance` rather than `rollback` to preserve new features.
4.  **Action**: Execution Agent autonomously patches the configuration file (`public/system-status.txt`) to apply the fix.
5.  **Result**: Dashboards update in real-time to show resolution.

## How to Run
1.  Clone the repo.
2.  `npm install`
3.  `npm run dev`
4.  Navigate to `http://localhost:3000`
5.  Click **Run AutoOps**.

---
*Built for the Future of Autonomous Systems.*
