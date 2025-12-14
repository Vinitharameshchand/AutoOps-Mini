# AutoOps Mini - API Quick Reference

## 🎯 Main Endpoint

### `POST /api/run-flow`

Triggers the autonomous agent flow with optional custom metrics.

---

## 📥 Request Format

### Option 1: With Custom Metrics
```bash
POST /api/run-flow
Content-Type: application/json

{
  "metrics": {
    "errors": 150,
    "latency_ms": 2500,
    "conversion_drop_percent": 18,
    "active_users": 800
  }
}
```

### Option 2: Without Metrics (uses mock data)
```bash
POST /api/run-flow
```

---

## 📤 Response Format

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

## 🎮 Decision Types

| Decision | Trigger Condition | Action |
|----------|------------------|--------|
| `rollback` | errors > 50 | Roll back to last stable version |
| `optimize_performance` | latency_ms > 2000 | Optimize performance bottlenecks |
| `fix_code` | errors > 20 OR latency_ms > 1000 | Apply targeted code fix |
| `scale_up` | (Custom logic) | Scale infrastructure |

---

## 🧪 Example Requests

### High Errors → Rollback
```bash
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 200, "latency_ms": 1000}}'
```

### High Latency → Optimize
```bash
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 10, "latency_ms": 3000}}'
```

### Moderate Issues → Fix Code
```bash
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 30, "latency_ms": 1500}}'
```

### Normal Metrics → Proactive Optimization
```bash
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 5, "latency_ms": 500}}'
```

---

## 🔌 Integration Examples

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3000/api/run-flow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    metrics: {
      errors: 150,
      latency_ms: 2500,
      conversion_drop_percent: 18,
      active_users: 800
    }
  })
});

const result = await response.json();
console.log('Decision:', result.decision.decision);
console.log('Reason:', result.decision.reason);
```

### Python
```python
import requests

response = requests.post('http://localhost:3000/api/run-flow', json={
    'metrics': {
        'errors': 150,
        'latency_ms': 2500,
        'conversion_drop_percent': 18,
        'active_users': 800
    }
})

result = response.json()
print(f"Decision: {result['decision']['decision']}")
print(f"Reason: {result['decision']['reason']}")
```

### cURL
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
  }' | jq '.'
```

---

## ⚙️ Environment Variables

```bash
# LLM Configuration
export OPENAI_API_KEY="sk-..."
export TOGETHER_API_KEY="..."
export LLM_PROVIDER="openai"

# Monitoring Integration
export MONITORING_TYPE="prometheus"
export PROMETHEUS_URL="http://localhost:9090"

# Datadog
export DATADOG_API_KEY="..."
export DATADOG_APP_KEY="..."

# Webhook
export WEBHOOK_URL="https://your-api.com/metrics"
export WEBHOOK_TOKEN="..."

# Debug
export DEBUG="true"
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - Agent flow completed |
| 405 | Method Not Allowed - Use POST only |
| 500 | Internal Server Error - Check logs |

---

## 🔍 Debugging

Enable debug mode:
```bash
export DEBUG=true
npm run dev
```

Check execution logs:
```bash
tail -f public/system-status.txt
```

---

## 🚀 Quick Test

```bash
# Test with mock data
curl -X POST http://localhost:3000/api/run-flow

# Test with custom metrics
curl -X POST http://localhost:3000/api/run-flow \
  -H "Content-Type: application/json" \
  -d '{"metrics": {"errors": 100, "latency_ms": 2000}}'
```
