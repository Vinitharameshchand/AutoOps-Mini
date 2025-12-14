/**
 * Monitoring System Integrations
 * Supports: Prometheus, Datadog, Generic Webhooks
 */

import { config } from '../config.js';

/**
 * Fetch metrics from Prometheus
 * @param {string} prometheusUrl - Prometheus server URL
 * @param {object} queries - PromQL queries for each metric
 */
export async function fetchFromPrometheus(prometheusUrl, queries = {}) {
    const defaultQueries = {
        errors: 'sum(rate(http_requests_total{status=~"5.."}[5m]))',
        latency: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
        activeUsers: 'sum(active_sessions)',
    };

    const metricsQueries = { ...defaultQueries, ...queries };

    try {
        const metrics = {
            timestamp: new Date().toISOString()
        };

        // Fetch each metric
        for (const [key, query] of Object.entries(metricsQueries)) {
            const url = `${prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'success' && data.data.result.length > 0) {
                metrics[key] = parseFloat(data.data.result[0].value[1]);
            }
        }

        // Transform to AutoOps format
        return {
            errors: Math.round(metrics.errors || 0),
            latency_ms: Math.round((metrics.latency || 0) * 1000),
            active_users: Math.round(metrics.activeUsers || 0),
            conversion_drop_percent: 0, // Calculate if you have conversion metrics
            timestamp: metrics.timestamp,
            source: 'prometheus'
        };

    } catch (error) {
        console.error('Prometheus fetch error:', error);
        throw new Error(`Failed to fetch from Prometheus: ${error.message}`);
    }
}

/**
 * Fetch metrics from Datadog
 * @param {string} apiKey - Datadog API key
 * @param {string} appKey - Datadog Application key
 * @param {object} queries - Datadog metric queries
 */
export async function fetchFromDatadog(apiKey, appKey, queries = {}) {
    const datadogUrl = 'https://api.datadoghq.com/api/v1';
    const now = Math.floor(Date.now() / 1000);
    const from = now - 300; // Last 5 minutes

    const defaultQueries = {
        errors: 'sum:error.count{*}.as_count()',
        latency: 'avg:trace.http.request.duration{*}',
        activeUsers: 'sum:active.users{*}',
    };

    const metricsQueries = { ...defaultQueries, ...queries };

    try {
        const metrics = {
            timestamp: new Date().toISOString()
        };

        for (const [key, query] of Object.entries(metricsQueries)) {
            const url = `${datadogUrl}/query?query=${encodeURIComponent(query)}&from=${from}&to=${now}`;
            const response = await fetch(url, {
                headers: {
                    'DD-API-KEY': apiKey,
                    'DD-APPLICATION-KEY': appKey,
                }
            });
            const data = await response.json();

            if (data.series && data.series.length > 0) {
                const points = data.series[0].pointlist;
                metrics[key] = points[points.length - 1][1]; // Latest value
            }
        }

        return {
            errors: Math.round(metrics.errors || 0),
            latency_ms: Math.round(metrics.latency || 0),
            active_users: Math.round(metrics.activeUsers || 0),
            conversion_drop_percent: 0,
            timestamp: metrics.timestamp,
            source: 'datadog'
        };

    } catch (error) {
        console.error('Datadog fetch error:', error);
        throw new Error(`Failed to fetch from Datadog: ${error.message}`);
    }
}

/**
 * Fetch metrics from a generic webhook/API
 * @param {string} webhookUrl - Webhook URL
 * @param {object} options - Fetch options (headers, method, etc.)
 * @param {function} transformer - Function to transform response to AutoOps format
 */
export async function fetchFromWebhook(webhookUrl, options = {}, transformer = null) {
    try {
        const response = await fetch(webhookUrl, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const data = await response.json();

        // Use custom transformer if provided, otherwise expect AutoOps format
        if (transformer && typeof transformer === 'function') {
            return transformer(data);
        }

        // Expect data in AutoOps format
        return {
            errors: data.errors || 0,
            latency_ms: data.latency_ms || 0,
            conversion_drop_percent: data.conversion_drop_percent || 0,
            active_users: data.active_users || 0,
            timestamp: data.timestamp || new Date().toISOString(),
            source: 'webhook',
            ...data // Include any additional fields
        };

    } catch (error) {
        console.error('Webhook fetch error:', error);
        throw new Error(`Failed to fetch from webhook: ${error.message}`);
    }
}

/**
 * Fetch metrics from CloudWatch (AWS)
 * Requires AWS SDK to be installed: npm install @aws-sdk/client-cloudwatch
 */
export async function fetchFromCloudWatch(config) {
    // This is a template - requires AWS SDK
    // npm install @aws-sdk/client-cloudwatch

    throw new Error('CloudWatch integration requires @aws-sdk/client-cloudwatch. Install it first.');

    /* Example implementation:
    const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');
    
    const client = new CloudWatchClient({ region: config.region });
    
    const params = {
      Namespace: config.namespace,
      MetricName: 'Errors',
      StartTime: new Date(Date.now() - 300000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Sum']
    };
    
    const command = new GetMetricStatisticsCommand(params);
    const response = await client.send(command);
    */
}

/**
 * Auto-detect and fetch from configured monitoring system
 */
export async function fetchFromConfiguredMonitoring() {
    const monitoringConfig = config.monitoring || {};

    if (monitoringConfig.type === 'prometheus' && monitoringConfig.url) {
        return await fetchFromPrometheus(monitoringConfig.url, monitoringConfig.queries);
    }

    if (monitoringConfig.type === 'datadog' && monitoringConfig.apiKey && monitoringConfig.appKey) {
        return await fetchFromDatadog(
            monitoringConfig.apiKey,
            monitoringConfig.appKey,
            monitoringConfig.queries
        );
    }

    if (monitoringConfig.type === 'webhook' && monitoringConfig.url) {
        return await fetchFromWebhook(
            monitoringConfig.url,
            monitoringConfig.options,
            monitoringConfig.transformer
        );
    }

    throw new Error('No monitoring system configured. Set config.monitoring in config.js');
}
