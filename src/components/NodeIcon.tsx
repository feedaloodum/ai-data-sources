import { StreamColor, EdgeColor, LakeColor } from '@capra/icons/logos';
import { Lakehouse, Metrics, StorageFilled } from '@capra/icons';
import type { NodeIcon as NodeIconType } from './diagramTypes';

// Maps a node's `icon` value to a Cribl product logo (color) or a Capra icon.
// Destinations use monochrome Capra icons; Cribl products use their brand marks.
const ICONS = {
  edge: EdgeColor,
  stream: StreamColor,
  lake: LakeColor,
  lakehouse: Lakehouse,
  metrics: Metrics,
  archive: StorageFilled,
} as const;

export function NodeIcon({ icon }: { icon: NodeIconType }) {
  const Icon = ICONS[icon];
  return <Icon size="md" />;
}
