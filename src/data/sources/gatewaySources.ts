import type { Gateway, Source } from '../../types';

// ── LiteLLM Sources ────────────────────────────────────────────────────────────

const litellmAccessLogs: Source = {
  id: 'litellm-access-logs',
  name: 'Access Logs (SpendLogs)',
  description:
    'LiteLLM emits a standard_logging_object per request. PostgreSQL-backed (LiteLLM_SpendLogs table: request_id, call_type, spend, tokens, model, messages, response). Cold storage to S3/GCS/Azure Blob.',
  collectionMethod: 'stream-database',
  criblProduct: 'Cribl Stream',
  contains: [
    'Per-request spend, call type, and model',
    'Token counts: prompt, completion, total',
    'Attribution: team id, end user, api key, request id',
    'Full request messages and response payloads; start/end times',
  ],
  useCases: [
    'What did each request cost, and how many tokens did it use?',
    'Which teams, users, and keys are driving spend?',
    'Which models are being routed to, and how often?',
    'Can I reconstruct the full request/response for an audit?',
  ],
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
  contains: [
    'OTel spans/metrics with full gen_ai.* semantic conventions',
    'System and request model, token usage, total cost',
    'Latency: time-to-first-token and total duration',
    'Trace and span ids for distributed tracing',
  ],
  useCases: [
    'What is token usage, cost, and latency per request from live telemetry?',
    'Can I trace a request across providers via distributed tracing?',
    'How does TTFT and duration vary by model?',
    'Can I feed gateway telemetry into an OTel-based pipeline?',
  ],
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
  contains: [
    'Spend and token metrics (total/input/output) labeled by model, team, user, key',
    'Budget and rate-limit metrics',
    'Latency metrics: total, overhead, llm_api, TTFT',
    'Fallback metrics',
  ],
  useCases: [
    'What is real-time spend and token throughput per model/team?',
    'Are teams approaching budget or rate limits?',
    'Where is latency coming from — gateway overhead vs. the LLM API?',
    'How often are model fallbacks triggering?',
  ],
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
  contains: [
    'Aggregated spend and request counts by day and team',
    'Total tokens per period',
    'Key, user, and team info endpoints',
    'Daily aggregation across ~30 Prisma tables',
  ],
  useCases: [
    'What is daily spend and request volume per team?',
    'How is spend trending over time?',
    'What keys, users, and teams exist and how are they configured?',
    'Can I report org-level usage without per-request logs?',
  ],
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
  contains: [
    'Per-request usage: prompt/completion/total tokens, cost, time-per-token, TTFT',
    'Meta: request/response model, provider name, plugin id, llm latency, request mode',
    'Full request and response payloads (when log_payloads is enabled)',
  ],
  useCases: [
    'What did each proxied request cost, in tokens and dollars?',
    'Which upstream provider and model served a request?',
    'Where is latency coming from (LLM latency, time-per-token)?',
    'Can I reconstruct the full request/response for an audit?',
  ],
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
  contains: [
    'HTTP 429 rate-limit responses',
    'Rate-limit headers: limit, remaining, Retry-After',
    'Limit type (total_tokens, prompt_tokens, completion_tokens, or cost) and affected model',
  ],
  useCases: [
    'When and where are consumers hitting rate limits?',
    'Which models or teams are exhausting their quota?',
    'How much headroom remains against configured limits?',
    'Are rate limits causing user-facing failures?',
  ],
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
  contains: [
    'Gen AI span attributes (gen_ai.system, request model, token usage)',
    'kong.gen_ai.* metrics for cost and cache status',
    'RAG and guardrails latency (v3.14+)',
    'Per-consumer, provider, and model dimensions',
  ],
  useCases: [
    'What is cost and token usage per provider/model from OTel?',
    'How effective is Kong\'s semantic cache (cache hit/miss)?',
    'What latency do RAG and guardrails add?',
    'Can I trace gateway AI traffic in an OTel pipeline?',
  ],
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
  contains: [
    'Request, cost, and token counters (ai_llm_requests_total, ai_llm_cost_total, ai_llm_tokens_total)',
    'Provider latency (ai_llm_provider_latency_ms)',
    'Labels: ai_provider, ai_model, cache_status, consumer, request_mode',
    'Token type breakdown (prompt vs. completion)',
  ],
  useCases: [
    'What is real-time request volume, cost, and token usage per provider/model?',
    'How does latency vary across providers?',
    'Which consumers are driving the most gateway traffic?',
    'How is cache status affecting cost?',
  ],
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