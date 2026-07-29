import type { Agent, Source } from '../../types';

// ── Claude Code Sources ──────────────────────────────────────────────────────

const claudeCodeJsonl: Source = {
  id: 'claude-code-jsonl',
  name: 'JSONL Sessions',
  description:
    'Session-level JSONL files written by Claude Code CLI to ~/.claude/projects/*/sessions/*.jsonl. Contains full conversation data including prompts, completions, tool calls, and token counts.',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'Full conversation — user prompts and assistant completions',
    'Per-turn token usage: input, output, cache-creation, cache-read',
    'Cost in USD, model id, session id, and timestamps',
    'Tool-use and tool-result events with names and arguments',
    'Stop reasons (e.g. tool_use, end_turn)',
  ],
  useCases: [
    'What did a developer ask, and how did Claude Code respond?',
    'How many tokens and how much cost did a session consume?',
    'Which tools were invoked during a session, and with what inputs?',
    'Can I reconstruct a full session for review or audit?',
  ],
  exampleEventTabs: [
    {
      label: 'Raw JSONL (assistant turn)',
      language: 'json',
      content: `{
  "type": "assistant",
  "content": "I'll read the auth module to understand the issue.",
  "model": "us.anthropic.claude-sonnet-4-20250514-v1:0",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-27T14:32:18.456Z",
  "usage": {
    "input_tokens": 4821,
    "output_tokens": 127,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 3640
  },
  "cost_usd": 0.0342,
  "stop_reason": "tool_use"
}`,
    },
    {
      label: 'Raw JSONL (tool_use)',
      language: 'json',
      content: `{
  "type": "tool_use",
  "name": "Read",
  "input": {
    "file_path": "/home/dev/project/src/auth.py"
  },
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-27T14:32:18.456Z",
  "usage": {
    "input_tokens": 0,
    "output_tokens": 0
  }
}`,
    },
    {
      label: 'OTel Span',
      language: 'json',
      content: `{
  "trace_id": "abc123def456789012345678901234",
  "span_id": "a1b2c3d4e5f67890",
  "name": "claude_code.tool_use",
  "kind": 1,
  "start_time": "2026-05-27T14:32:18.456Z",
  "end_time": "2026-05-27T14:32:19.102Z",
  "attributes": {
    "gen_ai.system": "aws_bedrock",
    "gen_ai.request.model": "us.anthropic.claude-sonnet-4-20250514-v1:0",
    "gen_ai.usage.input_tokens": 4821,
    "gen_ai.usage.output_tokens": 127,
    "gen_ai.usage.cache_read_input_tokens": 3640,
    "gen_ai.response.finish_reasons": ["tool_use"],
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "tool_name": "Read",
    "cost_usd": 0.0342
  },
  "resource": {
    "service.name": "claude-code",
    "host.name": "dev-laptop-01",
    "os.user": "dschmitz"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['session_id', 'model', 'total_input_tokens', 'total_output_tokens', 'total_cost_usd', 'duration_seconds'],
      reason: 'Monitor token usage and cost per session',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['session_id', 'developer', 'model', 'token_breakdown', 'tool_call_count', 'tool_names', 'stop_reasons', 'has_guard_detection'],
      reason: 'Investigate session activity and tool patterns',
    },
    {
      tierId: 'cribl-lake',
      fields: ['type', 'content', 'input', 'output', 'name', 'session_id', 'timestamp', 'all fields'],
      reason: 'Prove full activity audit — every event preserved, masked',
    },
  ],
};

const claudeCodeOtel: Source = {
  id: 'claude-code-otel',
  name: 'OTel (OpenTelemetry)',
  description:
    'Alternative collection using Cribl Edge OTel receiver. Receives OpenTelemetry traces, metrics, and logs from Claude Code agents instrumented with the OTel exporter.',
  collectionMethod: 'edge-otel-receiver',
  criblProduct: 'Cribl Edge',
  contains: [
    'OTel spans with trace/span ids and durations (start/end time)',
    'gen_ai.* attributes — system, request model, token usage, finish reasons',
    'Cost, stop reason, and session id',
    'Resource attributes: service.name, host.name, os.user, project',
  ],
  useCases: [
    'What is the token and cost profile per span/turn from live telemetry?',
    'Which developer (os.user/host) and project generated the activity?',
    'How long did each model call and tool use take?',
    'Can I trace agent behavior without tailing local files?',
  ],
  exampleEventTabs: [
    {
      label: 'OTel Span (Enriched)',
      language: 'json',
      content: `{
  "trace_id": "abc123def456789012345678901234",
  "span_id": "a1b2c3d4e5f67890",
  "name": "claude_code.assistant",
  "kind": 1,
  "start_time": "2026-05-27T14:32:18.456Z",
  "end_time": "2026-05-27T14:32:19.102Z",
  "attributes": {
    "gen_ai.system": "aws_bedrock",
    "gen_ai.request.model": "us.anthropic.claude-sonnet-4-20250514-v1:0",
    "gen_ai.usage.input_tokens": 4821,
    "gen_ai.usage.output_tokens": 127,
    "gen_ai.usage.cache_read_input_tokens": 3640,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "cost_usd": 0.0342,
    "stop_reason": "tool_use"
  },
  "resource": {
    "service.name": "claude-code",
    "service.instance.id": "dev-laptop-01",
    "host.name": "dev-laptop-01",
    "os.user": "dschmitz",
    "claude_code.project": "my-app"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['gen_ai.usage.input_tokens', 'gen_ai.usage.output_tokens', 'gen_ai.usage.cache_read_input_tokens', 'cost_usd'],
      reason: 'Monitor token and cost metrics from OTel spans',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['session_id', 'tool_name', 'stop_reason', 'model', 'host.name', 'os.user'],
      reason: 'Investigate developer activity patterns via OTel traces',
    },
  ],
};

const claudeCodeToolCalls: Source = {
  id: 'claude-code-tool-calls',
  name: 'Tool Calls',
  description:
    'File reads/writes, shell commands, code execution, git operations. Part of JSONL session data (tool_use and tool_result events).',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'Tool name (Bash, Read, Write, Edit, etc.) and invocation arguments',
    'Tool result output',
    'Session id and timestamps for each call',
    'Shell commands, file paths, and code-execution details',
  ],
  useCases: [
    'What commands and file operations did the agent run?',
    'Which tools are used most often, and how?',
    'Did the agent execute anything risky or unexpected?',
    'Can I audit every tool call with its arguments and output?',
  ],
  exampleEventTabs: [
    {
      label: 'tool_use event',
      language: 'json',
      content: `{
  "type": "tool_use",
  "name": "Bash",
  "input": { "command": "npm test -- --run" },
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-27T14:32:15.567Z"
}`,
    },
    {
      label: 'tool_result event',
      language: 'json',
      content: `{
  "type": "tool_result",
  "name": "Bash",
  "output": "Tests: 42 passed, 0 failed",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-27T14:32:16.234Z"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['tool_call_count', 'tool_names'],
      reason: 'Monitor tool usage frequency',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['name', 'tool_category_breakdown', 'session_id', 'timestamp'],
      reason: 'Investigate which tools are used and how often',
    },
    {
      tierId: 'cribl-lake',
      fields: ['name', 'input', 'output', 'session_id', 'timestamp'],
      reason: 'Prove full tool call audit with arguments and outputs (masked)',
    },
  ],
};

const claudeCodeMcpCalls: Source = {
  id: 'claude-code-mcp-calls',
  name: 'MCP Server Calls',
  description:
    'Requests to Model Context Protocol servers — filesystem, database, API tools, custom MCP servers. Part of JSONL session data.',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'MCP tool name (mcp__<server>__<tool>) identifying server and operation',
    'Call arguments and results',
    'Session id and timestamps',
    'Interactions with filesystem, database, API, and custom MCP servers',
  ],
  useCases: [
    'Which MCP servers is the agent talking to, and how often?',
    'What data did the agent access through MCP tools?',
    'Are any custom or unexpected MCP servers in use?',
    'Can I audit every MCP call with its arguments?',
  ],
  exampleEventTabs: [
    {
      label: 'MCP tool call',
      language: 'json',
      content: `{
  "type": "tool_use",
  "name": "mcp__filesystem__read_file",
  "input": { "path": "/home/dev/project/config.yaml" },
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-27T14:33:01.123Z"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['mcp_call_count', 'mcp_server_names'],
      reason: 'Monitor MCP server usage',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['name', 'session_id', 'timestamp'],
      reason: 'Investigate MCP server interaction patterns',
    },
    {
      tierId: 'cribl-lake',
      fields: ['name', 'input', 'output', 'session_id', 'timestamp'],
      reason: 'Prove full MCP call audit (masked)',
    },
  ],
};

// ── Codex CLI Sources ─────────────────────────────────────────────────────────

const codexRollouts: Source = {
  id: 'codex-session-rollouts',
  name: 'Session Rollouts',
  description:
    'Session rollout files written by Codex CLI to ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl. RolloutItem format: session_meta, response_item, event_msg, turn_context, world_state. Compressed rollouts use .jsonl.zst.',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'session_meta — session id, timestamp, cwd, cli version, model provider',
    'response_item — assistant messages and output text',
    'event_msg — tool calls with tool name, input, success, duration',
    'turn_context and world_state per rollout item',
  ],
  useCases: [
    'What was the full conversation and tool activity in a Codex session?',
    'Which tools ran, did they succeed, and how long did they take?',
    'What working directory and CLI version produced the session?',
    'Can I reconstruct or audit a complete Codex rollout?',
  ],
  exampleEventTabs: [
    {
      label: 'session_meta (first line)',
      language: 'json',
      content: `{
  "type": "session_meta",
  "payload": {
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-05-07T17-24-21",
    "cwd": "/home/dev/project",
    "originator": "cli",
    "cli_version": "1.0.0",
    "source": "cli",
    "model_provider": "openai"
  }
}`,
    },
    {
      label: 'response_item (assistant)',
      language: 'json',
      content: `{
  "type": "response_item",
  "payload": {
    "type": "message",
    "role": "assistant",
    "content": [
      { "type": "output_text", "text": "I'll fix the auth module." }
    ]
  }
}`,
    },
    {
      label: 'event_msg (tool call)',
      language: 'json',
      content: `{
  "type": "event_msg",
  "payload": {
    "type": "tool_call",
    "tool_name": "shell",
    "input": { "command": "npm test" },
    "success": true,
    "duration_ms": 3400
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['session_id', 'model_provider', 'tokens_used', 'cwd', 'cli_version'],
      reason: 'Monitor session metadata and token usage',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['session_id', 'response_item', 'event_msg', 'turn_context'],
      reason: 'Investigate conversation flow and tool usage patterns',
    },
    {
      tierId: 'cribl-lake',
      fields: ['all fields — full rollout preserved'],
      reason: 'Prove full session audit — every rollout event',
    },
  ],
};

const codexSqliteState: Source = {
  id: 'codex-sqlite-state',
  name: 'SQLite State',
  description:
    'SQLite database at ~/.codex/state_5.sqlite. Threads table contains session metadata: tokens_used, git info, model_provider, cwd, title, sandbox_policy, approval_mode.',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'Per-thread session metadata: id, title, created/updated timestamps',
    'Tokens used, model provider, and source',
    'Git correlation: git_sha, git_branch, git_origin_url',
    'Sandbox policy and approval mode; cwd and rollout path',
  ],
  useCases: [
    'How many tokens did each Codex session consume?',
    'Which git branch/commit was a session working against?',
    'What sandbox and approval settings were in effect?',
    'How many sessions ran, and from where?',
  ],
  exampleEventTabs: [
    {
      label: 'Threads table row',
      language: 'json',
      content: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "rollout_path": "~/.codex/sessions/2026/05/07/rollout-2026-05-07T17-24-21-a1b2c3d4.jsonl",
  "created_at": "2026-05-07T17:24:21Z",
  "updated_at": "2026-05-07T17:35:42Z",
  "source": "cli",
  "model_provider": "openai",
  "cwd": "/home/dev/project",
  "title": "Fix auth module",
  "sandbox_policy": "workspace-write",
  "approval_mode": "on-failure",
  "tokens_used": 42807,
  "git_sha": "abc1234",
  "git_branch": "main",
  "git_origin_url": "git@github.com:org/repo.git"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['tokens_used', 'model_provider', 'source', 'created_at', 'updated_at'],
      reason: 'Monitor token usage and session counts from thread metadata',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['id', 'cwd', 'title', 'git_sha', 'git_branch', 'sandbox_policy', 'approval_mode'],
      reason: 'Investigate session context and git correlation',
    },
  ],
};

const codexOtel: Source = {
  id: 'codex-otel',
  name: 'OTel (OpenTelemetry)',
  description:
    'Native OTel support via the codex-otel crate. Configured in ~/.codex/config.toml [otel] section. OTLP HTTP/gRPC for logs, traces, and metrics. Includes gen_ai.usage.* attributes.',
  collectionMethod: 'edge-otel-receiver',
  criblProduct: 'Cribl Edge',
  contains: [
    'OTel logs/traces/metrics events (e.g. codex.api_request)',
    'Per-request attributes: model, attempt, status, duration',
    'gen_ai.usage.* token attributes',
    'Session source (cli, etc.)',
  ],
  useCases: [
    'What is the success rate and latency of Codex API requests?',
    'How many retries/attempts are happening per request?',
    'What is token usage per request from live telemetry?',
    'Can I monitor Codex without tailing local rollout files?',
  ],
  exampleEventTabs: [
    {
      label: 'OTel Log Event (codex.api_request)',
      language: 'json',
      content: `{
  "target": "codex_otel",
  "name": "codex.api_request",
  "attributes": {
    "model": "gpt-4o",
    "attempt": 1,
    "status": "success",
    "duration_ms": 2340,
    "session_source": "cli"
  }
}`,
    },
    {
      label: 'OTel Metric (codex.tool.call)',
      language: 'json',
      content: `{
  "name": "codex.tool.call",
  "value": 1,
  "unit": "1",
  "attributes": {
    "tool_name": "shell",
    "success": true,
    "duration_ms": 3400,
    "model": "gpt-4o",
    "app.version": "1.0.0"
  }
}`,
    },
    {
      label: 'OTel Span (gen_ai.usage)',
      language: 'json',
      content: `{
  "name": "handle_responses",
  "kind": "CLIENT",
  "attributes": {
    "gen_ai.usage.input_tokens": 4821,
    "gen_ai.usage.cache_read.input_tokens": 3640,
    "gen_ai.usage.cache_write.input_tokens": 0,
    "gen_ai.usage.output_tokens": 127,
    "codex.usage.reasoning_output_tokens": 500,
    "codex.usage.total_tokens": 9588
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['gen_ai.usage.input_tokens', 'gen_ai.usage.output_tokens', 'codex.usage.total_tokens', 'codex.api_request.duration_ms'],
      reason: 'Monitor token usage, cost, and API latency from OTel metrics',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['session_id', 'tool_name', 'model', 'codex.tool_decision', 'codex.tool_result'],
      reason: 'Investigate tool decisions and results via OTel traces',
    },
  ],
};

// ── Cursor Sources ────────────────────────────────────────────────────────────

const cursorHooks: Source = {
  id: 'cursor-hooks',
  name: 'Hooks (Telemetry)',
  description:
    'Cursor Hooks system — 20+ lifecycle events (beforeSubmitPrompt, afterAgentResponse, preToolUse, postToolUse, sessionStart, sessionEnd, subagentStart/Stop, etc.). Shell scripts forward structured JSON to any HTTP endpoint. Primary telemetry collection pathway.',
  collectionMethod: 'stream-http',
  criblProduct: 'Cribl Stream',
  contains: [
    '20+ lifecycle events (beforeSubmitPrompt, afterAgentResponse, pre/postToolUse, session start/end, subagent start/stop)',
    'Prompt and response text, model, request id, trace id, timestamp',
    'Per-response token usage (input/output)',
    'Tool events with tool name, file path, and success',
  ],
  useCases: [
    'What are developers prompting Cursor, and what does it return?',
    'Which tools/files did the agent touch, and did they succeed?',
    'What is token usage and model distribution across prompts?',
    'Can I capture a full conversation audit from the primary telemetry path?',
  ],
  exampleEventTabs: [
    {
      label: 'beforeSubmitPrompt event',
      language: 'json',
      content: `{
  "event": "beforeSubmitPrompt",
  "prompt": "Fix the authentication bug in login.py",
  "model": "gpt-4o",
  "request_id": "req-abc123",
  "trace_id": "trace-xyz789",
  "timestamp": "2026-05-27T14:32:00.000Z"
}`,
    },
    {
      label: 'afterAgentResponse event',
      language: 'json',
      content: `{
  "event": "afterAgentResponse",
  "response": "I've identified the bug in the JWT validation logic...",
  "model": "gpt-4o",
  "request_id": "req-abc123",
  "trace_id": "trace-xyz789",
  "timestamp": "2026-05-27T14:32:15.000Z",
  "usage": {
    "input_tokens": 3200,
    "output_tokens": 450
  }
}`,
    },
    {
      label: 'postToolUse event',
      language: 'json',
      content: `{
  "event": "postToolUse",
  "tool": "edit_file",
  "file_path": "/src/auth.py",
  "success": true,
  "request_id": "req-abc123",
  "timestamp": "2026-05-27T14:32:10.000Z"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['event', 'model', 'usage.input_tokens', 'usage.output_tokens', 'timestamp'],
      reason: 'Monitor prompt frequency, token usage, and model distribution',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['event', 'request_id', 'trace_id', 'tool', 'file_path', 'model'],
      reason: 'Investigate agent activity patterns and tool usage',
    },
    {
      tierId: 'cribl-lake',
      fields: ['prompt', 'response', 'all fields'],
      reason: 'Prove full conversation audit (masked)',
    },
  ],
};

const cursorAnalyticsApi: Source = {
  id: 'cursor-analytics-api',
  name: 'Analytics API',
  description:
    'Enterprise REST API at api.cursor.com. Agent edits, Tab usage, DAU, model usage, conversation insights, MCP adoption. Polled aggregate data.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  requiresEnterprise: true,
  contains: [
    'Aggregate usage: agent edits, Tab acceptances, daily active users',
    'Model usage breakdown by model',
    'Conversation insights: avg turns, total conversations',
    'MCP adoption: servers connected, tools available',
  ],
  useCases: [
    'How much is the team using Cursor (edits, Tab, DAU)?',
    'Which models are most used across the org?',
    'How is MCP adoption trending?',
    'How engaged are developers (conversation depth) over time?',
  ],
  exampleEventTabs: [
    {
      label: 'Analytics response',
      language: 'json',
      content: `{
  "agent_edits": 142,
  "tab_acceptances": 89,
  "dau": 1,
  "model_usage": {
    "gpt-4o": 78,
    "claude-sonnet-4": 42
  },
  "conversation_insights": {
    "avg_turns_per_conversation": 8.3,
    "total_conversations": 12
  },
  "mcp_adoption": {
    "servers_connected": 3,
    "tools_available": 15
  },
  "date": "2026-05-27"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['agent_edits', 'tab_acceptances', 'dau', 'model_usage', 'conversation_insights', 'mcp_adoption'],
      reason: 'Monitor aggregate usage and adoption metrics',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['agent_edits', 'model_usage', 'conversation_insights'],
      reason: 'Investigate usage trends over time',
    },
  ],
};

const cursorAiCodeTracking: Source = {
  id: 'cursor-ai-code-tracking',
  name: 'AI Code Tracking API',
  description: 'Enterprise API for per-commit AI attribution. Tracks which code changes were AI-assisted.',
  collectionMethod: 'stream-api-poll',
  criblProduct: 'Cribl Stream',
  requiresEnterprise: true,
  contains: [
    'Per-commit AI attribution: commit SHA, AI-assisted lines, total lines',
    'AI attribution percentage',
    'Model used and timestamp',
  ],
  useCases: [
    'What percentage of committed code was AI-assisted?',
    'Which commits and models drove AI contributions?',
    'How is AI code adoption trending over time?',
    'Can I report AI attribution for engineering leadership?',
  ],
  exampleEventTabs: [
    {
      label: 'AI attribution response',
      language: 'json',
      content: `{
  "commit_sha": "abc1234",
  "ai_assisted_lines": 42,
  "total_lines": 67,
  "ai_attribution_pct": 62.7,
  "model_used": "gpt-4o",
  "timestamp": "2026-05-27T14:35:00Z"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['ai_assisted_lines', 'total_lines', 'ai_attribution_pct', 'model_used'],
      reason: 'Monitor AI code contribution percentages',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['commit_sha', 'ai_assisted_lines', 'model_used', 'timestamp'],
      reason: 'Investigate AI attribution per commit',
    },
  ],
};

const cursorAuditLogStreaming: Source = {
  id: 'cursor-audit-log-streaming',
  name: 'Audit Log Streaming',
  description:
    'Enterprise audit log streaming to SIEM/S3/webhooks. Audit events (NOT AI content — use Hooks for content).',
  collectionMethod: 'stream-s3',
  criblProduct: 'Cribl Stream',
  requiresEnterprise: true,
  contains: [
    'Audit events: event type, action, user id',
    'Source IP address and timestamp',
    'Administrative/access events (not AI prompt/response content)',
  ],
  useCases: [
    'Who logged in and performed admin actions, and when?',
    'From what IP addresses is the org accessing Cursor?',
    'Can I stream Cursor audit events to my SIEM?',
    'Can I retain a compliance audit trail (note: content lives in Hooks)?',
  ],
  exampleEventTabs: [
    {
      label: 'Audit log event',
      language: 'json',
      content: `{
  "event_type": "user_login",
  "user_id": "user-abc123",
  "timestamp": "2026-05-27T14:00:00Z",
  "ip_address": "10.0.1.42",
  "action": "login"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'cribl-lake',
      fields: ['event_type', 'user_id', 'timestamp', 'ip_address', 'action'],
      reason: 'Prove compliance audit trail',
    },
    {
      tierId: 'archive',
      fields: ['all fields'],
      reason: 'Keep long-term compliance retention',
    },
  ],
};

const cursorGlobalState: Source = {
  id: 'cursor-global-state',
  name: 'Global State (state.vscdb)',
  description:
    'SQLite database at ~/Library/Application Support/Cursor/User/globalStorage/state.vscdb. Contains chat history (aiService.prompts, workbench.panel.aichat.view.aichat.chatdata) and saved prompts.',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'Chat history — user and assistant turns (chatdata)',
    'Saved prompts (aiService.prompts)',
    'Key/value rows from the local ItemTable store',
  ],
  useCases: [
    'What conversations happened locally, even without enterprise telemetry?',
    'What saved prompts does a developer keep?',
    'Can I recover chat history from a local machine?',
    'Can I preserve conversation content for audit?',
  ],
  exampleEventTabs: [
    {
      label: 'ItemTable query result',
      language: 'json',
      content: `{
  "key": "workbench.panel.aichat.view.aichat.chatdata",
  "value": "[{\\"role\\": \\"user\\", \\"text\\": \\"Fix the auth bug\\"}, {\\"role\\": \\"assistant\\", \\"text\\": \\"I'll look at the auth module...\\"}]"
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'cribl-lake',
      fields: ['key', 'value (chat history JSON)'],
      reason: 'Prove full conversation history from local storage',
    },
  ],
};

const cursorWorkspaceStorage: Source = {
  id: 'cursor-workspace-storage',
  name: 'Workspace Storage',
  description:
    'Per-workspace SQLite at ~/Library/Application Support/Cursor/User/workspaceStorage/<hash>/state.vscdb. Chat/composer history keyed by MD5 hash of project path.',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'Per-project chat and composer history',
    'Workspace hash (MD5 of project path) and project path',
    'Entry counts for chat and composer',
  ],
  useCases: [
    'Which projects has a developer used Cursor on?',
    'How much AI activity happened per project?',
    'Can I attribute conversation history to a specific repo?',
    'Can I recover per-workspace chat history locally?',
  ],
  exampleEventTabs: [
    {
      label: 'Workspace state query',
      language: 'json',
      content: `{
  "workspace_hash": "a1b2c3d4e5f67890",
  "project_path": "/home/dev/project",
  "chat_entries": 42,
  "composer_entries": 15
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'cribl-lake',
      fields: ['workspace_hash', 'project_path', 'chat_entries', 'composer_entries'],
      reason: 'Prove per-project conversation history',
    },
  ],
};

const cursorInternalOtel: Source = {
  id: 'cursor-internal-otel',
  name: 'Internal OTel (Not User-Configurable)',
  description:
    'Cursor bundles @opentelemetry/otlp-exporter-base and sends trace spans via HTTP to Cursor\'s own backend. NOT user-configurable — users cannot redirect OTLP to their own collector. For user-collectible telemetry, use Hooks instead.',
  collectionMethod: 'edge-otel-receiver',
  criblProduct: 'Cribl Edge',
  limitation: 'Internal only — locked to Cursor backend. Use Hooks for user-collectible telemetry.',
  contains: [
    'Internal trace spans (e.g. agent_cli.turn.start) with request/trace ids',
    'Locked to Cursor\'s backend — not redirectable to your own collector',
  ],
  useCases: [
    'What internal spans exist (visible only in error logs)?',
    'Why can\'t I collect this directly — and what should I use instead (Hooks)?',
  ],
  exampleEventTabs: [
    {
      label: 'Internal OTel trace (from error logs)',
      language: 'json',
      content: `{
  "name": "agent_cli.turn.start",
  "attributes": {
    "request_id": "req-abc123",
    "trace_id": "trace-xyz789"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'lakehouse-engine',
      fields: ['request_id', 'trace_id'],
      reason: 'Would investigate agent turn patterns — but NOT user-collectible. Use Hooks instead.',
    },
  ],
};

// ── ChatGPT Desktop Sources ───────────────────────────────────────────────────

const chatgptCodexEngine: Source = {
  id: 'chatgpt-codex-engine',
  name: 'Codex Engine Sessions',
  description:
    'ChatGPT Desktop uses the Codex agent system for coding features. Same ~/.codex/ paths, same rollout format, same [otel] config as Codex CLI. SessionMeta has source: "chatgpt".',
  collectionMethod: 'edge-file-tail',
  criblProduct: 'Cribl Edge',
  contains: [
    'Codex rollout items with source: "chatgpt" in session_meta',
    'Session id, cwd, cli version, model provider, timestamp',
    'Assistant response items and event messages (tool calls)',
    'Same ~/.codex/ format as Codex CLI',
  ],
  useCases: [
    'What coding sessions came from ChatGPT Desktop vs. Codex CLI (source field)?',
    'What did the assistant do during a ChatGPT Desktop coding session?',
    'How much token usage comes from ChatGPT Desktop?',
    'Can I audit ChatGPT Desktop coding activity?',
  ],
  exampleEventTabs: [
    {
      label: 'Session metadata (source: chatgpt)',
      language: 'json',
      content: `{
  "type": "session_meta",
  "payload": {
    "session_id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    "timestamp": "2026-05-27T10-15-30",
    "cwd": "/home/dev/project",
    "source": "chatgpt",
    "cli_version": "1.0.0",
    "model_provider": "openai"
  }
}`,
    },
    {
      label: 'Response item (assistant)',
      language: 'json',
      content: `{
  "type": "response_item",
  "payload": {
    "type": "message",
    "role": "assistant",
    "content": [
      { "type": "output_text", "text": "I'll create a new test file for the auth module." }
    ]
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['session_id', 'source', 'model_provider', 'tokens_used'],
      reason: 'Monitor ChatGPT Desktop coding session usage',
    },
    {
      tierId: 'lakehouse-engine',
      fields: ['session_id', 'response_item', 'event_msg'],
      reason: 'Investigate conversation flow and tool patterns',
    },
    {
      tierId: 'cribl-lake',
      fields: ['all fields — full rollout preserved'],
      reason: 'Prove full session audit',
    },
  ],
};

const chatgptOtel: Source = {
  id: 'chatgpt-otel',
  name: 'OTel (via Codex Engine)',
  description:
    'Same OTel support as Codex CLI — via the codex-otel crate. Configured in ~/.codex/config.toml [otel] section. OTLP HTTP/gRPC for logs, traces, metrics.',
  collectionMethod: 'edge-otel-receiver',
  criblProduct: 'Cribl Edge',
  contains: [
    'OTel logs/traces/metrics (e.g. codex.conversation_starts) with source: chatgpt',
    'Model, sandbox policy, approval mode',
    'gen_ai.usage.* and codex.usage.* token attributes',
  ],
  useCases: [
    'What is token usage for ChatGPT Desktop coding sessions from live telemetry?',
    'What sandbox/approval settings were used?',
    'Can I monitor ChatGPT Desktop without tailing local files?',
    'How does ChatGPT Desktop activity compare to Codex CLI?',
  ],
  exampleEventTabs: [
    {
      label: 'OTel Log (codex.conversation_starts)',
      language: 'json',
      content: `{
  "target": "codex_otel",
  "name": "codex.conversation_starts",
  "attributes": {
    "model": "gpt-4o",
    "source": "chatgpt",
    "sandbox_policy": "workspace-write",
    "approval_mode": "on-failure"
  }
}`,
    },
  ],
  tieringSuggestions: [
    {
      tierId: 'metrics-store',
      fields: ['gen_ai.usage.input_tokens', 'gen_ai.usage.output_tokens', 'codex.usage.total_tokens'],
      reason: 'Monitor token usage from ChatGPT Desktop coding sessions',
    },
  ],
};

// ── Export Agents ─────────────────────────────────────────────────────────────

export const agents: Agent[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    description:
      'Anthropic CLI coding agent. Writes JSONL session files to ~/.claude/. Supports OTel, tool calls, and MCP server calls.',
    status: 'v1',
    sources: [claudeCodeJsonl, claudeCodeOtel, claudeCodeToolCalls, claudeCodeMcpCalls],
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    description:
      'OpenAI CLI coding agent. Writes session rollout files to ~/.codex/. Has native OTel via codex-otel crate. SQLite state database.',
    status: 'v1',
    sources: [codexRollouts, codexSqliteState, codexOtel, claudeCodeToolCalls, claudeCodeMcpCalls],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description:
      'Cursor IDE (VS Code fork). Uses Hooks for telemetry (20+ lifecycle events). Enterprise Analytics API and AI Code Tracking. Local SQLite state for chat history.',
    status: 'v1',
    sources: [
      cursorHooks,
      cursorAnalyticsApi,
      cursorAiCodeTracking,
      cursorAuditLogStreaming,
      cursorGlobalState,
      cursorWorkspaceStorage,
      cursorInternalOtel,
    ],
  },
  {
    id: 'chatgpt-desktop',
    name: 'ChatGPT Desktop',
    description:
      'OpenAI ChatGPT desktop app. Uses Codex engine for coding features — same ~/.codex/ infrastructure as Codex CLI. OTel via codex-otel crate.',
    status: 'v1',
    sources: [chatgptCodexEngine, chatgptOtel],
  },
];