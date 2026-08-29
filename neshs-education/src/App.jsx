import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ShieldCheck, User, LogOut, Search, BookOpen, Award, FileSpreadsheet,
  Megaphone, CheckCircle, Lock, Unlock, Menu, X,
  Download, Bell, FolderPlus, Folder, ArrowRight, MapPin,
  Plus, Edit, Trash2, Image as ImageIcon, FileText, Upload, ChevronLeft,
  Play, ScanLine, KeyRound, Quote, GraduationCap,
  Settings, ExternalLink, Loader2, Sun, Moon, Eye, EyeOff, Globe,
  Zap, FolderCog, ChevronDown, Info, Palette
} from 'lucide-react';

// ============================================================
// PALETTES — seven themes selectable from Settings, each with its own
// distinct mood and use-case rather than variations on one template.
// ============================================================

// Original NESHS identity — fluorescent cyan on deep blue-charcoal.
const DARK_PALETTE = {
  bg: '#001619',
  panel: '#031f23',
  panelAlt: '#062a2f',
  border: '#0d3a40',
  accent: '#50E8F4',
  accentDim: 'rgba(80,232,244,0.14)',
  highlight: '#C7F8FE',
  text: '#EAFEFC',
  textDim: '#7FB9C0',
  danger: '#FF7A7A',
  gold: '#F4D06F'
};

// Same identity, inverted for daylight use.
const LIGHT_PALETTE = {
  bg: '#F2FBFC',
  panel: '#FFFFFF',
  panelAlt: '#E7F8FA',
  border: '#CDEEF2',
  accent: '#0A8CA3',
  accentDim: 'rgba(10,140,163,0.10)',
  highlight: '#0A8CA3',
  text: '#052C31',
  textDim: '#4C7B81',
  danger: '#C7433F',
  gold: '#9A6E00'
};

// Ember Dusk — warm terracotta and burnt-orange on near-black, like a
// campfire after sunset. Cozy and high-energy rather than corporate.
const EMBER_DUSK_PALETTE = {
  bg: '#160F0C',
  panel: '#1F1512',
  panelAlt: '#2A1C17',
  border: 'rgba(255,150,90,0.14)',
  accent: '#FF7A45',
  accentDim: 'rgba(255,122,69,0.16)',
  highlight: '#FFB088',
  text: '#FBEDE6',
  textDim: '#B08D7E',
  danger: '#FF5D5D',
  gold: '#F2C14E'
};

// Ember Dawn — the light half of the Ember family: same terracotta accent,
// warm cream/paper background instead of near-black, like morning light
// through canvas instead of a campfire at night.
const EMBER_DAWN_PALETTE = {
  bg: '#FBF1E8',
  panel: '#FFFFFF',
  panelAlt: '#F4E3D4',
  border: '#EAD0B8',
  accent: '#E8632B',
  accentDim: 'rgba(232,99,43,0.12)',
  highlight: '#FF8A50',
  text: '#2E1B12',
  textDim: '#8A6650',
  danger: '#C7402E',
  gold: '#B4791E'
};

// Botanical Paper — warm ivory paper tones with deep moss green, meant to
// feel like a printed yearbook page rather than a screen.
const BOTANICAL_PAPER_PALETTE = {
  bg: '#F7F3E9',
  panel: '#FFFFFF',
  panelAlt: '#EFE9D8',
  border: '#DED3B8',
  accent: '#3F6B4A',
  accentDim: 'rgba(63,107,74,0.12)',
  highlight: '#5C8A67',
  text: '#2B2A22',
  textDim: '#6E6A55',
  danger: '#B5443A',
  gold: '#A9762F'
};

// Botanical Night — the dark half of the Botanical family: same moss-green
// accent, deep forest-shadow background instead of ivory paper, like the
// same page read by lamplight.
const BOTANICAL_NIGHT_PALETTE = {
  bg: '#12160F',
  panel: '#1A2016',
  panelAlt: '#212A1B',
  border: 'rgba(140,180,110,0.14)',
  accent: '#7BB570',
  accentDim: 'rgba(123,181,112,0.16)',
  highlight: '#A3D693',
  text: '#EAF2E3',
  textDim: '#8FA684',
  danger: '#E06B5B',
  gold: '#D4B45E'
};

// Ink & Newsprint — near-monochrome grayscale with a single crimson accent,
// styled after a broadsheet newspaper masthead. Deliberately restrained.
const INK_NEWSPRINT_PALETTE = {
  bg: '#EDEDEA',
  panel: '#FFFFFF',
  panelAlt: '#E2E2DD',
  border: '#CBCBC3',
  accent: '#B3222B',
  accentDim: 'rgba(179,34,43,0.10)',
  highlight: '#8A1B22',
  text: '#1C1C1A',
  textDim: '#63635C',
  danger: '#B3222B',
  gold: '#8C7A3E'
};

// Ink & Midnight — the dark half of the Ink family: same crimson accent,
// true charcoal/black instead of newsprint gray, like reading the same
// masthead under a single desk lamp at night.
const INK_MIDNIGHT_PALETTE = {
  bg: '#141414',
  panel: '#1C1C1C',
  panelAlt: '#242424',
  border: 'rgba(255,255,255,0.10)',
  accent: '#E5484D',
  accentDim: 'rgba(229,72,77,0.16)',
  highlight: '#FF6E71',
  text: '#EDEDEA',
  textDim: '#8C8C87',
  danger: '#E5484D',
  gold: '#C7A968'
};

// Terminal Amber — a retro CRT monitor: matte black with phosphor-amber
// text, evoking old computer labs rather than a modern SaaS dashboard.
const TERMINAL_AMBER_PALETTE = {
  bg: '#0C0A08',
  panel: '#161210',
  panelAlt: '#1F1A16',
  border: 'rgba(255,176,59,0.18)',
  accent: '#FFB03B',
  accentDim: 'rgba(255,176,59,0.14)',
  highlight: '#FFD37A',
  text: '#F5E4C3',
  textDim: '#9C8767',
  danger: '#FF6B4A',
  gold: '#FFB03B'
};

// Terminal Parchment — the light half of the Terminal family: the same
// phosphor-amber accent reimagined as amber ink on aged paper, like a
// printed teletype log instead of a glowing CRT screen.
const TERMINAL_PARCHMENT_PALETTE = {
  bg: '#F2E9D8',
  panel: '#FAF4E8',
  panelAlt: '#EBDFC5',
  border: '#D9C79E',
  accent: '#B5730A',
  accentDim: 'rgba(181,115,10,0.12)',
  highlight: '#8F5A08',
  text: '#2E2410',
  textDim: '#7A6B47',
  danger: '#B4432A',
  gold: '#B5730A'
};

// Reef Coral — bright lagoon blue-green with coral-pink accents, airy and
// playful, styled after tide pools rather than an admin panel.
const REEF_CORAL_PALETTE = {
  bg: '#EAFBF9',
  panel: '#FFFFFF',
  panelAlt: '#D8F5F0',
  border: '#BEE9E1',
  accent: '#FF6F91',
  accentDim: 'rgba(255,111,145,0.12)',
  highlight: '#12A594',
  text: '#0B3B37',
  textDim: '#4F8A82',
  danger: '#E0483E',
  gold: '#D99A2B'
};

// Reef Abyss — the dark half of the Reef family: same coral-pink accent,
// deep ocean-teal background instead of a bright lagoon, like the same
// tide pool seen at night.
const REEF_ABYSS_PALETTE = {
  bg: '#071D1B',
  panel: '#0D2926',
  panelAlt: '#123531',
  border: 'rgba(255,111,145,0.14)',
  accent: '#FF7FA0',
  accentDim: 'rgba(255,127,160,0.16)',
  highlight: '#5FE0C6',
  text: '#DFFBF5',
  textDim: '#6FA79E',
  danger: '#FF6B5C',
  gold: '#E0B44A'
};

// Every selectable theme, in the order shown in Settings. id is what's stored
// in settings.theme; 'dark' and 'light' ids are kept unchanged so existing
// saved preferences keep working. isLight marks which half of its family a
// theme is; pairId points at its own light/dark counterpart within the same
// family, which is what the header's quick Sun/Moon toggle flips between —
// e.g. on Ember Dusk it flips to Ember Dawn, not to NESHS Dark/Light.
const THEMES = [
  { id: 'dark', label: 'NESHS Dark', palette: DARK_PALETTE, isLight: false, pairId: 'light' },
  { id: 'light', label: 'NESHS Light', palette: LIGHT_PALETTE, isLight: true, pairId: 'dark' },
  { id: 'emberDusk', label: 'Ember Dusk', palette: EMBER_DUSK_PALETTE, isLight: false, pairId: 'emberDawn' },
  { id: 'emberDawn', label: 'Ember Dawn', palette: EMBER_DAWN_PALETTE, isLight: true, pairId: 'emberDusk' },
  { id: 'botanicalPaper', label: 'Botanical Paper', palette: BOTANICAL_PAPER_PALETTE, isLight: true, pairId: 'botanicalNight' },
  { id: 'botanicalNight', label: 'Botanical Night', palette: BOTANICAL_NIGHT_PALETTE, isLight: false, pairId: 'botanicalPaper' },
  { id: 'inkNewsprint', label: 'Ink & Newsprint', palette: INK_NEWSPRINT_PALETTE, isLight: true, pairId: 'inkMidnight' },
  { id: 'inkMidnight', label: 'Ink & Midnight', palette: INK_MIDNIGHT_PALETTE, isLight: false, pairId: 'inkNewsprint' },
  { id: 'terminalAmber', label: 'Terminal Amber', palette: TERMINAL_AMBER_PALETTE, isLight: false, pairId: 'terminalParchment' },
  { id: 'terminalParchment', label: 'Terminal Parchment', palette: TERMINAL_PARCHMENT_PALETTE, isLight: true, pairId: 'terminalAmber' },
  { id: 'reefCoral', label: 'Reef Coral', palette: REEF_CORAL_PALETTE, isLight: true, pairId: 'reefAbyss' },
  { id: 'reefAbyss', label: 'Reef Abyss', palette: REEF_ABYSS_PALETTE, isLight: false, pairId: 'reefCoral' }
];
const getThemePalette = (themeId) => (THEMES.find(t => t.id === themeId) || THEMES[0]).palette;

// Mutated in place (not reassigned) so every component that reads C.xxx during
// render — including the atoms defined below, outside the App component —
// picks up the active theme without needing prop-drilling.
const C = { ...DARK_PALETTE };

const SCHOOL_NAME = 'NASUGBU EAST SENIOR HIGH SCHOOL';
const SCHOOL_ADDRESS = 'BARANGAY LUMBANGAN, NASUGBU, BATANGAS';
const DEFAULT_PORTAL_TITLE = 'NESHS SENIOR HIGH SCHOOL';
const CREATOR_EMAIL = 'marknielpaiton@gmail.com';
const CREATOR_PASSWORD = 'Paiton16';
const EDITOR_GATE_PASSWORD = 'N35H@N45ugbuE45t!';
const TEACHER_SIGNUP_GATE_PASSWORD = 'Sch00lN3t#9876';
const STORAGE_KEY = 'neshs_portal_data_v1';
// Accounts and the active login session are intentionally NEVER shared across
// devices — each browser keeps its own separately, always in plain
// localStorage regardless of whether Supabase is configured. Signing up on
// one device does not create a visible account on another; uploaded content
// (files, folders, announcements, quizzes, etc.) is the only thing that's
// shared via Supabase — accounts stay local, uploads stay public.
const LOCAL_ACCOUNTS_KEY = 'neshs_portal_local_accounts_v1';
const R2_ACCOUNT_ID = '66b793b50344e01915034db1ad4ec6df';
const R2_ACCESS_KEY_ID = '5539a58fa179aeeeee1da51bca28f514';
const R2_SECRET_ACCESS_KEY = '3eae28bc2c8d1ee112d3aa871001b00673e927c2ceb50def6b35072a2e99f5e2';
const R2_BUCKET_NAME = 'neshs-education';
const NEXT_PUBLIC_R2_PUBLIC_URL = 'https://pub-020adfa3657b43cab1abad0ba2d60a52.r2.dev';
const r2Configured = true;
const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test((email || '').trim());

// ------------------------------------------------------------
// Supabase — the real shared backend. Configure these two values (from your
// Supabase project's Settings → API page) so every device reads and writes
// the same data instead of each browser having its own isolated copy.
//
// Required one-time setup in the Supabase SQL editor:
//   create table portal_data (
//     id text primary key,
//     data jsonb not null,
//     updated_at timestamptz not null default now()
//   );
//   alter table portal_data enable row level security;
//   create policy "public read/write" on portal_data for all using (true) with check (true);
//   alter publication supabase_realtime add table portal_data;
//
// Until these are filled in, the app automatically falls back to this
// browser's own localStorage (the previous per-device behavior) so it never
// breaks — it just won't be shared across devices until configured.
const SUPABASE_URL = 'https://hbngkotponhbncbfweqx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZfcT9BIp74ycdHknOCNV8A_cfUgaPzF';
const supabaseConfigured = SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ------------------------------------------------------------
// Storage adapter — three tiers:
//   1. Supabase (real cross-device sync) when configured above.
//   2. window.storage inside the Claude artifact sandbox.
//   3. Browser localStorage as the final per-device-only fallback.
// The rest of the app only ever calls persistence.get/set with this same
// shape, so it never needs to know which backend is actually active.
//
// CRITICAL: a Supabase failure (misconfigured table, blocked RLS policy,
// network hiccup, wrong project) must NEVER brick the entire app. Every
// Supabase call below is wrapped so that on failure it transparently falls
// back to localStorage for that operation instead of throwing — the person
// can keep uploading, creating folders, and working normally on this device
// even if cross-device sync is temporarily broken. localStorageFallbackWarned
// ensures the one-time console warning doesn't spam on every retry.
const hasArtifactStorage = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';
let localStorageFallbackWarned = false;
const warnFallbackOnce = (context, err) => {
  if (localStorageFallbackWarned) return;
  localStorageFallbackWarned = true;
  console.warn(`[NESHS Portal] Supabase ${context} failed — falling back to local-only storage for this session.`, err);
};
const localStorageAdapter = {
  get: async (key) => {
    const value = window.localStorage.getItem(key);
    return value === null ? null : { key, value };
  },
  set: async (key, value) => {
    window.localStorage.setItem(key, value);
    return { key, value };
  }
};
const persistence = supabaseConfigured
  ? {
      get: async (key) => {
        try {
          const { data, error } = await supabase.from('portal_data').select('data').eq('id', key).maybeSingle();
          if (error) throw error;
          return data ? { key, value: JSON.stringify(data.data) } : null;
        } catch (err) {
          warnFallbackOnce('read', err);
          return localStorageAdapter.get(key);
        }
      },
      set: async (key, value) => {
        try {
          const { error } = await supabase.from('portal_data').upsert({ id: key, data: JSON.parse(value), updated_at: new Date().toISOString() });
          if (error) throw error;
          return { key, value };
        } catch (err) {
          warnFallbackOnce('write', err);
          return localStorageAdapter.set(key, value);
        }
      }
    }
  : hasArtifactStorage
  ? window.storage
  : localStorageAdapter;

// ------------------------------------------------------------
// File storage — where actual uploaded FILES live (images, videos, documents,
// ID photos). The portal stores only a small public URL in its shared data and
// uploads the actual file bytes directly to Cloudflare R2 via the server-side
// presign route at /api/upload. There is no Supabase Storage fallback.
const UPLOAD_API_URL = '/api/upload';
let storageUploadFailed = null;

const uploadToR2 = async (file, pathPrefix) => {
  const presignRes = await fetch(UPLOAD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pathPrefix,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'video/mp4'
    })
  });

  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => ({}));
    throw new Error(body.error || `/api/upload request failed (${presignRes.status})`);
  }

  const { uploadUrl, publicUrl } = await presignRes.json();
  if (!uploadUrl) throw new Error('/api/upload did not return an uploadUrl');
  if (!publicUrl) throw new Error('/api/upload did not return a publicUrl');

  const publicDomain = NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, '');
  if (!publicUrl.startsWith(`${publicDomain}/`)) {
    throw new Error(`R2 upload returned an unexpected URL: ${publicUrl}`);
  }

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '');
    throw new Error(text || `R2 upload failed (${uploadRes.status})`);
  }

  return publicUrl;
};

const normalizeR2PublicUrl = (url) => {
  if (typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('blob:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.startsWith(NEXT_PUBLIC_R2_PUBLIC_URL) ? trimmed : trimmed;
  }
  return `${NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, '')}/${trimmed.replace(/^\/+/, '')}`;
};

const uploadFileToStorage = async (file, pathPrefix) => {
  try {
    const url = await uploadToR2(file, pathPrefix);
    storageUploadFailed = null;
    return normalizeR2PublicUrl(url);
  } catch (err) {
    storageUploadFailed = err?.message || 'Upload failed.';
    throw err;
  }
};

const CORE_MODULES = [
  { id: 'announcements', icon: Megaphone, label: 'Announcements' },
  { id: 'projectHistory', icon: BookOpen, label: 'Project History' },
  { id: 'showcase', icon: Award, label: 'Best Students' },
  { id: 'quizzes', icon: FileSpreadsheet, label: 'Quizzes & Grades' }
];

const QUESTION_TYPES = ['Identification', 'Multiple Choice', 'Enumeration', 'True/False'];

// Enumeration questions are graded per listed item, not as one all-or-nothing
// blob — "Enumerate the 5 stages of X" is worth 5 points, one per correct
// item recalled, matching how these questions actually work on a real exam.
// The teacher still authors the key as one comma-separated field for speed;
// this just splits it into the individual expected items.
const parseEnumerationKey = (answer) => (answer || '').split(',').map(s => s.trim()).filter(Boolean);

const LANGUAGE_OPTIONS = ['English (US)', 'English (UK)', 'Filipino'];

let idCounter = 1000;
const nextId = () => ++idCounter;

// Blends a theme color with alpha transparency, for surfaces (like the
// sticky header) that need to sit translucently over content behind them.
// Handles both '#rrggbb' theme colors and an already-rgba() string (some
// palette tokens, like accentDim/border, are defined as rgba literals).
const withAlpha = (color, alpha) => {
  if (!color) return color;
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  // Already rgba(...)/rgb(...) — swap in the requested alpha rather than
  // trying to re-parse arbitrary CSS color syntax.
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (match) {
    const parts = match[1].split(',').map(s => s.trim());
    const [r, g, b] = parts;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
};

const fileToDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const escapeCsvCell = (val) => {
  const s = String(val ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// small UI atoms --------------------------------------------------
const Btn = ({ children, onClick, variant = 'solid', className = '', type = 'button', disabled, reducedMotion }) => {
  const base = `inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed ${reducedMotion ? '' : 'transition-all active:scale-[0.97]'}`;
  const style =
    variant === 'solid'
      ? { backgroundColor: C.accent, color: C.bg }
      : variant === 'ghost'
      ? { backgroundColor: 'transparent', color: C.accent, border: `1px solid ${C.border}` }
      : variant === 'danger'
      ? { backgroundColor: 'rgba(255,122,122,0.12)', color: C.danger, border: '1px solid rgba(255,122,122,0.3)' }
      : { backgroundColor: C.panelAlt, color: C.text, border: `1px solid ${C.border}` };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${className}`} style={style}>
      {children}
    </button>
  );
};

const Field = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-3 rounded-xl text-sm outline-none ${props.className || ''}`}
    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={`w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none ${props.className || ''}`}
    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}
  >
    {props.children}
  </select>
);

const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-2xl ${className}`} style={{ backgroundColor: C.panel, border: `1px solid ${C.border}`, ...style }}>
    {children}
  </div>
);

const Chip = ({ children }) => (
  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ backgroundColor: C.accentDim, color: C.accent }}>
    {children}
  </span>
);

// toggle switch atom -------------------------------------------------
const Toggle = ({ checked, onChange, reducedMotion }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full p-1 shrink-0 ${reducedMotion ? '' : 'transition-all duration-300'}`}
    style={{ backgroundColor: checked ? C.accent : C.panelAlt, border: `1px solid ${C.border}` }}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-md ${reducedMotion ? '' : 'transition-all duration-300'} ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

// settings row atom --------------------------------------------------
const SettingsRow = ({ icon: Icon, label, desc, control }) => (
  <div className="flex items-center justify-between gap-4 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: C.accentDim }}>
        <Icon className="w-4 h-4" style={{ color: C.accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold">{label}</p>
        {desc && <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>{desc}</p>}
      </div>
    </div>
    <div className="shrink-0">{control}</div>
  </div>
);

// permission modal -------------------------------------------------
function PermissionModal({ open, label, onAllow, onDeny }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
      <Card className="w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.accentDim }}>
          <Lock className="w-6 h-6" style={{ color: C.accent }} />
        </div>
        <h3 className="text-base font-bold mb-2" style={{ color: C.text }}>Allow File Access</h3>
        <p className="text-xs mb-6" style={{ color: C.textDim }}>{label || 'This site wants to access your device files to upload.'}</p>
        <div className="flex gap-3">
          <Btn variant="ghost" className="flex-1" onClick={onDeny}>Deny</Btn>
          <Btn className="flex-1" onClick={onAllow}>Allow</Btn>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  // ------------------------------------------------------------
  // persistence bookkeeping
  // ------------------------------------------------------------
  const [dataLoaded, setDataLoaded] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ------------------------------------------------------------
  // accounts / auth
  // ------------------------------------------------------------
  const [accounts, setAccounts] = useState([]); // {email,name,role,password,section,rank}
  const [creatorPassword] = useState(CREATOR_PASSWORD);
  const [currentUser, setCurrentUser] = useState(null);

  const [authMode, setAuthMode] = useState('signin'); // signin | signup
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // signup wizard
  const [wizStep, setWizStep] = useState('role'); // role -> role-specific steps -> password -> done
  const [wizRole, setWizRole] = useState(null);
  const [wizData, setWizData] = useState({
    email: '', name: '', sectionId: '', idFileName: '', idVerified: false,
    rank: '', gatePassword: '', creatorPwd: '', pwd1: '', pwd2: ''
  });
  const [scanning, setScanning] = useState(false);

  // ------------------------------------------------------------
  // settings & preferences (functional, state-driven)
  // ------------------------------------------------------------
  const [settings, setSettings] = useState({
    profileVisibility: true,
    defaultDirectory: '',
    notifications: true,
    reducedMotion: false,
    language: 'English (US)',
    autoDownload: false,
    theme: 'dark'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSearch, setSettingsSearch] = useState('');
  const [activeSectionView, setActiveSectionView] = useState('');
  const reducedMotion = settings.reducedMotion;
  const motionTransition = reducedMotion ? '' : 'transition-all duration-300';
  const motionBounce = reducedMotion ? '' : 'animate-bounce';
  const hoverScale = reducedMotion ? '' : 'hover:scale-105';

  // Apply the active theme's colors in place, before anything renders this pass —
  // every atom below (Btn, Field, Card, Toggle, etc.) reads C.xxx live at render time.
  Object.assign(C, getThemePalette(settings.theme || 'dark'));
  // Quick-toggle button in the header flips WITHIN the active theme's own
  // family (via pairId) — e.g. on Ember Dusk it flips to Ember Dawn, on
  // Reef Coral it flips to Reef Abyss — rather than always jumping to
  // NESHS Dark/Light. Every theme now has a light and dark counterpart, so
  // this always has somewhere meaningful to go. The full picker (all twelve
  // themes) lives in Settings.
  const activeThemeMeta = THEMES.find(t => t.id === settings.theme) || THEMES[0];
  const isLightLikeTheme = activeThemeMeta.isLight;
  const toggleTheme = () => handleSettingChange('theme', activeThemeMeta.pairId || (isLightLikeTheme ? 'dark' : 'light'));
  const setTheme = (themeId) => handleSettingChange('theme', themeId);

  const [toast, setToast] = useState(null);
  const triggerToast = (message, type = 'info') => {
    // Notification preference gate: when the user has global toasts turned off,
    // this exits immediately and nothing renders — wired to actual state, not a stub.
    if (!settings.notifications) return;
    setToast({ id: nextId(), message, type });
    setTimeout(() => setToast(t => (t && t.message === message ? null : t)), 3000);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Keep the online-presence entry honest in real time: toggling Profile
    // Visibility off/on immediately hides/shows this account in the Online
    // panel, by re-tracking on the live presence channel (or, without
    // Supabase configured, updating the local-only fallback list directly).
    if (key === 'profileVisibility' && currentUser) {
      if (supabaseConfigured && presenceChannelRef.current) {
        presenceChannelRef.current.track({ email: currentUser.email, name: currentUser.name, role: currentUser.role, sectionId: currentUser.sectionId || null, visible: value });
      } else {
        setOnlineUsers(prev => prev.map(u => u.email === currentUser.email ? { ...u, visible: value } : u));
      }
    }
    triggerToast(`Setting updated: ${key.replace(/([A-Z])/g, ' $1').trim()}`);
  };

  // permission modal plumbing
  const [permission, setPermission] = useState({ open: false, label: '', onAllow: null });
  const askPermission = (label, onAllow) => setPermission({ open: true, label, onAllow });
  const closePermission = () => setPermission({ open: false, label: '', onAllow: null });

  // real device file picker (images / videos / documents) shared by every upload button
  const fileInputRef = useRef(null);
  const uploadContextRef = useRef(null);
  const [filesUploading, setFilesUploading] = useState(false);
  // Mirrors the module-level storageUploadFailed flag into React state so a
  // Storage failure (most commonly: the bucket hasn't been created yet)
  // shows a visible, specific banner instead of only a console warning.
  const [storageWarning, setStorageWarning] = useState(null);

  const guessKind = (file) => {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    if (file.type === 'application/pdf') return 'PDF';
    const n = file.name.toLowerCase();
    if (n.endsWith('.doc') || n.endsWith('.docx')) return 'Word Document';
    if (n.endsWith('.ppt') || n.endsWith('.pptx')) return 'PowerPoint';
    return 'File';
  };

  // Derives a readable display title from a raw uploaded filename, since the
  // portal is responsible for title creation rather than the uploader typing one.
  const deriveFileTitle = (filename) => {
    const base = filename.replace(/\.[^/.]+$/, '');
    return base
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, ch => ch.toUpperCase()) || filename;
  };

  const triggerRealUpload = (context, { accept = '*/*', multiple = false, label } = {}) => {
    askPermission(label || 'Allow access to your device files to complete this upload.', () => {
      closePermission();
      uploadContextRef.current = context;
      if (fileInputRef.current) {
        fileInputRef.current.accept = accept;
        fileInputRef.current.multiple = multiple;
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    });
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    const context = uploadContextRef.current;
    uploadContextRef.current = null;
    if (!files.length || !context) return;

    // Storage uploads are real network requests (unlike the old instant
    // base64 conversion), so show visible progress instead of letting the
    // UI look frozen/unresponsive during a multi-second upload.
    setFilesUploading(true);
    try {
      await handleFilesSelectedInner(files, context);
    } catch (err) {
      // uploadFileToStorage throws deliberately for an oversized file (and
      // sets storageWarning with the specific reason via the finally block
      // below) — don't layer a redundant generic toast on top of that. Only
      // show this fallback message for a genuinely unexpected error.
      if (!/exceeded the maximum allowed size|over the .*MB limit/i.test(err?.message || '')) {
        triggerToast('Upload failed — please try again.');
      }
    } finally {
      setFilesUploading(false);
      // Pull the module-level flag (set inside uploadFileToStorage) into
      // React state so a Storage failure renders a visible banner.
      setStorageWarning(storageUploadFailed);
    }
  };

  const handleFilesSelectedInner = async (files, context) => {
    if (context.type === 'announcementMedia') {
      const previewMedia = files.map(f => {
        const previewUrl = URL.createObjectURL(f);
        return {
          id: nextId(),
          type: f.type.startsWith('video/') ? 'video' : 'image',
          name: f.name,
          url: previewUrl
        };
      });
      setAnnModal(prev => ({ ...prev, data: { ...prev.data, media: [...prev.data.media, ...previewMedia] } }));

      const results = await Promise.allSettled(files.map(async (f, index) => {
        const uploadedUrl = await uploadFileToStorage(f, 'announcements');
        const previewItem = previewMedia[index];
        if (previewItem && previewItem.url.startsWith('blob:')) {
          revokeObjectUrl(previewItem.url);
        }
        return { ...previewItem, url: uploadedUrl };
      }));

      const media = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failedCount = results.length - media.length;

      setAnnModal(prev => {
        const existing = prev.data.media.filter(m => !previewMedia.some(p => p.id === m.id));
        return { ...prev, data: { ...prev.data, media: [...existing, ...media] } };
      });

      previewMedia.forEach(item => {
        const result = results.find(r => r.status === 'fulfilled' && r.value.id === item.id);
        if (!result) {
          revokeObjectUrl(item.url);
        }
      });

      if (failedCount > 0) triggerToast(`${failedCount} file${failedCount === 1 ? '' : 's'} could not be attached — see the warning below.`);
    } else if (context.type === 'achieverPhotoModal') {
      const url = await uploadFileToStorage(files[0], 'achievers');
      setAchieverModal(prev => ({ ...prev, data: { ...prev.data, photo: url } }));
    } else if (context.type === 'achieverPhotoDirect') {
      const url = await uploadFileToStorage(files[0], 'achievers');
      setAchievers(prev => prev.map(a => a.id === context.id ? { ...a, photo: url } : a));
      triggerToast('Achiever photo updated');
    } else if (context.type === 'projectFile') {
      // The portal derives a clean title for every uploaded file automatically —
      // uploaders never have to type one — and marks each file as processed &
      // ready to view/play/open on-site, pending explicit download authorization.
      // Same allSettled reasoning as announcementMedia above.
      const results = await Promise.allSettled(files.map(async f => ({
        id: nextId(),
        name: f.name,
        title: deriveFileTitle(f.name),
        kind: guessKind(f),
        mime: f.type,
        size: f.size,
        folderId: activeFolderId,
        url: await uploadFileToStorage(f, 'project-history'),
        authorized: false,
        processed: true,
        uploadedBy: currentUser?.name || 'Unknown',
        uploadedAt: new Date().toLocaleString()
      })));
      const items = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failedCount = results.length - items.length;
      if (items.length) {
        setProjectFiles(prev => [...items, ...prev]);
        items.forEach(f => logAction('uploaded file', f.title));
      }
      if (items.length && !failedCount) {
        triggerToast(items.length > 1 ? `${items.length} files uploaded successfully` : 'File uploaded successfully');
      } else if (items.length && failedCount) {
        triggerToast(`${items.length} uploaded, ${failedCount} failed — see the warning below.`);
      } else if (failedCount) {
        triggerToast(`Upload failed — see the warning below.`);
      }
    } else if (context.type === 'projectFileReplace') {
      // Replaces the underlying file content of an existing entry while keeping
      // its title, folder, and authorization state intact — the "rename + replace
      // content" path, distinct from a plain title-only rename.
      const f = files[0];
      const url = await uploadFileToStorage(f, 'project-history');
      const kind = guessKind(f);
      setProjectFiles(prev => prev.map(pf => pf.id === context.id ? { ...pf, name: f.name, kind, mime: f.type, size: f.size, url, uploadedAt: new Date().toLocaleString() } : pf));
      const existing = projectFiles.find(pf => pf.id === context.id);
      logAction('replaced file content for', existing?.title || existing?.name || f.name);
      triggerToast('File content replaced');
      setViewerFile(prev => (prev && prev.id === context.id ? { ...prev, name: f.name, kind, mime: f.type, size: f.size, url } : prev));
    } else if (context.type === 'authorPhoto') {
      const url = await uploadFileToStorage(files[0], 'authors');
      setAuthorPhotoUrl(url);
      logAction('updated author photo', files[0].name || 'photo');
    } else if (context.type === 'authorModalPhoto') {
      const url = await uploadFileToStorage(files[0], 'authors');
      setAuthorModal(prev => ({ ...prev, data: { ...prev.data, photo: url } }));
    } else if (context.type === 'idUpload') {
      const f = files[0];
      const url = await uploadFileToStorage(f, 'id-verification');
      setWizData(prev => ({ ...prev, idFileName: f.name, idFileUrl: url }));
      runScan(() => setWizData(prev => ({ ...prev, idVerified: true })));
    }
  };

  const resetWizard = () => {
    setWizStep('role'); setWizRole(null);
    setWizData({ email: '', name: '', sectionId: '', idFileName: '', idVerified: false, rank: '', gatePassword: '', creatorPwd: '', pwd1: '', pwd2: '' });
    setAuthError('');
  };

  // ------------------------------------------------------------
  // notifications log
  // ------------------------------------------------------------
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]); // persistent action history / audit trail
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const logAction = (action, item) => {
    const entry = { id: nextId(), actor: currentUser?.name || 'System', action, item, ts: new Date().toISOString() };
    // notifications (short-lived UI) — keep recent
    setNotifications(prev => [{ ...entry, ts: new Date().toLocaleString() }, ...prev].slice(0, 60));
    setNotifUnread(n => n + 1);
    // persistent history (audit) — keep a larger rolling log and save it
    setHistory(prev => {
      const next = [entry, ...prev];
      return next.slice(0, 1000);
    });
  };

  // ------------------------------------------------------------
  // sections (strand/grade — created by editor/creator, chosen by students at signup)
  // ------------------------------------------------------------
  const [sections, setSections] = useState([]); // {id, strand, grade, name, title, active}
  const [sectionPanelOpen, setSectionPanelOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSection, setNewSection] = useState({ strand: '', grade: '11', name: '' });

  const buildSectionTitle = (s) => `${s.strand} [${s.grade}] - ${s.name}`;

  const createSection = () => {
    if (!newSection.strand.trim() || !newSection.name.trim()) return;
    const s = { id: nextId(), strand: newSection.strand.trim(), grade: newSection.grade, name: newSection.name.trim(), active: false };
    s.title = buildSectionTitle(s);
    setSections(prev => [...prev, s]);
    setNewSection({ strand: '', grade: '11', name: '' });
    logAction('created section', s.title);
  };
  const toggleSectionActive = (id) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };
  const deleteSection = (id) => {
    const s = sections.find(x => x.id === id);
    setSections(prev => prev.filter(x => x.id !== id));
    if (s) logAction('deleted section', s.title);
  };

  // ------------------------------------------------------------
  // sidebar custom folders
  // ------------------------------------------------------------
  const [folders, setFolders] = useState([]); // {id, title, module, uploadDate?}
  const [addFolderOpen, setAddFolderOpen] = useState(false);
  const [addFolderLockedModule, setAddFolderLockedModule] = useState(false); // true when opened from inside Project History — skips the module picker entirely
  const [folderStep, setFolderStep] = useState(1);
  const [folderError, setFolderError] = useState('');
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const [newFolder, setNewFolder] = useState({ title: '', module: 'announcements', uploadDate: todayISO() });

  // Opens the folder-creation modal already scoped to Project History, as a
  // single-step "group name" prompt — no module question, since the module
  // is implied by where the button was tapped.
  const openProjectHistoryFolderCreate = () => {
    setNewFolder({ title: '', module: 'projectHistory', uploadDate: todayISO() });
    setAddFolderLockedModule(true);
    setFolderStep(1);
    setFolderError('');
    setAddFolderOpen(true);
  };

  const closeAddFolderModal = () => {
    setAddFolderOpen(false); setFolderStep(1); setAddFolderLockedModule(false); setFolderError('');
    setNewFolder({ title: '', module: 'announcements', uploadDate: todayISO() });
  };

  const createFolder = () => {
    // Give explicit feedback instead of a silent no-op — a swallowed failure
    // here previously left the modal open with no error, so the user's next
    // tap (often landing on the sidebar behind it) looked like the folder
    // creation itself had "redirected" them elsewhere.
    if (!newFolder.title.trim()) { setFolderError('Please enter a name for this group.'); return; }
    if (newFolder.module === 'projectHistory' && !newFolder.uploadDate) { setFolderError('Please choose an upload date.'); return; }
    setFolderError('');
    const f = {
      id: `f-${nextId()}`,
      title: newFolder.title.trim(),
      module: newFolder.module,
      // Project History folders record the date the folder/upload batch was created;
      // other modules don't need it, so it's left undefined for them.
      uploadDate: newFolder.module === 'projectHistory' ? newFolder.uploadDate : undefined
    };
    setFolders(prev => [f, ...prev]);
    // Land the user inside the folder they just created and on the Project
    // History tab specifically — this must happen before the modal fully
    // closes so there's no frame where activeTab still points at the old view.
    if (f.module === 'projectHistory') {
      setActiveTab(f.id);
    }
    closeAddFolderModal();
    logAction('created folder', f.title);
  };
  const deleteFolder = (id) => {
    const f = folders.find(x => x.id === id);
    if (!window.confirm(`Delete the folder "${f?.title}"? This will also delete every file inside it. This cannot be undone.`)) return;
    const filesInside = projectFiles.filter(pf => pf.folderId === id).length;
    setFolders(prev => prev.filter(x => x.id !== id));
    // Cascade-delete: files/announcements/achievers/quizzes scoped to this folder
    // become orphaned (invisible, but still taking up storage) if left behind.
    setProjectFiles(prev => prev.filter(pf => pf.folderId !== id));
    setAnnouncements(prev => prev.filter(a => a.folderId !== id));
    setAchievers(prev => prev.filter(a => a.folderId !== id));
    setQuizzes(prev => prev.filter(q => q.folderId !== id));
    setActiveTab(prev => (prev === id ? 'announcements' : prev));
    if (f) logAction('deleted folder', filesInside > 0 ? `${f.title} (${filesInside} file${filesInside === 1 ? '' : 's'})` : f.title);
  };

  const [activeTab, setActiveTab] = useState('announcements');
  const activeFolder = folders.find(f => f.id === activeTab);
  const activeModule = activeFolder ? activeFolder.module : activeTab;
  const activeFolderId = activeFolder ? activeFolder.id : null;
  const projectHistoryFolders = folders.filter(f => f.module === 'projectHistory');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop "close" toggle for the NESHS PORTAL sidebar

  // ------------------------------------------------------------
  // portal title — top-middle site name, renamable by creator/editor
  // ------------------------------------------------------------
  const [portalTitle, setPortalTitle] = useState(DEFAULT_PORTAL_TITLE);
  const [portalTitleEditing, setPortalTitleEditing] = useState(false);
  const [portalTitleDraft, setPortalTitleDraft] = useState('');
  const startEditPortalTitle = () => { setPortalTitleDraft(portalTitle); setPortalTitleEditing(true); };
  const savePortalTitle = () => {
    // Belt-and-suspenders: even though the edit UI is only reachable by the
    // Creator/Editors, re-check permission here too so saving never depends
    // solely on which buttons happened to be rendered.
    if (!canEditEverything) { setPortalTitleEditing(false); return; }
    const title = portalTitleDraft.trim();
    if (!title) return;
    setPortalTitle(title);
    setPortalTitleEditing(false);
    logAction('renamed portal title to', title);
    triggerToast('Portal name updated');
  };

  // ------------------------------------------------------------
  // online presence — who is genuinely using the site right now, across every
  // device/browser. Backed by Supabase Presence (a purpose-built realtime
  // channel) when configured, since only a real presence channel can detect
  // someone closing their tab/losing connection — a value stored in the
  // shared data blob has no way to know that on its own and would only ever
  // clear via an explicit logout.
  const [onlineUsers, setOnlineUsers] = useState([]); // [{email, name, role, sectionId, visible}] — one entry per online account, deduped across devices
  const [onlinePanelOpen, setOnlinePanelOpen] = useState(false);
  const visibleOnlineUsers = onlineUsers.filter(u => u.visible !== false);
  const presenceChannelRef = useRef(null);

  // ------------------------------------------------------------
  // announcements
  // ------------------------------------------------------------
  const [announcements, setAnnouncements] = useState([]);
  const [annSearch, setAnnSearch] = useState('');
  const [annModal, setAnnModal] = useState({ open: false, step: 1, data: null });
  const [lightbox, setLightbox] = useState(null); // {type,url,name}

  const revokeObjectUrl = (url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const cleanupAnnouncementMediaUrls = (mediaList = []) => {
    mediaList.forEach(m => revokeObjectUrl(m?.url));
  };

  const closeAnnouncementModal = () => {
    if (annModal?.data?.media) cleanupAnnouncementMediaUrls(annModal.data.media);
    setAnnModal({ open: false, step: 1, data: null });
  };

  const startNewAnnouncement = () => {
    if (annModal?.data?.media) cleanupAnnouncementMediaUrls(annModal.data.media);
    setAnnModal({ open: true, step: 1, data: { id: null, title: '', details: '', media: [], folderId: activeFolderId } });
  };
  const submitAnnouncementTitle = () => {
    if (!annModal.data.title.trim()) return;
    setAnnModal(prev => ({ ...prev, step: 2 }));
  };
  const uploadAnnouncementMedia = () => {
    triggerRealUpload({ type: 'announcementMedia' }, { accept: 'image/*,video/*', multiple: true, label: 'Allow access to your photos & videos to attach to this article.' });
  };

  const removeAnnouncementMedia = (mediaId) => {
    setAnnModal(prev => {
      const mediaToRemove = prev.data.media.find(m => m.id === mediaId);
      if (mediaToRemove) revokeObjectUrl(mediaToRemove.url);
      return { ...prev, data: { ...prev.data, media: prev.data.media.filter(m => m.id !== mediaId) } };
    });
  };
  const saveAnnouncement = () => {
    if (annModal.data.media) cleanupAnnouncementMediaUrls(annModal.data.media.filter(m => m.url && m.url.startsWith('blob:')));

    const sanitizedMedia = (annModal.data.media || []).map(item => {
      const mediaUrl = normalizeR2PublicUrl(item?.url || '');
      if (mediaUrl.startsWith('blob:')) throw new Error('Cannot save blob URL to database!');
      console.log('Final URL saved to DB:', mediaUrl);
      return { ...item, url: mediaUrl };
    });

    const payload = {
      ...annModal.data,
      media: sanitizedMedia,
      id: annModal.data.id || nextId(),
      author: currentUser.name,
      date: new Date().toLocaleDateString()
    };

    setAnnouncements(prev => {
      const exists = prev.some(a => a.id === payload.id);
      return exists ? prev.map(a => a.id === payload.id ? payload : a) : [payload, ...prev];
    });
    logAction(annModal.data.id ? 'edited article' : 'created article', payload.title);
    triggerToast(annModal.data.id ? 'Article updated' : 'Article published');
    closeAnnouncementModal();
  };
  const deleteAnnouncement = (id) => {
    const a = announcements.find(x => x.id === id);
    setAnnouncements(prev => prev.filter(x => x.id !== id));
    if (a) logAction('deleted article', a.title);
  };
  const visibleAnnouncements = () => {
    const scoped = announcements.filter(a => a.folderId === activeFolderId);
    const list = scoped.filter(a => !annSearch || a.title.toLowerCase().includes(annSearch.toLowerCase()));
    if (!annSearch) return list;
    return [...list].sort((a, b) => {
      const am = a.title.toLowerCase().startsWith(annSearch.toLowerCase()) ? 0 : 1;
      const bm = b.title.toLowerCase().startsWith(annSearch.toLowerCase()) ? 0 : 1;
      return am - bm;
    });
  };

  // ------------------------------------------------------------
  // project history — real upload, view/play inline, gated downloads
  // ------------------------------------------------------------
  const [projectFiles, setProjectFiles] = useState([]); // {id,name,title,kind,mime,folderId,url,authorized,processed,uploadedBy}
  const [viewerFile, setViewerFile] = useState(null);
  const uploadProjectFile = () => {
    triggerRealUpload({ type: 'projectFile' }, { accept: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx', multiple: true, label: 'Allow access to your files to upload images, videos, Word or PowerPoint documents.' });
  };
  const deleteProjectFile = (id) => {
    const f = projectFiles.find(x => x.id === id);
    setProjectFiles(prev => prev.filter(x => x.id !== id));
    if (viewerFile && viewerFile.id === id) setViewerFile(null);
    if (f) logAction('deleted file', f.title || f.name);
  };
  const toggleFileAuthorization = (id) => {
    setProjectFiles(prev => prev.map(f => f.id === id ? { ...f, authorized: !f.authorized } : f));
    const f = projectFiles.find(x => x.id === id);
    if (f) logAction(f.authorized ? 'revoked download access for' : 'authorized download for', f.title || f.name);
    triggerToast('Download authorization updated');
    // keep the open viewer's authorization flag in sync so the download button
    // enables/disables immediately without needing to reopen the viewer
    setViewerFile(prev => (prev && prev.id === id ? { ...prev, authorized: !prev.authorized } : prev));
  };
  const canDownloadFile = (f) => canEditEverything || !!f.authorized;
  const downloadFile = (f) => {
    if (!canDownloadFile(f)) { triggerToast('This file has not been authorized for download yet.'); return; }
    const a = document.createElement('a');
    a.href = f.url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logAction('downloaded file', f.title || f.name);
    if (settings.autoDownload) triggerToast(`Downloaded ${f.title || f.name}`);
  };

  // Rename (title) + optional replace-content editing for an uploaded file.
  const [renameModal, setRenameModal] = useState({ open: false, id: null, title: '' });
  const openRenameModal = (f) => setRenameModal({ open: true, id: f.id, title: f.title || f.name });
  const saveRename = () => {
    const title = renameModal.title.trim();
    if (!title) return;
    setProjectFiles(prev => prev.map(f => f.id === renameModal.id ? { ...f, title } : f));
    const f = projectFiles.find(x => x.id === renameModal.id);
    logAction('renamed file', f ? `${f.title || f.name} \u2192 ${title}` : title);
    triggerToast('File renamed');
    setViewerFile(prev => (prev && prev.id === renameModal.id ? { ...prev, title } : prev));
    setRenameModal({ open: false, id: null, title: '' });
  };
  const replaceProjectFileContent = (id) => {
    triggerRealUpload({ type: 'projectFileReplace', id }, { accept: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx', label: 'Allow access to your files to replace this file\u2019s content.' });
  };

  // ------------------------------------------------------------
  // best students / achievers
  // ------------------------------------------------------------
  const [achievers, setAchievers] = useState([]);
  const [achieverModal, setAchieverModal] = useState({ open: false, data: null });
  const [expandedAchieverId, setExpandedAchieverId] = useState(null);
  const [achievementDraft, setAchievementDraft] = useState({});

  const openAchieverModal = (data) => setAchieverModal({ open: true, data: data || { id: null, name: '', semester: '', quote: '', photo: null, achievements: [], folderId: activeFolderId } });
  const saveAchiever = () => {
    if (!achieverModal.data.name.trim()) return;
    const payload = { ...achieverModal.data, id: achieverModal.data.id || nextId(), achievements: achieverModal.data.achievements || [] };
    setAchievers(prev => {
      const exists = prev.some(a => a.id === payload.id);
      return exists ? prev.map(a => a.id === payload.id ? payload : a) : [payload, ...prev];
    });
    logAction(achieverModal.data.id ? 'edited achiever' : 'added achiever', payload.name);
    triggerToast(achieverModal.data.id ? 'Achiever updated' : 'Achiever added');
    setAchieverModal({ open: false, data: null });
  };
  const deleteAchiever = (id) => {
    const a = achievers.find(x => x.id === id);
    setAchievers(prev => prev.filter(x => x.id !== id));
    if (expandedAchieverId === id) setExpandedAchieverId(null);
    if (a) logAction('deleted achiever', a.name);
  };
  const uploadAchieverPhoto = (id) => {
    triggerRealUpload({ type: 'achieverPhotoDirect', id }, { accept: 'image/*', label: "Allow access to your photos to set this achiever's picture." });
  };
  const uploadAchieverPhotoInModal = () => {
    triggerRealUpload({ type: 'achieverPhotoModal' }, { accept: 'image/*', label: "Allow access to your photos to set this achiever's picture." });
  };
  const addAchievement = (achieverId) => {
    const text = (achievementDraft[achieverId] || '').trim();
    if (!text) return;
    setAchievers(prev => prev.map(a => a.id === achieverId ? { ...a, achievements: [...(a.achievements || []), { id: nextId(), text }] } : a));
    setAchievementDraft(prev => ({ ...prev, [achieverId]: '' }));
    logAction('added achievement for', achievers.find(a => a.id === achieverId)?.name || '');
  };
  const removeAchievement = (achieverId, achId) => {
    setAchievers(prev => prev.map(a => a.id === achieverId ? { ...a, achievements: (a.achievements || []).filter(x => x.id !== achId) } : a));
  };

  // ------------------------------------------------------------
  // quizzes
  // ------------------------------------------------------------
  const [quizzes, setQuizzes] = useState([]);
  const [quizRecords, setQuizRecords] = useState([]);
  const [quizMode, setQuizMode] = useState('list'); // list | builder | take | records
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [builder, setBuilder] = useState(null); // {step, id, title, password, items}
  const [takeState, setTakeState] = useState({ gate: '', started: false, answers: {} });
  const [takeError, setTakeError] = useState('');
  const [recordSectionFilter, setRecordSectionFilter] = useState('all');

  const startBuilder = () => { setBuilder({ step: 1, id: null, title: '', password: '', items: [] }); setQuizMode('builder'); };
  const builderNext = () => {
    if (builder.step === 1 && !builder.title.trim()) return;
    if (builder.step === 2 && !builder.password.trim()) return;
    setBuilder(prev => ({ ...prev, step: prev.step + 1 }));
  };
  const addQuestion = (type) => setBuilder(prev => ({ ...prev, items: [...prev.items, { type, qText: '', options: ['', '', '', ''], answer: '' }] }));
  const updateQuestion = (idx, patch) => setBuilder(prev => {
    const items = [...prev.items];
    items[idx] = { ...items[idx], ...patch };
    return { ...prev, items };
  });
  const removeQuestion = (idx) => setBuilder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const saveQuiz = () => {
    const payload = { id: builder.id || nextId(), title: builder.title, password: builder.password, items: builder.items, folderId: activeFolderId };
    setQuizzes(prev => {
      const exists = prev.some(q => q.id === payload.id);
      return exists ? prev.map(q => q.id === payload.id ? payload : q) : [payload, ...prev];
    });
    logAction(builder.id ? 'edited quiz' : 'created quiz', payload.title);
    triggerToast('Quiz saved');
    setBuilder(null); setQuizMode('list');
  };
  const deleteQuiz = (id) => {
    const q = quizzes.find(x => x.id === id);
    setQuizzes(prev => prev.filter(x => x.id !== id));
    if (activeQuizId === id) { setActiveQuizId(null); setQuizMode('list'); }
    if (q) logAction('deleted quiz', q.title);
  };
  const [lastResult, setLastResult] = useState(null);
  // A question's point value: Enumeration is worth one point per listed
  // item (e.g. "Enumerate the 5 stages..." = 5 points), matching how these
  // are actually scored on a real exam — every other question type is
  // worth its usual single point.
  const questionMaxPoints = (item) => item.type === 'Enumeration' ? Math.max(1, parseEnumerationKey(item.answer).length) : 1;

  const submitQuiz = () => {
    const quiz = quizzes.find(q => q.id === activeQuizId);
    if (!quiz) { setQuizMode('list'); return; }
    let score = 0;
    let maxScore = 0;
    quiz.items.forEach((item, idx) => {
      maxScore += questionMaxPoints(item);
      if (item.type === 'Enumeration') {
        // Per-item, partial-credit scoring: each correctly recalled item is
        // one point, independent of the others — not all-or-nothing.
        const correctItems = parseEnumerationKey(item.answer).map(s => s.toLowerCase());
        const givenList = Array.isArray(takeState.answers[idx]) ? takeState.answers[idx] : [];
        const givenTrimmed = givenList.map(s => (s || '').toString().toLowerCase().trim());
        if (item.orderMatters) {
          // Chronological/sequence questions: item N only counts if it
          // matches the expected item at that same position.
          correctItems.forEach((correct, i) => {
            if (givenTrimmed[i] && givenTrimmed[i] === correct) score++;
          });
        } else {
          // Order-free recall: each given answer can match any not-yet-used
          // correct item, so listing the same right items in a different
          // order still earns full credit.
          const remaining = [...correctItems];
          givenTrimmed.forEach(g => {
            if (!g) return;
            const matchIdx = remaining.indexOf(g);
            if (matchIdx !== -1) { score++; remaining.splice(matchIdx, 1); }
          });
        }
      } else {
        const given = (takeState.answers[idx] || '').toString().toLowerCase().trim();
        const correct = (item.answer || '').toString().toLowerCase().trim();
        if (given && given === correct) score++;
      }
    });
    // Student name, grade, and section come from the account/section chosen at
    // login/signup — never re-asked here. Non-student roles (teacher/editor
    // taking a quiz to preview it) simply have no section on file.
    setQuizRecords(prev => [...prev, {
      id: nextId(), quizId: quiz.id, studentName: currentUser.name,
      grade: currentUserSection ? currentUserSection.grade : '',
      section: currentUserSection ? currentUserSection.title : '',
      score, maxScore, ts: new Date().toLocaleString()
    }]);
    logAction('quiz submitted', `${currentUser.name} / ${quiz.title} (${score}/${maxScore})`);
    setLastResult({ title: quiz.title, score, maxScore });
    setTakeState({ gate: '', started: false, answers: {} });
    setQuizMode('list');
  };

  // Section-segregated CSV export for a quiz's record sheet.
  const exportRecordsCsv = (quiz, records) => {
    const rows = [
      ['Student', 'Grade', 'Section', 'Score', 'Max Score', 'Submitted At'],
      ...records.map(r => [r.studentName, r.grade, r.section, r.score, r.maxScore, r.ts])
    ];
    const csv = rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(quiz.title || 'quiz-records').replace(/[^\w\-]+/g, '_')}_records.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAction('exported records for', quiz.title);
    triggerToast('Record sheet exported');
  };

  // ------------------------------------------------------------
  // author profile — the primary Creator profile, plus any number of
  // additional authors/contributors added afterward.
  // ------------------------------------------------------------
  const [authorName, setAuthorName] = useState('MARK NIEL PAITON');
  const [authorTitle, setAuthorTitle] = useState('Creator & Architect');
  const [authorBio, setAuthorBio] = useState('Visionary developer behind the NESHS Portal, built to bridge academic administration and a clear digital experience for the whole school.');
  const [authorEditing, setAuthorEditing] = useState(false);
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState(null);
  const uploadAuthorPhoto = () => triggerRealUpload({ type: 'authorPhoto' }, { accept: 'image/*', label: 'Allow access to your photos to update the author picture.' });

  const [authors, setAuthors] = useState([]); // [{id, name, title, bio, photo}]
  const [authorModal, setAuthorModal] = useState({ open: false, data: null });
  const openAuthorModal = (data) => setAuthorModal({ open: true, data: data || { id: null, name: '', title: '', bio: '', photo: null } });
  const uploadAuthorModalPhoto = () => triggerRealUpload({ type: 'authorModalPhoto' }, { accept: 'image/*', label: 'Allow access to your photos to set this author\u2019s picture.' });
  const saveAuthorEntry = () => {
    if (!authorModal.data.name.trim()) return;
    const payload = { ...authorModal.data, id: authorModal.data.id || nextId() };
    setAuthors(prev => {
      const exists = prev.some(a => a.id === payload.id);
      return exists ? prev.map(a => a.id === payload.id ? payload : a) : [...prev, payload];
    });
    logAction(authorModal.data.id ? 'edited author' : 'added author', payload.name);
    triggerToast(authorModal.data.id ? 'Author updated' : 'Author added');
    setAuthorModal({ open: false, data: null });
  };
  const deleteAuthorEntry = (id) => {
    const a = authors.find(x => x.id === id);
    setAuthors(prev => prev.filter(x => x.id !== id));
    if (a) logAction('removed author', a.name);
  };

  // ------------------------------------------------------------
  // role helpers
  // ------------------------------------------------------------
  const isCreator = currentUser?.email?.toLowerCase() === CREATOR_EMAIL;
  const isEditor = currentUser?.role === 'editor';
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';
  const canEditEverything = isCreator || isEditor;
  const canCreateQuizzes = isCreator || isEditor || isTeacher;
  const currentUserSection = currentUser?.sectionId ? sections.find(s => s.id === currentUser.sectionId) : null;

  // ------------------------------------------------------------
  // PERSISTENCE — load once on mount, save (debounced) on change, and (when
  // Supabase is configured) subscribe to realtime changes so uploads made on
  // one device appear on every other device without a manual refresh.
  //
  // CRITICAL: Supabase's realtime channel echoes a change back to the SAME
  // device that made it, not just to other devices. Combined with the
  // debounced save (500ms) and Postgres's own commit latency, this means a
  // device can receive an echo of an OLDER save arriving just after it has
  // already moved on to newer local state (e.g. right after adding a
  // folder) — and without protection, that stale echo overwrites the newer
  // state, making the just-created folder/section/etc. vanish. lastAppliedVersionRef
  // tracks the newest version number this device has produced or received;
  // any incoming update with a version at or below that is a stale echo and
  // gets ignored outright.
  // ------------------------------------------------------------
  const lastAppliedVersionRef = useRef(0);

  const applyRemoteData = (data) => {
    // NOTE: accounts and currentUser are handled by their own dedicated
    // local-only effect below — never part of the shared Supabase blob.
    if (Array.isArray(data.sections)) setSections(data.sections);
    if (Array.isArray(data.folders)) setFolders(data.folders);
    if (Array.isArray(data.announcements)) setAnnouncements(data.announcements);
    if (Array.isArray(data.projectFiles)) setProjectFiles(data.projectFiles);
    if (Array.isArray(data.achievers)) setAchievers(data.achievers);
    if (Array.isArray(data.quizzes)) setQuizzes(data.quizzes);
    if (Array.isArray(data.quizRecords)) setQuizRecords(data.quizRecords);
    if (Array.isArray(data.notifications)) setNotifications(data.notifications);
    if (Array.isArray(data.history)) setHistory(data.history);
    // onlineUsers is intentionally NOT restored from the saved blob — presence
    // is live, transient state owned by the Supabase Presence channel (or the
    // local-only fallback), never durable data. Loading a stale saved copy
    // here would make offline accounts appear to "come back online" on reload.
    if (typeof data.portalTitle === 'string' && data.portalTitle.trim()) setPortalTitle(data.portalTitle);
    if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
    if (data.author) {
      setAuthorName(data.author.name || 'MARK NIEL PAITON');
      setAuthorTitle(data.author.title || 'Creator & Architect');
      setAuthorBio(data.author.bio || '');
      setAuthorPhotoUrl(data.author.photo || null);
    }
    if (Array.isArray(data.authors)) setAuthors(data.authors);
    if (typeof data.idCounter === 'number') idCounter = Math.max(idCounter, data.idCounter);
  };

  // Accounts + the active login session — always local to this device/browser,
  // loaded and saved straight to localStorage, completely separate from the
  // shared Supabase-backed content above. Runs once on mount, independent of
  // whether Supabase is configured or the shared data has finished loading.
  const [localAccountsLoaded, setLocalAccountsLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      if (raw) {
        const local = JSON.parse(raw);
        if (Array.isArray(local.accounts)) setAccounts(local.accounts);
        if (local.currentUser) setCurrentUser(local.currentUser);
      }
    } catch (err) {
      // No valid local account data yet on this device — start fresh, no
      // shared data is at risk here since this key never touches Supabase.
    }
    setLocalAccountsLoaded(true);
  }, []);

  useEffect(() => {
    if (!localAccountsLoaded) return;
    try {
      window.localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify({ accounts, currentUser }));
    } catch (err) {
      // Best-effort — a full/blocked localStorage here just means this
      // device's login session won't persist across a reload, not a loss of
      // any shared content.
    }
  }, [accounts, currentUser, localAccountsLoaded]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loadFailed = false;
      try {
        const res = await persistence.get(STORAGE_KEY, true);
        if (res && res.value && !cancelled) {
          const data = JSON.parse(res.value);
          applyRemoteData(data);
          // Seed the version guard with whatever this initial load carried,
          // so the very first realtime message this device receives is
          // compared against real data instead of the default 0 (which
          // would make it look "newer" no matter what and skip the guard
          // entirely on that first message).
          if (typeof data.__v === 'number') lastAppliedVersionRef.current = data.__v;
          // Default Directory setting drives the initial active section/folder view
          // on login rather than a hardcoded tab.
          if (data.settings && data.settings.defaultDirectory) {
            setActiveSectionView(data.settings.defaultDirectory);
            setActiveTab(data.settings.defaultDirectory);
          }
        }
      } catch (err) {
        // The stored data existed but failed to parse/load — this must NEVER be
        // treated as "nothing was saved yet." Falling through silently here would
        // let the very next debounced save overwrite the corrupted-but-recoverable
        // stored JSON with a blank slate, permanently destroying every uploaded
        // file. Block saving entirely until the user acts.
        loadFailed = true;
      }
      if (!cancelled) {
        if (loadFailed) {
          setSaveError('Your saved files could not be loaded. To protect your data, saving has been paused — please refresh the page before making changes. If this keeps happening, contact the site editor.');
        } else {
          setDataLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Realtime subscription — only active when Supabase is actually configured.
  // Whenever ANY device saves, every other open browser receives the new row
  // and applies it immediately, which is what makes uploads/edits genuinely
  // shared across devices instead of trapped in one browser's own storage.
  const applyingRemoteRef = useRef(false);
  useEffect(() => {
    if (!supabaseConfigured || !dataLoaded) return;
    const channel = supabase
      .channel('portal_data_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_data', filter: `id=eq.${STORAGE_KEY}` }, (payload) => {
        const data = payload.new && payload.new.data;
        if (!data) return;
        // Reject a stale echo: Supabase's realtime channel delivers a
        // change back to the device that MADE it, not only to other
        // devices, and delivery order isn't guaranteed relative to this
        // device's own newer local edits. A version at or below what this
        // device has already applied is old news — applying it would wipe
        // out newer local state (this is the bug behind folders/sections
        // vanishing right after another save, like an upload, fires close
        // behind them).
        const incomingVersion = typeof data.__v === 'number' ? data.__v : 0;
        if (incomingVersion <= lastAppliedVersionRef.current) return;
        lastAppliedVersionRef.current = incomingVersion;
        applyingRemoteRef.current = true;
        applyRemoteData(data);
        // Release the guard on the next tick, after React has processed the
        // batch of setters above — see the save effect below for why this flag
        // exists (to stop an incoming remote change from immediately bouncing
        // straight back out as an outgoing save).
        setTimeout(() => { applyingRemoteRef.current = false; }, 0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dataLoaded]);

  // Presence channel — a separate Supabase realtime channel purpose-built for
  // "who's here right now." Joins when a user is signed in on this device,
  // leaves automatically on logout OR if the tab closes/connection drops
  // (Supabase detects that itself), and every browser's presence state stays
  // in sync so the Online panel is accurate across devices without polling.
  useEffect(() => {
    if (!supabaseConfigured || !dataLoaded) return;
    const channel = supabase.channel('portal_presence', { config: { presence: { key: currentUser ? currentUser.email : `guest-${Math.random().toString(36).slice(2)}` } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // presenceState groups by key; each key can have multiple entries if
        // the same account is open in several tabs — collapse to one row per
        // account, since the panel lists people, not tabs/devices.
        const merged = Object.values(state).map(entries => entries[entries.length - 1]).filter(Boolean);
        setOnlineUsers(merged);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          presenceChannelRef.current = channel;
          if (currentUser) {
            channel.track({ email: currentUser.email, name: currentUser.name, role: currentUser.role, sectionId: currentUser.sectionId || null, visible: settings.profileVisibility !== false });
          }
        }
      });
    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      if (presenceChannelRef.current === channel) presenceChannelRef.current = null;
    };
  }, [dataLoaded, currentUser?.email]);

  useEffect(() => {
    if (!dataLoaded) return;
    // Don't re-save data that just arrived FROM a realtime update — that would
    // create a pointless save-receive-save loop between devices.
    if (applyingRemoteRef.current) return;
    const handle = setTimeout(() => {
      // Every save gets a new version number, strictly greater than any this
      // device has seen so far (its own last save OR the newest realtime
      // echo it received) — this is what lets the realtime handler above
      // recognize and discard a stale echo of an old save instead of using
      // it to clobber newer local state. Claimed synchronously (not after
      // the write succeeds) so two saves firing close together can never
      // compute the same version number and collide.
      const nextVersion = lastAppliedVersionRef.current + 1;
      lastAppliedVersionRef.current = nextVersion;
      const payload = {
        __v: nextVersion,
        sections, folders, announcements, projectFiles, achievers,
        quizzes, quizRecords, notifications, settings, portalTitle,
        author: { name: authorName, title: authorTitle, bio: authorBio, photo: authorPhotoUrl },
        authors,
        history,
        idCounter
      };
      let json;
      try {
        json = JSON.stringify(payload);
      } catch (err) {
        setSaveError('Could not prepare data for saving.');
        return;
      }
      // Retry on failure instead of giving up until the next unrelated state
      // change — a save failure right before a reload must not go unrecovered.
      const attemptSave = (retriesLeft) => {
        persistence.set(STORAGE_KEY, json, true)
          .then(() => setSaveError(''))
          .catch(() => {
            if (retriesLeft > 0) {
              setTimeout(() => attemptSave(retriesLeft - 1), 1500);
            } else {
              setSaveError('Changes could not be saved — storage may be full. Try removing large files or images.');
            }
          });
      };
      attemptSave(2);
    }, 500);
    return () => clearTimeout(handle);
  }, [sections, folders, announcements, projectFiles, achievers, quizzes, quizRecords, notifications, settings, portalTitle, authorName, authorTitle, authorBio, authorPhotoUrl, authors, dataLoaded]);

  // ------------------------------------------------------------
  // AUTH: sign in
  // ------------------------------------------------------------
  // Tracks this device's own presence on the shared Supabase channel (when
  // configured) so every open browser — any account, any device — shows up
  // for everyone else in real time, and automatically disappears if the tab
  // closes or the connection drops, not just on an explicit logout.
  // Falls back to a simple local-only entry when Supabase isn't configured,
  // matching the previous single-device behavior.
  const markUserOnline = (acc) => {
    const entry = { email: acc.email, name: acc.name, role: acc.role, sectionId: acc.sectionId || null, visible: settings.profileVisibility !== false };
    if (supabaseConfigured && presenceChannelRef.current) {
      presenceChannelRef.current.track(entry);
    } else {
      setOnlineUsers(prev => [...prev.filter(u => u.email !== acc.email), entry]);
    }
  };
  const markUserOffline = (email) => {
    if (supabaseConfigured && presenceChannelRef.current) {
      presenceChannelRef.current.untrack();
    } else {
      setOnlineUsers(prev => prev.filter(u => u.email !== email));
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setAuthError('');
    const email = signinEmail.trim().toLowerCase();

    if (email === CREATOR_EMAIL) {
      if (signinPassword !== CREATOR_PASSWORD) return setAuthError('Incorrect password.');
      const existing = accounts.find(a => a.email === CREATOR_EMAIL);
      const creatorAccount = existing || { email: CREATOR_EMAIL, name: 'MARK NIEL PAITON', role: 'editor', password: CREATOR_PASSWORD, sectionId: null, rank: null };
      if (!existing) setAccounts(prev => [...prev, creatorAccount]);
      setCurrentUser(creatorAccount);
      markUserOnline(creatorAccount);
      // Apply the Default Directory preference on login, falling back to Announcements.
      setActiveTab(settings.defaultDirectory || 'announcements');
      logAction('signed in', CREATOR_EMAIL);
      return;
    }

    const acc = accounts.find(a => a.email === email);
    if (!acc) return setAuthError('No account found for that email. Please sign up.');
    if (acc.password !== signinPassword) return setAuthError('Incorrect password.');
    setCurrentUser(acc);
    markUserOnline(acc);
    setActiveTab(settings.defaultDirectory || 'announcements');
    logAction('signed in', acc.email);
  };

  // ------------------------------------------------------------
  // AUTH: sign up wizard steps
  // ------------------------------------------------------------
  const chooseRole = (role) => { setWizRole(role); setWizStep(role === 'student' ? 'section' : role === 'teacher' ? 'teacherGate' : 'gate'); };

  const runScan = (onDone) => {
    setScanning(true);
    setTimeout(() => { setScanning(false); onDone(); }, 1400);
  };

  const studentPickSection = () => {
    if (!wizData.sectionId) return;
    setWizStep('id');
  };

  // Teachers must enter this shared access password before they're allowed to
  // proceed to ID upload/verification — a gate on the teacher signup path
  // itself, separate from the existing Editor gate password.
  const teacherGateContinue = () => {
    if (wizData.gatePassword !== TEACHER_SIGNUP_GATE_PASSWORD) { setAuthError('Incorrect teacher access password.'); return; }
    setAuthError('');
    setWizStep('id');
  };

  const requestIdUpload = () => {
    triggerRealUpload({ type: 'idUpload' }, { accept: 'image/*', label: 'Allow access to your files to upload and verify your ID.' });
  };

  const idContinue = () => {
    if (!wizData.idVerified) return;
    if (wizRole === 'teacher' && !wizData.rank.trim()) return;
    setWizStep(wizRole === 'teacher' ? 'name' : 'password');
  };

  const teacherNameContinue = () => { if (wizData.name.trim()) setWizStep('password'); };

  const gateContinue = () => {
    if (wizData.gatePassword !== EDITOR_GATE_PASSWORD) { setAuthError('Incorrect editor access password.'); return; }
    setAuthError('');
    setWizStep('creatorCheck');
  };

  const creatorCheckContinue = () => {
    if (!isGmailAddress(wizData.email)) { setAuthError('Please use a Gmail address (e.g. name@gmail.com).'); return; }
    const email = wizData.email.trim().toLowerCase();
    if (email === CREATOR_EMAIL) {
      if (wizData.creatorPwd !== creatorPassword) { setAuthError('Incorrect creator account password.'); return; }
      setAuthError(''); setWizStep('password');
    } else {
      setAuthError(''); setWizStep('password');
    }
  };

  const finishSignup = () => {
    if (!wizData.email.trim()) return setAuthError('Gmail address is required.');
    if (!isGmailAddress(wizData.email)) return setAuthError('Please sign up with a Gmail address (e.g. name@gmail.com).');
    if (wizData.pwd1.length < 4) return setAuthError('Password must be at least 4 characters.');
    if (wizData.pwd1 !== wizData.pwd2) return setAuthError('Passwords do not match.');
    const email = wizData.email.trim().toLowerCase();
    if (accounts.some(a => a.email === email)) return setAuthError('An account with that email already exists.');

    const account = {
      email,
      name: wizRole === 'teacher' ? wizData.name.trim() : (wizRole === 'student' ? wizData.name.trim() || email.split('@')[0] : email.split('@')[0]),
      role: wizRole,
      password: wizData.pwd1,
      sectionId: wizRole === 'student' ? wizData.sectionId : null,
      rank: wizRole === 'teacher' ? wizData.rank.trim() : null
    };
    setAccounts(prev => [...prev, account]);
    setCurrentUser(account);
    markUserOnline(account);
    setActiveTab(settings.defaultDirectory || 'announcements');
    logAction('account created', account.email);
    resetWizard();
  };

  const handleLogout = () => {
    if (currentUser) markUserOffline(currentUser.email);
    setCurrentUser(null);
    setActiveTab('announcements');
    setPortalTitleEditing(false);
    resetWizard();
  };

  // ================================================================
  // INITIAL LOAD SCREEN
  // ================================================================
  // Waits on BOTH loads: the shared Supabase-backed content AND this
  // device's own local accounts/session — the login screen right after this
  // needs accounts to be ready, and neither load blocks on the other.
  if (!dataLoaded || !localAccountsLoaded) {
    // A load failure sets saveError and deliberately never flips dataLoaded to
    // true — this screen must say so plainly rather than spin forever, since
    // silently proceeding into the app would risk the next save overwriting
    // whatever is actually still sitting in storage.
    if (saveError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-sans p-6 text-center" style={{ backgroundColor: C.bg, color: C.text }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,122,122,0.12)' }}>
            <Lock className="w-6 h-6" style={{ color: C.danger }} />
          </div>
          <p className="text-sm font-bold max-w-sm">{saveError}</p>
          <Btn onClick={() => window.location.reload()} reducedMotion={false}>Refresh Page</Btn>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 font-sans" style={{ backgroundColor: C.bg, color: C.text }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.accent }} />
          <p className="text-xs" style={{ color: C.textDim }}>Loading NESHS Portal</p>
        </div>
    );
  }

  // ================================================================
  // LOGIN / SIGNUP SCREEN
  // ================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans relative" style={{ backgroundColor: C.bg, color: C.text }}>
        <PermissionModal open={permission.open} label={permission.label} onAllow={permission.onAllow} onDeny={closePermission} />
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilesSelected} />
        <button onClick={toggleTheme} className={`absolute top-5 right-5 p-2 rounded-lg ${motionTransition}`} style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }} title={isLightLikeTheme ? 'Switch to dark mode' : 'Switch to light mode'}>
          {isLightLikeTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3" style={{ backgroundColor: C.accentDim, border: `1px solid ${C.border}` }}>
              <ShieldCheck className="w-8 h-8" style={{ color: C.accent }} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">NESHS PORTAL</h1>
            <p className="text-[11px] uppercase font-semibold tracking-wider" style={{ color: C.textDim }}>{SCHOOL_NAME}</p>
          </div>

          <Card className="p-6">
            <div className="flex p-1 rounded-xl mb-5" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <button onClick={() => { setAuthMode('signin'); resetWizard(); }} className="flex-1 py-2 text-xs font-bold rounded-lg" style={authMode === 'signin' ? { backgroundColor: C.accent, color: C.bg } : { color: C.textDim }}>Sign In</button>
              <button onClick={() => { setAuthMode('signup'); resetWizard(); }} className="flex-1 py-2 text-xs font-bold rounded-lg" style={authMode === 'signup' ? { backgroundColor: C.accent, color: C.bg } : { color: C.textDim }}>Sign Up</button>
            </div>

            {authError && <div className="mb-4 p-3 rounded-xl text-xs font-medium" style={{ backgroundColor: 'rgba(255,122,122,0.1)', border: '1px solid rgba(255,122,122,0.3)', color: C.danger }}>{authError}</div>}

            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Field type="email" required placeholder="Gmail account" value={signinEmail} onChange={e => setSigninEmail(e.target.value)} />
                <Field type="password" required placeholder="Password" value={signinPassword} onChange={e => setSigninPassword(e.target.value)} />
                <Btn type="submit" className="w-full py-3" reducedMotion={reducedMotion}>Sign In</Btn>
              </form>
            )}

            {authMode === 'signup' && (
              <div className="space-y-4">
                {wizStep === 'role' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold" style={{ color: C.textDim }}>Select your role</p>
                    {[
                      { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Join your section and take quizzes' },
                      { id: 'teacher', label: 'Teacher', icon: User, desc: 'Create quizzes and view records' },
                      { id: 'editor', label: 'Editor', icon: KeyRound, desc: 'Manage content site-wide' }
                    ].map(r => (
                      <button key={r.id} onClick={() => chooseRole(r.id)} className="w-full flex items-center gap-3 p-4 rounded-xl text-left" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                        <r.icon className="w-5 h-5" style={{ color: C.accent }} />
                        <div>
                          <p className="text-sm font-bold">{r.label}</p>
                          <p className="text-[10px]" style={{ color: C.textDim }}>{r.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 ml-auto" style={{ color: C.textDim }} />
                      </button>
                    ))}
                  </div>
                )}

                {wizStep === 'section' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold" style={{ color: C.textDim }}>Choose your section</p>
                    {sections.length === 0 && <p className="text-xs" style={{ color: C.textDim }}>No sections have been created yet. Ask your teacher or the site editor to add one.</p>}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {sections.map(s => (
                        <button key={s.id} onClick={() => setWizData(prev => ({ ...prev, sectionId: s.id }))} className="w-full text-left p-3 rounded-xl text-xs font-semibold" style={wizData.sectionId === s.id ? { backgroundColor: C.accentDim, border: `1px solid ${C.accent}`, color: C.accent } : { backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
                          {s.title}
                        </button>
                      ))}
                    </div>
                    <Btn className="w-full py-3" onClick={studentPickSection} disabled={!wizData.sectionId} reducedMotion={reducedMotion}>Continue</Btn>
                  </div>
                )}

                {wizStep === 'id' && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs font-bold" style={{ color: C.textDim }}>
                      {wizRole === 'teacher' ? 'Upload your Teacher ID for verification' : 'Upload your Student ID for verification'}
                    </p>
                    <div className="rounded-xl p-6 flex flex-col items-center gap-3" style={{ backgroundColor: C.bg, border: `1px dashed ${C.border}` }}>
                      {scanning ? (
                        <>
                          <ScanLine className="w-10 h-10 animate-pulse" style={{ color: C.accent }} />
                          <p className="text-[11px]" style={{ color: C.textDim }}>Analyzing ID...</p>
                        </>
                      ) : wizData.idVerified ? (
                        <>
                          <CheckCircle className="w-10 h-10" style={{ color: C.accent }} />
                          <p className="text-[11px] truncate max-w-full" style={{ color: C.text }}>{wizData.idFileName}</p>
                          <p className="text-[10px]" style={{ color: C.accent }}>Verified</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8" style={{ color: C.textDim }} />
                          <Btn variant="ghost" onClick={requestIdUpload} reducedMotion={reducedMotion}>Upload ID Image</Btn>
                        </>
                      )}
                    </div>
                    {wizRole === 'teacher' && wizData.idVerified && (
                      <Field placeholder="Rank / Title shown on ID (e.g. Master Teacher I)" value={wizData.rank} onChange={e => setWizData({ ...wizData, rank: e.target.value })} />
                    )}
                    <Btn className="w-full py-3" onClick={idContinue} disabled={!wizData.idVerified || (wizRole === 'teacher' && !wizData.rank.trim())} reducedMotion={reducedMotion}>Continue</Btn>
                  </div>
                )}

                {wizStep === 'name' && (
                  <div className="space-y-4">
                    <Field placeholder="Full Name" value={wizData.name} onChange={e => setWizData({ ...wizData, name: e.target.value })} />
                    <Btn className="w-full py-3" onClick={teacherNameContinue} disabled={!wizData.name.trim()} reducedMotion={reducedMotion}>Continue</Btn>
                  </div>
                )}

                {wizStep === 'gate' && (
                  <div className="space-y-4">
                    <p className="text-xs" style={{ color: C.textDim }}>Enter the editor access password to continue.</p>
                    <Field type="password" placeholder="Editor Access Password" value={wizData.gatePassword} onChange={e => setWizData({ ...wizData, gatePassword: e.target.value })} />
                    <Btn className="w-full py-3" onClick={gateContinue} reducedMotion={reducedMotion}>Continue</Btn>
                  </div>
                )}

                {wizStep === 'teacherGate' && (
                  <div className="space-y-4">
                    <p className="text-xs" style={{ color: C.textDim }}>Enter the teacher access password before uploading your ID.</p>
                    <Field type="password" placeholder="Teacher Access Password" value={wizData.gatePassword} onChange={e => setWizData({ ...wizData, gatePassword: e.target.value })} />
                    <Btn className="w-full py-3" onClick={teacherGateContinue} reducedMotion={reducedMotion}>Continue</Btn>
                  </div>
                )}

                {wizStep === 'creatorCheck' && (
                  <div className="space-y-4">
                    <Field type="email" placeholder="Gmail account (e.g. name@gmail.com)" value={wizData.email} onChange={e => setWizData({ ...wizData, email: e.target.value })} />
                    {wizData.email.trim().toLowerCase() === CREATOR_EMAIL && (
                      <Field type="password" placeholder="Creator account password" value={wizData.creatorPwd} onChange={e => setWizData({ ...wizData, creatorPwd: e.target.value })} />
                    )}
                    {wizData.email.trim().toLowerCase() === CREATOR_EMAIL && (
                      <p className="text-[10px]" style={{ color: C.accent }}>This is the sole Creator account for the site.</p>
                    )}
                    <Btn className="w-full py-3" onClick={creatorCheckContinue} disabled={!isGmailAddress(wizData.email)} reducedMotion={reducedMotion}>Continue</Btn>
                  </div>
                )}

                {wizStep === 'password' && (
                  <div className="space-y-4">
                    {(wizRole !== 'editor') && (
                      <Field type="email" placeholder="Gmail account (e.g. name@gmail.com)" value={wizData.email} onChange={e => setWizData({ ...wizData, email: e.target.value })} />
                    )}
                    <p className="text-xs font-bold" style={{ color: C.textDim }}>Create a password to save your account</p>
                    <Field type="password" placeholder="Create Password" value={wizData.pwd1} onChange={e => setWizData({ ...wizData, pwd1: e.target.value })} />
                    <Field type="password" placeholder="Confirm Password" value={wizData.pwd2} onChange={e => setWizData({ ...wizData, pwd2: e.target.value })} />
                    <Btn className="w-full py-3" onClick={finishSignup} disabled={(wizRole !== 'editor' && !isGmailAddress(wizData.email)) || wizData.pwd1.length < 4 || wizData.pwd1 !== wizData.pwd2} reducedMotion={reducedMotion}>Create Account &amp; Continue</Btn>
                  </div>
                )}

                {wizStep !== 'role' && (
                  <button onClick={resetWizard} className="text-[10px] flex items-center gap-1 mx-auto" style={{ color: C.textDim }}>
                    <ChevronLeft className="w-3 h-3" /> Start over
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ================================================================
  // MAIN APP
  // ================================================================
  const sectionOptions = sections.length > 0 ? sections : [];
  // Directory options a Default Directory dropdown can point at: core modules + custom folders.
  const directoryOptions = [...CORE_MODULES.map(m => ({ id: m.id, title: m.label })), ...folders.map(f => ({ id: f.id, title: f.title }))];
  const activeQuiz = quizzes.find(q => q.id === activeQuizId) || null;
  const activeQuizRecords = quizRecords.filter(r => r.quizId === activeQuizId);
  const recordSections = Array.from(new Set(activeQuizRecords.map(r => (r.section || '').trim()).filter(Boolean))).sort();
  const filteredQuizRecords = recordSectionFilter === 'all' ? activeQuizRecords : activeQuizRecords.filter(r => (r.section || '').trim() === recordSectionFilter);

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: C.bg, color: C.text }}>
      <PermissionModal open={permission.open} label={permission.label} onAllow={permission.onAllow} onDeny={closePermission} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilesSelected} />

      {/* GLOBAL TOAST — only ever set when settings.notifications is true (see triggerToast) */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[400] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold ${motionBounce}`} style={{ backgroundColor: C.accent, color: C.bg }}>
          <CheckCircle className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}
      {/* Upload-in-progress indicator — Storage uploads are real network
          requests, not instant, so this keeps the UI from looking frozen
          during a multi-second upload (unlike toast, this is always shown
          regardless of the notifications setting, since it reflects actual
          in-flight work rather than an informational message). */}
      {filesUploading && (
        <div className="fixed bottom-6 right-6 z-[400] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold" style={{ backgroundColor: C.panel, border: `1px solid ${C.accent}`, color: C.accent }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}
      {saveError && (
        <div className="fixed bottom-6 left-6 z-[400] px-4 py-2.5 rounded-xl text-[11px] font-semibold max-w-xs" style={{ backgroundColor: 'rgba(255,122,122,0.14)', border: `1px solid ${C.danger}`, color: C.danger }}>
          {saveError}
        </div>
      )}
      {/* Visible, hard-to-miss warning when Supabase isn't configured — the app
          silently falls back to per-device storage otherwise, which is exactly
          what caused online users and uploads to look "invisible" to other
          devices. Only shown to creator/editor since they're the ones who can
          fix it, and only once they're past the login screen. */}
      {!supabaseConfigured && canEditEverything && (
        <div className="fixed bottom-6 left-6 z-[400] px-4 py-2.5 rounded-xl text-[11px] font-semibold max-w-xs" style={{ backgroundColor: 'rgba(244,208,111,0.14)', border: `1px solid ${C.gold}`, color: C.gold }}>
          Supabase isn't configured — data and online users are only visible on this device. Add your project URL and anon key to go live for everyone.
        </div>
      )}
      {/* Storage-specific failure banner — separate from the general Supabase
          config warning above, because Supabase itself can be perfectly
          configured (data syncs fine) while the Storage bucket specifically
          is still missing, which is exactly what silently reintroduces the
          "uploads vanish" bug. Dismissible since it's a persistent state
          flag, not a one-off toast, and would otherwise block the view. */}
      {storageWarning && canEditEverything && (
        <div className="fixed bottom-6 left-6 z-[400] px-4 py-2.5 rounded-xl text-[11px] font-semibold max-w-sm flex items-start gap-2" style={{ backgroundColor: 'rgba(255,122,122,0.14)', border: `1px solid ${C.danger}`, color: C.danger }}>
          <span className="flex-1">{storageWarning}</span>
          <button onClick={() => setStorageWarning(null)} className="shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 flex flex-col z-40 p-5 ${reducedMotion ? '' : 'transition-transform'} ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${sidebarCollapsed ? 'md:hidden' : ''}`} style={{ backgroundColor: C.panel, borderRight: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: C.accentDim }}><ShieldCheck className="w-5 h-5" style={{ color: C.accent }} /></div>
            <h1 className="font-extrabold text-sm truncate">NESHS PORTAL</h1>
          </div>
          {/* Close button — collapses the sidebar on desktop; on mobile it hides the slide-in nav. */}
          <button
            onClick={() => { setSidebarCollapsed(true); setMobileNavOpen(false); }}
            className="p-1.5 rounded-lg shrink-0"
            style={{ backgroundColor: C.panelAlt, color: C.textDim }}
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {canEditEverything && (
          <button onClick={() => setAddFolderOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold mb-4" style={{ backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.border}` }}>
            <FolderPlus className="w-4 h-4" /> Add Folder
          </button>
        )}

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          <p className="text-[10px] font-bold uppercase mb-2 pl-1" style={{ color: C.textDim }}>Core Modules</p>
          {CORE_MODULES.map(m => {
            // Folders belonging to this module are nested directly beneath its
            // button — except Project History, whose groups are intentionally
            // NOT listed here. Those live only on the Project History page itself.
            const moduleFolders = m.id === 'projectHistory' ? [] : folders.filter(f => f.module === m.id);
            return (
              <div key={m.id}>
                <button onClick={() => { setActiveTab(m.id); setMobileNavOpen(false); setQuizMode('list'); setExpandedAchieverId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold" style={activeTab === m.id ? { backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.accent}` } : { color: C.textDim }}>
                  <m.icon className="w-4 h-4" /> {m.label}
                </button>
                {moduleFolders.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1 pl-2" style={{ borderLeft: `1px solid ${C.border}` }}>
                    {moduleFolders.map(f => (
                      <div key={f.id} className="flex items-center gap-1">
                        <button onClick={() => { setActiveTab(f.id); setMobileNavOpen(false); }} className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold" style={activeTab === f.id ? { backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.accent}` } : { color: C.textDim }}>
                          <Folder className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{f.title}</span>
                        </button>
                        {canEditEverything && (
                          <button onClick={() => deleteFolder(f.id)} className="p-1.5 rounded-lg shrink-0" style={{ color: C.danger }} title="Delete folder">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-[10px] font-bold uppercase mt-4 mb-2 pl-1" style={{ color: C.textDim }}>System</p>
          <button onClick={() => setActiveTab('author')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold" style={activeTab === 'author' ? { backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.accent}` } : { color: C.textDim }}>
            <User className="w-4 h-4" /> Author Profile
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.accent }} />
          <div>
            <p className="text-[10px] font-extrabold leading-tight">{SCHOOL_NAME}</p>
            <p className="text-[9px] leading-tight" style={{ color: C.textDim }}>{SCHOOL_ADDRESS}</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-6 py-4" style={{ backgroundColor: withAlpha(C.panel, 0.9), borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden" style={{ color: C.textDim }}><Menu className="w-5 h-5" /></button>
            {/* Reopen button — only shown once the sidebar has been closed on desktop. */}
            {sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(false)} className="hidden md:flex p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }} title="Open sidebar">
                <Menu className="w-4 h-4" />
              </button>
            )}
            {/* Online button — top-left, shows a live count and roster of everyone currently signed in. */}
            <div className="relative">
              <button onClick={() => setOnlinePanelOpen(true)} className="p-2 rounded-lg flex items-center gap-2 text-xs font-bold" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: C.accent }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: C.accent }} />
                </span>
                Online <span style={{ color: C.text }}>{visibleOnlineUsers.length}</span>
              </button>
            </div>
            {canEditEverything && (
              <button onClick={() => setSectionPanelOpen(true)} className="p-2 rounded-lg flex items-center gap-2 text-xs font-bold" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }}>
                <Folder className="w-4 h-4" /> Sections
              </button>
            )}
          </div>

          {/* Top-middle portal name — renamable by the Creator and Editors only. */}
          <div className="flex-1 min-w-0 flex items-center justify-center">
            {portalTitleEditing && canEditEverything ? (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <Field
                  autoFocus
                  value={portalTitleDraft}
                  onChange={e => setPortalTitleDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') savePortalTitle(); if (e.key === 'Escape') setPortalTitleEditing(false); }}
                  className="text-center text-xs font-bold py-2"
                />
                <button onClick={savePortalTitle} className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: C.accent, color: C.bg }} title="Save"><CheckCircle className="w-4 h-4" /></button>
                <button onClick={() => setPortalTitleEditing(false)} className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: C.panelAlt, color: C.textDim }} title="Cancel"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button
                onClick={() => canEditEverything && startEditPortalTitle()}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg truncate ${canEditEverything ? '' : 'cursor-default'}`}
                title={canEditEverything ? 'Tap to rename' : undefined}
              >
                <span className="text-sm font-extrabold tracking-tight truncate" style={{ color: C.text }}>{portalTitle}</span>
                {canEditEverything && <Edit className="w-3 h-3 shrink-0" style={{ color: C.textDim }} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setNotifUnread(0); }} className="p-2 rounded-lg relative" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.textDim }}>
                <Bell className="w-4 h-4" />
                {notifUnread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold" style={{ backgroundColor: C.accent, color: C.bg }}>{notifUnread > 9 ? '9+' : notifUnread}</span>}
              </button>
              {notifOpen && (
                <Card className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto p-3 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase" style={{ color: C.textDim }}>Recent Activity</p>
                    {notifications.length > 0 && <button onClick={() => setNotifications([])} className="text-[10px] font-bold" style={{ color: C.accent }}>Clear All</button>}
                  </div>
                  {notifications.length === 0 && <p className="text-xs" style={{ color: C.textDim }}>No activity yet.</p>}
                  {notifications.map(n => (
                    <div key={n.id} className="py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                      <p className="text-[11px]"><span className="font-bold">{n.actor}</span> {n.action} <span style={{ color: C.accent }}>{n.item}</span></p>
                      <p className="text-[9px]" style={{ color: C.textDim }}>{n.ts}</p>
                    </div>
                  ))}
                </Card>
              )}
            </div>

            {/* Top-right profile widget: name, section (students only), and role — hidden
                behind the Profile Visibility privacy toggle when the user opts out. */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold flex items-center justify-end gap-1.5">
                {currentUser.name}
                {!settings.profileVisibility && <EyeOff className="w-3 h-3" style={{ color: C.textDim }} title="Your active status is hidden from other students" />}
              </p>
              <p className="text-[10px] uppercase" style={{ color: C.accent }}>
                {currentUser.role}{currentUserSection ? ` \u00b7 ${currentUserSection.title}` : ''}
              </p>
            </div>

            <button onClick={toggleTheme} className={`p-2 rounded-lg ${motionTransition}`} style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }} title={isLightLikeTheme ? 'Switch to dark mode' : 'Switch to light mode'}>
              {isLightLikeTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.textDim }} title="Settings & Privacy">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,122,122,0.1)', border: '1px solid rgba(255,122,122,0.25)', color: C.danger }}><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        <main className="p-6 max-w-5xl w-full mx-auto pb-24">
          {/* AUTHOR PROFILE */}
          {activeTab === 'author' && (
            <div>
              <Card className="p-10 text-center">
                <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-5 cursor-pointer overflow-hidden" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.accent}` }} onClick={() => isCreator && uploadAuthorPhoto()}>
                  {authorPhotoUrl ? <img src={authorPhotoUrl} alt={authorName} className="w-full h-full object-cover" /> : <User className="w-10 h-10" style={{ color: C.accent }} />}
                </div>
                {isCreator && <p className="text-[9px] uppercase font-bold mb-4 -mt-2" style={{ color: C.textDim }}>Tap photo to change</p>}

                {authorEditing ? (
                  <div className="max-w-lg mx-auto space-y-3">
                    <Field placeholder="Full Name" value={authorName} onChange={e => setAuthorName(e.target.value)} className="text-center font-extrabold" />
                    <Field placeholder="Title (e.g. Creator & Architect)" value={authorTitle} onChange={e => setAuthorTitle(e.target.value)} className="text-center" />
                    <textarea placeholder="Bio" value={authorBio} onChange={e => setAuthorBio(e.target.value)} className="w-full h-28 p-3 rounded-xl text-sm outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
                    <Btn className="w-full" onClick={() => setAuthorEditing(false)} reducedMotion={reducedMotion}>Save Profile</Btn>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-extrabold mb-1">{authorName}</h1>
                    <Chip>{authorTitle}</Chip>
                    <p className="mt-6 max-w-lg mx-auto text-sm leading-relaxed" style={{ color: C.textDim }}>{authorBio}</p>
                  </>
                )}
                {isCreator && !authorEditing && <Btn variant="ghost" className="mt-4" onClick={() => setAuthorEditing(true)} reducedMotion={reducedMotion}><Edit className="w-3 h-3" /> Edit Profile</Btn>}
              </Card>

              {/* Additional authors/contributors — creator and editors can add more. */}
              <div className="flex items-center justify-between mt-6 mb-3">
                <p className="text-[10px] font-bold uppercase" style={{ color: C.textDim }}>Additional Authors</p>
                {canEditEverything && <Btn variant="ghost" onClick={() => openAuthorModal(null)} reducedMotion={reducedMotion}><Plus className="w-4 h-4" /> Add Author</Btn>}
              </div>
              {authors.length === 0 ? (
                <Card className="p-8 text-center">
                  <User className="w-8 h-8 mx-auto mb-2" style={{ color: C.textDim }} />
                  <p className="text-xs" style={{ color: C.textDim }}>No additional authors yet.</p>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {authors.map(a => (
                    <Card key={a.id} className="p-5 relative">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.accent}` }}>
                          {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : <User className="w-5 h-5" style={{ color: C.accent }} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold truncate">{a.name}</p>
                          {a.title && <p className="text-[10px] uppercase font-bold" style={{ color: C.accent }}>{a.title}</p>}
                        </div>
                      </div>
                      {a.bio && <p className="text-xs mt-3 leading-relaxed" style={{ color: C.textDim }}>{a.bio}</p>}
                      {canEditEverything && (
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <button onClick={() => openAuthorModal(a)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.textDim }}><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteAuthorEntry(a.id)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.danger }}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeModule === 'announcements' && activeTab !== 'author' && (
            <div>
              <div className="relative mb-6">
                <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: C.textDim }} />
                <Field placeholder="Search announcements by title..." value={annSearch} onChange={e => setAnnSearch(e.target.value)} className="pl-9" />
              </div>

              {canEditEverything && (
                <button onClick={startNewAnnouncement} className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl mb-6" style={{ backgroundColor: C.accentDim, border: `2px dashed ${C.accent}` }}>
                  <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                    <Plus className="w-6 h-6" style={{ color: C.bg }} />
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: C.accent }}>Create Article/News</span>
                </button>
              )}

              {visibleAnnouncements().length === 0 && (
                <Card className="p-12 text-center">
                  <Megaphone className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} />
                  <p className="text-sm" style={{ color: C.textDim }}>{announcements.filter(a => a.folderId === activeFolderId).length === 0 ? 'No announcements yet.' : 'No matching articles found.'}</p>
                </Card>
              )}

              <div className="grid gap-4">
                {visibleAnnouncements().map(a => (
                  <Card key={a.id} className="p-5 relative group">
                    {a.media.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {a.media.map(m => (
                          <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }} onClick={() => setLightbox(m)}>
                            {m.type === 'video' ? (
                              <>
                                <video controls playsInline preload="metadata" style={{ width: '100%' }} className="w-full h-full object-cover" muted>
                                  <source src={m.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,10,12,0.35)' }}>
                                  <Play className="w-6 h-6" style={{ color: C.accent }} />
                                </div>
                              </>
                            ) : (
                              <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <h3 className="text-base font-extrabold">{a.title}</h3>
                    <p className="text-sm leading-relaxed mt-2 mb-3" style={{ color: C.textDim }}>{a.details || 'No details provided.'}</p>
                    <p className="text-[10px] uppercase" style={{ color: C.accent }}>Posted by {a.author} &middot; {a.date}</p>
                    {canEditEverything && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => setAnnModal({ open: true, step: 1, data: a })} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.textDim }}><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.danger }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* PROJECT HISTORY */}
          {activeModule === 'projectHistory' && activeTab !== 'author' && (
            <div>
              <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <div className="min-w-0">
                  {activeFolder ? (
                    <button onClick={() => setActiveTab('projectHistory')} className="flex items-center gap-1.5 text-[10px] font-bold uppercase mb-1" style={{ color: C.accent }}>
                      <ChevronLeft className="w-3.5 h-3.5" /> All Groups
                    </button>
                  ) : (
                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.textDim }}>Project History</p>
                  )}
                  <h2 className="text-xl font-extrabold truncate">{activeFolder ? activeFolder.title : 'Upload Groups'}</h2>
                  {activeFolder?.uploadDate && (
                    <p className="text-[10px] font-semibold uppercase mt-0.5" style={{ color: C.textDim }}>Folder created {activeFolder.uploadDate}</p>
                  )}
                </div>
                {canEditEverything && (
                  <div className="flex gap-2 shrink-0">
                    <Btn variant="ghost" onClick={openProjectHistoryFolderCreate} reducedMotion={reducedMotion}><FolderPlus className="w-4 h-4" /> New Group</Btn>
                    {activeFolder && <Btn onClick={uploadProjectFile} reducedMotion={reducedMotion}><Upload className="w-4 h-4" /> Upload File</Btn>}
                  </div>
                )}
              </div>

              {!activeFolder ? (
                // The group list lives directly on the Project History page itself —
                // every group created here stays inside this page, it's never a
                // separate destination outside Project History.
                projectHistoryFolders.length === 0 ? (
                  <Card className="p-12 text-center mt-4">
                    <Folder className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} />
                    <p className="text-sm mb-1" style={{ color: C.textDim }}>No upload groups yet.</p>
                    <p className="text-[11px]" style={{ color: C.textDim }}>Create a group to start uploading files into Project History.</p>
                    {canEditEverything && (
                      <Btn className="mt-4" onClick={openProjectHistoryFolderCreate} reducedMotion={reducedMotion}>
                        <FolderPlus className="w-4 h-4" /> Create Folder
                      </Btn>
                    )}
                  </Card>
                ) : (
                  <div className="grid gap-2 mt-4">
                    {projectHistoryFolders.map(f => {
                      const fileCount = projectFiles.filter(pf => pf.folderId === f.id).length;
                      return (
                        <Card key={f.id} className="p-4 flex items-center justify-between gap-3">
                          <button onClick={() => setActiveTab(f.id)} className="flex items-center gap-3 min-w-0 text-left flex-1">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.accentDim }}>
                              <Folder className="w-5 h-5" style={{ color: C.accent }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{f.title}</p>
                              <p className="text-[10px]" style={{ color: C.textDim }}>{fileCount} file{fileCount === 1 ? '' : 's'}{f.uploadDate ? ` \u00b7 Created ${f.uploadDate}` : ''}</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setActiveTab(f.id)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.accent }} title="Open group">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            {canEditEverything && (
                              <button onClick={() => deleteFolder(f.id)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.danger }} title="Delete group">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="mt-4">
                  {projectFiles.filter(f => f.folderId === activeFolderId).length === 0 && (
                    <Card className="p-12 text-center"><FileText className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} /><p className="text-sm" style={{ color: C.textDim }}>No files uploaded yet.</p></Card>
                  )}
                  <div className="space-y-2">
                    {projectFiles.filter(f => f.folderId === activeFolderId).map(f => (
                      <Card key={f.id} className="p-4 flex items-center justify-between gap-3">
                        <button onClick={() => setViewerFile(f)} className="flex items-center gap-3 min-w-0 text-left flex-1">
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                            {f.kind === 'Image' ? <img src={f.url} alt={f.title || f.name} className="w-full h-full object-cover" /> : (f.kind === 'Video' || f.kind === 'Audio') ? <Play className="w-4 h-4" style={{ color: C.accent }} /> : <FileText className="w-4 h-4" style={{ color: C.accent }} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{f.title || f.name}</p>
                            <p className="text-[10px]" style={{ color: C.textDim }}>{f.kind} &middot; {f.authorized ? 'Authorized for download' : 'Download pending authorization'}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          {canEditEverything && (
                            <button onClick={() => openRenameModal(f)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.textDim }} title="Rename or replace file">
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canEditEverything && (
                            <button onClick={() => toggleFileAuthorization(f.id)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: f.authorized ? C.accent : C.textDim }} title={f.authorized ? 'Revoke download access' : 'Authorize download'}>
                              {f.authorized ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                          )}
                          <button onClick={() => downloadFile(f)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: canDownloadFile(f) ? C.accent : C.textDim }} title={canDownloadFile(f) ? 'Download' : 'Awaiting authorization'}>
                            <Download className="w-4 h-4" />
                          </button>
                          {canEditEverything && <button onClick={() => deleteProjectFile(f.id)} className="p-1.5 rounded" style={{ backgroundColor: C.panelAlt, color: C.danger }}><Trash2 className="w-4 h-4" /></button>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BEST STUDENTS */}
          {activeModule === 'showcase' && activeTab !== 'author' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold">Best Students</h2>
                {canEditEverything && <Btn onClick={() => openAchieverModal(null)} reducedMotion={reducedMotion}><Plus className="w-4 h-4" /> Add Achiever</Btn>}
              </div>
              {achievers.filter(a => a.folderId === activeFolderId).length === 0 && <Card className="p-12 text-center"><Award className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} /><p className="text-sm" style={{ color: C.textDim }}>No achievers added yet.</p></Card>}
              <div className="grid gap-4">
                {achievers.filter(a => a.folderId === activeFolderId).map(a => {
                  const expanded = expandedAchieverId === a.id;
                  const achievements = a.achievements || [];
                  return (
                    <Card key={a.id} className="overflow-hidden" style={{ borderColor: 'rgba(244,208,111,0.3)' }}>
                      {/* Header row toggles expand/collapse. Buttons inside stop propagation
                          explicitly so their own click handlers fire without also toggling
                          the card — this is the piece that was broken before. */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedAchieverId(expanded ? null : a.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedAchieverId(expanded ? null : a.id); } }}
                        className="p-5 relative cursor-pointer flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.gold}` }}>
                          {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5" style={{ color: C.textDim }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-extrabold truncate">{a.name}</h3>
                          <p className="text-[10px] font-bold uppercase" style={{ color: C.gold }}>{a.semester}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 shrink-0 ${reducedMotion ? '' : 'transition-transform duration-300'}`} style={{ color: C.gold, opacity: 0.7, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        {canEditEverything && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAchiever(a.id); }}
                            className="p-1.5 rounded shrink-0"
                            style={{ backgroundColor: C.panelAlt, color: C.danger }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {expanded && (
                        <div className="px-5 pb-5 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                          <div className="flex flex-col items-center text-center mt-4">
                            <div
                              className="w-24 h-24 rounded-full flex items-center justify-center mb-3 cursor-pointer overflow-hidden"
                              style={{ backgroundColor: C.accentDim, border: `2px solid ${C.gold}` }}
                              onClick={(e) => { e.stopPropagation(); if (canEditEverything) uploadAchieverPhoto(a.id); }}
                            >
                              {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8" style={{ color: C.textDim }} />}
                            </div>
                            {canEditEverything && <p className="text-[9px] uppercase font-bold mb-3" style={{ color: C.textDim }}>Tap photo to change</p>}
                            <h4 className="text-lg font-extrabold">{a.name}</h4>
                            {a.semester && <p className="text-[10px] font-bold uppercase mt-1" style={{ color: C.gold }}>{a.semester}</p>}
                            {a.quote && (
                              <div className="flex items-start gap-2 max-w-sm mt-4 mb-1">
                                <Quote className="w-4 h-4 shrink-0" style={{ color: C.accent }} />
                                <p className="text-sm italic" style={{ color: C.textDim }}>{a.quote}</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-5">
                            <p className="text-[10px] font-bold uppercase mb-2" style={{ color: C.textDim }}>Achievements</p>
                            <div className="space-y-1.5 mb-3">
                              {achievements.length === 0 && <p className="text-xs" style={{ color: C.textDim }}>No achievements listed yet.</p>}
                              {achievements.map(ach => (
                                <div key={ach.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                  <span className="text-xs flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: C.gold }} /> {ach.text}</span>
                                  {canEditEverything && (
                                    <button onClick={(e) => { e.stopPropagation(); removeAchievement(a.id, ach.id); }} style={{ color: C.danger }}>
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {/* Add-achievement control — the piece explicitly requested. */}
                            {canEditEverything && (
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <Field
                                  placeholder="Add an achievement..."
                                  value={achievementDraft[a.id] || ''}
                                  onChange={e => setAchievementDraft(prev => ({ ...prev, [a.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAchievement(a.id); } }}
                                />
                                <Btn onClick={() => addAchievement(a.id)} reducedMotion={reducedMotion}><Plus className="w-4 h-4" /> Add</Btn>
                              </div>
                            )}
                          </div>

                          {canEditEverything && (
                            <Btn variant="ghost" className="mt-4" onClick={(e) => { e.stopPropagation(); openAchieverModal(a); }} reducedMotion={reducedMotion}>
                              <Edit className="w-3 h-3" /> Edit Details
                            </Btn>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUIZZES */}
          {activeModule === 'quizzes' && activeTab !== 'author' && (
            <div>
              {quizMode === 'list' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold">Quizzes &amp; Grades</h2>
                    {canCreateQuizzes && <Btn onClick={startBuilder} reducedMotion={reducedMotion}><Plus className="w-4 h-4" /> Create Quiz</Btn>}
                  </div>
                  {quizzes.filter(q => q.folderId === activeFolderId).length === 0 && <Card className="p-12 text-center"><FileSpreadsheet className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} /><p className="text-sm" style={{ color: C.textDim }}>No quizzes yet.</p></Card>}
                  <div className="grid gap-3">
                    {quizzes.filter(q => q.folderId === activeFolderId).map(q => (
                      <Card key={q.id} className="p-5 flex justify-between items-center flex-wrap gap-2">
                        <div><h3 className="text-sm font-bold">{q.title}</h3><p className="text-[10px]" style={{ color: C.textDim }}>{q.items.length} Questions</p></div>
                        <div className="flex gap-2 flex-wrap">
                          {/* Take Quiz — routes into the gated quiz-taking flow. */}
                          <Btn onClick={() => { setActiveQuizId(q.id); setQuizMode('take'); setTakeError(''); setTakeState({ gate: '', started: false, answers: {} }); }} reducedMotion={reducedMotion}>
                            <Play className="w-3.5 h-3.5" /> Take Quiz
                          </Btn>
                          {!isStudent && (
                            <>
                              <Btn variant="ghost" onClick={() => { setActiveQuizId(q.id); setQuizMode('records'); setRecordSectionFilter('all'); }} reducedMotion={reducedMotion}>Records</Btn>
                              {canCreateQuizzes && <button onClick={() => { setBuilder({ step: 3, ...q }); setQuizMode('builder'); }} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.textDim }}><Edit className="w-4 h-4" /></button>}
                              {canCreateQuizzes && <button onClick={() => deleteQuiz(q.id)} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.danger }}><Trash2 className="w-4 h-4" /></button>}
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {quizMode === 'builder' && builder && (
                <Card className="p-6 max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-extrabold">Create Quiz</h3>
                    <button onClick={() => { setBuilder(null); setQuizMode('list'); }} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
                  </div>

                  {builder.step === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold" style={{ color: C.textDim }}>1. Quiz Title</p>
                      <Field placeholder="Quiz Title" value={builder.title} onChange={e => setBuilder({ ...builder, title: e.target.value })} />
                      <Btn className="w-full py-3" onClick={builderNext} reducedMotion={reducedMotion}>Next</Btn>
                    </div>
                  )}

                  {builder.step === 2 && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold" style={{ color: C.textDim }}>2. Access Password</p>
                      <Field placeholder="Password students will enter to take this quiz" value={builder.password} onChange={e => setBuilder({ ...builder, password: e.target.value })} />
                      <Btn className="w-full py-3" onClick={builderNext} reducedMotion={reducedMotion}>Next</Btn>
                    </div>
                  )}

                  {builder.step === 3 && (
                    <div className="space-y-5">
                      <p className="text-xs font-bold" style={{ color: C.textDim }}>3. Questions &amp; Answer Key</p>
                      <div className="flex flex-wrap gap-2">
                        {QUESTION_TYPES.map(t => <Btn key={t} variant="ghost" onClick={() => addQuestion(t)} reducedMotion={reducedMotion}>+ {t}</Btn>)}
                      </div>
                      <div className="space-y-3">
                        {builder.items.map((item, idx) => (
                          <Card key={idx} className="p-4 relative">
                            <Chip>{item.type}</Chip>
                            <input placeholder="Question text" value={item.qText} onChange={e => updateQuestion(idx, { qText: e.target.value })} className="w-full bg-transparent text-sm mt-3 mb-2 outline-none border-b pb-1" style={{ borderColor: C.border, color: C.text }} />
                            {item.type === 'Multiple Choice' && (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {item.options.map((opt, oi) => (
                                  <input key={oi} placeholder={`Option ${oi + 1}`} value={opt} onChange={e => { const opts = [...item.options]; opts[oi] = e.target.value; updateQuestion(idx, { options: opts }); }} className="text-xs px-2 py-1.5 rounded outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
                                ))}
                              </div>
                            )}
                            {item.type === 'True/False' ? (
                              <select value={item.answer} onChange={e => updateQuestion(idx, { answer: e.target.value })} className="text-xs px-2 py-1.5 rounded outline-none w-full" style={{ backgroundColor: C.bg, border: `1px solid ${C.accent}`, color: C.accent }}>
                                <option value="">Correct Answer...</option>
                                <option value="True">True</option>
                                <option value="False">False</option>
                              </select>
                            ) : item.type === 'Enumeration' ? (
                              <div className="space-y-2">
                                <input placeholder="Answer key, one item per comma (e.g. Solid, Liquid, Gas, Plasma)" value={item.answer} onChange={e => updateQuestion(idx, { answer: e.target.value })} className="w-full text-xs px-2 py-1.5 rounded outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.accent}`, color: C.accent }} />
                                <div className="flex items-center justify-between gap-3">
                                  <label className="flex items-center gap-2 text-[11px]" style={{ color: C.textDim }}>
                                    <input type="checkbox" checked={!!item.orderMatters} onChange={e => updateQuestion(idx, { orderMatters: e.target.checked })} />
                                    Order matters (e.g. chronological steps)
                                  </label>
                                  {parseEnumerationKey(item.answer).length > 0 && (
                                    <span className="text-[10px] font-bold" style={{ color: C.textDim }}>{parseEnumerationKey(item.answer).length} pt{parseEnumerationKey(item.answer).length === 1 ? '' : 's'}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <input placeholder="Answer key (exact text)" value={item.answer} onChange={e => updateQuestion(idx, { answer: e.target.value })} className="w-full text-xs px-2 py-1.5 rounded outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.accent}`, color: C.accent }} />
                            )}
                            <button onClick={() => removeQuestion(idx)} className="absolute top-3 right-3" style={{ color: C.textDim }}><Trash2 className="w-4 h-4" /></button>
                          </Card>
                        ))}
                      </div>
                      <Btn className="w-full py-3" onClick={saveQuiz} disabled={builder.items.length === 0} reducedMotion={reducedMotion}>Save Quiz</Btn>
                    </div>
                  )}
                </Card>
              )}

              {quizMode === 'take' && (
                activeQuiz ? (
                  <Card className="p-8 max-w-xl mx-auto">
                    {!takeState.started ? (
                      <div className="space-y-4 text-center">
                        <Lock className="w-10 h-10 mx-auto" style={{ color: C.textDim }} />
                        <h3 className="text-lg font-extrabold">{activeQuiz.title}</h3>
                        {/* Name, grade, and section come from the account chosen at
                            login — shown read-only for confirmation, never re-asked. */}
                        <div className="p-3 rounded-xl text-left" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                          <p className="text-sm font-bold">{currentUser.name}</p>
                          <p className="text-[10px] uppercase" style={{ color: C.accent }}>
                            {currentUserSection ? currentUserSection.title : currentUser.role}
                          </p>
                        </div>
                        {takeError && <p className="text-xs font-semibold" style={{ color: C.danger }}>{takeError}</p>}
                        <Field type="password" placeholder="Quiz Access Password" value={takeState.gate} onChange={e => setTakeState({ ...takeState, gate: e.target.value })} />
                        <div className="flex gap-3 pt-2">
                          <Btn variant="ghost" className="flex-1" onClick={() => setQuizMode('list')} reducedMotion={reducedMotion}>Cancel</Btn>
                          <Btn className="flex-1" onClick={() => {
                            if (takeState.gate !== activeQuiz.password) { setTakeError('Incorrect quiz access password.'); return; }
                            setTakeError('');
                            setTakeState(prev => ({ ...prev, started: true }));
                          }} reducedMotion={reducedMotion}>Start Quiz</Btn>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <h3 className="text-lg font-extrabold">{activeQuiz.title}</h3>
                        {activeQuiz.items.map((item, idx) => (
                          <Card key={idx} className="p-4">
                            <p className="text-sm font-semibold mb-3">{idx + 1}. {item.qText}</p>
                            {item.type === 'Multiple Choice' ? (
                              <div className="space-y-2">
                                {item.options.filter(Boolean).map((opt, oi) => (
                                  <label key={oi} className="flex items-center gap-2 text-xs">
                                    <input type="radio" name={`q${idx}`} checked={takeState.answers[idx] === opt} onChange={() => setTakeState({ ...takeState, answers: { ...takeState.answers, [idx]: opt } })} />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            ) : item.type === 'True/False' ? (
                              <div className="flex gap-3">
                                {['True', 'False'].map(v => (
                                  <button key={v} onClick={() => setTakeState({ ...takeState, answers: { ...takeState.answers, [idx]: v } })} className="px-4 py-1.5 rounded-lg text-xs font-bold" style={takeState.answers[idx] === v ? { backgroundColor: C.accent, color: C.bg } : { backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}>{v}</button>
                                ))}
                              </div>
                            ) : item.type === 'Enumeration' ? (
                              <div className="space-y-2">
                                {parseEnumerationKey(item.answer).map((_, itemIdx) => {
                                  const list = Array.isArray(takeState.answers[idx]) ? takeState.answers[idx] : [];
                                  return (
                                    <div key={itemIdx} className="flex items-center gap-2">
                                      <span className="text-xs font-bold w-5 shrink-0 text-right" style={{ color: C.textDim }}>{itemIdx + 1}.</span>
                                      <Field
                                        placeholder={`Item ${itemIdx + 1}`}
                                        value={list[itemIdx] || ''}
                                        onChange={e => {
                                          const next = [...list];
                                          next[itemIdx] = e.target.value;
                                          setTakeState({ ...takeState, answers: { ...takeState.answers, [idx]: next } });
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <Field placeholder="Your answer" value={takeState.answers[idx] || ''} onChange={e => setTakeState({ ...takeState, answers: { ...takeState.answers, [idx]: e.target.value } })} />
                            )}
                          </Card>
                        ))}
                        <Btn className="w-full py-3" onClick={submitQuiz} reducedMotion={reducedMotion}>Submit Answers</Btn>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} />
                    <p className="text-sm mb-4" style={{ color: C.textDim }}>This quiz is no longer available.</p>
                    <Btn onClick={() => setQuizMode('list')} reducedMotion={reducedMotion}>Back to Quizzes</Btn>
                  </Card>
                )
              )}

              {quizMode === 'records' && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                    <h3 className="text-lg font-extrabold">Record Sheet: {activeQuiz?.title || 'Quiz'}</h3>
                    <div className="flex items-center gap-2">
                      {recordSections.length > 0 && (
                        <Select value={recordSectionFilter} onChange={e => setRecordSectionFilter(e.target.value)} className="!w-auto !py-2 text-xs">
                          <option value="all">All Sections</option>
                          {recordSections.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      )}
                      {activeQuiz && filteredQuizRecords.length > 0 && (
                        <Btn variant="ghost" onClick={() => exportRecordsCsv(activeQuiz, filteredQuizRecords)} reducedMotion={reducedMotion}>
                          <Download className="w-3.5 h-3.5" /> Export CSV
                        </Btn>
                      )}
                      <button onClick={() => setQuizMode('list')} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead style={{ color: C.textDim }}><tr><th className="p-3">Student</th><th className="p-3">Grade</th><th className="p-3">Section</th><th className="p-3">Score</th><th className="p-3">Time</th></tr></thead>
                      <tbody>
                        {filteredQuizRecords.map(r => (
                          <tr key={r.id} style={{ borderTop: `1px solid ${C.border}` }}>
                            <td className="p-3 font-bold">{r.studentName}</td>
                            <td className="p-3">{r.grade}</td>
                            <td className="p-3">{r.section}</td>
                            <td className="p-3 font-bold" style={{ color: C.accent }}>{r.score}/{r.maxScore}</td>
                            <td className="p-3" style={{ color: C.textDim }}>{r.ts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredQuizRecords.length === 0 && <p className="text-center py-8 text-sm" style={{ color: C.textDim }}>No submissions yet{recordSectionFilter !== 'all' ? ` for ${recordSectionFilter}` : ''}.</p>}
                  </div>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      {annModal.open && annModal.data && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold">{annModal.data.id ? 'Edit Article' : 'Create Article/News'}</h3>
              <button onClick={closeAnnouncementModal} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>

            {annModal.step === 1 && (
              <div className="space-y-4">
                <Field placeholder="Article Title" value={annModal.data.title} onChange={e => setAnnModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))} />
                <Btn className="w-full py-3" onClick={submitAnnouncementTitle} disabled={!annModal.data.title.trim()} reducedMotion={reducedMotion}>Next</Btn>
              </div>
            )}

            {annModal.step === 2 && (
              <div className="space-y-4">
                <textarea placeholder="Article details..." value={annModal.data.details} onChange={e => setAnnModal(prev => ({ ...prev, data: { ...prev.data, details: e.target.value } }))} className="w-full h-32 p-3 rounded-xl text-sm outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }} />

                <div>
                  <button onClick={uploadAnnouncementMedia} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-bold" style={{ backgroundColor: C.accentDim, border: `1px dashed ${C.accent}`, color: C.accent }}>
                    <Upload className="w-4 h-4" /> Attach Photos / Videos
                  </button>
                  {annModal.data.media.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {annModal.data.media.map(m => (
                        <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                          {m.type === 'video' ? (
                            <video controls playsInline preload="metadata" style={{ width: '100%' }} className="w-full h-full object-cover" muted>
                              <source src={m.url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                          )}
                          <button onClick={() => removeAnnouncementMedia(m.id)} className="absolute top-1 right-1 p-0.5 rounded-full" style={{ backgroundColor: 'rgba(0,10,12,0.7)', color: C.danger }}><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Btn className="w-full py-3" onClick={saveAnnouncement} reducedMotion={reducedMotion}>{annModal.data.id ? 'Save Changes' : 'Publish Article'}</Btn>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ACHIEVER MODAL */}
      {achieverModal.open && achieverModal.data && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold">{achieverModal.data.id ? 'Edit Achiever' : 'Add Achiever'}</h3>
              <button onClick={() => setAchieverModal({ open: false, data: null })} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center cursor-pointer overflow-hidden" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.gold}` }} onClick={uploadAchieverPhotoInModal}>
                {achieverModal.data.photo ? <img src={achieverModal.data.photo} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6" style={{ color: C.textDim }} />}
              </div>
              <p className="text-[9px] uppercase font-bold text-center -mt-2" style={{ color: C.textDim }}>Tap to upload photo</p>
              <Field placeholder="Full Name" value={achieverModal.data.name} onChange={e => setAchieverModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} />
              <Field placeholder="Semester / Term (e.g. SY 2025-2026, 1st Semester)" value={achieverModal.data.semester} onChange={e => setAchieverModal(prev => ({ ...prev, data: { ...prev.data, semester: e.target.value } }))} />
              <textarea placeholder="Quote" value={achieverModal.data.quote} onChange={e => setAchieverModal(prev => ({ ...prev, data: { ...prev.data, quote: e.target.value } }))} className="w-full h-20 p-3 rounded-xl text-sm outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
              <Btn className="w-full py-3" onClick={saveAchiever} disabled={!achieverModal.data.name.trim()} reducedMotion={reducedMotion}>Save Achiever</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ADD/EDIT AUTHOR MODAL */}
      {authorModal.open && authorModal.data && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold">{authorModal.data.id ? 'Edit Author' : 'Add Author'}</h3>
              <button onClick={() => setAuthorModal({ open: false, data: null })} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center cursor-pointer overflow-hidden" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.accent}` }} onClick={uploadAuthorModalPhoto}>
                {authorModal.data.photo ? <img src={authorModal.data.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6" style={{ color: C.textDim }} />}
              </div>
              <p className="text-[9px] uppercase font-bold text-center -mt-2" style={{ color: C.textDim }}>Tap to upload photo</p>
              <Field placeholder="Full Name" value={authorModal.data.name} onChange={e => setAuthorModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} />
              <Field placeholder="Title (e.g. Co-Developer, Contributor)" value={authorModal.data.title} onChange={e => setAuthorModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))} />
              <textarea placeholder="Bio" value={authorModal.data.bio} onChange={e => setAuthorModal(prev => ({ ...prev, data: { ...prev.data, bio: e.target.value } }))} className="w-full h-20 p-3 rounded-xl text-sm outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
              <Btn className="w-full py-3" onClick={saveAuthorEntry} disabled={!authorModal.data.name.trim()} reducedMotion={reducedMotion}>Save Author</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ONLINE PANEL — who's currently signed in, with a live count and a close button. */}
      {onlinePanelOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: C.accent }} />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: C.accent }} />
                  </span>
                  Online Now
                </h3>
                <p className="text-[10px] mt-1" style={{ color: C.textDim }}>{visibleOnlineUsers.length} account{visibleOnlineUsers.length === 1 ? '' : 's'} currently online</p>
              </div>
              <button onClick={() => setOnlinePanelOpen(false)} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto px-4 py-3 flex-1">
              {visibleOnlineUsers.length === 0 && (
                <p className="text-xs text-center py-8" style={{ color: C.textDim }}>No one else is online right now.</p>
              )}
              <div className="space-y-1.5">
                {visibleOnlineUsers.map(u => {
                  const sec = u.sectionId ? sections.find(s => s.id === u.sectionId) : null;
                  return (
                    <div key={u.email} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: C.accent }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: C.accent }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{u.name}{u.email === currentUser.email ? ' (You)' : ''}</p>
                        <p className="text-[10px] uppercase" style={{ color: C.accent }}>{u.role}{sec ? ` \u00b7 ${sec.title}` : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <Btn className="w-full py-3" onClick={() => setOnlinePanelOpen(false)} reducedMotion={reducedMotion}>Close</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* SECTIONS PANEL */}
      {sectionPanelOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold">Manage Sections</h3>
              <button onClick={() => setSectionPanelOpen(false)} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>

            {!addSectionOpen ? (
              <button onClick={() => setAddSectionOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold mb-4" style={{ backgroundColor: C.accentDim, color: C.accent, border: `1px dashed ${C.accent}` }}>
                <Plus className="w-4 h-4" /> Add Section
              </button>
            ) : (
              <div className="space-y-3 mb-5 p-4 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                <Field placeholder="Strand (e.g. STEM, ABM, HUMSS)" value={newSection.strand} onChange={e => setNewSection({ ...newSection, strand: e.target.value })} />
                <Select value={newSection.grade} onChange={e => setNewSection({ ...newSection, grade: e.target.value })}>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </Select>
                <Field placeholder="Section Name (e.g. Newton)" value={newSection.name} onChange={e => setNewSection({ ...newSection, name: e.target.value })} />
                <div className="flex gap-2">
                  <Btn variant="ghost" className="flex-1" onClick={() => setAddSectionOpen(false)} reducedMotion={reducedMotion}>Cancel</Btn>
                  <Btn className="flex-1" onClick={() => { createSection(); setAddSectionOpen(false); }} disabled={!newSection.strand.trim() || !newSection.name.trim()} reducedMotion={reducedMotion}>Create</Btn>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {sections.length === 0 && <p className="text-xs text-center py-6" style={{ color: C.textDim }}>No sections created yet.</p>}
              {sections.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  <span className="text-xs font-semibold truncate">{s.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Toggle checked={s.active} onChange={() => toggleSectionActive(s.id)} reducedMotion={reducedMotion} />
                    <button onClick={() => deleteSection(s.id)} style={{ color: C.danger }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ADD FOLDER MODAL */}
      {addFolderOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold">{addFolderLockedModule ? 'New Upload Group' : 'Add Folder'}</h3>
              <button onClick={closeAddFolderModal} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>

            {folderError && (
              <div className="mb-4 p-3 rounded-xl text-xs font-medium" style={{ backgroundColor: 'rgba(255,122,122,0.1)', border: '1px solid rgba(255,122,122,0.3)', color: C.danger }}>{folderError}</div>
            )}

            {addFolderLockedModule ? (
              // Opened from inside Project History: a single-step prompt for the
              // group/upload name and date — no "which module" question at all,
              // since the module is already implied by where this was opened.
              // Wrapped in a real <form> so Enter submits through createFolder
              // (with its explicit validation) instead of doing nothing.
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); createFolder(); }}>
                <div>
                  <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: C.textDim }}>Group / Upload Name</p>
                  <Field placeholder="e.g. Foundation Day 2026" value={newFolder.title} onChange={e => setNewFolder({ ...newFolder, title: e.target.value })} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: C.textDim }}>Upload Date</p>
                  <Field type="date" value={newFolder.uploadDate} onChange={e => setNewFolder({ ...newFolder, uploadDate: e.target.value })} />
                </div>
                <Btn type="submit" className="w-full py-3" reducedMotion={reducedMotion}>Create &amp; Continue</Btn>
              </form>
            ) : (
              folderStep === 1 ? (
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (newFolder.title.trim()) setFolderStep(2); else setFolderError('Please enter a folder title.'); }}>
                  <Field placeholder="Folder Title" value={newFolder.title} onChange={e => setNewFolder({ ...newFolder, title: e.target.value })} />
                  <Btn type="submit" className="w-full py-3" reducedMotion={reducedMotion}>Next</Btn>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); createFolder(); }}>
                  <p className="text-xs font-bold" style={{ color: C.textDim }}>Which module does this folder belong to?</p>
                  <Select value={newFolder.module} onChange={e => setNewFolder({ ...newFolder, module: e.target.value })}>
                    {CORE_MODULES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </Select>
                  {/* Project History folders require an upload date — files are uploaded
                      inside the folder afterward, never directly at creation time. */}
                  {newFolder.module === 'projectHistory' && (
                    <div>
                      <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: C.textDim }}>Upload Date</p>
                      <Field type="date" value={newFolder.uploadDate} onChange={e => setNewFolder({ ...newFolder, uploadDate: e.target.value })} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Btn type="button" variant="ghost" className="flex-1" onClick={() => setFolderStep(1)} reducedMotion={reducedMotion}>Back</Btn>
                    <Btn type="submit" className="flex-1" reducedMotion={reducedMotion}>Create Folder</Btn>
                  </div>
                </form>
              )
            )}
          </Card>
        </div>
      )}

      {/* SETTINGS PANEL — fully wired, functional preferences (was previously a dead button) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5" style={{ color: C.accent }} />
                <h3 className="text-lg font-extrabold">Settings &amp; Privacy</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto px-6 py-2 flex-1">
              {/* Category 1: Privacy */}
              <p className="text-[10px] font-bold uppercase pt-4 pb-1" style={{ color: C.accent }}>Privacy Checkup</p>
              <SettingsRow
                icon={settings.profileVisibility ? Eye : EyeOff}
                label="Profile Visibility"
                desc="Show or hide your active status from other students."
                control={<Toggle checked={settings.profileVisibility} onChange={v => handleSettingChange('profileVisibility', v)} reducedMotion={reducedMotion} />}
              />
              <SettingsRow
                icon={FolderCog}
                label="Default Directory"
                desc="The section that loads automatically when you sign in."
                control={
                  <Select value={settings.defaultDirectory} onChange={e => handleSettingChange('defaultDirectory', e.target.value)} className="!w-40 !py-2 text-xs">
                    <option value="">Announcements</option>
                    {directoryOptions.filter(d => d.id !== 'announcements').map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </Select>
                }
              />

              {/* Category 2: Preferences */}
              <p className="text-[10px] font-bold uppercase pt-5 pb-1" style={{ color: C.accent }}>Preferences</p>
              <SettingsRow
                icon={Bell}
                label="Notifications"
                desc="Show global system toast notifications."
                control={<Toggle checked={settings.notifications} onChange={v => handleSettingChange('notifications', v)} reducedMotion={reducedMotion} />}
              />
              <SettingsRow
                icon={Zap}
                label="Reduced Motion"
                desc="Turn off animations, bounce effects, and hover transitions."
                control={<Toggle checked={settings.reducedMotion} onChange={v => handleSettingChange('reducedMotion', v)} reducedMotion={reducedMotion} />}
              />
              <SettingsRow
                icon={Globe}
                label="Language and Region"
                desc="Choose the portal's display language."
                control={
                  <Select value={settings.language} onChange={e => handleSettingChange('language', e.target.value)} className="!w-36 !py-2 text-xs">
                    {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>
                }
              />
              <SettingsRow
                icon={Download}
                label="Auto-download Attachments"
                desc="Automatically save files when viewed in Project History."
                control={<Toggle checked={settings.autoDownload} onChange={v => handleSettingChange('autoDownload', v)} reducedMotion={reducedMotion} />}
              />

              {/* Theme picker — full palette selection, not just a dark/light
                  toggle. Each swatch previews the theme's actual background,
                  panel, and accent colors so it's recognizable at a glance. */}
              <div className="py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.accentDim }}>
                    <Palette className="w-4 h-4" style={{ color: C.accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold">Theme</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>Choose the portal's color scheme.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-11">
                  {THEMES.map(t => {
                    const active = (settings.theme || 'dark') === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`text-left p-2.5 rounded-xl ${reducedMotion ? '' : 'transition-all'}`}
                        style={{ backgroundColor: t.palette.panel, border: active ? `2px solid ${t.palette.accent}` : `1px solid ${t.palette.border}` }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: t.palette.bg, border: `1px solid ${t.palette.border}` }} />
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: t.palette.accent }} />
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: t.palette.gold }} />
                          {active && <CheckCircle className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: t.palette.accent }} />}
                        </div>
                        <p className="text-[10px] font-bold" style={{ color: t.palette.text }}>{t.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2 mt-5 mb-4 p-3 rounded-xl" style={{ backgroundColor: C.accentDim }}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.accent }} />
                <p className="text-[10px]" style={{ color: C.textDim }}>Changes are saved automatically and apply immediately across the portal.</p>
              </div>
            </div>

            <div className="p-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <Btn className="w-full py-3" onClick={() => setIsSettingsOpen(false)} reducedMotion={reducedMotion}>Done</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* QUIZ RESULT CONFIRMATION */}
      {lastResult && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-sm p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: C.accent }} />
            <h3 className="text-base font-bold mb-1">Quiz Submitted</h3>
            <p className="text-xs mb-4" style={{ color: C.textDim }}>{lastResult.title}</p>
            <p className="text-3xl font-extrabold mb-6" style={{ color: C.accent }}>{lastResult.score}/{lastResult.maxScore}</p>
            <Btn className="w-full py-3" onClick={() => setLastResult(null)} reducedMotion={reducedMotion}>Done</Btn>
          </Card>
        </div>
      )}

      {/* MEDIA LIGHTBOX */}
      {lightbox && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.94)' }} onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.text }}><X className="w-5 h-5" /></button>
          <div className="max-w-3xl w-full max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {lightbox.type === 'video' ? (
              <video controls playsInline preload="metadata" style={{ width: '100%' }} className="max-w-full max-h-[85vh] rounded-xl">
                <source src={lightbox.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={lightbox.url} alt={lightbox.name} className="max-w-full max-h-[85vh] rounded-xl object-contain" />
            )}
          </div>
        </div>
      )}

      {/* PROJECT FILE VIEWER — opens/plays/views on-site, with an external-open option */}
      {viewerFile && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.94)' }} onClick={() => setViewerFile(null)}>
          <div className="w-full max-w-3xl max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold truncate pr-4" style={{ color: C.text }}>{viewerFile.title || viewerFile.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                {canEditEverything && (
                  <button onClick={() => openRenameModal(viewerFile)} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.accent }} title="Rename or replace file"><Edit className="w-4 h-4" /></button>
                )}
                <a href={viewerFile.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.accent }} title="Open in a new tab"><ExternalLink className="w-4 h-4" /></a>
                {canDownloadFile(viewerFile) && (
                  <button onClick={() => downloadFile(viewerFile)} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.accent }} title="Download"><Download className="w-4 h-4" /></button>
                )}
                <button onClick={() => setViewerFile(null)} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.text }}><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: C.panel, border: `1px solid ${C.border}` }}>
              {viewerFile.kind === 'Image' && <img src={viewerFile.url} alt={viewerFile.title || viewerFile.name} className="max-w-full max-h-[75vh] object-contain" />}
              {viewerFile.kind === 'Video' && (
                <video controls playsInline preload="metadata" style={{ width: '100%' }} className="max-w-full max-h-[75vh]">
                  <source src={viewerFile.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {viewerFile.kind === 'Audio' && <audio src={viewerFile.url} controls className="w-full px-8" />}
              {viewerFile.kind === 'PDF' && <embed src={viewerFile.url} type="application/pdf" className="w-full h-[75vh]" />}
              {!['Image', 'Video', 'Audio', 'PDF'].includes(viewerFile.kind) && (
                <div className="p-10 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} />
                  <p className="text-sm mb-4" style={{ color: C.textDim }}>{viewerFile.kind} files can't preview inline — open it externally instead.</p>
                  <a href={viewerFile.url} target="_blank" rel="noreferrer">
                    <Btn reducedMotion={reducedMotion}><ExternalLink className="w-4 h-4" /> Open Externally</Btn>
                  </a>
                </div>
              )}
            </div>
            {!canDownloadFile(viewerFile) && (
              <p className="text-[10px] text-center mt-2" style={{ color: C.danger }}>Download not yet authorized by the site editor.</p>
            )}
          </div>
        </div>
      )}

      {/* RENAME / REPLACE FILE MODAL */}
      {renameModal.open && (
        <div className="fixed inset-0 z-[290] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-extrabold">Rename File</h3>
              <button onClick={() => setRenameModal({ open: false, id: null, title: '' })} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: C.textDim }}>Title</p>
                <Field placeholder="File title" value={renameModal.title} onChange={e => setRenameModal(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <Btn className="w-full py-3" onClick={saveRename} disabled={!renameModal.title.trim()} reducedMotion={reducedMotion}>Save Title</Btn>

              <div className="pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-[10px] font-bold uppercase mb-2" style={{ color: C.textDim }}>Replace File Content</p>
                <p className="text-[11px] mb-3" style={{ color: C.textDim }}>Upload a new file to swap in for this entry — the title, folder, and download authorization stay the same.</p>
                <Btn variant="ghost" className="w-full py-3" onClick={() => replaceProjectFileContent(renameModal.id)} reducedMotion={reducedMotion}>
                  <Upload className="w-4 h-4" /> Replace File
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}