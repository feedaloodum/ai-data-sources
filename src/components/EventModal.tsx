import { useState, useEffect } from 'react';
import { Modal, Text } from '@capra/core';
import type { Source } from '../types';
import './SourceCard.css';

interface EventModalProps {
  source: Source | null;
  onClose: () => void;
}

export function EventModal({ source, onClose }: EventModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Reset to first tab whenever a new source is opened.
  useEffect(() => {
    if (source) setActiveTab(0);
  }, [source?.id]);

  const isOpen = source !== null;
  const tabs = source?.exampleEventTabs ?? [];
  const currentTab = tabs[activeTab];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={source?.name}
      footer={null}
      size="lg"
      isDismissible
    >
      {source && (
        <div>
          <div className="event-modal__description">
            <Text variant="body-sm-normal" color="subtle">
              {source.description}
            </Text>
          </div>
          {source.contains && source.contains.length > 0 && (
            <div className="event-modal__section">
              <Text as="div" variant="body-sm-semibold">
                What the logs contain
              </Text>
              <ul className="event-modal__list">
                {source.contains.map((item, i) => (
                  <li key={i}>
                    <Text variant="body-sm-normal" color="subtle">{item}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {source.useCases && source.useCases.length > 0 && (
            <div className="event-modal__section">
              <Text as="div" variant="body-sm-semibold">
                Questions this data answers
              </Text>
              <ul className="event-modal__list">
                {source.useCases.map((item, i) => (
                  <li key={i}>
                    <Text variant="body-sm-normal" color="subtle">{item}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tabs.length > 1 && (
            <div className="event-modal__tabs" role="tablist">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.label}
                  role="tab"
                  aria-selected={idx === activeTab}
                  className={`event-modal__tab${idx === activeTab ? ' event-modal__tab--active' : ''}`}
                  onClick={() => setActiveTab(idx)}
                >
                  {tab.label}
                  <span className="event-modal__code-lang">{tab.language}</span>
                </button>
              ))}
            </div>
          )}
          {currentTab && (
            <div className="event-modal__code-block">
              <pre>{currentTab.content}</pre>
            </div>
          )}
          {tabs.length === 0 && (
            <Text variant="body-sm-normal" color="subtle">
              No example events available.
            </Text>
          )}
        </div>
      )}
    </Modal>
  );
}