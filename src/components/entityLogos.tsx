import type { ComponentType } from 'react';
import {
  Anthropic,
  Aws,
  Cursor,
  GcpBrand,
  MsAzureBrand,
  OpenTelemetry,
} from '@capra/icons/logos';
import { Terminal, ApiOutlined, QuickConnect } from '@capra/icons';
import { Text } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import { OpenAiLogo, LiteLlmLogo, KongLogo } from './customLogos';

// A brand mark rendered next to an entity's name. Capra ships brand logos for
// most vendors here; OpenAI-family entities use a local mark (Capra has no
// OpenAI logo), and anything unmapped falls back to a neutral Capra icon so
// every card/heading is still visually anchored. Capra logos, Capra icons, and
// our custom mark all render with a `size` prop, so they share one type.
type LogoComponent = ComponentType<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }>;

// Keyed by the entity `id` values in src/data/sources/*.
const ENTITY_LOGOS: Record<string, LogoComponent> = {
  // Agents
  'claude-code': Anthropic,
  'codex-cli': OpenAiLogo,
  'chatgpt-desktop': OpenAiLogo,
  cursor: Cursor,
  // Providers
  'aws-bedrock': Aws,
  'anthropic-api': Anthropic,
  'openai-api': OpenAiLogo,
  'azure-ai-foundry': MsAzureBrand,
  'gcp-vertex-ai': GcpBrand,
  // Gateways
  litellm: LiteLlmLogo,
  'kong-ai-gateway': KongLogo,
};

// Fallback by category when an id isn't explicitly mapped.
const FALLBACK_BY_KIND: Record<'agent' | 'provider' | 'gateway' | 'source', LogoComponent> = {
  agent: Terminal,
  provider: ApiOutlined,
  gateway: QuickConnect,
  source: OpenTelemetry,
};

export type EntityKind = 'agent' | 'provider' | 'gateway' | 'source';

export function getEntityLogo(id: string, kind: EntityKind): LogoComponent {
  return ENTITY_LOGOS[id] ?? FALLBACK_BY_KIND[kind];
}

const pageHeadingRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: token('spacing.md'),
  marginBottom: token('spacing.xs'),
};

const pageLogoStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '2rem',
  flexShrink: 0,
};

/** Page-level heading with the entity's brand logo, for detail views. */
export function EntityHeading({ id, kind, title }: { id: string; kind: EntityKind; title: string }) {
  const Logo = getEntityLogo(id, kind);
  return (
    <div style={pageHeadingRowStyle}>
      <span style={pageLogoStyle} aria-hidden>
        <Logo size="xl" />
      </span>
      <Text as="h1" variant="heading-xl">{title}</Text>
    </div>
  );
}

/** Page-level heading combining an agent + provider logo, for pair views. */
export function PairHeading({
  agentId,
  providerId,
  title,
}: {
  agentId: string;
  providerId: string;
  title: string;
}) {
  const AgentLogo = getEntityLogo(agentId, 'agent');
  const ProviderLogo = getEntityLogo(providerId, 'provider');
  return (
    <div style={pageHeadingRowStyle}>
      <span style={{ ...pageLogoStyle, gap: token('spacing.xs') }} aria-hidden>
        <AgentLogo size="xl" />
        <Text as="span" color="subtle">+</Text>
        <ProviderLogo size="xl" />
      </span>
      <Text as="h1" variant="heading-xl">{title}</Text>
    </div>
  );
}
