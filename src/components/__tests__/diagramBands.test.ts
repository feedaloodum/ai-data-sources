import { describe, it, expect } from 'vitest';
import { computeLayout } from '../diagramLayout';
import { buildAgentConfig } from '../diagramBuilders';
import type { Agent, Source } from '../../types';

function src(id: string): Source {
  return {
    id, name: `${id} long source name here`, description: '',
    collectionMethod: 'edge-file-tail', criblProduct: 'Cribl Edge',
    exampleEventTabs: [], tieringSuggestions: [],
  };
}

describe('diagram bands frame their nodes', () => {
  it('each layer encloses all its member nodes, no cross-band overlap', () => {
    const agent: Agent = {
      id: 'a', name: 'Agent', description: '', status: 'v1',
      sources: Array.from({ length: 7 }, (_, i) => src(`s${i}`)),
    };
    const layout = computeLayout(buildAgentConfig(agent));

    // Every node sits within its layer's rect.
    const byId = new Map(layout.layers.map((l) => [l.id, l]));
    for (const n of layout.nodes) {
      const l = byId.get(n.layerId!);
      expect(l, `layer for ${n.id}`).toBeDefined();
      expect(n.x - n.width / 2).toBeGreaterThanOrEqual(l!.x - 0.01);
      expect(n.x + n.width / 2).toBeLessThanOrEqual(l!.x + l!.width + 0.01);
      expect(n.y - n.height / 2).toBeGreaterThanOrEqual(l!.y - 0.01);
      expect(n.y + n.height / 2).toBeLessThanOrEqual(l!.y + l!.height + 0.01);
    }

    // Sources band bottom must not cross into Collection band top.
    const sources = byId.get('sources')!;
    const collection = byId.get('collection')!;
    expect(sources.y + sources.height).toBeLessThanOrEqual(collection.y + 0.01);
  });
});
