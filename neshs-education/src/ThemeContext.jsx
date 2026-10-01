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
    id: 'cyan-pulse', label: 'Cyan Pulse', vivid: '#50E8F4', nearWhite: '#C7F8FE', nearBlack: '#001619', swatch: '#50E8F4',
    light: withTokens({ bg: '#F3FDFE', panel: '#FFFFFF', panelAlt: '#EAFBFC', border: '#D3F3F6', accent: '#14B8C4', accentDim: 'rgba(20,184,196,0.12)', highlight: '#0F97A1', text: '#06272B', textDim: '#4E7A80', onPrimary: '#06272B' }),
    dark: withTokens({ bg: '#001619', panel: '#04262B', panelAlt: '#07343A', border: '#0D3A40', accent: '#50E8F4', accentDim: 'rgba(80,232,244,0.16)', highlight: '#7CEFF8', text: '#C7F8FE', textDim: '#7FB4BB', onPrimary: '#001619' }),
    glass: glassTokens({ bg: 'transparent', accent: '#50E8F4', primaryHover: '#7CEFF8', text: '#EFFCFE', textDim: '#A9D8DD', onPrimary: '#001619', gold: '#14B8C4', glassGradient: 'radial-gradient(circle at 20% 0%, #04343A 0%, #001619 55%, #000B0D 100%)', glassOrbOne: '#50E8F4', glassOrbTwo: '#14B8C4', glassSurface: 'rgba(80,232,244,0.06)', glassSurfaceRgb: '80,232,244', glassBorder: 'rgba(80,232,244,0.15)', glassBorderRgb: '80,232,244', glassActive: 'rgba(80,232,244,0.18)', glassGlow: 'rgba(80,232,244,0.25)', glassBackdrop: 'rgba(0,11,13,0.82)', glassMediaOverlay: 'rgba(0,11,13,0.35)' })
  },
  {
    id: 'violet-nova', label: 'Violet Nova', vivid: '#9B87F5', nearWhite: '#EDE9FE', nearBlack: '#14101F', swatch: '#9B87F5',
    light: withTokens({ bg: '#F8F7FD', panel: '#FFFFFF', panelAlt: '#F1EFFB', border: '#E5E1F7', accent: '#6D4FE0', accentDim: 'rgba(109,79,224,0.12)', highlight: '#5A3FC4', text: '#241B42', textDim: '#6C6289', onPrimary: '#F8F7FD' }),
    dark: withTokens({ bg: '#14101F', panel: '#1D1830', panelAlt: '#282144', border: '#2E2650', accent: '#9B87F5', accentDim: 'rgba(155,135,245,0.16)', highlight: '#B0A0F8', text: '#ECE8FB', textDim: '#A79BD1', onPrimary: '#14101F' }),
    glass: glassTokens({ bg: 'transparent', accent: '#9B87F5', primaryHover: '#B0A0F8', text: '#F3F0FE', textDim: '#BBB0DE', onPrimary: '#14101F', gold: '#C084FC', glassGradient: 'radial-gradient(circle at 20% 0%, #241C42 0%, #14101F 55%, #0A0714 100%)', glassOrbOne: '#9B87F5', glassOrbTwo: '#C084FC', glassSurface: 'rgba(155,135,245,0.06)', glassSurfaceRgb: '155,135,245', glassBorder: 'rgba(155,135,245,0.15)', glassBorderRgb: '155,135,245', glassActive: 'rgba(155,135,245,0.18)', glassGlow: 'rgba(155,135,245,0.25)', glassBackdrop: 'rgba(10,7,20,0.82)', glassMediaOverlay: 'rgba(10,7,20,0.35)' })
  },
  {
    id: 'lime-volt', label: 'Lime Volt', vivid: '#C4F542', nearWhite: '#F2FBDD', nearBlack: '#0B120A', swatch: '#C4F542',
    light: withTokens({ bg: '#F7FBF0', panel: '#FFFFFF', panelAlt: '#EEF7E2', border: '#DFF0C8', accent: '#5FA815', accentDim: 'rgba(95,168,21,0.12)', highlight: '#4C8811', text: '#1B2A0D', textDim: '#5C6E4A', onPrimary: '#1B2A0D' }),
    dark: withTokens({ bg: '#0B120A', panel: '#121A10', panelAlt: '#1C2915', border: '#263420', accent: '#C4F542', accentDim: 'rgba(196,245,66,0.16)', highlight: '#D4FF6B', text: '#EFFCE0', textDim: '#A8C48F', onPrimary: '#0B120A' }),
    glass: glassTokens({ bg: 'transparent', accent: '#C4F542', primaryHover: '#D4FF6B', text: '#F5FEE8', textDim: '#C1D9A8', onPrimary: '#0B120A', gold: '#7FCC1E', glassGradient: 'radial-gradient(circle at 20% 0%, #16210F 0%, #0B120A 55%, #050A04 100%)', glassOrbOne: '#C4F542', glassOrbTwo: '#7FCC1E', glassSurface: 'rgba(196,245,66,0.06)', glassSurfaceRgb: '196,245,66', glassBorder: 'rgba(196,245,66,0.15)', glassBorderRgb: '196,245,66', glassActive: 'rgba(196,245,66,0.18)', glassGlow: 'rgba(196,245,66,0.25)', glassBackdrop: 'rgba(5,10,4,0.82)', glassMediaOverlay: 'rgba(5,10,4,0.35)' })
  },
  {
    id: 'coral-ash', label: 'Coral Ash', vivid: '#F58F7C', nearWhite: '#F2C4CE', nearBlack: '#2C2B30', swatch: '#F58F7C',
    light: withTokens({ bg: '#FBF1F2', panel: '#FFFFFF', panelAlt: '#F9E8EC', border: '#F0D7DD', accent: '#9A3329', accentDim: 'rgba(154,51,41,0.12)', highlight: '#812821', text: '#2C2B30', textDim: '#706A70', onPrimary: '#F2C4CE' }),
    dark: withTokens({ bg: '#2C2B30', panel: '#3A393E', panelAlt: '#48464C', border: '#555158', accent: '#F58F7C', accentDim: 'rgba(245,143,124,0.16)', highlight: '#FFAB9B', text: '#F2C4CE', textDim: '#C9AAB2', onPrimary: '#2C2B30' }),
    glass: glassTokens({ bg: 'transparent', accent: '#F58F7C', primaryHover: '#FFAB9B', text: '#F2C4CE', textDim: '#D8B9C1', onPrimary: '#2C2B30', gold: '#F58F7C', glassGradient: 'radial-gradient(circle at 20% 0%, #514047 0%, #2C2B30 55%, #17161A 100%)', glassOrbOne: '#F58F7C', glassOrbTwo: '#C96568', glassSurface: 'rgba(245,143,124,0.06)', glassSurfaceRgb: '245,143,124', glassBorder: 'rgba(245,143,124,0.15)', glassBorderRgb: '245,143,124', glassActive: 'rgba(245,143,124,0.18)', glassGlow: 'rgba(245,143,124,0.25)', glassBackdrop: 'rgba(23,22,26,0.82)', glassMediaOverlay: 'rgba(23,22,26,0.35)' })
  },
  {
    id: 'rose-teal', label: 'Rose Teal', vivid: '#DA7B93', nearWhite: '#F5E6EA', nearBlack: '#1C3334', swatch: '#DA7B93',
    light: withTokens({ bg: '#FAF2F4', panel: '#FFFFFF', panelAlt: '#F6E8EC', border: '#EBD6DC', accent: '#A83E64', accentDim: 'rgba(168,62,100,0.12)', highlight: '#8D3152', text: '#1C3334', textDim: '#5E7172', onPrimary: '#F5E6EA' }),
    dark: withTokens({ bg: '#1C3334', panel: '#24403F', panelAlt: '#2E4F4D', border: '#385A58', accent: '#DA7B93', accentDim: 'rgba(218,123,147,0.16)', highlight: '#EA9AAF', text: '#F5E6EA', textDim: '#B7D0CE', onPrimary: '#1C3334' }),
    glass: glassTokens({ bg: 'transparent', accent: '#DA7B93', primaryHover: '#EA9AAF', text: '#F5E6EA', textDim: '#C6D9D6', onPrimary: '#1C3334', gold: '#376E6F', glassGradient: 'radial-gradient(circle at 20% 0%, #3A2636 0%, #1C3334 55%, #2E151B 100%)', glassOrbOne: '#DA7B93', glassOrbTwo: '#376E6F', glassSurface: 'rgba(218,123,147,0.06)', glassSurfaceRgb: '218,123,147', glassBorder: 'rgba(218,123,147,0.15)', glassBorderRgb: '218,123,147', glassActive: 'rgba(218,123,147,0.18)', glassGlow: 'rgba(218,123,147,0.25)', glassBackdrop: 'rgba(28,18,24,0.82)', glassMediaOverlay: 'rgba(28,18,24,0.35)' })
  },
  {
    id: 'mocha-brown', label: 'Mocha Brown', vivid: '#B97D4B', nearWhite: '#EDE1D3', nearBlack: '#2A1810', swatch: '#B97D4B',
    light: withTokens({ bg: '#FAF5EF', panel: '#FFFFFF', panelAlt: '#F4EADF', border: '#E8D8C6', accent: '#8C5A2E', accentDim: 'rgba(140,90,46,0.12)', highlight: '#70431F', text: '#2A1810', textDim: '#735D50', onPrimary: '#FFFFFF' }),
    dark: withTokens({ bg: '#2A1810', panel: '#38221A', panelAlt: '#493025', border: '#5B3D2C', accent: '#B97D4B', accentDim: 'rgba(185,125,75,0.16)', highlight: '#D09A68', text: '#EDE1D3', textDim: '#C4A995', onPrimary: '#2A1810' }),
    glass: glassTokens({ bg: 'transparent', accent: '#B97D4B', primaryHover: '#D09A68', text: '#EDE1D3', textDim: '#CDB9A8', onPrimary: '#2A1810', gold: '#B97D4B', glassGradient: 'radial-gradient(circle at 20% 0%, #4A3025 0%, #2A1810 55%, #160B07 100%)', glassOrbOne: '#B97D4B', glassOrbTwo: '#D09A68', glassSurface: 'rgba(185,125,75,0.06)', glassSurfaceRgb: '185,125,75', glassBorder: 'rgba(185,125,75,0.15)', glassBorderRgb: '185,125,75', glassActive: 'rgba(185,125,75,0.18)', glassGlow: 'rgba(185,125,75,0.25)', glassBackdrop: 'rgba(22,11,7,0.82)', glassMediaOverlay: 'rgba(22,11,7,0.35)' })
  },
  {
    id: 'cyber-mint', label: 'Cyber Mint', vivid: '#66FCF1', nearWhite: '#E8FFFD', nearBlack: '#0B0C10', swatch: '#66FCF1',
    light: withTokens({ bg: '#F2FFFE', panel: '#FFFFFF', panelAlt: '#E6FBF9', border: '#D2F2EF', accent: '#1FB8AC', accentDim: 'rgba(31,184,172,0.12)', highlight: '#138F86', text: '#0B0C10', textDim: '#4B696A', onPrimary: '#0B0C10' }),
    dark: withTokens({ bg: '#0B0C10', panel: '#1F2833', panelAlt: '#293541', border: '#344454', accent: '#66FCF1', accentDim: 'rgba(102,252,241,0.16)', highlight: '#8FFFF7', text: '#E8FFFD', textDim: '#A5C8C6', onPrimary: '#0B0C10' }),
    glass: glassTokens({ bg: 'transparent', accent: '#66FCF1', primaryHover: '#8FFFF7', text: '#E8FFFD', textDim: '#B6D9D6', onPrimary: '#0B0C10', gold: '#66FCF1', glassGradient: 'radial-gradient(circle at 20% 0%, #1F2833 0%, #0B0C10 55%, #050609 100%)', glassOrbOne: '#66FCF1', glassOrbTwo: '#1FB8AC', glassSurface: 'rgba(102,252,241,0.06)', glassSurfaceRgb: '102,252,241', glassBorder: 'rgba(102,252,241,0.15)', glassBorderRgb: '102,252,241', glassActive: 'rgba(102,252,241,0.18)', glassGlow: 'rgba(102,252,241,0.25)', glassBackdrop: 'rgba(5,6,9,0.82)', glassMediaOverlay: 'rgba(5,6,9,0.35)' })
  },
  {
    id: 'crimson-pixel', label: 'Crimson Pixel', vivid: '#C3073F', nearWhite: '#F7E9EC', nearBlack: '#1A1A1D', swatch: '#C3073F',
    light: withTokens({ bg: '#FBF3F4', panel: '#FFFFFF', panelAlt: '#F8E8EB', border: '#EED5DA', accent: '#A8062F', accentDim: 'rgba(168,6,47,0.12)', highlight: '#850524', text: '#1A1A1D', textDim: '#6E5C61', onPrimary: '#F7E9EC' }),
    dark: withTokens({ bg: '#1A1A1D', panel: '#2A1218', panelAlt: '#391720', border: '#51202B', accent: '#C3073F', accentDim: 'rgba(195,7,63,0.16)', highlight: '#E32B61', text: '#F7E9EC', textDim: '#D0AAB5', onPrimary: '#F7E9EC' }),
    glass: glassTokens({ bg: 'transparent', accent: '#C3073F', primaryHover: '#E32B61', text: '#F7E9EC', textDim: '#D7B2BD', onPrimary: '#F7E9EC', gold: '#C3073F', glassGradient: 'radial-gradient(circle at 20% 0%, #6F2232 0%, #1A1A1D 55%, #0D0D0F 100%)', glassOrbOne: '#C3073F', glassOrbTwo: '#6F2232', glassSurface: 'rgba(195,7,63,0.06)', glassSurfaceRgb: '195,7,63', glassBorder: 'rgba(195,7,63,0.15)', glassBorderRgb: '195,7,63', glassActive: 'rgba(195,7,63,0.18)', glassGlow: 'rgba(195,7,63,0.25)', glassBackdrop: 'rgba(13,13,15,0.82)', glassMediaOverlay: 'rgba(13,13,15,0.35)' })
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
