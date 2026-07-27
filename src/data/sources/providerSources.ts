import type { Provider, Source } from '../../types';

// ── AWS Bedrock Sources ───────────────────────────────────────────────────────

const bedrockInvocationLogs: Source = {
  id: 'bedrock-invocation-logs',
  name: 'S3 Invocation Logs',
  description:
    'AWS Bedrock auto-emits invocation logs to S3 when invocation logging is enabled. Contains full request/response payloads, token counts, latency, and guardrail events. Queried in place via Cribl Federated Search — no ETL.',
  collectionMethod: 'stream-s3',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Raw Invocation Log',
      language: 'json',
      content: `{
  "schemaType": "ModelInvocationLog",
  "schemaVersion": "1.0",
  "timestamp": "2026-05-27T14:32:18.456Z",
  "accountId": "123456789012",
  "region": "us-east-1",
  "requestId": "abc-123-def-456",
  "operation": "ConverseStream",
  "modelId": "us.anthropic.claude-sonnet-4-20250514-v1:0",
  "input": {
    "inputContentType": "application/json",
    "inputBodyJson": {
      "messages": [{ "role": "user", "content": "Refactor this module..." }],
      "system": [{ "text": "You are a helpful coding assistant..." }],
      "inferenceConfig": { "maxTokens": 4096, "temperature": 0.7 }
    }
  },
  "output": {
    "outputContentType": "application/json",
    "outputBodyJson": {
      "output": {
        "message": {
          "role": "assistant",
          "content": [
            { "type": "text", "text": "I'll read the auth module..." },
            { "type": "tool_use", "id": "toolu_abc", "name": "Read", "input": {} }
          ]
        }
      },
      "stopReason": "tool_use",
      "usage": { "inputTokens": 4821, "outputTokens": 127 }
    }
  },
  "invocationMetrics": {
    "inputTokenCount": 4821,
    "outputTokenCount": 127,
    "invocationLatency": 2340,
    "firstByteLatency": 1200
  }
}`,
    },
    {
      label: 'Guardrail Intervention',
      language: 'json',
      content: `{
  "schemaType": "ModelInvocationLog",
  "timestamp": "2026-05-27T14:35:02.789Z",
  "requestId": "xyz-789-abc-012",
  "modelId": "us.anthropic.claude-sonnet-4-20250514-v1:0",
  "guardrail": {
    "action": "INTERVENED",
    "output": [{
      "text": "I cannot provide that information.",
      "guardrail": {
        "inputAssessment": {
          "contentPolicy": {
            "policies": [{
              "type": "VIOLENCE",
              "action": "BLOCKED",
              "confidence": "HIGH"
            }]
          }
        }
      }
    }]
  }
}`,
    },
    {
      label: 'Federated Search KQL',
      language: 'sql',
      content: `-- Query Bedrock invocation logs in-place via Cribl Federated Search
-- No ETL, no data movement — queries the S3 bucket directly

dataset=federated:bedrock_invocations
| where guardrail.action == "INTERVENED"
| eval developer = split(userIdentity.arn, "/")[2]
| summarize intervention_count = count() by developer
| sort -intervention_count`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['invocationMetrics.inputTokenCount', 'invocationMetrics.outputTokenCount', 'invocationMetrics.invocationLatency', 'modelId', 'operation'],
      reason: 'Monitor token usage, latency, and invocation counts per model',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['requestId', 'modelId', 'operation', 'guardrail', 'stopReason', 'usage'],
      reason: 'Investigate guardrail interventions and model behavior',
    },
    {
      tierId: 'cribl-lake',
      fields: ['input.inputBodyJson', 'output.outputBodyJson', 'all fields'],
      reason: 'Prove full prompt/compliance audit with complete payloads',
    },
  ],
};

const bedrockCloudWatch: Source = {
  id: 'bedrock-cloudwatch',
  name: 'CloudWatch Metrics',
  description:
    'AWS CloudWatch metrics emitted by Bedrock: invocation count, latency percentiles, token counts, and error rates. Collected via CloudWatch Metric Stream → S3 → Cribl Stream.',
  collectionMethod: 'stream-s3',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'CloudWatch Metric Datapoint',
      language: 'json',
      content: `{
  "MetricName": "Invocations",
  "Dimensions": [
    { "Name": "ModelId", "Value": "us.anthropic.claude-sonnet-4-20250514-v1:0" }
  ],
  "Timestamp": "2026-05-27T14:32:00Z",
  "Value": 47,
  "Unit": "Count"
}

// Available Bedrock metrics (auto-emitted, 1-min resolution):
//   Invocations, InvocationClientErrors, InvocationServerErrors
//   InputTokenCount, OutputTokenCount
//   InvocationLatency, FirstByteLatency
//   ThrottledCount`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['MetricName', 'Value', 'Dimensions.ModelId', 'Timestamp'],
      reason: 'Monitor invocation counts, token usage, latency, and errors per model',
    },
  ],
};

const bedrockCloudTrail: Source = {
  id: 'bedrock-cloudtrail',
  name: 'CloudTrail Audit Events',
  description:
    'AWS CloudTrail events for Bedrock API calls. Tracks who called which model, when, and from where. Key for compliance, cost attribution, and security auditing. Developer identity from STS session name after the final / in the ARN.',
  collectionMethod: 'stream-s3',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'CloudTrail Event',
      language: 'json',
      content: `{
  "eventVersion": "1.10",
  "eventName": "InvokeModel",
  "eventTime": "2026-05-27T14:32:18Z",
  "sourceIPAddress": "10.0.1.42",
  "userIdentity": {
    "type": "AssumedRole",
    "arn": "arn:aws:sts::123456789012:assumed-role/ClaudeCodeRole/DanSchmitz",
    "sessionContext": {
      "sessionIssuer": {
        "arn": "arn:aws:iam::123456789012:role/ClaudeCodeRole",
        "type": "Role"
      }
    }
  },
  "requestParameters": {
    "modelId": "us.anthropic.claude-sonnet-4-20250514-v1:0",
    "contentType": "application/json"
  },
  "responseElements": { "statusCode": 200 }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['eventName', 'eventTime', 'sourceIPAddress'],
      reason: 'Monitor API call frequency and sources',
    },
    {
      tierId: 'cribl-lake',
      fields: ['userIdentity', 'requestParameters', 'responseElements', 'all fields'],
      reason: 'Prove compliance audit trail with developer identity',
    },
    {
      tierId: 'archive',
      fields: ['all fields'],
      reason: 'Keep long-term compliance retention',
    },
  ],
};

// ── Anthropic API Sources ──────────────────────────────────────────────────────

const anthropicAdminApi: Source = {
  id: 'anthropic-admin-api',
  name: 'Admin API (Usage, Cost, Analytics)',
  description:
    'Anthropic Admin API for org-wide usage monitoring. Endpoints: usage_report/messages, usage_report/claude_code, cost_report, and 11 analytics endpoints (token usage over time, per-user cost, skills, connectors, plugins, artifacts, chat projects).',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Usage Report Response',
      language: 'json',
      content: `{
  "data": [
    {
      "model": "claude-sonnet-4-20250514",
      "input_tokens": 42807,
      "output_tokens": 3842,
      "cache_read_input_tokens": 31520,
      "cost_usd": 1.2437,
      "start_time": "2026-05-27T00:00:00Z",
      "end_time": "2026-05-27T23:59:59Z"
    }
  ]
}`,
    },
    {
      label: 'Analytics API (per-user cost)',
      language: 'json',
      content: `{
  "data": [
    {
      "user_id": "user_abc123",
      "user_email": "dschmitz@example.com",
      "cost_usd": 12.45,
      "input_tokens": 150000,
      "output_tokens": 12000,
      "period": "2026-05"
    }
  ]
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['model', 'input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cost_usd'],
      reason: 'Monitor org-wide token usage and cost',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['user_id', 'user_email', 'cost_usd', 'model', 'period'],
      reason: 'Investigate per-user cost attribution and usage trends',
    },
  ],
};

const anthropicComplianceApi: Source = {
  id: 'anthropic-compliance-api',
  name: 'Compliance API (Audit Events)',
  description:
    'Anthropic Compliance API — 400+ activity types, paginated (cursor-based, default 100, max 5000). Filterable by type/actor/org/time/order. Content access: chats, messages, files, projects, artifacts, Claude Code artifacts.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Compliance Activity Event',
      language: 'json',
      content: `{
  "type": "message.sent",
  "actor": {
    "type": "user",
    "id": "user_abc123"
  },
  "organization_id": "org_xyz",
  "timestamp": "2026-05-27T14:32:18Z",
  "details": {
    "conversation_id": "conv_123",
    "model": "claude-sonnet-4-20250514"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['type', 'timestamp', 'organization_id'],
      reason: 'Monitor audit event frequency and types',
    },
    {
      tierId: 'cribl-lake',
      fields: ['type', 'actor', 'details', 'all fields'],
      reason: 'Prove compliance audit trail with full activity details',
    },
    {
      tierId: 'archive',
      fields: ['all fields'],
      reason: 'Keep long-term compliance retention',
    },
  ],
};

// ── OpenAI API Sources ────────────────────────────────────────────────────────

const openaiAdminApi: Source = {
  id: 'openai-admin-api',
  name: 'Admin API (Audit Logs, Usage, Costs)',
  description:
    'OpenAI Admin API: audit_logs (140+ event types: api_key.*, project.*, role.*, user.*, invite.*, etc.), usage (11 endpoints — completions, audio, embeddings, images, etc.), costs. Full CRUD for keys, users, projects, spend limits.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Audit Log Event',
      language: 'json',
      content: `{
  "event_type": "api_key.created",
  "actor": {
    "type": "user",
    "email": "dschmitz@example.com",
    "id": "user-abc123"
  },
  "timestamp": "2026-05-27T14:32:00Z",
  "project_id": "proj_xyz",
  "resource": {
    "type": "api_key",
    "id": "key_abc123"
  }
}`,
    },
    {
      label: 'Usage Response',
      language: 'json',
      content: `{
  "data": [
    {
      "model": "gpt-4o",
      "input_tokens": 150000,
      "output_tokens": 12000,
      "cost": 12.45,
      "start_time": "2026-05-27T00:00:00Z",
      "end_time": "2026-05-27T23:59:59Z"
    }
  ]
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['model', 'input_tokens', 'output_tokens', 'cost', 'event_type'],
      reason: 'Monitor token usage, cost, and audit event frequency',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['actor', 'project_id', 'event_type', 'resource'],
      reason: 'Investigate admin activity patterns and project-level usage',
    },
    {
      tierId: 'cribl-lake',
      fields: ['all fields — full audit log'],
      reason: 'Prove compliance audit trail',
    },
  ],
};

const openaiComplianceLogs: Source = {
  id: 'openai-compliance-logs',
  name: 'Compliance Logs Platform',
  description:
    'ChatGPT Enterprise Compliance Logs Platform — immutable, time-windowed JSONL log files for SIEM streaming and eDiscovery. Separate from Platform API admin.',
  collectionMethod: 'stream-s3',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Compliance Log Entry',
      language: 'json',
      content: `{
  "timestamp": "2026-05-27T14:32:18Z",
  "event_type": "conversation.message.created",
  "workspace_id": "ws_abc123",
  "user_id": "user-abc123",
  "conversation_id": "conv_123",
  "model": "gpt-4o",
  "content_preview": "Fix the authentication bug..."
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'cribl-lake',
      fields: ['timestamp', 'event_type', 'workspace_id', 'user_id', 'conversation_id', 'content_preview'],
      reason: 'Prove compliance audit trail for ChatGPT Enterprise',
    },
    {
      tierId: 'archive',
      fields: ['all fields'],
      reason: 'Keep long-term compliance retention',
    },
  ],
};

// ── Azure AI Foundry Sources ───────────────────────────────────────────────────

const azureDiagnosticLogs: Source = {
  id: 'azure-diagnostic-logs',
  name: 'Diagnostic Logs (5 Categories)',
  description:
    'Azure AI Foundry diagnostic settings: 5 log categories — Audit Logs, Azure OpenAI Request Usage, Managed Network Events, Request and Response Logs, Trace Logs. All flow to AzureDiagnostics Log Analytics table.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Request and Response Log',
      language: 'json',
      content: `{
  "category": "Request and Response Logs",
  "resourceId": "/subscriptions/abc/resourceGroups/rg/providers/Microsoft.CognitiveServices/accounts/myaccount",
  "properties_s": {
    "ModelDeploymentName": "gpt-4o-deployment",
    "ModelName": "gpt-4o",
    "ModelVersion": "2024-08-06",
    "StatusCode": 200,
    "StreamType": "streaming",
    "ServiceTier": "provisioned"
  }
}`,
    },
    {
      label: 'Audit Log',
      language: 'json',
      content: `{
  "category": "Audit Logs",
  "resourceId": "/subscriptions/abc/resourceGroups/rg/providers/Microsoft.CognitiveServices/accounts/myaccount",
  "operationName": "Microsoft.CognitiveServices/accounts/OpenAI/ChatCompletions/Action",
  "properties_s": {
    "callerIpAddress": "10.0.1.42",
    "correlationId": "abc-123"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['properties_s.ModelDeploymentName', 'properties_s.StatusCode', 'properties_s.ServiceTier'],
      reason: 'Monitor request counts and status codes per model deployment',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['category', 'properties_s.ModelName', 'properties_s.ModelVersion', 'properties_s.StreamType', 'operationName'],
      reason: 'Investigate request patterns and model usage',
    },
    {
      tierId: 'cribl-lake',
      fields: ['all fields — full diagnostic log'],
      reason: 'Prove compliance audit trail',
    },
  ],
};

const azureMetrics: Source = {
  id: 'azure-metrics',
  name: 'Platform Metrics (4 Categories)',
  description:
    'Azure AI Foundry platform metrics: HTTP Requests (availability, request count), Latency (Time to Response, Time Between Tokens, TTFT, Tokens/sec), Usage (prompt/completion/active/inference tokens, PTU utilization, cache match rate), and legacy Cognitive Services metrics.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Usage Metric',
      language: 'json',
      content: `{
  "metricName": "PromptTokens",
  "dimensions": {
    "ModelDeploymentName": "gpt-4o-deployment",
    "ModelName": "gpt-4o",
    "ModelVersion": "2024-08-06",
    "ServiceTier": "provisioned"
  },
  "timestamp": "2026-05-27T14:32:00Z",
  "value": 4821,
  "unit": "Count"
}`,
    },
    {
      label: 'Latency Metric',
      language: 'json',
      content: `{
  "metricName": "TimeToFirstToken",
  "dimensions": {
    "ModelDeploymentName": "gpt-4o-deployment"
  },
  "timestamp": "2026-05-27T14:32:00Z",
  "value": 1200,
  "unit": "Milliseconds"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['metricName', 'value', 'dimensions.ModelDeploymentName', 'dimensions.ModelName', 'dimensions.ServiceTier'],
      reason: 'Monitor token usage, PTU utilization, latency, and cache rates',
    },
  ],
};

// ── GCP Vertex AI Sources ──────────────────────────────────────────────────────

const vertexAuditLogs: Source = {
  id: 'vertex-audit-logs',
  name: 'Audit Logs (4 Types)',
  description:
    'GCP Vertex AI audit logs: Admin Activity (always on), Data Access (must enable — includes endpoints.predict, endpoints.rawPredict, endpoints.explain), System Event (always on), Policy Denied (default on).',
  collectionMethod: 'stream-s3',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Data Access Log (endpoints.predict)',
      language: 'json',
      content: `{
  "logName": "projects/my-project/logs/cloudaudit.googleapis.com%2Fdata_access",
  "protoPayload": {
    "serviceName": "aiplatform.googleapis.com",
    "methodName": "google.cloud.aiplatform.v1.EndpointService.Predict",
    "resourceName": "projects/my-project/locations/us-central1/endpoints/123456789",
    "authenticationInfo": {
      "principalEmail": "dschmitz@example.com"
    }
  },
  "timestamp": "2026-05-27T14:32:18Z"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['protoPayload.methodName', 'timestamp', 'protoPayload.authenticationInfo.principalEmail'],
      reason: 'Monitor prediction call frequency and user attribution',
    },
    {
      tierId: 'cribl-lake',
      fields: ['protoPayload', 'resourceName', 'all fields'],
      reason: 'Prove compliance audit trail with full payload',
    },
    {
      tierId: 'archive',
      fields: ['all fields'],
      reason: 'Keep long-term compliance retention',
    },
  ],
};

const vertexMonitoring: Source = {
  id: 'vertex-monitoring',
  name: 'Cloud Monitoring Metrics',
  description:
    'GCP Cloud Monitoring for Vertex AI: endpoint performance (predictions/sec, error %, model/overhead/total latency), resource usage (replica count, CPU, memory, accelerator duty cycle), feature store metrics, training metrics.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Endpoint Metric',
      language: 'json',
      content: `{
  "metric": {
    "type": "aiplatform.googleapis.com/prediction_online_total_request_count",
    "labels": {
      "model": "gemini-1.5-pro",
      "endpoint": "projects/my-project/locations/us-central1/endpoints/123"
    }
  },
  "points": [{
    "interval": { "startTime": "2026-05-27T14:32:00Z", "endTime": "2026-05-27T14:33:00Z" },
    "value": { "int64Value": "47" }
  }]
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['metric.type', 'metric.labels.model', 'metric.labels.endpoint', 'value'],
      reason: 'Monitor prediction counts, error rates, and latency per model',
    },
  ],
};

// ── Export Providers ───────────────────────────────────────────────────────────

export const providers: Provider[] = [
  {
    id: 'aws-bedrock',
    name: 'AWS Bedrock',
    description:
      'Managed inference service for foundation models. Emits S3 invocation logs, CloudWatch metrics, and CloudTrail audit events.',
    sources: [bedrockInvocationLogs, bedrockCloudWatch, bedrockCloudTrail],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    description:
      'Direct API to Anthropic models. Admin API for usage/cost/analytics, Compliance API for audit events and content access.',
    sources: [anthropicAdminApi, anthropicComplianceApi],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    description:
      'Direct API to OpenAI models. Admin API for audit logs/usage/costs, Compliance Logs Platform for ChatGPT Enterprise.',
    sources: [openaiAdminApi, openaiComplianceLogs],
  },
  {
    id: 'azure-ai-foundry',
    name: 'Azure AI Foundry',
    description:
      'Microsoft unified AI platform. Includes Azure OpenAI as a subset. 5 diagnostic log categories and 4 metric categories.',
    sources: [azureDiagnosticLogs, azureMetrics],
  },
  {
    id: 'gcp-vertex-ai',
    name: 'GCP Vertex AI',
    description:
      'Google Cloud AI platform. 4 audit log types, Cloud Monitoring metrics, and Model Monitoring for drift/skew detection.',
    sources: [vertexAuditLogs, vertexMonitoring],
  },
];