import type { ReactNode } from 'react';
import { config } from '../../config';
import { shell } from '../../content/copy';
import { themeVars } from '../../lib/theme';
import { useTheme } from '../../state/ThemeProvider';
import { CommandPalette } from './CommandPalette';
import { ConsentBanner } from './ConsentBanner';
import { Drawer } from './Drawer';
import { MobileBar } from './MobileBar';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Sidebar } from './Sidebar';
import { TopTabs } from './TopTabs';

/**
 * The page frame. Every viewport gets the same markup and CSS picks the layout (the
 * `rail:` breakpoint is 1100px), so the page renders correctly before any script runs.
 * Below 1100px the nav is always the mobile bar and drawer, whatever navLayout says.
 */
export function Shell({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const railNav = config.navLayout === 'sidebar';

  return (
    <div style={themeVars(theme)}>
      <a href="#main" className="skip-link">
        {shell.skipToContent}
      </a>
      {railNav ? <Sidebar /> : <TopTabs />}
      <MobileBar />
      <Drawer />

      <main
        id="main"
        tabIndex={-1}
        className={`relative z-[1] outline-hidden max-rail:pt-[var(--topbar-h)] ${
          railNav ? 'rail:ml-[var(--rail-w)]' : 'rail:pt-[62px]'
        }`}
      >
        <div className="mx-auto max-w-[1180px] px-[15px] pb-[80px] sm:px-[22px] sm:pb-[120px] rail:px-[30px] wide:max-w-[1420px]">
          {children}
        </div>
      </main>

      <ConsentBanner />
      <PrivacyPolicy />
      <CommandPalette />
    </div>
  );
}
