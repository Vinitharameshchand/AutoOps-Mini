/**
 * Summary Agent
 * Responsibility: Convert raw metrics into plain English explanation.
 */

import OpenAI from 'openai';
import { config, isLLMConfigured, getActiveLLMConfig } from '../config.js';
import { Cache } from '../utils/cache.js';

let openaiClient = null;

// Initialize OpenAI client lazily
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

export async function summarizeMetrics(metrics) {
    // 1. Check Cache First
    const cacheKey = Cache.generateKey('summary', metrics);
    const cachedSummary = Cache.get(cacheKey);

    if (cachedSummary) {
        if (config.system.debug) console.log('⚡ Using cached summary');
        return cachedSummary;
    }

    // Use fallback if no API key configured
    if (!isLLMConfigured()) {
        if (config.system.debug) {
            console.warn("No LLM API key found. Using fallback summary.");
        }
        return generateFallbackSummary(metrics);
    }

    try {
        const client = getOpenAIClient();
        const llmConfig = getActiveLLMConfig();

        // Add timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Summary generation timeout')), config.agents.summary.timeout)
        );

        const summaryPromise = client.chat.completions.create({
            model: llmConfig.model,
            messages: [
                {
                    role: "system",
                    content: "You are a Site Reliability Engineer agent. Summarize the following system metrics in one concise sentence, highlighting the most critical issues."
                },
                {
                    role: "user",
                    content: JSON.stringify(metrics)
                }
            ],
            temperature: llmConfig.temperature,
        });

        const response = await Promise.race([summaryPromise, timeoutPromise]);
        const summary = response.choices[0].message.content;

        // 2. Save to Cache
        Cache.set(cacheKey, summary);

        return summary;

    } catch (error) {
        if (config.system.debug) {
            console.error("Summary Agent Error:", error.message);
        }

        // Use fallback on error
        if (config.agents.summary.fallbackEnabled) {
            return generateFallbackSummary(metrics);
        }
        throw error;
    }
}

// Intelligent fallback based on metrics
function generateFallbackSummary(metrics) {
    const issues = [];

    if (metrics.cpu_load > 80) issues.push(`high CPU load (${metrics.cpu_load}%)`);
    if (metrics.memory_usage > 90) issues.push(`critical memory usage (${metrics.memory_usage}%)`);
    if (metrics.process_count > 500) issues.push(`abnormal process count (${metrics.process_count})`);

    if (issues.length === 0) {
        return "System metrics are within healthy limits.";
    }

    return `System Alert: ${issues.join(', ')} detected. Immediate attention recommended.`;
}
