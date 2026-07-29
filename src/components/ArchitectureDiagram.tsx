import { useState, useMemo } from 'react';
import { computeLayout } from './diagramLayout';
import type { DiagramConfig, ComputedNode } from './diagramTypes';
import { EventModal } from './EventModal';
import { NodeIcon } from './NodeIcon';
import { getEntityLogo, type EntityKind } from './entityLogos';
import type { Source } from '../types';
import { token } from '@capra/theme';

interface ArchitectureDiagramProps {
  config: DiagramConfig;
  sources?: Record<string, Source>;
}

const NODE_BORDER_TOKEN = {
  agent: 'color.border.accent.default',
  provider: 'color.border.warning.default',
  gateway: 'color.border.highlight.default',
  source: 'color.border.neutral.default',
  edge: 'color.border.success.default',
  stream: 'color.border.success.default',
  tier: 'color.border.neutral.subtle',
  generic: 'color.border.neutral.subtle',
} as const;

const NODE_BG_COLOR = {
  agent: 'color.background.accent.subtle',
  provider: 'color.background.warning.subtle',
  gateway: 'color.background.highlight.subtle',
  source: 'color.background.neutral.subtle',
  edge: 'color.background.success.subtle',
  stream: 'color.background.success.subtle',
  tier: 'color.background.neutral.subtle',
  generic: 'color.background.neutral.subtle',
} as const;

const EDGE_COLOR = {
  'data-flow': 'color.foreground.accent.default',
  'api-call': 'color.foreground.warning.default',
  audit: 'color.foreground.danger.default',
  return: 'color.foreground.danger.default',
} as const;

export function ArchitectureDiagram({ config, sources = {} }: ArchitectureDiagramProps) {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const layout = useMemo(() => computeLayout(config), [config]);

  const handleNodeClick = (node: ComputedNode) => {
    if (!node.clickable) return;
    const source = sources[node.id];
    if (source) {
      setSelectedSource(source);
    }
  };

  const { viewBox } = layout;

  return (
    <>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', minWidth: 700, display: 'block' }}
        >
          <defs>
            <marker id="arrow-default" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" opacity={0.5} />
            </marker>
          </defs>

          {/* Layers */}
          {layout.layers.map((layer) => (
            <g key={layer.id}>
              <rect
                x={layer.x}
                y={layer.y}
                width={layer.width}
                height={layer.height}
                rx={12}
                fill={token('color.background.surface')}
                stroke={token('color.border.neutral.subtle')}
                strokeWidth={1}
                strokeDasharray="6,3"
                opacity={0.5}
              />
              <text
                x={layer.x + 12}
                y={layer.y + 20}
                fontSize={10}
                fontWeight={600}
                fill={token('color.foreground.subtle')}
              >
                {layer.label}
              </text>
            </g>
          ))}

          {/* Edges */}
          {layout.edges.map((edge) => {
            const edgeColorToken = EDGE_COLOR[edge.type] ?? 'color.foreground.subtle';
            return (
              <g key={edge.id}>
                <path
                  d={edge.path}
                  fill="none"
                  stroke={token(edgeColorToken)}
                  strokeWidth={1.5}
                  strokeDasharray={edge.type === 'return' ? '4,4' : undefined}
                  markerEnd="url(#arrow-default)"
                  opacity={0.6}
                />
                <path id={`${edge.id}-path`} d={edge.path} fill="none" stroke="none" />
                {edge.label && (
                  <text fontSize={8} fill={token('color.foreground.subtle')} textAnchor="middle">
                    <textPath href={`#${edge.id}-path`} startOffset="50%">
                      {edge.label}
                    </textPath>
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {layout.nodes.map((node) => {
            const borderToken = NODE_BORDER_TOKEN[node.type] ?? 'color.border.neutral.default';
            const bgToken = NODE_BG_COLOR[node.type] ?? 'color.background.neutral.subtle';
            const isGeneric = node.type === 'generic';
            const isBranded = node.type === 'agent' || node.type === 'provider' || node.type === 'gateway';
            const BrandLogo = isBranded && node.brandId ? getEntityLogo(node.brandId, node.type as EntityKind) : null;
            const hasLeadingMark = Boolean(node.icon || BrandLogo);
            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{ cursor: node.clickable ? 'pointer' : 'default' }}
              >
                <rect
                  x={node.x - node.width / 2}
                  y={node.y - node.height / 2}
                  width={node.width}
                  height={node.height}
                  rx={8}
                  fill={token(bgToken)}
                  stroke={token(borderToken)}
                  strokeWidth={isGeneric ? 1 : 1.5}
                  strokeDasharray={isGeneric ? '4,4' : undefined}
                  opacity={isGeneric ? 0.6 : 1}
                />
                <foreignObject
                  x={node.x - node.width / 2}
                  y={node.y - node.height / 2}
                  width={node.width}
                  height={node.height}
                  style={{ pointerEvents: 'none' }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: hasLeadingMark ? 'flex-start' : 'center',
                      gap: 8,
                      padding: '4px 8px',
                      boxSizing: 'border-box',
                      textAlign: hasLeadingMark ? 'left' : 'center',
                    }}
                  >
                    {node.icon && (
                      <span style={{ display: 'inline-flex', flexShrink: 0, fontSize: 18 }}>
                        <NodeIcon icon={node.icon} />
                      </span>
                    )}
                    {BrandLogo && (
                      <span style={{ display: 'inline-flex', flexShrink: 0, fontSize: 20 }}>
                        <BrandLogo size="md" />
                      </span>
                    )}
                    <span
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: token('color.foreground.default'),
                      }}
                    >
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
                {node.clickable && (
                  <text
                    x={node.x + node.width / 2 - 10}
                    y={node.y - node.height / 2 + 13}
                    fontSize={9}
                    fill={token('color.foreground.subtle')}
                  >
                    🔍
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <EventModal source={selectedSource} onClose={() => setSelectedSource(null)} />
    </>
  );
}