import type { ReactNode } from 'react';
import { config } from '../../config';
import { shell } from '../../content/copy';
import { themeVars } from '../../lib/theme';
import { useCompendium } from '../../state/CompendiumProvider';
import { CommandPalette } from './CommandPalette';
import { Drawer } from './Drawer';
import { MobileBar } from './MobileBar';
import { Sidebar } from './Sidebar';
import { TopTabs } from './TopTabs';

export function Shell({ children }: { children: ReactNode }) {
  const { isNarrow, isWide, isPhone } = useCompendium();

  // Below 1100px the nav is always the drawer, whatever navLayout says.
  const railNav = !isNarrow && config.navLayout === 'sidebar';
  const topNav = !isNarrow && config.navLayout === 'topTabs';

  return (
    <div style={themeVars()}>
      <a href="#main" className="skip-link">
        {shell.skipToContent}
      </a>
      {railNav && <Sidebar />}
      {topNav && <TopTabs />}
      {isNarrow && (
        <>
          <MobileBar />
          <Drawer />
        </>
      )}

      <main
        id="main"
        tabIndex={-1}
        className="relative z-[1] outline-none"
        style={{
          marginLeft: railNav ? 'var(--rail-w)' : undefined,
          paddingTop: isNarrow ? 'var(--topbar-h)' : topNav ? 62 : undefined,
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: isWide ? 1420 : 1180,
            padding: `0 ${isPhone ? 15 : isNarrow ? 22 : 30}px ${isPhone ? 80 : 120}px`,
          }}
        >
          {children}
        </div>
      </main>

      <CommandPalette />
    </div>
  );
}
