import { getMetrics } from '../../agents/metricsAgent';
import { summarizeMetrics } from '../../agents/summaryAgent';
import { decideAction } from '../../agents/decisionAgent';
import { executeAction } from '../../agents/executionAgent';
import { config } from '../../config.js';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'This endpoint only accepts POST requests'
        });
    }

    const startTime = Date.now();

    try {
        // Step 1: Metrics Ingestion
        // Accept custom metrics from request body, or use mock data
        let metrics;

        if (req.body && req.body.metrics) {
            // Validate custom metrics
            metrics = validateMetrics(req.body.metrics);
            if (config.system.debug) {
                console.log('Using custom metrics from request');
            }
        } else {
            // Use real system metrics
            metrics = await getMetrics();
            if (config.system.debug) {
                console.log('Ingested real system metrics');
            }
        }

        // Step 2: Summary Generation
        const summary = await summarizeMetrics(metrics);

        // Step 3: Decision Making
        const decision = await decideAction(summary, metrics);

        // Step 4: Action Execution
        const actionResult = await executeAction(decision);

        const executionTime = Date.now() - startTime;

        // Log performance if debug enabled
        if (config.system.debug) {
            console.log(`AutoOps flow completed in ${executionTime}ms`);
        }

        res.status(200).json({
            metrics,
            summary,
            decision,
            actionResult,
            executionTime: `${executionTime}ms`
        });

    } catch (error) {
        console.error("AutoOps Flow Error:", error);

        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Validate and sanitize metrics (custom or real)
function validateMetrics(customMetrics) {
    const validated = {
        cpu_load: parseFloat(customMetrics.cpu_load) || 0,
        memory_usage: parseFloat(customMetrics.memory_usage) || 0,
        process_count: parseInt(customMetrics.process_count) || 0,
        uptime_seconds: parseInt(customMetrics.uptime_seconds) || 0,
        timestamp: customMetrics.timestamp || new Date().toISOString()
    };

    // Keep original keys if present (for backward compatibility or custom simulations)
    Object.keys(customMetrics).forEach(key => {
        if (validated[key] === undefined) {
            validated[key] = customMetrics[key];
        }
    });

    return validated;
}
