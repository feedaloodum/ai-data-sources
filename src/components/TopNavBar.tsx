import { Link, useLocation } from 'react-router-dom';
import { TopNav, Text, Switch } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeProvider';

// Section anchors live on the landing page; each links to `/#<id>` so the nav
// works from any route (react-router navigates home, the hash scrolls).
const NAV_LINKS: { label: string; hash: string }[] = [
  { label: 'Collection', hash: 'collection' },
  { label: 'Pairs', hash: 'pairs' },
  { label: 'Agents', hash: 'agents' },
  { label: 'Providers', hash: 'providers' },
  { label: 'Gateways', hash: 'gateways' },
];

const brandLinkStyle: CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
};

const navRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: token('spacing.lg'),
};

const navLinkStyle: CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
};

const themeToggleStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: token('spacing.xs'),
};

export function TopNavBar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { theme, toggleTheme } = useTheme();

  return (
    <TopNav>
      <TopNav.Start>
        <Link to="/" style={brandLinkStyle}>
          <Text variant="heading-sm" color="default">AI Data Sources</Text>
        </Link>
      </TopNav.Start>
      <TopNav.End>
        <nav style={navRowStyle}>
          {NAV_LINKS.map((item) => (
            <Link
              key={item.hash}
              to={isHome ? `#${item.hash}` : `/#${item.hash}`}
              style={navLinkStyle}
            >
              <Text variant="body-sm-semibold" color="subtle">{item.label}</Text>
            </Link>
          ))}
          <label style={themeToggleStyle}>
            <Text variant="body-sm-normal" color="subtle">Dark</Text>
            <Switch
              aria-label="Toggle dark mode"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </label>
        </nav>
      </TopNav.End>
    </TopNav>
  );
}
