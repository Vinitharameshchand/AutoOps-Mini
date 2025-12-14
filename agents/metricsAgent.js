import si from 'systeminformation';

export async function getMetrics() {
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
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    // Fallback if systeminformation fails (e.g. on restricted envs)
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
