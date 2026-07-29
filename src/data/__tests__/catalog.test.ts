import { describe, it, expect } from 'vitest';
import {
  getAgentById,
  getProviderById,
  getGatewayById,
  getPairById,
  getPairsForAgent,
  getPairsForProvider,
  listAllAgents,
  listAllProviders,
  listAllGateways,
  listAllPairs,
} from '../catalog';

describe('Catalog Index', () => {
  describe('listAllAgents', () => {
    it('returns 4 V1 agents', () => {
      const agents = listAllAgents();
      expect(agents).toHaveLength(4);
    });

    it('includes Claude Code, Codex CLI, Cursor, ChatGPT Desktop as V1 agents', () => {
      const agents = listAllAgents();
      const ids = agents.map((a) => a.id);
      expect(ids).toContain('claude-code');
      expect(ids).toContain('codex-cli');
      expect(ids).toContain('cursor');
      expect(ids).toContain('chatgpt-desktop');
    });
  });

  describe('listAllProviders', () => {
    it('returns 5 providers', () => {
      const providers = listAllProviders();
      expect(providers).toHaveLength(5);
    });

    it('includes AWS Bedrock, Anthropic API, OpenAI API, Azure AI Foundry, GCP Vertex AI', () => {
      const ids = listAllProviders().map((p) => p.id);
      expect(ids).toContain('aws-bedrock');
      expect(ids).toContain('anthropic-api');
      expect(ids).toContain('openai-api');
      expect(ids).toContain('azure-ai-foundry');
      expect(ids).toContain('gcp-vertex-ai');
    });
  });

  describe('listAllGateways', () => {
    it('returns 2 gateways', () => {
      const gateways = listAllGateways();
      expect(gateways).toHaveLength(2);
    });

    it('includes LiteLLM and Kong AI Gateway', () => {
      const ids = listAllGateways().map((g) => g.id);
      expect(ids).toContain('litellm');
      expect(ids).toContain('kong-ai-gateway');
    });
  });

  describe('listAllPairs', () => {
    it('returns 5 pairs', () => {
      const pairs = listAllPairs();
      expect(pairs).toHaveLength(5);
    });

    it('includes Claude Code + AWS Bedrock pair', () => {
      const pairs = listAllPairs();
      const pair = pairs.find(
        (p) => p.agentId === 'claude-code' && p.providerId === 'aws-bedrock'
      );
      expect(pair).toBeDefined();
    });
  });

  describe('getAgentById', () => {
    it('returns the correct agent', () => {
      const agent = getAgentById('claude-code');
      expect(agent).toBeDefined();
      expect(agent?.name).toBe('Claude Code');
    });

    it('returns undefined for unknown id', () => {
      expect(getAgentById('nonexistent')).toBeUndefined();
    });
  });

  describe('getProviderById', () => {
    it('returns the correct provider', () => {
      const provider = getProviderById('aws-bedrock');
      expect(provider).toBeDefined();
      expect(provider?.name).toBe('AWS Bedrock');
    });

    it('returns undefined for unknown id', () => {
      expect(getProviderById('nonexistent')).toBeUndefined();
    });
  });

  describe('getGatewayById', () => {
    it('returns the correct gateway', () => {
      const gateway = getGatewayById('litellm');
      expect(gateway).toBeDefined();
      expect(gateway?.name).toBe('LiteLLM');
    });

    it('returns undefined for unknown id', () => {
      expect(getGatewayById('nonexistent')).toBeUndefined();
    });
  });

  describe('getPairById', () => {
    it('returns the correct pair with agent and provider refs', () => {
      const pair = getPairById('claude-code-aws-bedrock');
      expect(pair).toBeDefined();
      expect(pair?.agentId).toBe('claude-code');
      expect(pair?.providerId).toBe('aws-bedrock');
    });

    it('returns undefined for unknown id', () => {
      expect(getPairById('nonexistent')).toBeUndefined();
    });
  });

  describe('getPairsForAgent', () => {
    it('returns all pairs containing Claude Code', () => {
      const pairs = getPairsForAgent('claude-code');
      expect(pairs).toHaveLength(2);
      const providerIds = pairs.map((p) => p.providerId);
      expect(providerIds).toContain('aws-bedrock');
      expect(providerIds).toContain('anthropic-api');
    });

    it('returns empty array for agent with no pairs', () => {
      const pairs = getPairsForAgent('nonexistent');
      expect(pairs).toHaveLength(0);
    });
  });

  describe('getPairsForProvider', () => {
    it('returns all pairs containing OpenAI API', () => {
      const pairs = getPairsForProvider('openai-api');
      expect(pairs).toHaveLength(2);
      const agentIds = pairs.map((p) => p.agentId);
      expect(agentIds).toContain('codex-cli');
      expect(agentIds).toContain('chatgpt-desktop');
    });

    it('returns empty array for provider with no pairs', () => {
      const pairs = getPairsForProvider('gcp-vertex-ai');
      expect(pairs).toHaveLength(0);
    });
  });
});