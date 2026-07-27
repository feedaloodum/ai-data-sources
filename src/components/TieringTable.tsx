import { Text } from '@capra/core';
import type { Source, TierId, TieringSuggestion } from '../types';
import { TIERS, TIER_ORDER } from '../data/tiering';
import './TieringTable.css';

interface TieringTableProps {
  sources: Source[];
}

function findSuggestion(
  source: Source,
  tierId: TierId,
): TieringSuggestion | undefined {
  return source.tieringSuggestions.find((s) => s.tierId === tierId);
}

export function TieringTable({ sources }: TieringTableProps) {
  return (
    <div className="tiering-table" role="table" aria-label="Sources by tier">
      {/* Header row: corner cell + one column per tier */}
      <div className="tiering-row tiering-row-header" role="row">
        <div className="tiering-cell tiering-cell-corner" role="columnheader">
          <Text variant="body-sm-semibold" color="subtle">
            Source
          </Text>
        </div>
        {TIER_ORDER.map((tierId) => {
          const tier = TIERS[tierId];
          return (
            <div
              key={tierId}
              className="tiering-cell tiering-cell-tier"
              role="columnheader"
            >
              <Text variant="body-sm-semibold">{tier.name}</Text>
              <Text variant="body-xs-normal" color="subtle">
                {tier.verb}
              </Text>
            </div>
          );
        })}
      </div>

      {/* One row per source */}
      {sources.map((source) => (
        <div className="tiering-row" role="row" key={source.id}>
          <div className="tiering-cell tiering-cell-source" role="rowheader">
            <Text variant="body-sm-semibold">{source.name}</Text>
          </div>
          {TIER_ORDER.map((tierId) => {
            const suggestion = findSuggestion(source, tierId);
            return (
              <div
                key={tierId}
                className={
                  'tiering-cell tiering-cell-data' +
                  (suggestion ? '' : ' tiering-cell-empty')
                }
                role="cell"
              >
                {suggestion ? (
                  <div className="tiering-suggestion">
                    <Text as="div" variant="body-xs-semibold">
                      {suggestion.fields.join(', ')}
                    </Text>
                    <Text as="div" variant="body-xs-normal" color="subtle">
                      {suggestion.reason}
                    </Text>
                  </div>
                ) : (
                  <Text variant="body-md-normal" color="subtle">
                    —
                  </Text>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default TieringTable;