import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, User, LogOut, Search, BookOpen, Award, FileSpreadsheet,
  Megaphone, CheckCircle, Lock, Unlock, Menu, X, Clock,
  Download, Bell, FolderPlus, Folder, ArrowRight, MapPin,
  Plus, Edit, Trash2, Image as ImageIcon, FileText, Upload, ChevronLeft,
  Play, ScanLine, KeyRound, Quote, GraduationCap,
  Settings, Globe, Accessibility, HardDrive, ExternalLink, Loader2, Sun, Moon
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ============================================================
// PALETTES — Fluorescent Blue on Blue Charcoal (dark) / Fluorescent Blue on White (light)
// ============================================================
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

// Mutated in place (not reassigned) so every component that reads C.xxx during
// render — including the atoms defined below, outside the App component —
// picks up the active theme without needing prop-drilling.
const C = { ...DARK_PALETTE };

const SCHOOL_NAME = 'NASUGBU EAST SENIOR HIGH SCHOOL';
const SCHOOL_ADDRESS = 'BARANGAY LUMBANGAN, NASUGBU, BATANGAS';
const CREATOR_EMAIL = 'marknielpaiton@gmail.com';
const CREATOR_PASSWORD = 'Paiton16';
const EDITOR_GATE_PASSWORD = 'N35H@N45ugbuE45t!';
const STORAGE_KEY = 'neshs_portal_data_v1';
const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test((email || '').trim());

const CORE_MODULES = [
  { id: 'announcements', icon: Megaphone, label: 'Announcements' },
  { id: 'projectHistory', icon: BookOpen, label: 'Project History' },
  { id: 'showcase', icon: Award, label: 'Best Students' },
  { id: 'quizzes', icon: FileSpreadsheet, label: 'Quizzes & Grades' }
];

const QUESTION_TYPES = ['Identification', 'Multiple Choice', 'Enumeration', 'True/False'];

let idCounter = 1000;
const nextId = () => ++idCounter;

const fileToDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

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
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full p-1 ${reducedMotion ? '' : 'transition-all duration-300'}`}
    style={{ backgroundColor: checked ? C.accent : C.panelAlt, border: `1px solid ${C.border}` }}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-md ${reducedMotion ? '' : 'transition-all duration-300'} ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
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

// Activity history component (adapted from Downloads/11.js) -----------------
function ActivityHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputAction, setInputAction] = useState('');
  const [historyError, setHistoryError] = useState('');

  const usingSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setHistoryError('');
      try {
        if (usingSupabase && supabase) {
          // fetch remote
          const { data: remoteData, error: remoteError } = await supabase.from('user_history').select('*').order('created_at', { ascending: false });
          if (remoteError) throw new Error(remoteError.message || JSON.stringify(remoteError));

          // fetch local cache and migrate any missing entries
          const res = await window.storage.get(STORAGE_KEY + '_history', true).catch(() => null);
          const localData = res && res.value ? JSON.parse(res.value) : [];

          const toInsert = Array.isArray(localData) ? localData.filter(ld => !remoteData.some(rd => rd.created_at === ld.created_at && rd.action === ld.action)) : [];
          if (toInsert.length > 0) {
            const insertPayload = toInsert.map(i => ({ action: i.action, created_at: i.created_at }));
            const { data: inserted, error: insertErr } = await supabase.from('user_history').insert(insertPayload).select();
            if (insertErr) {
              console.error('Supabase insert error during migration:', insertErr);
              if (!cancelled) setHistory(remoteData || []);
            } else {
              // save a local backup and clear original local cache
              try {
                await window.storage.set(STORAGE_KEY + '_history_backup', JSON.stringify(localData || []), true);
                await window.storage.set(STORAGE_KEY + '_history', JSON.stringify([]), true);
              } catch (bkErr) {
                console.error('Failed to backup/clear local history:', bkErr);
              }
              const merged = [...(inserted || []), ...(remoteData || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              if (!cancelled) setHistory(merged);
            }
          } else {
            if (!cancelled) setHistory(remoteData || []);
          }
        } else {
          const res = await window.storage.get(STORAGE_KEY + '_history', true);
          if (res && res.value && !cancelled) {
            const data = JSON.parse(res.value);
            setHistory(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Error loading history:', err);
        if (!cancelled) setHistoryError('Could not load activity history.');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const saveHistoryToStorage = async (arr) => {
    try {
      await window.storage.set(STORAGE_KEY + '_history', JSON.stringify(arr), true);
    } catch (err) {
      console.error('Error saving history:', err);
    }
  };

  const addHistory = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputAction.trim()) return;
    setHistoryError('');
    const actionText = inputAction.trim();

    if (usingSupabase && supabase) {
      const { data, error } = await supabase.from('user_history').insert([{ action: actionText }]).select();
      if (error) {
        console.error('Error saving action to Supabase:', error.message || error);
        setHistoryError('Failed to save action to server.');
      } else if (data && data[0]) {
        setHistory(prev => [data[0], ...prev]);
        setInputAction('');
      }
      return;
    }

    try {
      const item = { id: nextId(), action: actionText, created_at: new Date().toISOString() };
      const newArr = [item, ...history];
      setHistory(newArr);
      setInputAction('');
      await saveHistoryToStorage(newArr);
    } catch (err) {
      console.error('Error saving history locally:', err);
      setHistoryError('Failed to save action locally.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-extrabold">Website Activity History</h2>
      </div>
      <form onSubmit={addHistory} className="mb-4 flex items-center gap-3">
        <Field placeholder="Enter an action or state change..." value={inputAction} onChange={e => setInputAction(e.target.value)} />
        <Btn type="submit">Save Action</Btn>
      </form>

      <div>
        {historyError && (
          <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,122,122,0.08)', color: C.danger, border: `1px solid rgba(255,122,122,0.2)` }}>
            {historyError}
          </div>
        )}
        {loading ? (
          <p style={{ color: C.textDim }}>Loading records...</p>
        ) : history.length === 0 ? (
          <p style={{ color: C.textDim }}>No history found. Try adding one above!</p>
        ) : (
          <ul>
            {history.map(item => (
              <li key={item.id} className="mb-2">
                <strong style={{ color: C.text }}>{item.action}</strong> — <small style={{ color: C.textDim }}>{new Date(item.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
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

  // Apply the active theme's colors in place, before anything renders this pass —
  // every atom below (Btn, Field, Card, Toggle, etc.) reads C.xxx live at render time.
  Object.assign(C, settings.theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE);
  const toggleTheme = () => handleSettingChange('theme', settings.theme === 'light' ? 'dark' : 'light');

  const [toast, setToast] = useState(null);
  const triggerToast = (message, type = 'info') => {
    if (!settings.notifications) return;
    setToast({ id: nextId(), message, type });
    setTimeout(() => setToast(t => (t && t.message === message ? null : t)), 3000);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    triggerToast(`Setting updated: ${key.replace(/([A-Z])/g, ' $1')}`);
  };

  // permission modal plumbing
  const [permission, setPermission] = useState({ open: false, label: '', onAllow: null });
  const askPermission = (label, onAllow) => setPermission({ open: true, label, onAllow });
  const closePermission = () => setPermission({ open: false, label: '', onAllow: null });

  // real device file picker (images / videos / documents) shared by every upload button
  const fileInputRef = useRef(null);
  const uploadContextRef = useRef(null);

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

    if (context.type === 'announcementMedia') {
      const media = await Promise.all(files.map(async f => ({ id: nextId(), type: f.type.startsWith('video/') ? 'video' : 'image', name: f.name, url: await fileToDataURL(f) })));
      setAnnModal(prev => ({ ...prev, data: { ...prev.data, media: [...prev.data.media, ...media] } }));
    } else if (context.type === 'achieverPhotoModal') {
      const url = await fileToDataURL(files[0]);
      setAchieverModal(prev => ({ ...prev, data: { ...prev.data, photo: url } }));
    } else if (context.type === 'achieverPhotoDirect') {
      const url = await fileToDataURL(files[0]);
      setAchievers(prev => prev.map(a => a.id === context.id ? { ...a, photo: url } : a));
    } else if (context.type === 'projectFile') {
      const items = await Promise.all(files.map(async f => ({
        id: nextId(), name: f.name, kind: guessKind(f), mime: f.type, folderId: activeFolderId,
        url: await fileToDataURL(f), authorized: false, uploadedBy: currentUser?.name || 'Unknown'
      })));
      setProjectFiles(prev => [...items, ...prev]);
      items.forEach(f => logAction('uploaded file', f.name));
      triggerToast('File uploaded successfully');
    } else if (context.type === 'authorPhoto') {
      const url = await fileToDataURL(files[0]);
      setAuthorPhotoUrl(url);
    } else if (context.type === 'idUpload') {
      const f = files[0];
      const url = await fileToDataURL(f);
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
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const logAction = (action, item) => {
    setNotifications(prev => [{ id: nextId(), actor: currentUser?.name || 'System', action, item, ts: new Date().toLocaleString() }, ...prev].slice(0, 60));
    setNotifUnread(n => n + 1);
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
  const [folders, setFolders] = useState([]); // {id, title, module}
  const [addFolderOpen, setAddFolderOpen] = useState(false);
  const [folderStep, setFolderStep] = useState(1);
  const [newFolder, setNewFolder] = useState({ title: '', module: 'announcements' });

  const createFolder = () => {
    if (!newFolder.title.trim()) return;
    const f = { id: `f-${nextId()}`, title: newFolder.title.trim(), module: newFolder.module };
    setFolders(prev => [f, ...prev]);
    setAddFolderOpen(false); setFolderStep(1); setNewFolder({ title: '', module: 'announcements' });
    logAction('created folder', f.title);
  };
  const deleteFolder = (id) => {
    const f = folders.find(x => x.id === id);
    if (!window.confirm(`Delete the folder "${f?.title}"? This cannot be undone.`)) return;
    setFolders(prev => prev.filter(x => x.id !== id));
    setActiveTab(prev => (prev === id ? 'announcements' : prev));
    if (f) logAction('deleted folder', f.title);
  };

  const [activeTab, setActiveTab] = useState('announcements');
  const activeFolder = folders.find(f => f.id === activeTab);
  const activeModule = activeFolder ? activeFolder.module : activeTab;
  const activeFolderId = activeFolder ? activeFolder.id : null;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ------------------------------------------------------------
  // announcements
  // ------------------------------------------------------------
  const [announcements, setAnnouncements] = useState([]);
  const [annSearch, setAnnSearch] = useState('');
  const [annModal, setAnnModal] = useState({ open: false, step: 1, data: null });
  const [lightbox, setLightbox] = useState(null); // {type,url,name}

  const startNewAnnouncement = () => setAnnModal({ open: true, step: 1, data: { id: null, title: '', details: '', media: [], folderId: activeFolderId } });
  const submitAnnouncementTitle = () => {
    if (!annModal.data.title.trim()) return;
    setAnnModal(prev => ({ ...prev, step: 2 }));
  };
  const uploadAnnouncementMedia = () => {
    triggerRealUpload({ type: 'announcementMedia' }, { accept: 'image/*,video/*', multiple: true, label: 'Allow access to your photos & videos to attach to this article.' });
  };
  const removeAnnouncementMedia = (mediaId) => {
    setAnnModal(prev => ({ ...prev, data: { ...prev.data, media: prev.data.media.filter(m => m.id !== mediaId) } }));
  };
  const saveAnnouncement = () => {
    const payload = { ...annModal.data, id: annModal.data.id || nextId(), author: currentUser.name, date: new Date().toLocaleDateString() };
    setAnnouncements(prev => {
      const exists = prev.some(a => a.id === payload.id);
      return exists ? prev.map(a => a.id === payload.id ? payload : a) : [payload, ...prev];
    });
    logAction(annModal.data.id ? 'edited article' : 'created article', payload.title);
    triggerToast(annModal.data.id ? 'Article updated' : 'Article published');
    setAnnModal({ open: false, step: 1, data: null });
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
  const [projectFiles, setProjectFiles] = useState([]); // {id,name,kind,mime,folderId,url,authorized,uploadedBy}
  const [viewerFile, setViewerFile] = useState(null);
  const uploadProjectFile = () => {
    triggerRealUpload({ type: 'projectFile' }, { accept: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx', multiple: true, label: 'Allow access to your files to upload images, videos, Word or PowerPoint documents.' });
  };
  const deleteProjectFile = (id) => {
    const f = projectFiles.find(x => x.id === id);
    setProjectFiles(prev => prev.filter(x => x.id !== id));
    if (f) logAction('deleted file', f.name);
  };
  const toggleFileAuthorization = (id) => {
    setProjectFiles(prev => prev.map(f => f.id === id ? { ...f, authorized: !f.authorized } : f));
    const f = projectFiles.find(x => x.id === id);
    if (f) logAction(f.authorized ? 'revoked download access for' : 'authorized download for', f.name);
    triggerToast('Download authorization updated');
  };
  const canDownloadFile = (f) => canEditEverything || f.authorized;
  const downloadFile = (f) => {
    if (!canDownloadFile(f)) { triggerToast('This file has not been authorized for download yet.'); return; }
    const a = document.createElement('a');
    a.href = f.url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (settings.autoDownload) triggerToast(`Downloaded ${f.name}`);
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
    setAchieverModal({ open: false, data: null });
  };
  const deleteAchiever = (id) => {
    const a = achievers.find(x => x.id === id);
    setAchievers(prev => prev.filter(x => x.id !== id));
    if (a) logAction('deleted achiever', a.name);
  };
  const uploadAchieverPhoto = (id) => {
    triggerRealUpload({ type: 'achieverPhotoDirect', id }, { accept: 'image/*', label: 'Allow access to your photos to set this achiever\u2019s picture.' });
  };
  const uploadAchieverPhotoInModal = () => {
    triggerRealUpload({ type: 'achieverPhotoModal' }, { accept: 'image/*', label: 'Allow access to your photos to set this achiever\u2019s picture.' });
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
  const [takeState, setTakeState] = useState({ name: '', grade: '', section: '', gate: '', started: false, answers: {} });
  const [takeError, setTakeError] = useState('');

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
    if (q) logAction('deleted quiz', q.title);
  };
  const [lastResult, setLastResult] = useState(null);
  const submitQuiz = () => {
    const quiz = quizzes.find(q => q.id === activeQuizId);
    let score = 0;
    quiz.items.forEach((item, idx) => {
      const given = (takeState.answers[idx] || '').toString().toLowerCase().trim();
      const correct = (item.answer || '').toString().toLowerCase().trim();
      if (given && given === correct) score++;
    });
    setQuizRecords(prev => [...prev, {
      id: nextId(), quizId: quiz.id, studentName: takeState.name, grade: takeState.grade,
      section: takeState.section, score, maxScore: quiz.items.length, ts: new Date().toLocaleString()
    }]);
    setLastResult({ title: quiz.title, score, maxScore: quiz.items.length });
    setTakeState({ name: '', grade: '', section: '', gate: '', started: false, answers: {} });
    setQuizMode('list');
  };

  // ------------------------------------------------------------
  // author profile
  // ------------------------------------------------------------
  const [authorName, setAuthorName] = useState('MARK NIEL PAITON');
  const [authorTitle, setAuthorTitle] = useState('Creator & Architect');
  const [authorBio, setAuthorBio] = useState('Visionary developer behind the NESHS Portal, built to bridge academic administration and a clear digital experience for the whole school.');
  const [authorEditing, setAuthorEditing] = useState(false);
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState(null);
  const uploadAuthorPhoto = () => triggerRealUpload({ type: 'authorPhoto' }, { accept: 'image/*', label: 'Allow access to your photos to update the author picture.' });

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
  // PERSISTENCE — load once on mount, save (debounced) on change
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        if (res && res.value && !cancelled) {
          const data = JSON.parse(res.value);
          if (Array.isArray(data.accounts)) setAccounts(data.accounts);
          if (Array.isArray(data.sections)) setSections(data.sections);
          if (Array.isArray(data.folders)) setFolders(data.folders);
          if (Array.isArray(data.announcements)) setAnnouncements(data.announcements);
          if (Array.isArray(data.projectFiles)) setProjectFiles(data.projectFiles);
          if (Array.isArray(data.achievers)) setAchievers(data.achievers);
          if (Array.isArray(data.quizzes)) setQuizzes(data.quizzes);
          if (Array.isArray(data.quizRecords)) setQuizRecords(data.quizRecords);
          if (Array.isArray(data.notifications)) setNotifications(data.notifications);
          if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
          if (data.author) {
            setAuthorName(data.author.name || 'MARK NIEL PAITON');
            setAuthorTitle(data.author.title || 'Creator & Architect');
            setAuthorBio(data.author.bio || '');
            setAuthorPhotoUrl(data.author.photo || null);
          }
          if (typeof data.idCounter === 'number') idCounter = Math.max(idCounter, data.idCounter);
          if (data.settings && data.settings.defaultDirectory) setActiveSectionView(data.settings.defaultDirectory);
        }
      } catch (err) {
        // nothing saved yet on this artifact — that's fine, we start fresh
      }
      if (!cancelled) setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    const handle = setTimeout(() => {
      const payload = {
        accounts, sections, folders, announcements, projectFiles, achievers,
        quizzes, quizRecords, notifications, settings,
        author: { name: authorName, title: authorTitle, bio: authorBio, photo: authorPhotoUrl },
        idCounter
      };
      let json;
      try {
        json = JSON.stringify(payload);
      } catch (err) {
        setSaveError('Could not prepare data for saving.');
        return;
      }
      window.storage.set(STORAGE_KEY, json, true)
        .then(() => setSaveError(''))
        .catch(() => setSaveError('Changes could not be saved — storage may be full. Try removing large files or images.'));
    }, 500);
    return () => clearTimeout(handle);
  }, [accounts, sections, folders, announcements, projectFiles, achievers, quizzes, quizRecords, notifications, settings, authorName, authorTitle, authorBio, authorPhotoUrl, dataLoaded]);

  // ------------------------------------------------------------
  // AUTH: sign in
  // ------------------------------------------------------------
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
      return;
    }

    const acc = accounts.find(a => a.email === email);
    if (!acc) return setAuthError('No account found for that email. Please sign up.');
    if (acc.password !== signinPassword) return setAuthError('Incorrect password.');
    setCurrentUser(acc);
  };

  // ------------------------------------------------------------
  // AUTH: sign up wizard steps
  // ------------------------------------------------------------
  const chooseRole = (role) => { setWizRole(role); setWizStep(role === 'student' ? 'section' : role === 'teacher' ? 'id' : 'gate'); };

  const runScan = (onDone) => {
    setScanning(true);
    setTimeout(() => { setScanning(false); onDone(); }, 1400);
  };

  const studentPickSection = () => {
    if (!wizData.sectionId) return;
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
    logAction('account created', account.email);
    resetWizard();
  };

  const handleLogout = () => { setCurrentUser(null); setActiveTab('announcements'); resetWizard(); };

  // ================================================================
  // INITIAL LOAD SCREEN
  // ================================================================
  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 font-sans" style={{ backgroundColor: C.bg, color: C.text }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.accent }} />
        <p className="text-xs" style={{ color: C.textDim }}>Loading NESHS Portal…</p>
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
        <button onClick={toggleTheme} className={`absolute top-5 right-5 p-2 rounded-lg ${motionTransition}`} style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }} title={settings.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
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

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: C.bg, color: C.text }}>
      <PermissionModal open={permission.open} label={permission.label} onAllow={permission.onAllow} onDeny={closePermission} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilesSelected} />

      {/* GLOBAL TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[400] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold ${motionBounce}`} style={{ backgroundColor: C.accent, color: C.bg }}>
          <CheckCircle className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}
      {saveError && (
        <div className="fixed bottom-6 left-6 z-[400] px-4 py-2.5 rounded-xl text-[11px] font-semibold max-w-xs" style={{ backgroundColor: 'rgba(255,122,122,0.14)', border: `1px solid ${C.danger}`, color: C.danger }}>
          {saveError}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 flex flex-col z-40 p-5 ${reducedMotion ? '' : 'transition-transform'} ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} style={{ backgroundColor: C.panel, borderRight: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl" style={{ backgroundColor: C.accentDim }}><ShieldCheck className="w-5 h-5" style={{ color: C.accent }} /></div>
          <h1 className="font-extrabold text-sm">NESHS PORTAL</h1>
        </div>

        {canEditEverything && (
          <button onClick={() => setAddFolderOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold mb-4" style={{ backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.border}` }}>
            <FolderPlus className="w-4 h-4" /> Add Folder
          </button>
        )}

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          <p className="text-[10px] font-bold uppercase mb-2 pl-1" style={{ color: C.textDim }}>Core Modules</p>
          {CORE_MODULES.map(m => (
            <button key={m.id} onClick={() => { setActiveTab(m.id); setMobileNavOpen(false); setQuizMode('list'); setExpandedAchieverId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold" style={activeTab === m.id ? { backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.accent}` } : { color: C.textDim }}>
              <m.icon className="w-4 h-4" /> {m.label}
            </button>
          ))}

          {folders.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase mt-4 mb-2 pl-1" style={{ color: C.textDim }}>Folders</p>
              {folders.map(f => (
                <div key={f.id} className="flex items-center gap-1">
                  <button onClick={() => { setActiveTab(f.id); setMobileNavOpen(false); }} className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold" style={activeTab === f.id ? { backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.accent}` } : { color: C.textDim }}>
                    <Folder className="w-4 h-4 shrink-0" /> <span className="truncate">{f.title}</span>
                  </button>
                  {canEditEverything && (
                    <button onClick={() => deleteFolder(f.id)} className="p-2 rounded-lg shrink-0" style={{ color: C.danger }} title="Delete folder">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </>
          )}

          <p className="text-[10px] font-bold uppercase mt-4 mb-2 pl-1" style={{ color: C.textDim }}>System</p>
          <button onClick={() => setActiveTab('history')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold" style={activeTab === 'history' ? { backgroundColor: C.accentDim, color: C.accent, border: `1px solid ${C.accent}` } : { color: C.textDim }}>
            <Clock className="w-4 h-4" /> Activity History
          </button>
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
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4" style={{ backgroundColor: 'rgba(3,31,35,0.9)', borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden" style={{ color: C.textDim }}><Menu className="w-5 h-5" /></button>
            {canEditEverything && (
              <button onClick={() => setSectionPanelOpen(true)} className="p-2 rounded-lg flex items-center gap-2 text-xs font-bold" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }}>
                <Folder className="w-4 h-4" /> Sections
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
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

            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{currentUser.name}</p>
              <p className="text-[10px] uppercase" style={{ color: C.accent }}>
                {currentUser.role}{currentUserSection ? ` \u00b7 ${currentUserSection.title}` : ''}
              </p>
            </div>

            <button onClick={toggleTheme} className={`p-2 rounded-lg ${motionTransition}`} style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }} title={settings.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
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
          )}

          {activeTab === 'history' && (
            <Card className="p-6">
              <ActivityHistory />
            </Card>
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
                                <video src={m.url} className="w-full h-full object-cover" muted />
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold">Project History</h2>
                {canEditEverything && <Btn onClick={uploadProjectFile} reducedMotion={reducedMotion}><Upload className="w-4 h-4" /> Upload File</Btn>}
              </div>
              {projectFiles.filter(f => f.folderId === activeFolderId).length === 0 && (
                <Card className="p-12 text-center"><FileText className="w-10 h-10 mx-auto mb-3" style={{ color: C.textDim }} /><p className="text-sm" style={{ color: C.textDim }}>No files uploaded yet.</p></Card>
              )}
              <div className="space-y-2">
                {projectFiles.filter(f => f.folderId === activeFolderId).map(f => (
                  <Card key={f.id} className="p-4 flex items-center justify-between gap-3">
                    <button onClick={() => setViewerFile(f)} className="flex items-center gap-3 min-w-0 text-left flex-1">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                        {f.kind === 'Image' ? <img src={f.url} alt={f.name} className="w-full h-full object-cover" /> : (f.kind === 'Video' || f.kind === 'Audio') ? <Play className="w-4 h-4" style={{ color: C.accent }} /> : <FileText className="w-4 h-4" style={{ color: C.accent }} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{f.name}</p>
                        <p className="text-[10px]" style={{ color: C.textDim }}>{f.kind} &middot; {f.authorized ? 'Authorized for download' : 'Download pending authorization'}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
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
                  return (
                    <Card key={a.id} className="overflow-hidden" style={{ borderColor: 'rgba(244,208,111,0.3)' }}>
                      <div className="p-5 relative cursor-pointer flex items-center gap-4" onClick={(e) => { if (!e.target.closest('button')) setExpandedAchieverId(expanded ? null : a.id); }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.gold}` }}>
                          {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5" style={{ color: C.textDim }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-extrabold truncate">{a.name}</h3>
                          <p className="text-[10px] font-bold uppercase" style={{ color: C.gold }}>{a.semester}</p>
                        </div>
                        <Award className="w-5 h-5 shrink-0" style={{ color: C.gold, opacity: 0.6 }} />
                        {canEditEverything && (
                          <button onClick={() => deleteAchiever(a.id)} className="p-1.5 rounded shrink-0" style={{ backgroundColor: C.panelAlt, color: C.danger }}><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>

                      {expanded && (
                        <div className="px-5 pb-5 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                          <div className="flex flex-col items-center text-center mt-4">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 cursor-pointer overflow-hidden" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.gold}` }} onClick={() => canEditEverything && uploadAchieverPhoto(a.id)}>
                              {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8" style={{ color: C.textDim }} />}
                            </div>
                            {canEditEverything && <p className="text-[9px] uppercase font-bold mb-3" style={{ color: C.textDim }}>Tap photo to change</p>}
                            {a.quote && (
                              <div className="flex items-start gap-2 max-w-sm mb-4">
                                <Quote className="w-4 h-4 shrink-0" style={{ color: C.accent }} />
                                <p className="text-sm italic" style={{ color: C.textDim }}>{a.quote}</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="text-[10px] font-bold uppercase mb-2" style={{ color: C.textDim }}>Achievements</p>
                            <div className="space-y-1.5 mb-3">
                              {(a.achievements || []).length === 0 && <p className="text-xs" style={{ color: C.textDim }}>No achievements listed yet.</p>}
                              {(a.achievements || []).map(ach => (
                                <div key={ach.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                  <span className="text-xs flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: C.gold }} /> {ach.text}</span>
                                  {canEditEverything && <button onClick={() => removeAchievement(a.id, ach.id)} style={{ color: C.danger }}><X className="w-3.5 h-3.5" /></button>}
                                </div>
                              ))}
                            </div>
                            {canEditEverything && (
                              <div className="flex gap-2">
                                <Field placeholder="Add an achievement..." value={achievementDraft[a.id] || ''} onChange={e => setAchievementDraft(prev => ({ ...prev, [a.id]: e.target.value }))} />
                                <Btn onClick={() => addAchievement(a.id)} reducedMotion={reducedMotion}><Plus className="w-4 h-4" /> Add</Btn>
                              </div>
                            )}
                          </div>

                          {canEditEverything && <Btn variant="ghost" className="mt-4" onClick={() => openAchieverModal(a)} reducedMotion={reducedMotion}><Edit className="w-3 h-3" /> Edit Details</Btn>}
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
                          <Btn onClick={() => { setActiveQuizId(q.id); setQuizMode('take'); setTakeError(''); }} reducedMotion={reducedMotion}>Take Quiz</Btn>
                          {!isStudent && (
                            <>
                              <Btn variant="ghost" onClick={() => { setActiveQuizId(q.id); setQuizMode('records'); }} reducedMotion={reducedMotion}>Records</Btn>
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
                            ) : (
                              <input placeholder={item.type === 'Enumeration' ? 'Answer key (comma-separated)' : 'Answer key (exact text)'} value={item.answer} onChange={e => updateQuestion(idx, { answer: e.target.value })} className="w-full text-xs px-2 py-1.5 rounded outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.accent}`, color: C.accent }} />
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

              {quizMode === 'take' && (() => {
                const quiz = quizzes.find(q => q.id === activeQuizId);
                return (
                  <Card className="p-8 max-w-xl mx-auto">
                    {!takeState.started ? (
                      <div className="space-y-4 text-center">
                        <Lock className="w-10 h-10 mx-auto" style={{ color: C.textDim }} />
                        <h3 className="text-lg font-extrabold">{quiz.title}</h3>
                        {takeError && <p className="text-xs font-semibold" style={{ color: C.danger }}>{takeError}</p>}
                        <Field placeholder="Full Name" value={takeState.name} onChange={e => setTakeState({ ...takeState, name: e.target.value })} />
                        <Field placeholder="Grade Level" value={takeState.grade} onChange={e => setTakeState({ ...takeState, grade: e.target.value })} />
                        <Field placeholder="Section" value={takeState.section} onChange={e => setTakeState({ ...takeState, section: e.target.value })} />
                        <Field type="password" placeholder="Quiz Access Password" value={takeState.gate} onChange={e => setTakeState({ ...takeState, gate: e.target.value })} />
                        <div className="flex gap-3 pt-2">
                          <Btn variant="ghost" className="flex-1" onClick={() => setQuizMode('list')} reducedMotion={reducedMotion}>Cancel</Btn>
                          <Btn className="flex-1" onClick={() => {
                            if (!takeState.name.trim() || !takeState.grade.trim() || !takeState.section.trim()) { setTakeError('Please fill in your name, grade level, and section.'); return; }
                            if (takeState.gate !== quiz.password) { setTakeError('Incorrect quiz access password.'); return; }
                            setTakeError('');
                            setTakeState({ ...takeState, started: true });
                          }} reducedMotion={reducedMotion}>Start Quiz</Btn>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <h3 className="text-lg font-extrabold">{quiz.title}</h3>
                        {quiz.items.map((item, idx) => (
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
                            ) : (
                              <Field placeholder="Your answer" value={takeState.answers[idx] || ''} onChange={e => setTakeState({ ...takeState, answers: { ...takeState.answers, [idx]: e.target.value } })} />
                            )}
                          </Card>
                        ))}
                        <Btn className="w-full py-3" onClick={submitQuiz} reducedMotion={reducedMotion}>Submit Answers</Btn>
                      </div>
                    )}
                  </Card>
                );
              })()}

              {quizMode === 'records' && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-extrabold">Record Sheet: {quizzes.find(q => q.id === activeQuizId)?.title}</h3>
                    <button onClick={() => setQuizMode('list')} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead style={{ color: C.textDim }}><tr><th className="p-3">Student</th><th className="p-3">Grade</th><th className="p-3">Section</th><th className="p-3">Score</th><th className="p-3">Time</th></tr></thead>
                      <tbody>
                        {quizRecords.filter(r => r.quizId === activeQuizId).map(r => (
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
                    {quizRecords.filter(r => r.quizId === activeQuizId).length === 0 && <p className="text-center py-8 text-sm" style={{ color: C.textDim }}>No submissions yet.</p>}
                  </div>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

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
              <video src={lightbox.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl" />
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
              <p className="text-sm font-bold truncate pr-4" style={{ color: C.text }}>{viewerFile.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <a href={viewerFile.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.accent }} title="Open in a new tab"><ExternalLink className="w-4 h-4" /></a>
                {canDownloadFile(viewerFile) && (
                  <button onClick={() => downloadFile(viewerFile)} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.accent }} title="Download"><Download className="w-4 h-4" /></button>
                )}
                <button onClick={() => setViewerFile(null)} className="p-2 rounded-lg" style={{ backgroundColor: C.panelAlt, color: C.text }}><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: C.panel, border: `1px solid ${C.border}` }}>
              {viewerFile.kind === 'Image' && <img src={viewerFile.url} alt={viewerFile.name} className="max-w-full max-h-[75vh] object-contain" />}
              {viewerFile.kind === 'Video' && <video src={viewerFile.url} controls autoPlay className="max-w-full max-h-[75vh]" />}
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

      {/* ANNOUNCEMENT MODAL */}
      {annModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-lg">
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-bold">{annModal.data.id ? 'Edit Article' : 'Create Article/News'}</h2>
              <button onClick={() => setAnnModal({ open: false, step: 1, data: null })} style={{ color: C.textDim }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {annModal.step === 1 ? (
                <>
                  <Field placeholder="Article Title *" value={annModal.data.title} onChange={e => setAnnModal({ ...annModal, data: { ...annModal.data, title: e.target.value } })} />
                  <Btn className="w-full py-3" onClick={submitAnnouncementTitle} reducedMotion={reducedMotion}>Next: Add Media</Btn>
                </>
              ) : (
                <>
                  <textarea placeholder="Article details / release information" value={annModal.data.details} onChange={e => setAnnModal({ ...annModal, data: { ...annModal.data, details: e.target.value } })} className="w-full h-24 p-3 rounded-xl text-sm outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
                  <Btn variant="ghost" className="w-full" onClick={uploadAnnouncementMedia} reducedMotion={reducedMotion}><Upload className="w-4 h-4" /> Upload Photos &amp; Videos</Btn>
                  {annModal.data.media.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {annModal.data.media.map(m => (
                        <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                          {m.type === 'video' ? <video src={m.url} className="w-full h-full object-cover" muted /> : <img src={m.url} alt={m.name} className="w-full h-full object-cover" />}
                          <button onClick={() => removeAnnouncementMedia(m.id)} className="absolute top-1 right-1 p-0.5 rounded" style={{ backgroundColor: 'rgba(0,10,12,0.7)', color: C.danger }}><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Btn className="w-full py-3" onClick={saveAnnouncement} disabled={!annModal.data.title.trim()} reducedMotion={reducedMotion}>Publish Article</Btn>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ACHIEVER MODAL */}
      {achieverModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-md">
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-bold">{achieverModal.data.id ? 'Edit Achiever' : 'Add Achiever'}</h2>
              <button onClick={() => setAchieverModal({ open: false, data: null })} style={{ color: C.textDim }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field placeholder="Full Name *" value={achieverModal.data.name} onChange={e => setAchieverModal({ ...achieverModal, data: { ...achieverModal.data, name: e.target.value } })} />
              <Field placeholder="Semester (e.g. SY 2026-2027, 1st Sem)" value={achieverModal.data.semester} onChange={e => setAchieverModal({ ...achieverModal, data: { ...achieverModal.data, semester: e.target.value } })} />
              <textarea placeholder="Life motto or quote" value={achieverModal.data.quote} onChange={e => setAchieverModal({ ...achieverModal, data: { ...achieverModal.data, quote: e.target.value } })} className="w-full h-20 p-3 rounded-xl text-sm outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
              <Btn variant="ghost" className="w-full" onClick={uploadAchieverPhotoInModal} reducedMotion={reducedMotion}>
                {achieverModal.data.photo ? <img src={achieverModal.data.photo} alt="" className="w-5 h-5 rounded object-cover" /> : <Upload className="w-4 h-4" />} {achieverModal.data.photo ? 'Change Photo' : 'Upload Photo'}
              </Btn>
              <Btn className="w-full py-3" onClick={saveAchiever} reducedMotion={reducedMotion}>Save Achiever</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ADD FOLDER MODAL */}
      {addFolderOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,10,12,0.85)' }}>
          <Card className="w-full max-w-md">
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h2 className="text-sm font-bold"><FolderPlus className="inline w-4 h-4 mr-2" style={{ color: C.accent }} />Add Folder</h2>
              <button onClick={() => { setAddFolderOpen(false); setFolderStep(1); }} style={{ color: C.textDim }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {folderStep === 1 ? (
                <>
                  <Field placeholder="Folder title..." value={newFolder.title} onChange={e => setNewFolder({ ...newFolder, title: e.target.value })} />
                  <Btn className="w-full py-3" onClick={() => setFolderStep(2)} disabled={!newFolder.title.trim()} reducedMotion={reducedMotion}>Next</Btn>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {CORE_MODULES.map(m => (
                      <button key={m.id} onClick={() => setNewFolder({ ...newFolder, module: m.id })} className="p-4 rounded-xl text-left flex flex-col gap-2" style={newFolder.module === m.id ? { backgroundColor: C.accentDim, border: `1px solid ${C.accent}` } : { backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                        <m.icon className="w-5 h-5" style={{ color: newFolder.module === m.id ? C.accent : C.textDim }} />
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <Btn className="w-full py-3" onClick={createFolder} reducedMotion={reducedMotion}>Create Folder</Btn>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* SECTIONS SIDE PANEL */}
      {sectionPanelOpen && (
        <div className="fixed inset-0 z-[250] flex justify-end" style={{ backgroundColor: 'rgba(0,10,12,0.7)' }} onClick={() => setSectionPanelOpen(false)}>
          <div className="w-full max-w-sm h-full p-6 overflow-y-auto" style={{ backgroundColor: C.panel, borderLeft: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold">Sections</h2>
              <button onClick={() => setSectionPanelOpen(false)} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 mb-6">
              {sections.map(s => (
                <div key={s.id} className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  <button onClick={() => toggleSectionActive(s.id)} className="flex items-center gap-2 text-left flex-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.active ? '#4ADE80' : C.border }} />
                    <span className="text-xs font-semibold">{s.title}</span>
                  </button>
                  <button onClick={() => deleteSection(s.id)} style={{ color: C.danger }}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {sections.length === 0 && <p className="text-xs" style={{ color: C.textDim }}>No sections created yet.</p>}
            </div>
            {!addSectionOpen ? (
              <Btn variant="ghost" className="w-full" onClick={() => setAddSectionOpen(true)} reducedMotion={reducedMotion}><Plus className="w-4 h-4" /> Add Section</Btn>
            ) : (
              <div className="space-y-3">
                <Field placeholder="Strand (e.g. STEM)" value={newSection.strand} onChange={e => setNewSection({ ...newSection, strand: e.target.value })} />
                <select value={newSection.grade} onChange={e => setNewSection({ ...newSection, grade: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
                <Field placeholder="Section Name (e.g. A)" value={newSection.name} onChange={e => setNewSection({ ...newSection, name: e.target.value })} />
                <div className="flex gap-2">
                  <Btn variant="ghost" className="flex-1" onClick={() => setAddSectionOpen(false)} reducedMotion={reducedMotion}>Cancel</Btn>
                  <Btn className="flex-1" onClick={() => { createSection(); setAddSectionOpen(false); }} reducedMotion={reducedMotion}>Create</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS & PRIVACY DRAWER */}
      <div className={`fixed inset-0 z-[290] ${motionTransition} ${isSettingsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ backgroundColor: 'rgba(0,10,12,0.8)' }}>
        <div className={`fixed inset-y-0 right-0 w-full max-w-md p-6 flex flex-col ${motionTransition} ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: C.panel, borderLeft: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 rounded-xl" style={{ backgroundColor: C.panelAlt, color: C.textDim }}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold">Settings &amp; Privacy</h2>
                <p className="text-[11px]" style={{ color: C.textDim }}>Experience, preferences &amp; privacy options</p>
              </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
          </div>

          <div className="relative my-4">
            <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: C.textDim }} />
            <Field placeholder="Search settings..." value={settingsSearch} onChange={e => setSettingsSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Tools and Resources</p>
              <p className="text-[10px] mb-2" style={{ color: C.textDim }}>Manage privacy, visibility, and your default section.</p>
              <Card className="overflow-hidden divide-y" style={{ borderColor: C.border }}>
                <div className="p-4 flex items-center justify-between" style={{ borderColor: C.border }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: C.accentDim, color: C.accent }}><User className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-semibold">Privacy Checkup</p>
                      <p className="text-[10px]" style={{ color: C.textDim }}>Show your active status to other students</p>
                    </div>
                  </div>
                  <Toggle checked={settings.profileVisibility} onChange={v => handleSettingChange('profileVisibility', v)} reducedMotion={reducedMotion} />
                </div>
                <div className="p-4 flex items-center justify-between" style={{ borderColor: C.border, borderTopWidth: 1 }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: C.accentDim, color: C.accent }}><HardDrive className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-semibold">Default Directory</p>
                      <p className="text-[10px]" style={{ color: C.textDim }}>Section loaded automatically on login</p>
                    </div>
                  </div>
                  <select value={settings.defaultDirectory} onChange={e => { handleSettingChange('defaultDirectory', e.target.value); setActiveSectionView(e.target.value); }} className="text-xs py-1 px-2 rounded-lg outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.accent }}>
                    <option value="">None</option>
                    {sectionOptions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              </Card>
            </div>

            <div>
              <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Preferences</p>
              <p className="text-[10px] mb-2" style={{ color: C.textDim }}>Customize how the portal looks and behaves.</p>
              <Card className="overflow-hidden divide-y" style={{ borderColor: C.border }}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: C.accentDim, color: C.accent }}><Bell className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-semibold">Notifications</p>
                      <p className="text-[10px]" style={{ color: C.textDim }}>Enable global system toast popups</p>
                    </div>
                  </div>
                  <Toggle checked={settings.notifications} onChange={v => handleSettingChange('notifications', v)} reducedMotion={reducedMotion} />
                </div>
                <div className="p-4 flex items-center justify-between" style={{ borderTopWidth: 1, borderColor: C.border }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: C.accentDim, color: C.accent }}><Accessibility className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-semibold">Accessibility</p>
                      <p className="text-[10px]" style={{ color: C.textDim }}>Reduced motion — strip animations &amp; transitions</p>
                    </div>
                  </div>
                  <Toggle checked={settings.reducedMotion} onChange={v => handleSettingChange('reducedMotion', v)} reducedMotion={reducedMotion} />
                </div>
                <div className="p-4 flex items-center justify-between" style={{ borderTopWidth: 1, borderColor: C.border }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: C.accentDim, color: C.accent }}><Globe className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-semibold">Language and Region</p>
                      <p className="text-[10px]" style={{ color: C.textDim }}>Portal display localization</p>
                    </div>
                  </div>
                  <select value={settings.language} onChange={e => handleSettingChange('language', e.target.value)} className="text-xs py-1 px-2 rounded-lg outline-none" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
                    <option value="English (US)">English (US)</option>
                    <option value="Filipino">Filipino</option>
                  </select>
                </div>
                <div className="p-4 flex items-center justify-between" style={{ borderTopWidth: 1, borderColor: C.border }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: C.accentDim, color: C.accent }}><Download className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-semibold">Media</p>
                      <p className="text-[10px]" style={{ color: C.textDim }}>Auto-download authorized files when opened</p>
                    </div>
                  </div>
                  <Toggle checked={settings.autoDownload} onChange={v => handleSettingChange('autoDownload', v)} reducedMotion={reducedMotion} />
                </div>
              </Card>
            </div>
          </div>

          <div className="pt-4 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-[10px] font-semibold" style={{ color: C.textDim }}>NESHS Portal — data saved automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}