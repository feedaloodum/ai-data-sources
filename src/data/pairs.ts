import type { Pair } from '../types';

export const pairs: Pair[] = [
  {
    id: 'claude-code-aws-bedrock',
    agentId: 'claude-code',
    providerId: 'aws-bedrock',
    tipNotes: [
      'Bedrock S3 invocation logs already capture full prompts and completions — consider dropping content from JSONL hot tier to avoid duplication.',
      'CloudTrail provides developer identity via STS session name. Correlate with JSONL session_id for per-developer attribution.',
    ],
  },
  {
    id: 'claude-code-anthropic-api',
    agentId: 'claude-code',
    providerId: 'anthropic-api',
    tipNotes: [
      'No cloud-side backup of prompts (unlike Bedrock S3) — keep more content in the Lake tier for audit completeness.',
      'Admin API usage_report/claude_code provides cost attribution specifically for Claude Code sessions.',
    ],
  },
  {
    id: 'cursor-azure-ai-foundry',
    agentId: 'cursor',
    providerId: 'azure-ai-foundry',
    tipNotes: [
      'Cursor Hooks capture prompt/response content in real-time. Azure diagnostic logs capture request/response at the provider level — correlate via timestamps.',
      'Azure Usage metrics provide per-deployment token counts. Use ModelDeploymentName dimension to map back to Cursor sessions.',
    ],
  },
  {
    id: 'codex-cli-openai-api',
    agentId: 'codex-cli',
    providerId: 'openai-api',
    tipNotes: [
      'Codex OTel and OpenAI Admin API both capture token usage. Use OTel for per-session real-time metrics, Admin API for aggregate cost tracking.',
      'OpenAI Admin API audit logs (140+ event types) provide compliance coverage. Codex rollouts provide session-level detail.',
    ],
  },
  {
    id: 'chatgpt-desktop-openai-api',
    agentId: 'chatgpt-desktop',
    providerId: 'openai-api',
    tipNotes: [
      'ChatGPT Desktop uses the Codex engine — same ~/.codex/ infrastructure as Codex CLI. OTel config is shared.',
      'OpenAI Compliance Logs Platform provides ChatGPT Enterprise audit data separate from API admin logs.',
    ],
  },
];