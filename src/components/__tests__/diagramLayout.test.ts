import { describe, it, expect } from 'vitest';
import {
  computeLayout,
  computePath,
} from '../diagramLayout';
import type {
  DiagramNode,
  DiagramConfig,
} from '../diagramTypes';

// Helper to create a minimal node
function node(id: string, x: number, y: number, w = 100, h = 50): DiagramNode {
  return { id, label: id, x, y, width: w, height: h, type: 'source', clickable: true };
}

describe('Diagram Layout', () => {
  describe('computePath', () => {
    it('creates a straight vertical path for vertically aligned nodes', () => {
      const from = node('a', 100, 100);
      const to = node('b', 100, 200);
      const path = computePath(from, to, 'data-flow');
      expect(path).toContain('M');
      expect(path).toContain('L');
      // Should be a simple M ... L ... (straight line)
      expect(path).not.toContain('C');
    });

    it('creates a horizontal path for horizontally aligned nodes', () => {
      const from = node('a', 100, 100, 50, 50);
      const to = node('b', 300, 100, 50, 50);
      const path = computePath(from, to, 'data-flow');
      expect(path).toContain('M');
      expect(path).toContain('L');
    });

    it('creates an orthogonal (L-shaped) path for diagonal nodes', () => {
      const from = node('a', 100, 100, 50, 50);
      const to = node('b', 300, 200, 50, 50);
      const path = computePath(from, to, 'data-flow');
      // Orthogonal path: M x1 y1 L x1 midY L x2 midY L x2 y2
      expect(path).toContain('M');
      expect(path).toContain('L');
      expect(path).not.toContain('C');
    });

    it('creates a curved path for return/audit edges', () => {
      const from = node('a', 300, 100, 50, 50);
      const to = node('b', 100, 100, 50, 50);
      const path = computePath(from, to, 'return');
      // Curved path uses C (cubic bezier)
      expect(path).toContain('C');
    });
  });

  describe('computeLayout — pair view', () => {
    it('positions agent nodes on the left', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        nodes: [
          { id: 'agent', label: 'Claude Code', x: 50, y: 50, width: 120, height: 60, type: 'agent', clickable: true },
          { id: 'provider', label: 'AWS Bedrock', x: 600, y: 50, width: 120, height: 60, type: 'provider', clickable: true },
          { id: 'source1', label: 'JSONL Sessions', x: 50, y: 150, width: 100, height: 40, type: 'source', clickable: true },
          { id: 'edge', label: 'Cribl Edge', x: 250, y: 250, width: 100, height: 40, type: 'edge', clickable: true },
          { id: 'stream', label: 'Cribl Stream', x: 350, y: 350, width: 100, height: 40, type: 'stream', clickable: true },
          { id: 'tier1', label: 'Lakehouse Engine', x: 100, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
          { id: 'tier2', label: 'Metrics Store', x: 250, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
          { id: 'tier3', label: 'Cribl Lake', x: 400, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
          { id: 'tier4', label: 'Archive', x: 550, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
        ],
        edges: [
          { id: 'edge-1', from: 'agent', to: 'provider', type: 'api-call', label: 'Converse API' },
          { id: 'edge-2', from: 'source1', to: 'edge', type: 'data-flow', label: 'tails JSONL' },
        ],
        layers: [],
      };

      const layout = computeLayout(config);

      expect(layout.nodes).toHaveLength(9);
      expect(layout.edges).toHaveLength(2);
      // Agent should be on the left side (x < 300)
      const agentNode = layout.nodes.find((n) => n.id === 'agent');
      expect(agentNode).toBeDefined();
      expect(agentNode!.x).toBeLessThan(300);
      // Provider should be on the right side (x > 300)
      const providerNode = layout.nodes.find((n) => n.id === 'provider');
      expect(providerNode).toBeDefined();
      expect(providerNode!.x).toBeGreaterThan(300);
    });

    it('computes edge paths as valid SVG path strings', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        nodes: [
          { id: 'a', label: 'A', x: 50, y: 50, width: 100, height: 50, type: 'agent', clickable: true },
          { id: 'b', label: 'B', x: 300, y: 50, width: 100, height: 50, type: 'provider', clickable: true },
        ],
        edges: [
          { id: 'edge-1', from: 'a', to: 'b', type: 'api-call', label: 'API' },
        ],
        layers: [],
      };

      const layout = computeLayout(config);
      expect(layout.edges).toHaveLength(1);
      expect(layout.edges[0].path).toContain('M');
    });

    it('tier nodes are positioned in a row at the bottom', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        nodes: [
          { id: 'tier1', label: 'Lakehouse Engine', x: 50, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
          { id: 'tier2', label: 'Metrics Store', x: 200, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
          { id: 'tier3', label: 'Cribl Lake', x: 350, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
          { id: 'tier4', label: 'Archive', x: 500, y: 450, width: 120, height: 40, type: 'tier', clickable: false },
        ],
        edges: [],
        layers: [],
      };

      const layout = computeLayout(config);
      const tierNodes = layout.nodes.filter((n) => n.type === 'tier');
      expect(tierNodes).toHaveLength(4);
      // All tiers should have the same y coordinate (in a row)
      const yValues = tierNodes.map((n) => n.y);
      expect(new Set(yValues).size).toBe(1);
      // Tiers should be ordered left to right
      const xValues = tierNodes.map((n) => n.x);
      for (let i = 1; i < xValues.length; i++) {
        expect(xValues[i]).toBeGreaterThan(xValues[i - 1]);
      }
    });
  });

  describe('computeLayout — standalone views', () => {
    it('positions generic placeholder for agent view (provider on right)', () => {
      const config: DiagramConfig = {
        viewType: 'agent',
        nodes: [
          { id: 'agent', label: 'Cursor', x: 50, y: 50, width: 120, height: 60, type: 'agent', clickable: true },
          { id: 'generic-provider', label: 'AI Provider', x: 600, y: 50, width: 120, height: 60, type: 'generic', clickable: false },
        ],
        edges: [],
        layers: [],
      };

      const layout = computeLayout(config);
      const generic = layout.nodes.find((n) => n.id === 'generic-provider');
      expect(generic).toBeDefined();
      expect(generic!.clickable).toBe(false);
      expect(generic!.type).toBe('generic');
    });

    it('positions generic placeholder for provider view (agent on left)', () => {
      const config: DiagramConfig = {
        viewType: 'provider',
        nodes: [
          { id: 'generic-agent', label: 'AI Agent', x: 50, y: 50, width: 120, height: 60, type: 'generic', clickable: false },
          { id: 'provider', label: 'AWS Bedrock', x: 600, y: 50, width: 120, height: 60, type: 'provider', clickable: true },
        ],
        edges: [],
        layers: [],
      };

      const layout = computeLayout(config);
      const generic = layout.nodes.find((n) => n.id === 'generic-agent');
      expect(generic).toBeDefined();
      expect(generic!.clickable).toBe(false);
    });

    it('positions both generic placeholders for gateway view', () => {
      const config: DiagramConfig = {
        viewType: 'gateway',
        nodes: [
          { id: 'generic-agent', label: 'AI Agent', x: 50, y: 50, width: 120, height: 60, type: 'generic', clickable: false },
          { id: 'gateway', label: 'LiteLLM', x: 350, y: 50, width: 120, height: 60, type: 'gateway', clickable: true },
          { id: 'generic-provider', label: 'AI Provider', x: 600, y: 50, width: 120, height: 60, type: 'generic', clickable: false },
        ],
        edges: [],
        layers: [],
      };

      const layout = computeLayout(config);
      const generics = layout.nodes.filter((n) => n.type === 'generic');
      expect(generics).toHaveLength(2);
      expect(generics.every((n) => !n.clickable)).toBe(true);
      const gateway = layout.nodes.find((n) => n.id === 'gateway');
      expect(gateway).toBeDefined();
      expect(gateway!.clickable).toBe(true);
    });
  });

  describe('computeLayout — viewBox', () => {
    it('encloses all node bounds with padding', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        nodes: [
          node('a', 100, 100, 100, 50),
          node('b', 500, 400, 100, 50),
        ],
        edges: [],
        layers: [],
      };

      const { viewBox } = computeLayout(config);
      // Node bounds: x [50, 550], y [75, 425]. viewBox must contain these.
      expect(viewBox.x).toBeLessThanOrEqual(50);
      expect(viewBox.y).toBeLessThanOrEqual(75);
      expect(viewBox.x + viewBox.width).toBeGreaterThanOrEqual(550);
      expect(viewBox.y + viewBox.height).toBeGreaterThanOrEqual(425);
    });

    it('encloses content that would fall outside a fixed 900x680 box', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        // Tier row wider than 900 — first tier sits at negative x.
        nodes: [
          node('t1', -30, 600, 150, 40),
          node('t4', 990, 600, 150, 40),
        ],
        edges: [],
        layers: [],
      };

      const { viewBox } = computeLayout(config);
      expect(viewBox.x).toBeLessThanOrEqual(-105); // left edge of first tier
      expect(viewBox.x + viewBox.width).toBeGreaterThanOrEqual(1065);
    });

    it('extends upward to cover return-edge curves', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        nodes: [
          node('a', 100, 100, 100, 50),
          node('b', 300, 100, 100, 50),
        ],
        edges: [{ id: 'r', from: 'a', to: 'b', type: 'return' }],
        layers: [],
      };

      const { viewBox } = computeLayout(config);
      // Curve peaks at y = 100 - 80 = 20, so top must be at or above it.
      expect(viewBox.y).toBeLessThanOrEqual(20);
    });

    it('falls back to a small box for empty diagrams', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        nodes: [],
        edges: [],
        layers: [],
      };

      const { viewBox } = computeLayout(config);
      expect(viewBox.width).toBeGreaterThan(0);
      expect(viewBox.height).toBeGreaterThan(0);
    });
  });

  describe('computeLayout — layers', () => {
    it('preserves layer positions', () => {
      const config: DiagramConfig = {
        viewType: 'pair',
        nodes: [],
        edges: [],
        layers: [
          { id: 'agent-area', label: 'Developer Workstation', x: 20, y: 20, width: 300, height: 200, colorToken: 'accent' },
        ],
      };

      const layout = computeLayout(config);
      expect(layout.layers).toHaveLength(1);
      expect(layout.layers[0].label).toBe('Developer Workstation');
    });
  });
});