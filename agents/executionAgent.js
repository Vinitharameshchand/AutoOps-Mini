/**
 * Execution Agent
 * Responsibility: Execute the decided action (simulation or real file mod).
 */

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export async function executeAction(decisionObj) {
    const { decision, reason } = decisionObj;
    let log = `Executing action: ${decision}. Reason: ${reason}`;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        if (decision === 'fix_code' || decision === 'optimize_performance') {
            log += await applyCodeFix(decision, reason);
        } else if (decision === 'rollback') {
            log += await performRollback();
        } else if (decision === 'scale_up' || decision === 'scale_resources') {
            log += await scaleInfrastructure();
        } else if (decision === 'restart_service') {
            log += await restartService();
        } else if (decision === 'monitor') {
            log += "\nSystem healthy. Continued monitoring.";
        } else {
            log += `\nUnknown action: ${decision}. No operation performed.`;
        }

        return {
            status: "success",
            action_log: log,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        if (config.system.debug) {
            console.error("Execution Agent Error:", error);
        }

        return {
            status: "error",
            action_log: log + `\nExecution failed: ${error.message}`,
            timestamp: new Date().toISOString()
        };
    }
}

async function applyCodeFix(decision, reason) {
    const targetFile = path.join(process.cwd(), config.system.logFile);

    // Dry run mode - simulate without actual changes
    if (config.agents.execution.dryRun) {
        return `\n[DRY RUN] Would modify ${targetFile} to record: ${decision}`;
    }

    try {
        // Ensure file exists
        if (!fs.existsSync(targetFile)) {
            const dir = path.dirname(targetFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(targetFile, "System Status Log:\n", 'utf8');
        }

        const timestamp = new Date().toISOString();
        const logEntry = `\n[${timestamp}] AUTO-FIX APPLIED: ${decision} triggered. ${reason}`;

        fs.appendFileSync(targetFile, logEntry, 'utf8');

        // UPDATE DEMO STATE: Mark system as "Healthy"
        const healthFile = path.join(process.cwd(), 'public', 'system-health.json');
        fs.writeFileSync(healthFile, JSON.stringify({
            status: 'healthy',
            last_fix_timestamp: new Date().toISOString(),
            fix_type: decision
        }, null, 2));

        return `\nSuccessfully modified ${targetFile} to record the fix.`;
    } catch (err) {
        throw new Error(`File modification failed: ${err.message}`);
    }
}

async function performRollback() {
    // Simulate rollback
    await new Promise(resolve => setTimeout(resolve, 500));
    return `\nInitiating rollback sequence... (Simulated)\nRollback to previous stable version complete.`;
}

async function scaleInfrastructure() {
    // Simulate scaling
    await new Promise(resolve => setTimeout(resolve, 500));
    return `\nScaling infrastructure... (Simulated)\nAdded 2 additional instances to handle load.`;
}

async function restartService() {
    // Simulate restart
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `\nRestarting service... (Simulated)\nService uptime reset. Memory cleared.`;
}

