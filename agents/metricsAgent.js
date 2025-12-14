import si from 'systeminformation';
import { config } from '../config.js';
import { fetchFromConfiguredMonitoring } from './monitoringIntegrations.js';
import path from 'path';
import fs from 'fs';

export async function getMetrics() {
  // Check for "Mock Data" (Demo Mode) with Dynamic State
  if (config.agents.metrics.mockData) {
    // Check if the system has been fixed recently
    const healthFile = path.join(process.cwd(), 'public', 'system-health.json');
    let isHealthy = false;

    try {
      if (fs.existsSync(healthFile)) {
        const healthData = JSON.parse(fs.readFileSync(healthFile, 'utf8'));
        // Consider healthy if fixed within the last minute
        const lastFix = new Date(healthData.last_fix_timestamp).getTime();
        if (Date.now() - lastFix < 60000) {
          isHealthy = true;
        }
      }
    } catch (e) {
      // Ignore error, assume unhealthy
    }

    if (isHealthy) {
      if (config.system.debug) console.log('✅ System is recovering. Returning HEALTHY metrics.');
      return {
        cpu_load: 15, // Normal load
        memory_usage: 30,
        process_count: 85,
        uptime_seconds: 3700,
        errors: 0,
        latency_ms: 120, // Normal latency
        active_users: 860,
        conversion_drop_percent: 0,
        timestamp: new Date().toISOString(),
        source: 'mock_demo_healthy'
      };
    }

    if (config.system.debug) console.log('⚠️ System is degraded. Returning CRITICAL metrics.');

    // Return a scenario that triggers the "performance optimization" flow
    return {
      cpu_load: 45, // Moderate load
      memory_usage: 62,
      process_count: 120,
      uptime_seconds: 3600,
      errors: 12, // Some errors
      latency_ms: 1800, // CRITICAL: High latency spike (Trigger!)
      active_users: 850,
      conversion_drop_percent: 15, // Business KPI impact
      timestamp: new Date().toISOString(),
      source: 'mock_demo_critical'
    };
  }

  // 2. Check for Configured Monitoring Integrations
  if (config.monitoring && config.monitoring.type) {
    try {
      if (config.system.debug) console.log(`📡 Fetching metrics from ${config.monitoring.type}...`);
      return await fetchFromConfiguredMonitoring();
    } catch (error) {
      console.error(`Failed to fetch from ${config.monitoring.type}, falling back to system metrics:`, error);
    }
  }

  // 3. Fallback to Local System Information
  try {
    const [load, mem, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.time()
    ]);

    return {
      cpu_load: load.currentLoad.toFixed(2),
      memory_usage: ((mem.active / mem.total) * 100).toFixed(2),
      uptime_seconds: time.uptime,
      process_count: (await si.processes()).all,
      timestamp: new Date().toISOString(),
      source: 'system_information'
    };
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    return {
      cpu_load: 0,
      memory_usage: 0,
      uptime_seconds: 0,
      process_count: 0,
      timestamp: new Date().toISOString(),
      error: "Failed to fetch real metrics"
    };
  }
}
