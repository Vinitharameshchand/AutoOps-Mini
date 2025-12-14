# AutoOps Mini - System Workflow

This document outlines the autonomous workflow of the AutoOps Mini system.

## High-Level Architecture

AutoOps Mini operates on a continuous loop (or triggered via API) consisting of four specialized AI agents:

1.  **Ingestion Agent** (`metricsAgent.js`)
2.  **Summary Agent** (`summaryAgent.js`)
3.  **Decision Agent** (`decisionAgent.js`)
4.  **Execution Agent** (`executionAgent.js`)

## Detailed Workflow Steps

### 1. Metrics Ingestion
- **Source**: The system fetches metrics from the configured source.
    - **Mock Data (Demo Mode)**: Returns a simulated high-latency scenario to demonstrate auto-healing.
    - **Monitoring Integrations**: Fetches real data from Prometheus, Datadog, or Webhooks if configured.
    - **System Info**: Fallback to local machine stats (CPU, RAM, Processes).
- **Data**: Returns a standard JSON object containing critical KPIs (e.g., `latency_ms`, `error_rate`, `cpu_load`).

### 2. Situational Analysis (Summary Agent)
- **Input**: Raw JSON metrics.
- **Process**:
    - Checks internal **Cache** to avoid redundant LLM calls.
    - If no cache, sends metrics to **Llama-3** or **GPT-4o**.
    - If no API keys are present, uses a rule-based **fallback engine**.
- **Output**: A concise, plain-English summary of the system state (e.g., *"Critical latency spike detected correlating with increased error rates."*).

### 3. Decision Reasoning (Decision Agent)
- **Input**: Metrics + Summary.
- **Process**:
    - The AI evaluates the situation against a set of valid actions: `fix_code`, `rollback`, `optimize_performance`, `scale_up`, `restart_service`.
    - It reasons about trade-offs (e.g., *"Rollback is too aggressive, let's try optimization first."*).
- **Output**: A JSON decision object containing:
    - `decision`: The selected action key.
    - `reason`: The justification for the choice.

### 4. Autonomous Execution (Execution Agent)
- **Input**: Decision object.
- **Process**:
    - Based on the decision, it executes the remediation strategy.
    - **`optimize_performance` / `fix_code`**: Simulates applying a patch and logs the action to `public/system-status.txt`.
    - **`rollback`**: Simulates a deployment rollback sequence.
    - **Dry Run**: If enabled, logs what *would* happen without changes.
- **Output**: An action log detailing the steps taken and part of the final API response.

## API Endpoint
The entire flow is triggered via a single POST endpoint:
`POST /api/run-flow`

Response Example:
```json
{
  "metrics": { ... },
  "summary": "...",
  "decision": { ... },
  "actionResult": { ... },
  "executionTime": "1200ms"
}
```

## Configuration
All behavior is controlled via `config.js`, including:
- LLM Provider (OpenAI/Together)
- Mock Data Toggle
- Monitoring Source
- Dry Run Mode
