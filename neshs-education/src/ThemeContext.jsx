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
  onPrimary: palette.onPrimary || palette.text,
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

const glassTokens = palette => withTokens({
  ...palette,
  bg: 'transparent',
  panel: palette.glassSurface,
  panelAlt: palette.glassSurface,
  border: palette.glassBorder,
  accentDim: palette.glassActive,
  highlight: palette.primaryHover,
  backdrop: palette.glassBackdrop,
  mediaOverlay: palette.glassMediaOverlay
});

export const COLOR_THEMES = [
  {
    id: 'cyan-pulse', label: 'Cyan Pulse', swatch: '#14B8C4',
    light: withTokens({ bg: '#F3FDFE', panel: '#FFFFFF', panelAlt: '#EAFBFC', border: '#D3F3F6', accent: '#14B8C4', accentDim: 'rgba(20,184,196,0.12)', highlight: '#0F97A1', text: '#06272B', textDim: '#4E7A80', onPrimary: '#06272B' }),
    dark: withTokens({ bg: '#001619', panel: '#04262B', panelAlt: '#07343A', border: '#0D3A40', accent: '#50E8F4', accentDim: 'rgba(80,232,244,0.16)', highlight: '#7CEFF8', text: '#C7F8FE', textDim: '#7FB4BB', onPrimary: '#001619' }),
    glass: glassTokens({ bg: 'transparent', accent: '#50E8F4', primaryHover: '#7CEFF8', text: '#EFFCFE', textDim: '#A9D8DD', onPrimary: '#001619', gold: '#14B8C4', glassGradient: 'radial-gradient(circle at 20% 0%, #04343A 0%, #001619 55%, #000B0D 100%)', glassOrbOne: '#50E8F4', glassOrbTwo: '#14B8C4', glassSurface: 'rgba(80,232,244,0.06)', glassSurfaceRgb: '80,232,244', glassBorder: 'rgba(80,232,244,0.15)', glassBorderRgb: '80,232,244', glassActive: 'rgba(80,232,244,0.18)', glassGlow: 'rgba(80,232,244,0.25)', glassBackdrop: 'rgba(0,11,13,0.82)', glassMediaOverlay: 'rgba(0,11,13,0.35)' })
  },
  {
    id: 'violet-nova', label: 'Violet Nova', swatch: '#6D4FE0',
    light: withTokens({ bg: '#F8F7FD', panel: '#FFFFFF', panelAlt: '#F1EFFB', border: '#E5E1F7', accent: '#6D4FE0', accentDim: 'rgba(109,79,224,0.12)', highlight: '#5A3FC4', text: '#241B42', textDim: '#6C6289', onPrimary: '#F8F7FD' }),
    dark: withTokens({ bg: '#14101F', panel: '#1D1830', panelAlt: '#282144', border: '#2E2650', accent: '#9B87F5', accentDim: 'rgba(155,135,245,0.16)', highlight: '#B0A0F8', text: '#ECE8FB', textDim: '#A79BD1', onPrimary: '#14101F' }),
    glass: glassTokens({ bg: 'transparent', accent: '#9B87F5', primaryHover: '#B0A0F8', text: '#F3F0FE', textDim: '#BBB0DE', onPrimary: '#14101F', gold: '#C084FC', glassGradient: 'radial-gradient(circle at 20% 0%, #241C42 0%, #14101F 55%, #0A0714 100%)', glassOrbOne: '#9B87F5', glassOrbTwo: '#C084FC', glassSurface: 'rgba(155,135,245,0.06)', glassSurfaceRgb: '155,135,245', glassBorder: 'rgba(155,135,245,0.15)', glassBorderRgb: '155,135,245', glassActive: 'rgba(155,135,245,0.18)', glassGlow: 'rgba(155,135,245,0.25)', glassBackdrop: 'rgba(10,7,20,0.82)', glassMediaOverlay: 'rgba(10,7,20,0.35)' })
  },
  {
    id: 'lime-volt', label: 'Lime Volt', swatch: '#5FA815',
    light: withTokens({ bg: '#F7FBF0', panel: '#FFFFFF', panelAlt: '#EEF7E2', border: '#DFF0C8', accent: '#5FA815', accentDim: 'rgba(95,168,21,0.12)', highlight: '#4C8811', text: '#1B2A0D', textDim: '#5C6E4A', onPrimary: '#F7FBF0' }),
    dark: withTokens({ bg: '#0B120A', panel: '#121A10', panelAlt: '#1C2915', border: '#263420', accent: '#C4F542', accentDim: 'rgba(196,245,66,0.16)', highlight: '#D4FF6B', text: '#EFFCE0', textDim: '#A8C48F', onPrimary: '#0B120A' }),
    glass: glassTokens({ bg: 'transparent', accent: '#C4F542', primaryHover: '#D4FF6B', text: '#F5FEE8', textDim: '#C1D9A8', onPrimary: '#0B120A', gold: '#7FCC1E', glassGradient: 'radial-gradient(circle at 20% 0%, #16210F 0%, #0B120A 55%, #050A04 100%)', glassOrbOne: '#C4F542', glassOrbTwo: '#7FCC1E', glassSurface: 'rgba(196,245,66,0.06)', glassSurfaceRgb: '196,245,66', glassBorder: 'rgba(196,245,66,0.15)', glassBorderRgb: '196,245,66', glassActive: 'rgba(196,245,66,0.18)', glassGlow: 'rgba(196,245,66,0.25)', glassBackdrop: 'rgba(5,10,4,0.82)', glassMediaOverlay: 'rgba(5,10,4,0.35)' })
  }
];

const COLOR_THEME_IDS = new Set(COLOR_THEMES.filter(item => !item.darkOnly).map(item => item.id));
export const getColorTheme = id => COLOR_THEMES.find(item => item.id === id) || COLOR_THEMES[0];

const readStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_OPTIONS.has(stored) ? stored : 'light';
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
    const activePalette = getColorTheme(colorTheme)[theme === 'glass' ? 'glass' : resolvedTheme] || getColorTheme(colorTheme).dark;
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
    root.dataset.colorTheme = colorTheme;
    root.dataset.glassMode = theme === 'glass' ? 'true' : 'false';
    root.style.colorScheme = resolvedTheme === 'glass' ? 'dark' : resolvedTheme;
    root.style.setProperty('--glass-blur', glassValues.blur);
    root.style.setProperty('--glass-surface-opacity', glassValues.surfaceOpacity);
    root.style.setProperty('--glass-border-opacity', glassValues.borderOpacity);
    root.style.setProperty('--glass-glow-radius', glassValues.glowRadius);
    root.style.setProperty('--glass-glow-opacity', glassValues.glowOpacity);
    root.style.setProperty('--glass-orb-opacity', glassValues.orbOpacity);
    root.style.setProperty('--glass-saturate', glassValues.saturate);
    root.style.setProperty('--glass-gradient', activePalette.glassGradient || 'none');
    root.style.setProperty('--glass-surface', activePalette.glassSurface || 'rgba(255,255,255,0.06)');
    root.style.setProperty('--glass-surface-rgb', activePalette.glassSurfaceRgb || '255,255,255');
    root.style.setProperty('--glass-border', activePalette.glassBorder || 'rgba(255,255,255,0.12)');
    root.style.setProperty('--glass-border-rgb', activePalette.glassBorderRgb || '255,255,255');
    root.style.setProperty('--glass-active', activePalette.glassActive || 'rgba(110,91,255,0.18)');
    root.style.setProperty('--glass-glow', activePalette.glassGlow || 'rgba(110,91,255,0.25)');
    root.style.setProperty('--glass-orb-one', activePalette.glassOrbOne || '#6E5BFF');
    root.style.setProperty('--glass-orb-two', activePalette.glassOrbTwo || '#33D9C7');
    root.style.setProperty('--on-primary', activePalette.onPrimary);
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
