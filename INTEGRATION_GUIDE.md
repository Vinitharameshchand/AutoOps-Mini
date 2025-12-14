# AutoOps Mini - Integration Guide

## 📥 Sending Custom Metrics via API

### Basic Usage

**Endpoint:** `POST /api/run-flow`

**With Custom Metrics:**
```bash
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": {
      "errors": 150,
      "latency_ms": 2500,
      "conversion_drop_percent": 18,
      "active_users": 800
    }
  }'
```

**Without Metrics (uses mock data):**
```bash
curl -X POST http://localhost:3000/api/run-flow
```

### Response Format
```json
{
  "metrics": {
    "errors": 150,
    "latency_ms": 2500,
    "conversion_drop_percent": 18,
    "active_users": 800,
    "timestamp": "2025-12-14T07:30:00.000Z"
  },
  "summary": "Critical issues detected: high error rate (150), elevated latency (2500ms), 18% conversion drop.",
  "decision": {
    "decision": "rollback",
    "reason": "Critical error rate (150) detected. Rolling back to last stable version."
  },
  "actionResult": {
    "status": "success",
    "action_log": "Executing action: rollback...",
    "timestamp": "2025-12-14T07:30:02.000Z"
  },
  "executionTime": "1565ms"
}
```

---

## 🔌 Monitoring System Integrations

### 1. Prometheus Integration

**Setup:**
```bash
# Set environment variables
export MONITORING_TYPE=prometheus
export PROMETHEUS_URL=http://localhost:9090
```

**Configuration in `config.js`:**
```javascript
monitoring: {
  type: 'prometheus',
  prometheus: {
    url: 'http://localhost:9090',
    queries: {
      errors: 'sum(rate(http_requests_total{status=~"5.."}[5m]))',
      latency: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
      activeUsers: 'sum(active_sessions)'
    }
  }
}
```

**Usage:**
```javascript
import { fetchFromPrometheus } from './agents/monitoringIntegrations.js';

const metrics = await fetchFromPrometheus('http://localhost:9090', {
  errors: 'your_custom_query',
  latency: 'your_latency_query'
});
```

---

### 2. Datadog Integration

**Setup:**
```bash
export MONITORING_TYPE=datadog
export DATADOG_API_KEY=your_api_key
export DATADOG_APP_KEY=your_app_key
```

**Configuration:**
```javascript
monitoring: {
  type: 'datadog',
  datadog: {
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY,
    queries: {
      errors: 'sum:error.count{*}.as_count()',
      latency: 'avg:trace.http.request.duration{*}',
      activeUsers: 'sum:active.users{*}'
    }
  }
}
```

**Usage:**
```javascript
import { fetchFromDatadog } from './agents/monitoringIntegrations.js';

const metrics = await fetchFromDatadog(
  'your_api_key',
  'your_app_key',
  {
    errors: 'sum:your.error.metric{*}',
    latency: 'avg:your.latency.metric{*}'
  }
);
```

---

### 3. Generic Webhook Integration

**Setup:**
```bash
export MONITORING_TYPE=webhook
export WEBHOOK_URL=https://your-monitoring-api.com/metrics
export WEBHOOK_TOKEN=your_auth_token
```

**Configuration:**
```javascript
monitoring: {
  type: 'webhook',
  webhook: {
    url: 'https://your-api.com/metrics',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer your_token',
      'Content-Type': 'application/json'
    }
  }
}
```

**Expected Webhook Response:**
```json
{
  "errors": 42,
  "latency_ms": 1800,
  "conversion_drop_percent": 12,
  "active_users": 1250
}
```

**Custom Transformer:**
```javascript
import { fetchFromWebhook } from './agents/monitoringIntegrations.js';

const transformer = (data) => ({
  errors: data.error_count,
  latency_ms: data.avg_response_time,
  conversion_drop_percent: data.conversion_rate_drop,
  active_users: data.concurrent_users,
  timestamp: new Date().toISOString()
});

const metrics = await fetchFromWebhook(
  'https://your-api.com/metrics',
  { method: 'GET', headers: { 'Authorization': 'Bearer token' } },
  transformer
);
```

---

## 🔄 Integration Examples

### Example 1: New Relic Webhook
```javascript
// New Relic sends alerts to your webhook
// POST https://your-server.com/autoops-webhook

app.post('/autoops-webhook', async (req, res) => {
  const newRelicData = req.body;
  
  // Transform New Relic format to AutoOps format
  const metrics = {
    errors: newRelicData.violation_chart_url ? 100 : 0,
    latency_ms: newRelicData.duration || 0,
    conversion_drop_percent: 0,
    active_users: 0
  };
  
  // Trigger AutoOps
  const response = await fetch('http://localhost:3000/api/run-flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics })
  });
  
  res.json({ status: 'triggered' });
});
```

### Example 2: Grafana Alert Webhook
```javascript
// Grafana webhook handler
app.post('/grafana-webhook', async (req, res) => {
  const alert = req.body;
  
  const metrics = {
    errors: alert.evalMatches?.[0]?.value || 0,
    latency_ms: alert.evalMatches?.[1]?.value || 0,
    conversion_drop_percent: 0,
    active_users: 0,
    alert_name: alert.ruleName,
    severity: alert.state
  };
  
  await fetch('http://localhost:3000/api/run-flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics })
  });
  
  res.json({ received: true });
});
```

### Example 3: Scheduled Monitoring Check
```javascript
// Run AutoOps every 5 minutes with Prometheus data
import cron from 'node-cron';
import { fetchFromPrometheus } from './agents/monitoringIntegrations.js';

cron.schedule('*/5 * * * *', async () => {
  try {
    const metrics = await fetchFromPrometheus('http://localhost:9090');
    
    const response = await fetch('http://localhost:3000/api/run-flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics })
    });
    
    const result = await response.json();
    console.log('AutoOps executed:', result.decision);
  } catch (error) {
    console.error('Scheduled check failed:', error);
  }
});
```

---

## 🧪 Testing

### Test with Custom Metrics
```bash
# High errors - should trigger rollback
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 200, "latency_ms": 1000}}'

# High latency - should trigger optimization
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 10, "latency_ms": 3000}}'

# Moderate issues - should trigger fix
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 30, "latency_ms": 1500}}'
```

### Test Monitoring Integration
```javascript
// Test Prometheus
import { fetchFromPrometheus } from './agents/monitoringIntegrations.js';
const metrics = await fetchFromPrometheus('http://localhost:9090');
console.log(metrics);

// Test Datadog
import { fetchFromDatadog } from './agents/monitoringIntegrations.js';
const metrics = await fetchFromDatadog('api_key', 'app_key');
console.log(metrics);

// Test Webhook
import { fetchFromWebhook } from './agents/monitoringIntegrations.js';
const metrics = await fetchFromWebhook('https://your-api.com/metrics');
console.log(metrics);
```

---

## 📊 Supported Monitoring Systems

| System | Status | Integration Type |
|--------|--------|------------------|
| **Prometheus** | ✅ Ready | Native |
| **Datadog** | ✅ Ready | Native |
| **Generic Webhook** | ✅ Ready | Native |
| **New Relic** | ✅ Via Webhook | Webhook |
| **Grafana** | ✅ Via Webhook | Webhook |
| **CloudWatch** | 🔄 Template Ready | Requires AWS SDK |
| **Custom API** | ✅ Via Webhook | Webhook |

---

## 🔐 Security Best Practices

1. **Use Environment Variables** for API keys
2. **Validate Webhook Sources** with signatures
3. **Rate Limit** the `/api/run-flow` endpoint
4. **Use HTTPS** in production
5. **Sanitize Input** (already implemented)

---

## 🚀 Quick Start

### 1. Use Mock Data (Default)
```bash
npm run dev
# Visit http://localhost:3000
```

### 2. Use Custom Metrics
```bash
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 50, "latency_ms": 2000}}'
```

### 3. Connect Prometheus
```bash
export MONITORING_TYPE=prometheus
export PROMETHEUS_URL=http://localhost:9090
npm run dev
```

### 4. Connect Datadog
```bash
export MONITORING_TYPE=datadog
export DATADOG_API_KEY=your_key
export DATADOG_APP_KEY=your_app_key
npm run dev
```
