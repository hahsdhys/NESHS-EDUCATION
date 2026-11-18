import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme, getColorTheme } from './ThemeContext.jsx';
import { getConsent, setConsent, SITE_NAME } from './siteUtils.js';

// Legal documents shown inline (Help & Info), in a pop-up (login screen,
// sign-up) and linked from the cookie banner. The text is a plain-language
// starting point for the school to review, not legal advice.

export const LEGAL_VERSION = '2026-11';
export const LEGAL_UPDATED = 'November 2026';

export const LEGAL_DOCS = [
  { id: 'privacy', label: 'Privacy Notice' },
  { id: 'terms', label: 'Terms of Use' },
  { id: 'cookies', label: 'Cookie Notice' }
];

const H = ({ children }) => <h3 className="font-bold mt-5 mb-1 text-base" style={{ color: 'var(--lg-text)' }}>{children}</h3>;
const P = ({ children }) => <p className="mb-2">{children}</p>;
const Li = ({ children }) => <li className="ml-5 list-disc mb-1">{children}</li>;

export function PrivacyDoc({ onOpen }) {
  return (
    <div className="text-sm leading-relaxed">
      <P>{SITE_NAME} is the online portal of Nasugbu East Senior High School (&ldquo;the school&rdquo;, &ldquo;we&rdquo;). This notice explains how we handle personal information under the Data Privacy Act of 2012 (Republic Act No. 10173) and its rules.</P>
      <H>1. What we collect</H>
      <ul>
        <Li>Account details: name, Gmail address, role (student, teacher or editor), section or rank, and your password.</Li>
        <Li>Activity: quiz answers and scores, items you post, notifications, and whether you are online.</Li>
        <Li>Content you upload: photos, videos and documents.</Li>
        <Li>Messages you send through the Contact form.</Li>
        <Li>Technical data: theme and settings stored on your device, and an error log kept on your device.</Li>
      </ul>
      <H>2. Why we collect it (lawful basis)</H>
      <P>To create and secure your account, run school activities such as announcements, projects and quizzes, answer your messages, and keep the portal working. We rely on your consent, given when you sign up, and on the school&rsquo;s legitimate interest in running its learning services. We do not sell personal data or use it for advertising.</P>
      <H>3. Students and minors</H>
      <P>Many students are under 18. If you are, please make sure a parent or guardian knows you are using the portal. A parent or guardian may contact us to see, correct or remove a child&rsquo;s information.</P>
      <H>4. Who can see it</H>
      <ul>
        <Li>Signed-in members: announcements, project files, best students and who is online.</Li>
        <Li>The teacher or editor who runs a quiz: quiz results.</Li>
        <Li>Editors only: messages sent through the Contact form.</Li>
        <Li>Account details are stored on the device where you signed up.</Li>
      </ul>
      <H>5. Service providers</H>
      <P>We use Vercel (hosting), Supabase (shared data), Cloudflare R2 (file storage), Google Fonts, Google Maps (only if you load the map) and Google Analytics (only if you accept analytics cookies). These providers may process data outside the Philippines under their own safeguards.</P>
      <H>6. How long we keep it</H>
      <P>Account and activity data are kept while your account is active and removed when you ask us to delete it or when the school clears old school-year records. Contact messages may be deleted by editors at any time.</P>
      <H>7. Your rights</H>
      <P>You may ask to be informed about, access, correct, object to, or erase your personal data, and to withdraw your consent, as well as to data portability and damages where the law provides. Send a request through the Contact tab (topic: Account or password) and we will reply within 2 school days where possible.</P>
      <H>8. Security</H>
      <P>We use HTTPS, access limited by role, request limits and error handling. No online service is perfectly secure, so please choose a password you do not use elsewhere and sign out on shared devices.</P>
      <H>9. Complaints</H>
      <P>If you believe your data was mishandled, contact us first. You may also complain to the National Privacy Commission at privacy.gov.ph.</P>
      <H>10. Data Protection Officer</H>
      <P>The school administration acts as the contact for data protection questions. Reach them through the Contact tab{onOpen ? <> (<button type="button" className="underline font-bold" onClick={() => onOpen('contact')}>open it</button>)</> : null}.</P>
      <P>Last updated: {LEGAL_UPDATED}.</P>
    </div>
  );
}

export function TermsDoc() {
  return (
    <div className="text-sm leading-relaxed">
      <P>By creating an account or using {SITE_NAME}, you agree to these terms. If you do not agree, please do not use the portal.</P>
      <H>1. Who may use it</H>
      <P>The portal is for students, teachers and staff of Nasugbu East Senior High School. You must give accurate information and keep your password private. You are responsible for activity under your account.</P>
      <H>2. Acceptable use</H>
      <ul>
        <Li>Be respectful. No bullying, harassment, hate speech or sexual content.</Li>
        <Li>Do not post anything illegal, harmful, or that infringes someone else&rsquo;s rights.</Li>
        <Li>Do not cheat on quizzes, share quiz passwords, or use another person&rsquo;s account.</Li>
        <Li>Do not try to break, overload, scan or gain unauthorized access to the portal or its data.</Li>
        <Li>Do not upload malware or files you do not have the right to share.</Li>
      </ul>
      <H>3. Your content</H>
      <P>You keep ownership of what you upload or post. By posting it, you allow the school to host, display and share it inside the portal for school purposes. Only post work and photos you have permission to share, and get consent before posting photos of other people.</P>
      <H>4. Reporting and takedown</H>
      <P>If you see content that is harmful, wrongly shared, or that infringes your copyright, send a message through the Contact tab (topic: Report a problem) with a link or description, and tell us why. We will review it and remove content that breaks these terms or the law.</P>
      <H>5. School materials</H>
      <P>The portal design, logo and school content belong to the school and its creators. Do not copy or reuse them outside school activities without permission.</P>
      <H>6. Availability and disclaimer</H>
      <P>We work to keep the portal running but provide it &ldquo;as is&rdquo;. It may be unavailable or contain errors. To the extent the law allows, the school and the site&rsquo;s creators are not liable for losses caused by downtime, lost data or reliance on portal content. Nothing here limits rights you have under Philippine law.</P>
      <H>7. Suspension</H>
      <P>We may suspend or remove accounts or content that break these terms.</P>
      <H>8. Changes and law</H>
      <P>We may update these terms and will show the new date below. Continued use means you accept the update. These terms are governed by the laws of the Republic of the Philippines.</P>
      <P>Last updated: {LEGAL_UPDATED}.</P>
    </div>
  );
}

export function CookiesDoc() {
  const [choice, setChoice] = useState(getConsent());
  const pick = (v) => { setConsent(v); setChoice(v); };
  return (
    <div className="text-sm leading-relaxed">
      <P>Cookies and similar browser storage are small pieces of data saved on your device.</P>
      <H>Essential (always on)</H>
      <ul>
        <Li>Your sign-in and saved account on this device.</Li>
        <Li>Your theme, color theme and settings.</Li>
        <Li>Your cookie choice and a short error log used to fix bugs.</Li>
      </ul>
      <H>Analytics (only with your consent)</H>
      <P>If the school turns on Google Analytics, it loads only after you accept. It counts visits and pages using anonymized IP addresses, so we can improve the portal. Nothing is used for advertising.</P>
      <H>Your choice</H>
      <P>Current choice: <b>{choice === 'accepted' ? 'Analytics allowed' : choice === 'declined' ? 'Analytics declined' : 'Not chosen yet'}</b>. You can change it any time.</P>
      <div className="flex flex-wrap gap-2 mt-2">
        <button type="button" onClick={() => pick('accepted')} className="px-4 py-2 rounded-full text-xs font-bold" style={{ background: 'var(--lg-accent)', color: 'var(--lg-on)' }}>Allow analytics</button>
        <button type="button" onClick={() => pick('declined')} className="px-4 py-2 rounded-full text-xs font-bold" style={{ border: '1px solid var(--lg-line)' }}>Decline</button>
      </div>
      <P><span className="block mt-3">Last updated: {LEGAL_UPDATED}.</span></P>
    </div>
  );
}

export const LegalDoc = ({ id, onOpen }) => id === 'terms' ? <TermsDoc /> : id === 'cookies' ? <CookiesDoc /> : <PrivacyDoc onOpen={onOpen} />;

// Palette helper so these pieces follow the active theme anywhere in the app.
export const useLegalPalette = () => {
  const { theme, resolvedTheme, colorTheme } = useTheme();
  const t = getColorTheme(colorTheme);
  const pal = t[theme === 'glass' ? 'glass' : resolvedTheme] || t.dark;
  return {
    pal,
    vars: { '--lg-text': pal.text, '--lg-accent': pal.accent, '--lg-on': pal.onPrimary, '--lg-line': pal.border }
  };
};

export function LegalModal({ doc, onClose, onChange }) {
  const { pal, vars } = useLegalPalette();
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const title = LEGAL_DOCS.find(d => d.id === doc)?.label || 'Legal';
  return (
    <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,.55)' }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} className="w-full sm:max-w-2xl max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl" style={{ ...vars, background: pal.panel, color: pal.text, border: `1px solid ${pal.border}` }}>
        <div className="flex items-center justify-between gap-3 p-4" style={{ borderBottom: `1px solid ${pal.border}` }}>
          <div className="flex gap-1 overflow-x-auto">
            {LEGAL_DOCS.map(d => (
              <button key={d.id} onClick={() => onChange(d.id)} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold" style={doc === d.id ? { background: pal.accent, color: pal.onPrimary } : { color: pal.textDim, border: `1px solid ${pal.border}` }}>{d.label}</button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ color: pal.textDim }}><LegalDoc id={doc} /></div>
      </div>
    </div>
  );
}

export function ConsentBanner() {
  const { pal, vars } = useLegalPalette();
  const [choice, setChoice] = useState(getConsent());
  const [doc, setDoc] = useState(null);
  return (
    <>
      {!choice && (
        <div role="region" aria-label="Cookie notice" className="fixed left-3 right-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-[800] rounded-2xl p-4 shadow-2xl" style={{ ...vars, background: pal.panel, color: pal.text, border: `1px solid ${pal.border}` }}>
          <p className="text-xs leading-relaxed mb-3" style={{ color: pal.textDim }}>We keep essential data on your device so the portal works. With your OK we also use anonymous analytics to improve it. <button type="button" onClick={() => setDoc('cookies')} className="underline font-bold" style={{ color: pal.accent }}>Details</button></p>
          <div className="flex gap-2">
            <button onClick={() => { setConsent('accepted'); setChoice('accepted'); }} className="flex-1 py-2 rounded-full text-xs font-bold" style={{ background: pal.accent, color: pal.onPrimary }}>Accept</button>
            <button onClick={() => { setConsent('declined'); setChoice('declined'); }} className="flex-1 py-2 rounded-full text-xs font-bold" style={{ border: `1px solid ${pal.border}` }}>Decline</button>
          </div>
        </div>
      )}
      {doc && <LegalModal doc={doc} onClose={() => setDoc(null)} onChange={setDoc} />}
    </>
  );
}
