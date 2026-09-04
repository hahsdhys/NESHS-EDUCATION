import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const THEME_STORAGE_KEY = 'neshs_user_theme';
export const COLOR_THEME_STORAGE_KEY = 'neshs_color_theme';
export const GLASS_INTENSITY_STORAGE_KEY = 'neshs_glass_intensity';
const THEME_OPTIONS = new Set(['dark', 'light', 'glass', 'system']);

const STATUS_COLORS = {
  success: '#2E9B62',
  danger: '#C7433F',
  warning: '#B7791F'
};

const withTokens = palette => ({
  ...palette,
  primary: palette.accent,
  primaryHover: palette.highlight,
  secondary: palette.accentDim,
  success: palette.success || STATUS_COLORS.success,
  danger: palette.danger || STATUS_COLORS.danger,
  warning: palette.warning || STATUS_COLORS.warning,
  gold: palette.gold || STATUS_COLORS.warning,
  dangerDim: palette.dangerDim || 'rgba(199,67,63,0.12)',
  dangerBorder: palette.dangerBorder || 'rgba(199,67,63,0.30)',
  warningDim: palette.warningDim || 'rgba(183,121,31,0.14)',
  warningBorder: palette.warningBorder || 'rgba(183,121,31,0.30)',
  backdrop: palette.backdrop || 'rgba(0,0,0,0.82)',
  mediaOverlay: palette.mediaOverlay || 'rgba(0,0,0,0.35)'
});

export const COLOR_THEMES = [
  {
    id: 'ocean-teal', label: 'Ocean Teal', swatch: '#0A8CA3',
    light: withTokens({ bg: '#F2FBFC', panel: '#FFFFFF', panelAlt: '#E7F8FA', border: '#CDEEF2', accent: '#0A8CA3', accentDim: 'rgba(10,140,163,0.10)', highlight: '#08798D', text: '#052C31', textDim: '#4C7B81' }),
    dark: withTokens({ bg: '#001619', panel: '#031F23', panelAlt: '#062A2F', border: '#0D3A40', accent: '#50E8F4', accentDim: 'rgba(80,232,244,0.14)', highlight: '#8AF2F8', text: '#EAFEFC', textDim: '#7FB9C0' })
  },
  {
    id: 'sunset-coral', label: 'Sunset Coral', swatch: '#F4623A',
    light: withTokens({ bg: '#FFF8F5', panel: '#FFFFFF', panelAlt: '#FFF0E9', border: '#F2DDD4', accent: '#F4623A', accentDim: 'rgba(244,98,58,0.12)', highlight: '#D94E2A', text: '#2B1B14', textDim: '#7A6156' }),
    dark: withTokens({ bg: '#1A1210', panel: '#241814', panelAlt: '#302019', border: '#3A2A22', accent: '#FF7A50', accentDim: 'rgba(255,122,80,0.16)', highlight: '#FF8F6B', text: '#FBEDE6', textDim: '#C9A896' })
  },
  {
    id: 'forest-academic', label: 'Forest Academic', swatch: '#2E7D4F',
    light: withTokens({ bg: '#F6FAF7', panel: '#FFFFFF', panelAlt: '#EDF7F0', border: '#DCEBE1', accent: '#2E7D4F', accentDim: 'rgba(46,125,79,0.12)', highlight: '#256640', text: '#1A2E22', textDim: '#5C7566' }),
    dark: withTokens({ bg: '#0F1712', panel: '#16211A', panelAlt: '#1D2B22', border: '#23342A', accent: '#4CAF7D', accentDim: 'rgba(76,175,125,0.16)', highlight: '#63C093', text: '#E6F2EB', textDim: '#9FC2AD' })
  },
  {
    id: 'royal-indigo', label: 'Royal Indigo', swatch: '#4C3FCB',
    light: withTokens({ bg: '#F7F7FC', panel: '#FFFFFF', panelAlt: '#F0EFFA', border: '#E0DEF5', accent: '#4C3FCB', accentDim: 'rgba(76,63,203,0.11)', highlight: '#3D31A8', text: '#1E1B33', textDim: '#665F8C' }),
    dark: withTokens({ bg: '#131120', panel: '#1B1830', panelAlt: '#242044', border: '#2C2850', accent: '#7B6EF6', accentDim: 'rgba(123,110,246,0.16)', highlight: '#8F84F8', text: '#EBE9FA', textDim: '#A9A2D6' })
  },
  {
    id: 'golden-sand', label: 'Golden Sand', swatch: '#B8860B',
    light: withTokens({ bg: '#FDFBF5', panel: '#FFFFFF', panelAlt: '#F8F2E2', border: '#ECE2C6', accent: '#B8860B', accentDim: 'rgba(184,134,11,0.12)', highlight: '#9A6F09', text: '#2E2712', textDim: '#7A6E4C' }),
    dark: withTokens({ bg: '#1A160D', panel: '#241E11', panelAlt: '#302816', border: '#3A3018', accent: '#E0AC3D', accentDim: 'rgba(224,172,61,0.16)', highlight: '#EABD5C', text: '#F5EDD9', textDim: '#C7B888' })
  },
  {
    id: 'slate-mono', label: 'Slate Mono', swatch: '#3F4753',
    light: withTokens({ bg: '#FAFAFB', panel: '#FFFFFF', panelAlt: '#F1F2F4', border: '#E3E5E9', accent: '#3F4753', accentDim: 'rgba(63,71,83,0.11)', highlight: '#2E3540', text: '#1C1F24', textDim: '#6B7280' }),
    dark: withTokens({ bg: '#131518', panel: '#1B1E22', panelAlt: '#252930', border: '#2A2E34', accent: '#9BA5B4', accentDim: 'rgba(155,165,180,0.16)', highlight: '#B0B9C6', text: '#EDEFF2', textDim: '#9AA1AB' })
  },
  {
    id: 'glass-obsidian', label: 'Glass Obsidian', swatch: '#6E5BFF', darkOnly: true,
    dark: withTokens({
      bg: 'transparent', panel: 'rgba(255,255,255,0.06)', panelAlt: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.12)', accent: '#6E5BFF', accentDim: 'rgba(110,91,255,0.18)',
      highlight: '#8172FF', text: '#F2F3F8', textDim: '#A8ACC4', gold: '#33D9C7',
      success: '#4ADE80', danger: '#FF5C7A', warning: '#F5C451',
      dangerDim: 'rgba(255,92,122,0.15)', dangerBorder: 'rgba(255,92,122,0.40)',
      warningDim: 'rgba(245,196,81,0.15)', warningBorder: 'rgba(245,196,81,0.35)',
      backdrop: 'rgba(5,6,13,0.82)', mediaOverlay: 'rgba(5,6,13,0.35)',
      primaryButton: 'rgba(110,91,255,0.25)', primaryBorder: 'rgba(110,91,255,0.5)'
    })
  }
];

const COLOR_THEME_IDS = new Set(COLOR_THEMES.filter(item => !item.darkOnly).map(item => item.id));
export const getColorTheme = id => COLOR_THEMES.find(item => item.id === id) || COLOR_THEMES[0];

const readStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_OPTIONS.has(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
};

const readStoredColorTheme = () => {
  try {
    const stored = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    return COLOR_THEME_IDS.has(stored) ? stored : COLOR_THEMES[0].id;
  } catch {
    return COLOR_THEMES[0].id;
  }
};

const readStoredGlassIntensity = () => {
  try {
    const stored = Number(window.localStorage.getItem(GLASS_INTENSITY_STORAGE_KEY));
    return Number.isFinite(stored) ? Math.min(100, Math.max(1, stored)) : 60;
  } catch {
    return 60;
  }
};

const getSystemTheme = () => (
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
);

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [colorTheme, setColorThemeState] = useState(readStoredColorTheme);
  const [glassIntensity, setGlassIntensityState] = useState(readStoredGlassIntensity);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = event => setSystemTheme(event.matches ? 'dark' : 'light');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const intensityRatio = glassIntensity / 100;
    const glassValues = {
      blur: `${4 + intensityRatio * 28}px`,
      surfaceOpacity: 0.02 + intensityRatio * 0.12,
      borderOpacity: 0.06 + intensityRatio * 0.16,
      glowRadius: `${8 + intensityRatio * 20}px`,
      glowOpacity: 0.12 + intensityRatio * 0.23,
      orbOpacity: 0.05 + intensityRatio * 0.20,
      saturate: `${110 + intensityRatio * 50}%`
    };
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.dataset.theme = resolvedTheme;
    root.dataset.colorTheme = theme === 'glass' ? 'glass-obsidian' : colorTheme;
    root.dataset.glassMode = theme === 'glass' ? 'true' : 'false';
    root.style.colorScheme = resolvedTheme === 'glass' ? 'dark' : resolvedTheme;
    root.style.setProperty('--glass-blur', glassValues.blur);
    root.style.setProperty('--glass-surface-opacity', glassValues.surfaceOpacity);
    root.style.setProperty('--glass-border-opacity', glassValues.borderOpacity);
    root.style.setProperty('--glass-glow-radius', glassValues.glowRadius);
    root.style.setProperty('--glass-glow-opacity', glassValues.glowOpacity);
    root.style.setProperty('--glass-orb-opacity', glassValues.orbOpacity);
    root.style.setProperty('--glass-saturate', glassValues.saturate);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
      window.localStorage.setItem(GLASS_INTENSITY_STORAGE_KEY, String(glassIntensity));
    } catch {
      // Theme changes still apply for this session when storage is unavailable.
    }
  }, [theme, colorTheme, glassIntensity, resolvedTheme]);

  const setTheme = nextTheme => {
    if (THEME_OPTIONS.has(nextTheme)) setThemeState(nextTheme);
  };

  const setColorTheme = nextTheme => {
    if (COLOR_THEME_IDS.has(nextTheme)) setColorThemeState(nextTheme);
  };

  const setGlassIntensity = nextIntensity => {
    const value = Number(nextIntensity);
    if (Number.isFinite(value)) setGlassIntensityState(Math.min(100, Math.max(1, value)));
  };

  const value = useMemo(() => ({ theme, resolvedTheme, colorTheme, setTheme, setColorTheme, glassIntensity, setGlassIntensity }), [theme, resolvedTheme, colorTheme, glassIntensity]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
