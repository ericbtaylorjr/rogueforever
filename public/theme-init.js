/*
 * Runs before first paint (blocking, first-party so the CSP allows it) so the page never
 * flashes the wrong theme. Order of precedence: a choice the visitor made with the toggle,
 * then the device setting, then dark. Keep the logic in sync with src/state/ThemeProvider.tsx.
 */
(function () {
  var theme = 'dark';
  try {
    var stored = localStorage.getItem('rc:theme');
    if (stored === 'light' || stored === 'dark') theme = stored;
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch (e) {
    /* storage or matchMedia unavailable: stay dark */
  }
  document.documentElement.setAttribute('data-theme', theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#EBDEB6' : '#0B0B0D');
})();
