/**
 * AutoOps Mini - Configuration
 * Centralized configuration for all agents and API settings
 */

export const config = {
    // LLM Configuration
    llm: {
        provider: process.env.LLM_PROVIDER || 'openai',
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4o',
            temperature: 0.5,
        },
        together: {
            apiKey: process.env.TOGETHER_API_KEY,
            model: 'meta-llama/Llama-3-70b-chat-hf',
            baseURL: 'https://api.together.xyz/v1',
            temperature: 0.5,
        },
    },

    // Agent Configuration
    agents: {
        metrics: {
            mockData: true, // Set to false to use real metrics source
        },
        summary: {
            timeout: 10000, // 10 seconds
            fallbackEnabled: true,
        },
        decision: {
            timeout: 10000,
            fallbackEnabled: true,
            validActions: ['fix_code', 'rollback', 'optimize_performance', 'scale_up', 'scale_resources', 'restart_service', 'monitor'],
        },
        execution: {
            timeout: 5000,
            dryRun: false, // Set to true to simulate without actual file changes
        },
    },

    // Monitoring System Configuration
    monitoring: {
        // Type: 'prometheus', 'datadog', 'webhook', or null for mock data
        type: process.env.MONITORING_TYPE || null,

        // Prometheus Configuration
        prometheus: {
            url: process.env.PROMETHEUS_URL || 'http://localhost:9090',
            queries: {
                errors: 'sum(rate(http_requests_total{status=~"5.."}[5m]))',
                latency: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
            }
        },

        // Datadog Configuration
        datadog: {
            apiKey: process.env.DATADOG_API_KEY,
            appKey: process.env.DATADOG_APP_KEY,
            queries: {
                errors: 'sum:error.count{*}.as_count()',
                latency: 'avg:trace.http.request.duration{*}',
            }
        },

        // Generic Webhook Configuration
        webhook: {
            url: process.env.WEBHOOK_URL,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN || ''}`
            }
        }
    },

    // System Configuration
    system: {
        debug: process.env.DEBUG === 'true',
        logFile: 'public/system-status.txt',
    },
};

// Helper to check if LLM is configured
export function isLLMConfigured() {
    const provider = config.llm.provider;
    return provider === 'openai'
        ? !!config.llm.openai.apiKey
        : !!config.llm.together.apiKey;
}

// Helper to get active LLM config
export function getActiveLLMConfig() {
    const provider = config.llm.provider;
    return provider === 'openai' ? config.llm.openai : config.llm.together;
}
