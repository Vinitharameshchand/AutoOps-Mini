/**
 * Decision Agent
 * Responsibility: Decide the best next action based on the summary and metrics.
 */

import OpenAI from 'openai';
import { config, isLLMConfigured, getActiveLLMConfig } from '../config.js';
import { Cache } from '../utils/cache.js';

let openaiClient = null;

function getOpenAIClient() {
    if (!openaiClient && isLLMConfigured()) {
        const llmConfig = getActiveLLMConfig();
        openaiClient = new OpenAI({
            apiKey: llmConfig.apiKey,
            baseURL: config.llm.provider === 'together' ? llmConfig.baseURL : undefined,
        });
    }
    return openaiClient;
}

export async function decideAction(summary, metrics) {
    // 1. Check Cache First
    const cacheKey = Cache.generateKey('decision', { summary, metrics });
    const cachedDecision = Cache.get(cacheKey);

    if (cachedDecision) {
        if (config.system.debug) console.log('⚡ Using cached decision');
        return cachedDecision;
    }

    // Use fallback if no API key configured
    if (!isLLMConfigured()) {
        if (config.system.debug) {
            console.warn("No LLM API key found. Using fallback decision logic.");
        }
        return generateFallbackDecision(summary, metrics);
    }

    try {
        const client = getOpenAIClient();
        const llmConfig = getActiveLLMConfig();

        // Add timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Decision generation timeout')), config.agents.decision.timeout)
        );

        const decisionPromise = client.chat.completions.create({
            model: llmConfig.model,
            messages: [
                {
                    role: "system",
                    content: `You are a Senior DevOps Engineer. Based on the system status summary, choose exactly ONE action from: ${JSON.stringify(config.agents.decision.validActions)}.
          Return a JSON object with 'decision' and 'reason'.
          Example: {"decision": "fix_code", "reason": "Bug detected in login flow."}`
                },
                {
                    role: "user",
                    content: `Summary: ${summary}\nMetrics: ${JSON.stringify(metrics)}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const response = await Promise.race([decisionPromise, timeoutPromise]);
        const decision = JSON.parse(response.choices[0].message.content);

        // Validate decision
        if (!config.agents.decision.validActions.includes(decision.decision)) {
            throw new Error(`Invalid decision: ${decision.decision}`);
        }

        // 2. Save to Cache
        Cache.set(cacheKey, decision);

        return decision;

    } catch (error) {
        if (config.system.debug) {
            console.error("Decision Agent Error:", error.message);
        }

        // Use fallback on error
        if (config.agents.decision.fallbackEnabled) {
            return generateFallbackDecision(summary, metrics);
        }
        throw error;
    }
}

// Intelligent fallback decision based on metrics
function generateFallbackDecision(summary, metrics) {
    // High CPU usage suggests optimization needed
    if (metrics.cpu_load > 80) {
        return {
            decision: "scale_resources",
            reason: `Critical CPU load (${metrics.cpu_load}%) detected. Scaling up resources.`
        };
    }

    // High Memory usage suggests potential leaks or need for restart
    if (metrics.memory_usage > 90) {
        return {
            decision: "restart_service",
            reason: `Critical memory usage (${metrics.memory_usage}%) detected. Restarting service to clear memory.`
        };
    }

    // High latency suggests database or code inefficiency
    if (metrics.latency_ms > 1000) {
        return {
            decision: "optimize_performance",
            reason: `Critical latency detected (${metrics.latency_ms}ms). Optimizing database queries and caching.`
        };
    }

    // High process count might indicate runaway processes
    if (metrics.process_count > 500) {
        return {
            decision: "optimize_performance",
            reason: `High process count (${metrics.process_count}). Optimizing process management.`
        };
    }

    // Default to optimization if load is moderate
    if (metrics.cpu_load > 50 || metrics.memory_usage > 60) {
        return {
            decision: "optimize_performance",
            reason: "Moderate system load detected. Applying proactive optimizations."
        };
    }

    return {
        decision: "monitor",
        reason: "System metrics within normal parameters. Continuing monitoring."
    };
}

