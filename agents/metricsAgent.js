/**
 * Metrics Agent
 * Responsibility: Ingest (mock) system metrics.
 */

export async function getMetrics() {
  // Simulating fetching metrics from a monitoring system
  return {
    errors: 42,
    latency_ms: 1800,
    conversion_drop_percent: 12,
    active_users: 1250,
    timestamp: new Date().toISOString()
  };
}
