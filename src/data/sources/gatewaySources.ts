import type { Gateway, Source } from '../../types';

// ── LiteLLM Sources ────────────────────────────────────────────────────────────

const litellmAccessLogs: Source = {
  id: 'litellm-access-logs',
  name: 'Access Logs (SpendLogs)',
  description:
    'LiteLLM emits a standard_logging_object per request. PostgreSQL-backed (LiteLLM_SpendLogs table: request_id, call_type, spend, tokens, model, messages, response). Cold storage to S3/GCS/Azure Blob.',
  collectionMethod: 'stream-database',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'SpendLog entry',
      language: 'json',
      content: `{
  "request_id": "req-abc123",
  "call_type": "completion",
  "api_key": "sk-1234...",
  "spend": 0.0342,
  "total_tokens": 4948,
  "prompt_tokens": 4821,
  "completion_tokens": 127,
  "model": "gpt-4o",
  "startTime": "2026-05-27T14:32:18.456Z",
  "endTime": "2026-05-27T14:32:20.796Z",
  "team_id": "team-1",
  "end_user": "dschmitz@example.com",
  "messages": [{ "role": "user", "content": "Fix the auth bug" }],
  "response": { "id": "chatcmpl-abc", "choices": [...] }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['spend', 'total_tokens', 'prompt_tokens', 'completion_tokens', 'model', 'call_type'],
      reason: 'Monitor per-request token usage and cost',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['request_id', 'model', 'team_id', 'end_user', 'call_type', 'startTime', 'endTime'],
      reason: 'Investigate usage patterns by team, user, and model',
    },
    {
      tierId: 'cribl-lake',
      fields: ['messages', 'response', 'all fields'],
      reason: 'Prove full request/response audit',
    },
  ],
};

const litellmOtel: Source = {
  id: 'litellm-otel',
  name: 'OTel (Native OTLP)',
  description:
    'Native OTLP export via [otel] callback. Supports otlp_http, otlp_grpc, console exporters. Full gen_ai.* semantic conventions including cost, TTFT, token usage, and content events.',
  collectionMethod: 'edge-otel-receiver',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'OTel Span (gen_ai.*)',
      language: 'json',
      content: `{
  "name": "chat gpt-4o",
  "kind": "CLIENT",
  "attributes": {
    "gen_ai.system": "openai",
    "gen_ai.request.model": "gpt-4o",
    "gen_ai.usage.input_tokens": 4821,
    "gen_ai.usage.output_tokens": 127,
    "gen_ai.cost.total_cost": 0.0342,
    "gen_ai.client.response.time_to_first_token": 1200,
    "gen_ai.client.response.duration": 2340
  }
}`,
    },
    {
      label: 'OTel Metric',
      language: 'json',
      content: `{
  "name": "gen_ai.client.token.usage",
  "value": 4948,
  "attributes": {
    "gen_ai.system": "openai",
    "gen_ai.request.model": "gpt-4o"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['gen_ai.usage.input_tokens', 'gen_ai.usage.output_tokens', 'gen_ai.cost.total_cost', 'gen_ai.client.response.duration'],
      reason: 'Monitor token usage, cost, and latency from OTel spans',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['gen_ai.system', 'gen_ai.request.model', 'trace_id', 'span_id'],
      reason: 'Investigate cross-provider traces and distributed tracing',
    },
  ],
};

const litellmPrometheus: Source = {
  id: 'litellm-prometheus',
  name: 'Prometheus Metrics (30+)',
  description:
    '30+ metrics exposed at /metrics endpoint: litellm_spend_metric, litellm_total_tokens_metric, litellm_input/output_tokens_metric, budget metrics, rate limit metrics, latency metrics (total/overhead/llm_api/ttft), fallback metrics.',
  collectionMethod: 'stream-prometheus-scrape',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Prometheus metric',
      language: 'text',
      content: `# Metrics exposed at /metrics
litellm_spend_metric{end_user="dschmitz",hashed_api_key="sk-xxx",model="gpt-4o",team="team-1"} 0.0342
litellm_total_tokens_metric{model="gpt-4o",team="team-1"} 4948
litellm_input_tokens_metric{model="gpt-4o"} 4821
litellm_output_tokens_metric{model="gpt-4o"} 127
litellm_deployment_latency_total{model="gpt-4o"} 2.34`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['litellm_spend_metric', 'litellm_total_tokens_metric', 'litellm_input_tokens_metric', 'litellm_output_tokens_metric', 'litellm_deployment_latency_total'],
      reason: 'Monitor spend, tokens, and latency in real-time',
    },
  ],
};

const litellmAdminApi: Source = {
  id: 'litellm-admin-api',
  name: 'Admin API (Spend, Usage, Keys)',
  description:
    'LiteLLM Admin API: /key/info, /user/info, /team/info, /global/spend/logs, /global/spend/keys, /global/spend/users, /global/spend/teams. ~30 Prisma tables including daily aggregation tables.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Global spend logs response',
      language: 'json',
      content: `{
  "data": [
    {
      "date": "2026-05-27",
      "spend": 12.45,
      "api_requests": 142,
      "total_tokens": 702336,
      "team_id": "team-1"
    }
  ]
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['spend', 'api_requests', 'total_tokens', 'date', 'team_id'],
      reason: 'Monitor daily spend and request counts',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['date', 'spend', 'team_id', 'api_requests'],
      reason: 'Investigate spend trends by team over time',
    },
  ],
};

// ── Kong AI Gateway Sources ───────────────────────────────────────────────────

const kongAiPluginLogs: Source = {
  id: 'kong-ai-plugin-logs',
  name: 'AI Plugin Logging (ai-proxy)',
  description:
    'Kong ai-proxy plugin with log_payloads and log_statistics. 20+ fields under ai.proxy.* including token usage, cost, latency, provider, model. Emitted via Kong log plugins.',
  collectionMethod: 'stream-http',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'AI Proxy Log Entry',
      language: 'json',
      content: `{
  "ai": {
    "proxy": {
      "usage": {
        "prompt_tokens": 4821,
        "completion_tokens": 127,
        "total_tokens": 4948,
        "cost": 0.0342,
        "time_per_token": 18.4,
        "time_to_first_token": 1200
      },
      "meta": {
        "request_model": "gpt-4o",
        "response_model": "gpt-4o",
        "provider_name": "openai",
        "plugin_id": "kong-ai-proxy-123",
        "llm_latency": 2340,
        "request_mode": "streaming"
      },
      "payload": {
        "request_body": { "messages": [...] },
        "response_body": { "choices": [...] }
      }
    }
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['ai.proxy.usage.prompt_tokens', 'ai.proxy.usage.completion_tokens', 'ai.proxy.usage.cost', 'ai.proxy.meta.llm_latency'],
      reason: 'Monitor token usage, cost, and latency per request',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['ai.proxy.meta.provider_name', 'ai.proxy.meta.request_model', 'ai.proxy.meta.plugin_id', 'ai.proxy.meta.request_mode'],
      reason: 'Investigate provider routing and model usage patterns',
    },
    {
      tierId: 'cribl-lake',
      fields: ['ai.proxy.payload.request_body', 'ai.proxy.payload.response_body', 'all fields'],
      reason: 'Prove full request/response audit',
    },
  ],
};

const kongRateLimiting: Source = {
  id: 'kong-rate-limiting',
  name: 'Rate Limiting Logs',
  description:
    'Kong ai-rate-limiting-advanced plugin. HTTP 429 responses with rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After). Counts by total_tokens, prompt_tokens, completion_tokens, or cost.',
  collectionMethod: 'stream-http',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Rate limit 429 response',
      language: 'json',
      content: `{
  "status": 429,
  "headers": {
    "X-RateLimit-Limit": "100000",
    "X-RateLimit-Remaining": "0",
    "Retry-After": "3600"
  },
  "body": {
    "message": "Rate limit exceeded for model gpt-4o",
    "limit_type": "total_tokens"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['status', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'limit_type'],
      reason: 'Monitor rate limit hits and remaining quota',
    },
  ],
};

const kongOtel: Source = {
  id: 'kong-otel',
  name: 'OTel Plugin (AI Metrics)',
  description:
    'Kong opentelemetry plugin with metrics.enable_ai_metrics: true. Gen AI span attributes (v3.13+), kong.gen_ai.* metrics for cost, cache, RAG, and guardrails latency (v3.14+).',
  collectionMethod: 'edge-otel-receiver',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Kong Gen AI Metric',
      language: 'json',
      content: `{
  "name": "kong.gen_ai.cost",
  "value": 0.0342,
  "attributes": {
    "ai_provider": "openai",
    "ai_model": "gpt-4o",
    "consumer": "user-abc"
  }
}`,
    },
    {
      label: 'Gen AI Span',
      language: 'json',
      content: `{
  "name": "chat gpt-4o",
  "kind": "CLIENT",
  "attributes": {
    "gen_ai.system": "openai",
    "gen_ai.request.model": "gpt-4o",
    "gen_ai.usage.input_tokens": 4821,
    "gen_ai.usage.output_tokens": 127,
    "kong.gen_ai.cache_status": "miss"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['kong.gen_ai.cost', 'gen_ai.usage.input_tokens', 'gen_ai.usage.output_tokens', 'ai_provider', 'ai_model'],
      reason: 'Monitor cost, tokens, and cache performance per provider/model',
    },
  ],
};

const kongPrometheus: Source = {
  id: 'kong-prometheus',
  name: 'Prometheus AI Metrics',
  description:
    'Kong prometheus plugin with ai_metrics: true. Exposes ai_llm_requests_total, ai_llm_cost_total, ai_llm_tokens_total, ai_llm_provider_latency_ms. Labels: ai_provider, ai_model, cache_status, consumer, request_mode.',
  collectionMethod: 'stream-prometheus-scrape',
  criblProduct: 'Cribl Stream',
  exampleEventTabs: [
    {
      label: 'Prometheus AI metrics',
      language: 'text',
      content: `# Metrics exposed at /metrics
ai_llm_requests_total{ai_provider="openai",ai_model="gpt-4o",consumer="user-abc",request_mode="streaming"} 142
ai_llm_cost_total{ai_provider="openai",ai_model="gpt-4o"} 4.86
ai_llm_tokens_total{ai_provider="openai",ai_model="gpt-4o",token_type="prompt"} 684462
ai_llm_tokens_total{ai_provider="openai",ai_model="gpt-4o",token_type="completion"} 18034
ai_llm_provider_latency_ms{ai_provider="openai",ai_model="gpt-4o"} 2340`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['ai_llm_requests_total', 'ai_llm_cost_total', 'ai_llm_tokens_total', 'ai_llm_provider_latency_ms'],
      reason: 'Monitor request volume, cost, tokens, and latency per provider/model',
    },
  ],
};

// ── Export Gateways ────────────────────────────────────────────────────────────

export const gateways: Gateway[] = [
  {
    id: 'litellm',
    name: 'LiteLLM',
    description:
      'Open source AI proxy that normalizes calls to 100+ LLM providers. Access logs, spend tracking (~30 tables), native OTel, Prometheus (30+ metrics), 20+ callback integrations, Admin API.',
    sources: [litellmAccessLogs, litellmOtel, litellmPrometheus, litellmAdminApi],
  },
  {
    id: 'kong-ai-gateway',
    name: 'Kong AI Gateway',
    description:
      'Kong AI Gateway with 24+ AI plugins. AI proxy logging, rate limiting, OTel with AI metrics, Prometheus AI metrics. Guardrails, caching, RAG, prompt engineering, MCP/A2A proxy.',
    sources: [kongAiPluginLogs, kongRateLimiting, kongOtel, kongPrometheus],
  },
];