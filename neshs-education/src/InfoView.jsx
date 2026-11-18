import React, { useMemo, useState } from 'react';
import { HelpCircle, Send, MapPin, ShieldCheck, Users, Clock, Trash2, CheckCircle2, ChevronDown, Navigation, Inbox, AlertTriangle } from 'lucide-react';
import { cleanMediaUrl } from './utils/cleanMediaUrl';
import { SCHOOL_MAP_QUERY, createLimiter, readErrorLog, clearErrorLog } from './siteUtils.js';

// Help & Info: FAQs, contact form + thank-you, response-time promise,
// map/directions, privacy policy and the team. Messages are saved in the
// same shared portal data as everything else; editors read them in the inbox.

export const INFO_SECTIONS = [
  { id: 'faq', label: 'FAQs', icon: HelpCircle },
  { id: 'contact', label: 'Contact', icon: Send },
  { id: 'visit', label: 'Visit us', icon: MapPin },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { id: 'team', label: 'Team', icon: Users }
];

const RESPONSE_PROMISE = 'We aim to reply within 2 school days.';

const FAQS = [
  ['What is ECHOES NESHS?', 'The online portal of Nasugbu East Senior High School. Announcements, project files, best students and quizzes live here and update in real time for everyone signed in.'],
  ['How do I create an account?', 'Choose Sign up on the login screen, pick whether you are a student or a teacher, and follow the steps. Students choose their section.'],
  ['I forgot my password. What do I do?', 'Send us a message from the Contact tab with your name and section. An editor will help you get back in.'],
  ['How do I take a quiz?', 'Open Quizzes & Grades, choose a quiz and enter the quiz password given by your teacher. Your score is recorded when you submit.'],
  ['Who can post announcements or upload files?', 'Editor accounts manage announcements, project files and best students. Teachers can create quizzes.'],
  ['Which files can I upload and how big can they be?', 'Images, videos and documents up to 200 MB each. Larger files are rejected before they upload.'],
  ['Why do I see "This device only"?', 'The portal could not reach the shared database, so changes are kept on this device until the connection comes back.'],
  ['Can I change how the portal looks?', 'Yes. Use the sun/moon button in the top bar for light and dark, and Settings for the color theme.']
];

function Section({ C, title, children, id }) {
  return (
    <section id={id} className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: C.panel, border: `1px solid ${C.border}` }}>
      <h2 className="text-lg font-extrabold mb-4" style={{ fontFamily: "'Archivo', sans-serif" }}>{title}</h2>
      {children}
    </section>
  );
}

export default function InfoView({ C, section, onSection, user, messages, onSend, onDeleteMessage, isEditor, team, onNavigate }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ name: user?.name || '', topic: 'General question', text: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [mapOn, setMapOn] = useState(false);
  const [shown, setShown] = useState(10);
  const [errLog, setErrLog] = useState(() => readErrorLog());
  const limiter = useMemo(() => createLimiter(3, 5 * 60 * 1000), []);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const text = form.text.trim();
    if (form.name.trim().length < 2) return setError('Please enter your name.');
    if (text.length < 10) return setError('Please write at least a short sentence so we can help.');
    if (messages.some(m => m.from === user?.email && m.text === text)) return setError('You already sent this message.');
    const wait = limiter.check();
    if (wait) return setError(`You are sending messages too fast. Try again in ${wait} seconds.`);
    onSend({ name: form.name.trim(), topic: form.topic, text: text.slice(0, 1500) });
    setSent(true);
  };

  const field = { backgroundColor: C.panelAlt, border: `1px solid ${C.border}`, color: C.text };
  const mapQuery = encodeURIComponent(SCHOOL_MAP_QUERY);
  const sorted = [...messages].sort((a, b) => (b.id || 0) - (a.id || 0));

  return (
    <div className="space-y-5" style={{ '--hv-accent': C.accent, '--hv-on': C.onPrimary, '--hv-line': C.border }}>
      <header>
        <p className="hv-lbl mb-2" style={{ color: C.accent }}>HELP &amp; INFO</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "'Archivo', sans-serif", letterSpacing: '-0.02em' }}>How can we help?</h1>
        <p className="mt-2 text-sm max-w-xl" style={{ color: C.textDim }}>Answers, ways to reach us, where to find the school, and how we handle your data.</p>
      </header>

      <nav aria-label="Help sections" className="flex gap-2 overflow-x-auto pb-1">
        {INFO_SECTIONS.map(s => {
          const on = section === s.id;
          return (
            <button key={s.id} onClick={() => onSection(s.id)} aria-current={on ? 'page' : undefined} className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={on ? { backgroundColor: C.accent, color: C.onPrimary, border: `1px solid ${C.accent}` } : { backgroundColor: C.panel, color: C.textDim, border: `1px solid ${C.border}` }}>
              <s.icon className="w-3.5 h-3.5" aria-hidden="true" />{s.label}
            </button>
          );
        })}
      </nav>

      {section === 'faq' && (
        <Section C={C} title="Frequently asked questions">
          <div className="divide-y" style={{ borderColor: C.border }}>
            {FAQS.map(([q, a], i) => (
              <div key={q} className="py-1" style={{ borderColor: C.border }}>
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i} className="w-full flex items-center justify-between gap-3 py-3 text-left text-sm font-bold">
                  {q}<ChevronDown className="w-4 h-4 shrink-0" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', color: C.accent }} aria-hidden="true" />
                </button>
                {openFaq === i && <p className="pb-3 text-sm leading-relaxed" style={{ color: C.textDim }}>{a}</p>}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm" style={{ color: C.textDim }}>Still stuck? <button onClick={() => onSection('contact')} className="font-bold underline" style={{ color: C.accent }}>Send us a message</button>.</p>
        </Section>
      )}

      {section === 'contact' && (
        <Section C={C} title="Contact us">
          <p className="flex items-center gap-2 text-sm mb-4" style={{ color: C.textDim }}><Clock className="w-4 h-4" style={{ color: C.accent }} aria-hidden="true" />{RESPONSE_PROMISE}</p>
          {sent ? (
            <div role="status" className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: C.accent }} aria-hidden="true" />
              <h3 className="text-xl font-extrabold mb-1">Thank you!</h3>
              <p className="text-sm mb-5" style={{ color: C.textDim }}>Your message was sent. {RESPONSE_PROMISE}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => onNavigate('home')} className="hv-btn hv-btn-primary">Back to Home</button>
                <button onClick={() => { setSent(false); setForm(f => ({ ...f, text: '' })); }} className="hv-btn hv-btn-ghost">Send another</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3" noValidate>
              <label className="block text-xs font-bold">Your name
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={80} className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm" style={field} />
              </label>
              <label className="block text-xs font-bold">Topic
                <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm" style={field}>
                  {['General question', 'Account or password', 'Report a problem', 'Suggestion'].map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold">Message
                <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} rows={5} maxLength={1500} className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm" style={field} />
              </label>
              {error && <p role="alert" className="text-xs font-semibold" style={{ color: C.danger }}>{error}</p>}
              <button type="submit" className="hv-btn hv-btn-primary"><Send className="w-4 h-4" aria-hidden="true" />Send message</button>
            </form>
          )}
        </Section>
      )}

      {section === 'contact' && isEditor && (
        <Section C={C} title={`Inbox (${messages.length})`}>
          {messages.length === 0 && <p className="text-sm" style={{ color: C.textDim }}>No messages yet. New ones appear here.</p>}
          <ul className="space-y-3">
            {sorted.slice(0, shown).map(m => (
              <li key={m.id} className="rounded-xl p-3" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate"><Inbox className="inline w-3.5 h-3.5 mr-1.5" style={{ color: C.accent }} aria-hidden="true" />{m.name} <span className="font-normal" style={{ color: C.textDim }}>· {m.topic}</span></p>
                    <p className="text-[11px]" style={{ color: C.textDim }}>{m.from} · {m.ts}</p>
                  </div>
                  <button onClick={() => onDeleteMessage(m.id)} aria-label="Delete message" className="p-1.5 rounded-lg" style={{ color: C.danger }}><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap break-words">{m.text}</p>
              </li>
            ))}
          </ul>
          {sorted.length > shown && <button onClick={() => setShown(n => n + 10)} className="mt-3 text-xs font-bold" style={{ color: C.accent }}>Show more</button>}
          <details className="mt-5 text-xs" style={{ color: C.textDim }} onToggle={() => setErrLog(readErrorLog())}>
            <summary className="cursor-pointer font-bold"><AlertTriangle className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" />Error log on this device ({errLog.length})</summary>
            <ul className="mt-2 space-y-1">
              {errLog.length === 0 && <li>No errors recorded.</li>}
              {errLog.map((e, i) => <li key={i} className="break-words">{e.t.slice(0, 19).replace('T', ' ')} · {e.source}: {e.message}</li>)}
            </ul>
            {errLog.length > 0 && <button onClick={() => { clearErrorLog(); setErrLog([]); }} className="mt-2 font-bold" style={{ color: C.accent }}>Clear log</button>}
          </details>
        </Section>
      )}

      {section === 'visit' && (
        <Section C={C} title="Visit the school">
          <p className="text-sm mb-1 font-bold">Nasugbu East Senior High School</p>
          <p className="text-sm mb-4" style={{ color: C.textDim }}>Barangay Lumbangan, Nasugbu, Batangas</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <a className="hv-btn hv-btn-primary" href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`} target="_blank" rel="noopener noreferrer"><Navigation className="w-4 h-4" aria-hidden="true" />Get directions</a>
            <a className="hv-btn hv-btn-ghost" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
          </div>
          {mapOn ? (
            <iframe title="Map of Nasugbu East Senior High School" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} className="w-full rounded-xl" style={{ height: 320, border: `1px solid ${C.border}` }} />
          ) : (
            <button onClick={() => setMapOn(true)} className="w-full rounded-xl py-16 text-sm font-bold" style={{ backgroundColor: C.panelAlt, border: `1px dashed ${C.border}`, color: C.textDim }}>
              <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: C.accent }} aria-hidden="true" />Load the map (uses Google Maps)
            </button>
          )}
        </Section>
      )}

      {section === 'privacy' && (
        <Section C={C} title="Privacy policy">
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: C.textDim }}>
            <p>ECHOES NESHS is a school portal. We collect only what we need to run it, in line with the Philippine Data Privacy Act of 2012 (RA 10173).</p>
            <div><h3 className="font-bold mb-1" style={{ color: C.text }}>What we collect</h3>
              <p>Your name, email, role, section and password when you sign up; quiz answers and scores; the messages you send us; files you upload; and whether you are online right now.</p></div>
            <div><h3 className="font-bold mb-1" style={{ color: C.text }}>How we use it</h3>
              <p>To sign you in, show announcements and projects, record quiz results, answer your messages and keep the portal working. We do not sell your data or use it for advertising.</p></div>
            <div><h3 className="font-bold mb-1" style={{ color: C.text }}>Who can see it</h3>
              <p>Announcements, uploaded files, best students and online status are visible to signed-in members. Quiz results are visible to the teacher or editor who runs the quiz. Messages are visible to editors only. Account details stay on the device you signed up on.</p></div>
            <div><h3 className="font-bold mb-1" style={{ color: C.text }}>Services we rely on</h3>
              <p>Vercel (hosting), Supabase (shared data), Cloudflare R2 (file storage), Google Fonts, Google Maps (only if you load the map) and Google Analytics (only if turned on for the site, with anonymized IPs).</p></div>
            <div><h3 className="font-bold mb-1" style={{ color: C.text }}>Cookies and local storage</h3>
              <p>We store your theme, settings and sign-in on your device so the portal remembers you. You can clear them in your browser at any time.</p></div>
            <div><h3 className="font-bold mb-1" style={{ color: C.text }}>Your rights</h3>
              <p>You can ask to see, correct or delete your information. Send a message from the <button onClick={() => onSection('contact')} className="font-bold underline" style={{ color: C.accent }}>Contact tab</button>. {RESPONSE_PROMISE}</p></div>
            <p className="text-xs">Last updated: November 2026.</p>
          </div>
        </Section>
      )}

      {section === 'team' && (
        <Section C={C} title="The team">
          <ul className="grid sm:grid-cols-2 gap-4">
            {team.map(t => (
              <li key={t.name} className="flex items-center gap-4 rounded-xl p-4" style={{ backgroundColor: C.panelAlt, border: `1px solid ${C.border}` }}>
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: C.accentDim, border: `2px solid ${C.accent}` }}>
                  {t.photo ? <img src={cleanMediaUrl(t.photo)} alt={`Portrait of ${t.name}`} loading="lazy" className="w-full h-full object-cover" /> : <Users className="w-6 h-6" style={{ color: C.accent }} aria-hidden="true" />}
                </div>
                <div className="min-w-0"><p className="font-bold text-sm">{t.name}</p><p className="text-xs" style={{ color: C.textDim }}>{t.title}</p></div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs" style={{ color: C.textDim }}>The team photo is set from Author Profile: tap the photo there to change it.</p>
        </Section>
      )}
    </div>
  );
}
