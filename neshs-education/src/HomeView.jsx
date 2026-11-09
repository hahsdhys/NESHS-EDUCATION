import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Megaphone, BookOpen, Award, FileSpreadsheet, User, Users, Activity,
  Clock, ArrowRight, FolderOpen, Image as ImageIcon, Play, Radio, Sparkles
} from 'lucide-react';
import { cleanMediaUrl } from './utils/cleanMediaUrl';

// ECHOES live homepage ------------------------------------------------------
// Everything on this screen is read straight from the same shared state the
// rest of the portal uses (announcements, achievers, quizzes, folders,
// notifications, presence). That state is kept current by the Supabase
// realtime + presence channels in App.jsx, so this page updates on its own
// whenever anyone posts, uploads, signs in or takes a quiz — no refresh, no
// separate fetch. Every clickable thing below is a real <button> that calls
// onNavigate / onOpenOnline, the same handlers the sidebar and header use.

const DISPLAY_FONT = "'Unbounded', 'Arial Black', sans-serif";

const firstNameOf = (full = '') => {
  const raw = String(full).trim();
  if (!raw) return '';
  // Handles both "Mark Niel Paiton" and "Paiton, Mark Niel H."
  const part = raw.includes(',') ? raw.split(',')[1].trim() : raw;
  const word = part.split(/\s+/)[0] || '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const initialsOf = (name = '') => {
  const words = String(name).replace(',', ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
};

const greetingFor = (date) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const QUICK_LINKS = [
  { id: 'announcements', icon: Megaphone, label: 'Announcements' },
  { id: 'projectHistory', icon: BookOpen, label: 'Project History' },
  { id: 'showcase', icon: Award, label: 'Best Students' },
  { id: 'quizzes', icon: FileSpreadsheet, label: 'Quizzes & Grades' },
  { id: 'author', icon: User, label: 'Author' }
];


const STORY_STEPS = [
  { id: 'about', icon: Sparkles, kicker: 'What is this?', title: 'One home for Senior Uno', body: 'The NESHS Portal brings everything Nasugbu East Senior High students and teachers need into a single place: news, project files, recognition and quizzes. Sign in once and everything below is a tap away.', cta: null },
  { id: 'announcements', icon: Megaphone, kicker: 'Stay informed', title: 'Announcements', body: 'Read the latest school news with photos and details. New posts show up on your screen the moment they are published, so you never miss a reminder or an event.', cta: { label: 'Open announcements', to: 'announcements' } },
  { id: 'projectHistory', icon: BookOpen, kicker: 'Keep the work', title: 'Project History', body: 'Browse folders of class projects and files by section. Open, preview and download work from past batches, and teachers can keep every folder organised.', cta: { label: 'Open project history', to: 'projectHistory' } },
  { id: 'showcase', icon: Award, kicker: 'Celebrate wins', title: 'Best Students', body: 'See who is shining each semester, with their achievements listed next to their names. A small spotlight for the people who put in the work.', cta: { label: 'See the best students', to: 'showcase' } },
  { id: 'quizzes', icon: FileSpreadsheet, kicker: 'Learn and check', title: 'Quizzes & Grades', body: 'Take teacher-made quizzes with a password, then see your results and records. Teachers can review every attempt in one list.', cta: { label: 'Go to quizzes', to: 'quizzes' } },
  { id: 'live', icon: Radio, kicker: 'Always current', title: 'Live and together', body: 'The portal updates by itself. See who is online right now and watch new posts, uploads and quiz activity appear without refreshing the page.', cta: 'online' }
];

function StoryVisual({ id, C, data }) {
  const rows = (items, render) => items.length
    ? <ul className="hud-rows">{items.map(render)}</ul>
    : <p className="text-xs" style={{ color: C.textDim }}>Nothing here yet. It will appear as soon as it is added.</p>;
  if (id === 'about') {
    return (
      <div className="hud-stats">
        {[['Announcements', data.announcements.length], ['Folders', data.folders.length], ['Quizzes', data.quizzes.length]].map(([l, v]) => (
          <div key={l} className="hud-stat"><strong>{v}</strong><span>{l}</span></div>
        ))}
      </div>
    );
  }
  if (id === 'announcements') {
    return rows(data.announcements.slice(0, 3), a => (
      <li key={a.id}><ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /><span className="truncate">{a.title}</span><em>{a.date}</em></li>
    ));
  }
  if (id === 'projectHistory') {
    return data.folders.length ? (
      <div className="hud-files">
        {data.folders.slice(0, 8).map(f => (
          <span key={f.id} className="hud-file"><span className="hud-file-tile"><FolderOpen className="w-5 h-5" aria-hidden="true" /></span><em className="truncate">{f.title}</em></span>
        ))}
      </div>
    ) : rows([], () => null);
  }
  if (id === 'showcase') {
    return rows(data.achievers.slice(0, 4), a => (
      <li key={a.id}><Award className="w-3.5 h-3.5" aria-hidden="true" /><span className="truncate">{a.name}</span><em>{a.semester}</em></li>
    ));
  }
  if (id === 'quizzes') {
    return rows(data.quizzes.slice(0, 4), q => (
      <li key={q.id}><ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /><span className="truncate">{q.title}</span><em>{(q.items || []).length} items</em></li>
    ));
  }
  return (
    <div className="hud-ring-wrap">
      <div className="hud-ring" style={{ '--ring': data.online > 0 ? '100%' : '0%' }} aria-hidden="true" />
      <div className="hud-ring-label"><strong>{data.online}</strong><span>online now</span></div>
    </div>
  );
}

function ScrollStory({ C, reducedMotion, onNavigate, onOpenOnline, data }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const wrapRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const i = Number(e.target.dataset.index);
          if (!Number.isNaN(i)) setActive(i);
        }
      });
    }, { rootMargin: '-40% 0px -45% 0px', threshold: 0 });
    cardRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.5;
      setProgress(total > 0 ? Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / total)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
  }, []);

  const jump = i => {
    const el = cardRefs.current[i];
    if (el) el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  return (
    <section className="echo-story" ref={wrapRef} aria-labelledby="home-story" style={{ '--story-accent': C.accent, '--story-glow': C.glow }}>
      <div className="echo-story-rail">
        <h2 id="home-story" className="font-display text-xl font-extrabold mb-1">How the portal works</h2>
        <p className="text-xs mb-5" style={{ color: C.textDim }}>Scroll to take the tour.</p>
        <div className="echo-story-track" aria-hidden="true"><span style={{ height: `${Math.round(progress * 100)}%` }} /></div>
        <ol className="echo-story-nav">
          {STORY_STEPS.map((s, i) => (
            <li key={s.id}>
              <button type="button" onClick={() => jump(i)} aria-current={active === i ? 'step' : undefined} className={active === i ? 'is-active' : ''}>
                <span className="echo-story-num">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="echo-story-steps">
        {STORY_STEPS.map((s, i) => (
          <article
            key={s.id}
            ref={el => { cardRefs.current[i] = el; }}
            data-index={i}
            className={`echo-story-card hud ${active === i ? 'is-active' : ''}`}
            style={{ backgroundColor: C.panel, border: `1px solid ${C.border}` }}
          >
            <span className="hud-tag"><s.icon className="w-4 h-4" aria-hidden="true" />{s.kicker}</span>
            <h3 className="echo-story-title">{s.title}</h3>
            <span className="hud-line" aria-hidden="true" />
            <p className="text-sm leading-relaxed max-w-xl mb-5" style={{ color: C.textDim }}>{s.body}</p>
            <StoryVisual id={s.id} C={C} data={data} />
            {s.cta && (
              <button
                type="button"
                onClick={() => (s.cta === 'online' ? onOpenOnline() : onNavigate(s.cta.to))}
                className="mt-5 self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                style={{ backgroundColor: C.accent, color: C.onPrimary }}
              >
                {s.cta === 'online' ? 'See who is online' : s.cta.label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Panel({ C, title, icon: Icon, action, children }) {
  return (
    <section className="rounded-2xl p-5 glass-surface hud" style={{ backgroundColor: C.panel, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-extrabold" style={{ fontFamily: DISPLAY_FONT }}>
          {Icon && <Icon className="w-4 h-4" style={{ color: C.glow }} aria-hidden="true" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function LinkButton({ C, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] font-bold shrink-0"
      style={{ color: C.accent }}
    >
      {children} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  );
}

function Empty({ C, children }) {
  return <p className="text-xs py-6 text-center" style={{ color: C.textDim }}>{children}</p>;
}

export default function HomeView({
  palette: C,
  user,
  schoolName,
  reducedMotion,
  isConfigured = true,
  isLive,
  onlineUsers = [],
  announcements = [],
  achievers = [],
  quizzes = [],
  quizRecords = [],
  folders = [],
  projectFiles = [],
  notifications = [],
  onNavigate,
  onOpenOnline
}) {
  // Light clock tick so the greeting and time stay correct while the tab is open.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const latestAnnouncements = useMemo(
    () => [...announcements].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 3),
    [announcements]
  );

  // Same expression the Project History page uses for a folder's file count,
  // so the two screens can never disagree.
  const projectFolders = useMemo(() => folders.filter(f => f.module === 'projectHistory'), [folders]);
  const fileCount = useMemo(
    () => projectFolders.reduce((sum, f) => sum + (f.project_files?.[0]?.count ?? projectFiles.filter(pf => pf.folderId === f.id).length), 0),
    [projectFolders, projectFiles]
  );

  const topStudents = useMemo(
    () => [...achievers].sort((a, b) => (b.achievements?.length || 0) - (a.achievements?.length || 0)).slice(0, 4),
    [achievers]
  );
  const recentQuizzes = useMemo(() => [...quizzes].slice(-3).reverse(), [quizzes]);
  const activity = notifications.slice(0, 5);

  // Module pages only list items at their root, so a row for an item that
  // lives inside a sidebar folder must open that folder. If the folder was
  // deleted since, fall back to the module root instead of a blank page.
  const targetFor = (item, fallback) => (item.folderId && folders.some(f => f.id === item.folderId) ? item.folderId : fallback);

  const firstName = firstNameOf(user?.name);
  const timeText = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const heroVars = {
    '--hero-from': C.heroFrom,
    '--hero-to': C.heroTo,
    '--hero-ink': C.heroInk,
    '--hero-echo': C.heroEcho,
    '--hero-white': C.heroWhite
  };

  const stats = [
    { key: 'online', label: 'Online now', value: onlineUsers.length, icon: Users, onClick: onOpenOnline, live: true },
    { key: 'ann', label: 'Announcements', value: announcements.length, icon: Megaphone, onClick: () => onNavigate('announcements') },
    { key: 'files', label: 'Project files', value: fileCount, icon: FolderOpen, onClick: () => onNavigate('projectHistory') },
    { key: 'quiz', label: 'Quizzes', value: quizzes.length, icon: FileSpreadsheet, onClick: () => onNavigate('quizzes') }
  ];

  return (
    <div className="space-y-5">
      {/* HERO */}
      <div className="neshs-home-hero" style={heroVars}>
        <div className="neshs-home-hero-content">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.38)', color: '#fff' }}
              role="status"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                {isLive && !reducedMotion && (
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: C.glow }} />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: isLive ? C.glow : '#cbd5c9' }} />
              </span>
              {isLive ? 'Live' : isConfigured ? 'Reconnecting…' : 'This device only'}
            </span>
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.38)', color: '#fff' }}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <time dateTime={now.toISOString()}>{timeText} · {dateText}</time>
            </span>
          </div>

          <h1 className="neshs-home-title">NESHS</h1>
          <p className="neshs-home-subtitle">{schoolName}</p>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--hero-ink)' }}>
            {greetingFor(now)}{firstName ? `, ${firstName}` : ''}.
          </p>
          <div className="neshs-home-welcome">
            <strong>WEL<span>COME</span></strong>
            <span className="neshs-home-welcome-to">to</span>
          </div>
          <div className="neshs-home-echoes" aria-label="ECHOES">ECH<span>OES</span></div>
          <span className="neshs-home-tag">For education purpose</span>

          <div className="flex flex-wrap gap-3 mt-6">
            <button type="button" onClick={() => onNavigate('announcements')} className="neshs-hero-btn neshs-hero-btn-solid">
              <Megaphone className="w-4 h-4" aria-hidden="true" /> Latest news
            </button>
            <button type="button" onClick={() => onNavigate('quizzes')} className="neshs-hero-btn neshs-hero-btn-outline">
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" /> Take a quiz
            </button>
          </div>
        </div>
      </div>

      <ScrollStory C={C} reducedMotion={reducedMotion} onNavigate={onNavigate} onOpenOnline={onOpenOnline} data={{ announcements, folders, achievers, quizzes, online: (onlineUsers || []).length }} />

      {/* COMMUNITY STRIP */}
      <div className="rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-2 text-sm glass-surface" style={{ backgroundColor: C.panel, border: `1px solid ${C.border}` }}>
        <span className="font-semibold">Senior Uno Community</span>
        <span style={{ color: C.textDim }}>
          {onlineUsers.length} online now · {user?.role}
        </span>
      </div>

      {/* LIVE STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <button
            key={s.key}
            type="button"
            onClick={s.onClick}
            className="text-left rounded-2xl p-4 glass-surface"
            style={{ backgroundColor: C.panel, border: `1px solid ${C.border}`, boxShadow: `0 0 18px ${C.accentDim}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-4 h-4" style={{ color: C.glow }} aria-hidden="true" />
              {s.live && <span className="text-[9px] font-bold uppercase" style={{ color: C.glow }}>live</span>}
            </div>
            <p className="text-3xl font-extrabold leading-none" style={{ fontFamily: DISPLAY_FONT, color: C.accent }}>{s.value}</p>
            <p className="text-[11px] mt-2" style={{ color: C.textDim }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* NEWS + PEOPLE */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Panel C={C} title="Latest announcements" icon={Megaphone} action={<LinkButton C={C} onClick={() => onNavigate('announcements')}>View all</LinkButton>}>
            {latestAnnouncements.length === 0 ? (
              <Empty C={C}>No announcements yet. New posts show up here the moment they are published.</Empty>
            ) : (
              <ul className="space-y-3">
                {latestAnnouncements.map(a => {
                  const thumb = (a.media || []).find(m => m.type !== 'video') || (a.media || [])[0];
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => onNavigate(targetFor(a, 'announcements'))}
                        className="w-full flex items-center gap-3 text-left rounded-xl p-3"
                        style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}` }}
                      >
                        <span className="w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: C.accentDim }}>
                          {thumb && thumb.type !== 'video' ? (
                            <img src={cleanMediaUrl(thumb.url)} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : thumb ? (
                            <Play className="w-5 h-5" style={{ color: C.accent }} aria-hidden="true" />
                          ) : (
                            <ImageIcon className="w-5 h-5" style={{ color: C.textDim }} aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold truncate">{a.title}</span>
                          <span className="block text-xs mt-0.5 line-clamp-2" style={{ color: C.textDim }}>{a.details || 'No details provided.'}</span>
                          <span className="block text-[10px] uppercase mt-1" style={{ color: C.accent }}>{a.author} · {a.date}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Panel C={C} title="Online now" icon={Users} action={<LinkButton C={C} onClick={onOpenOnline}>See all</LinkButton>}>
            {onlineUsers.length === 0 ? (
              <Empty C={C}>{isLive ? 'Nobody else is online right now.' : 'Live presence appears once the shared connection is up.'}</Empty>
            ) : (
              <div className="flex flex-wrap gap-2">
                {onlineUsers.slice(0, 8).map(u => (
                  <span
                    key={u.email}
                    title={`${u.name} · ${u.role}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold"
                    style={{ backgroundColor: C.accent, color: C.onPrimary }}
                  >
                    {initialsOf(u.name)}
                  </span>
                ))}
                {onlineUsers.length > 8 && (
                  <button
                    type="button"
                    onClick={onOpenOnline}
                    className="w-9 h-9 rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.accent }}
                    aria-label={`Show all ${onlineUsers.length} online users`}
                  >
                    +{onlineUsers.length - 8}
                  </button>
                )}
              </div>
            )}
          </Panel>

          <Panel C={C} title="Best students" icon={Award} action={<LinkButton C={C} onClick={() => onNavigate('showcase')}>View all</LinkButton>}>
            {topStudents.length === 0 ? (
              <Empty C={C}>No achievers added yet.</Empty>
            ) : (
              <ul className="space-y-2">
                {topStudents.map(a => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(targetFor(a, 'showcase'))}
                      className="w-full flex items-center gap-3 text-left rounded-xl p-2.5"
                      style={{ backgroundColor: C.panelAlt }}
                    >
                      <span className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: C.accentDim, border: `1px solid ${C.border}` }}>
                        {(a.avatar_url || a.photo)
                          ? <img src={cleanMediaUrl(a.avatar_url || a.photo)} alt="" className="w-full h-full object-cover" loading="lazy" />
                          : <span className="text-[10px] font-extrabold" style={{ color: C.accent }}>{initialsOf(a.name)}</span>}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold truncate">{a.name}</span>
                        {a.semester && <span className="block text-[10px]" style={{ color: C.glow }}>{a.semester}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* QUIZZES + ACTIVITY */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel C={C} title="Quizzes" icon={FileSpreadsheet} action={<LinkButton C={C} onClick={() => onNavigate('quizzes')}>Open</LinkButton>}>
          {recentQuizzes.length === 0 ? (
            <Empty C={C}>No quizzes yet. Teachers can create one from Quizzes & Grades.</Empty>
          ) : (
            <ul className="space-y-2">
              {recentQuizzes.map(q => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(targetFor(q, 'quizzes'))}
                    className="w-full flex items-center justify-between gap-3 text-left rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: C.panelAlt }}
                  >
                    <span className="text-sm font-semibold truncate">{q.title || 'Untitled quiz'}</span>
                    <span className="text-[11px] font-bold shrink-0" style={{ color: C.accent }}>{q.items?.length || 0} items</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] mt-3" style={{ color: C.textDim }}>{quizRecords.length} attempt{quizRecords.length === 1 ? '' : 's'} recorded so far.</p>
        </Panel>

        <Panel C={C} title="Recent activity" icon={Activity}>
          {activity.length === 0 ? (
            <Empty C={C}>No activity yet.</Empty>
          ) : (
            <ul className="space-y-2.5">
              {activity.map(n => (
                <li key={n.id} className="text-[12px]" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                  <span className="font-bold">{n.actor}</span> {n.action} <span style={{ color: C.accent }}>{n.item}</span>
                  <span className="block text-[10px]" style={{ color: C.textDim }}>{n.ts}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* QUICK ACCESS — the skewed file tiles from the ECHOES design */}
      <section aria-labelledby="home-quick">
        <h2 id="home-quick" className="text-sm font-extrabold mb-3" style={{ fontFamily: DISPLAY_FONT }}>Jump to</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {QUICK_LINKS.map(l => (
            <button key={l.id} type="button" onClick={() => onNavigate(l.id)} className="echo-tile" style={{ '--tile-bg': C.panelAlt, '--tile-line': C.glow, '--tile-glow': C.accentDim }}>
              <span className="echo-tile-inner">
                <l.icon className="w-6 h-6 mx-auto mb-2" style={{ color: C.accent }} aria-hidden="true" />
                <span className="block text-xs font-semibold">{l.label}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
