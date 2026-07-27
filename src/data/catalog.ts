import type { Agent, Provider, Gateway, Pair } from '../types';
import { agents } from './sources/agentSources';
import { providers } from './sources/providerSources';
import { gateways } from './sources/gatewaySources';
import { pairs } from './pairs';

// ── List functions ────────────────────────────────────────────────────────────

export function listAllAgents(): Agent[] {
  return agents;
}

export function listAllProviders(): Provider[] {
  return providers;
}

export function listAllGateways(): Gateway[] {
  return gateways;
}

export function listAllPairs(): Pair[] {
  return pairs;
}

// ── Lookup by ID ──────────────────────────────────────────────────────────────

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export function getGatewayById(id: string): Gateway | undefined {
  return gateways.find((g) => g.id === id);
}

export function getPairById(id: string): Pair | undefined {
  return pairs.find((p) => p.id === id);
}

// ── Relationship queries ───────────────────────────────────────────────────────

export function getPairsForAgent(agentId: string): Pair[] {
  return pairs.filter((p) => p.agentId === agentId);
}

export function getPairsForProvider(providerId: string): Pair[] {
  return pairs.filter((p) => p.providerId === providerId);
}