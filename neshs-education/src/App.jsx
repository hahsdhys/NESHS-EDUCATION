import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  LogOut,
  Bell,
  Search,
  BookOpen,
  Award,
  FileSpreadsheet,
  Pin,
  Trash2,
  Plus,
  Upload,
  CheckCircle,
  XCircle,
  Lock,
  ChevronDown,
  Menu,
  X,
  Clock,
  Send,
  AlertTriangle,
  Download
} from 'lucide-react';

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================
const SUPER_ADMIN_EMAIL = 'marknielpaiton@gmail.com';

const INITIAL_BULLETINS = [
  {
    id: 1,
    title: 'Welcome to Academic Year 2026-2027',
    content: 'Classes officially begin today. Please review your section schedules and course outlines.',
    author: 'MARK NIEL PAITON (Creator)',
    date: '2026-08-01',
    pinned: true
  },
  {
    id: 2,
    title: 'Quarter 1 Assessment Schedule',
    content: 'The initial portal assessment schedules for STEM and HUMSS sections have been published.',
    author: 'Academic Directorate',
    date: '2026-08-05',
    pinned: false
  }
];

const INITIAL_PROJECTS = [
  { id: 1, title: 'Quarter 1 Capstone Research Outline', section: '12 - STEM A', deadline: '2026-08-20', submissions: 14, fileType: 'PDF' },
  { id: 2, title: 'Contemporary Arts Digital Portfolio', section: '11 - HUMSS B', deadline: '2026-08-25', submissions: 22, fileType: 'ZIP' }
];

const INITIAL_SHOWCASE = [
  { id: 1, name: 'Angelica De Silva', section: '12 - STEM A', gpa: '98.5', achievement: 'Top Academic Performer - Science & Tech' },
  { id: 2, name: 'John Robert Mendoza', section: '11 - HUMSS B', gpa: '97.8', achievement: 'Excellence in Humanities & Communication' }
];

const INITIAL_QUIZZES = [
  { id: 1, title: 'General Physics 1 - Diagnostic Exam', section: '12 - STEM A', maxScore: 50, avgScore: 44.2 },
  { id: 2, title: 'Oral Communication Assessment', section: '11 - HUMSS B', maxScore: 30, avgScore: 26.8 }
];

const SECTIONS_LIST = [
  '11 - STEM A', '11 - STEM B', '11 - HUMSS A', '11 - HUMSS B', '11 - TVL ICT',
  '12 - STEM A', '12 - STEM B', '12 - HUMSS A', '12 - HUMSS B', '12 - TVL ICT'
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');     
  const [loginRole, setLoginRole] = useState('student');
  const [loginError, setLoginError] = useState('');

  const [selectedSection, setSelectedSection] = useState(SECTIONS_LIST[0]);
  const [idFile, setIdFile] = useState(null);
  const [idFileName, setIdFileName] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);

  const [activeTab, setActiveTab] = useState('bulletin');
  const [currentSectionView, setCurrentSectionView] = useState('All Sections');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'System Update: Google OAuth & Verified Teacher Workflow integrated.', time: '10m ago', unread: true },
    { id: 2, text: 'New student submissions recorded in 12 - STEM A.', time: '1h ago', unread: true }
  ]);

  const [bulletins, setBulletins] = useState(INITIAL_BULLETINS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [showcase, setShowcase] = useState(INITIAL_SHOWCASE);
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);

  const [usersList, setUsersList] = useState([
    { id: 1, email: 'marknielpaiton@gmail.com', name: 'MARK NIEL PAITON', role: 'superadmin', isVerified: true },
    { id: 2, email: 'teacher.sample@neshs.edu.ph', name: 'Maria Santos', role: 'teacher', isVerified: true },
    { id: 3, email: 'student.sample@gmail.com', name: 'Juan Cruz', role: 'student', isVerified: true, section: '12 - STEM A' }
  ]);
  const [pendingVerifications, setPendingVerifications] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isAuthenticated = !!currentUser;
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isTeacher = currentUser?.role === 'teacher';
  const isEditor = currentUser?.role === 'editor';
  const isStudent = currentUser?.role === 'student';

  const canManageGlobalContent = isSuperAdmin || (isTeacher && currentUser?.isVerified) || isEditor;

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Email address is required.');
      return;
    }

    const emailClean = loginEmail.trim().toLowerCase();

    if (emailClean === SUPER_ADMIN_EMAIL.toLowerCase()) {
      const adminUser = {
        email: SUPER_ADMIN_EMAIL,
        name: 'MARK NIEL PAITON',
        role: 'superadmin',
        isVerified: true
      };
      setCurrentUser(adminUser);
      setVerificationPending(false);
      return;
    }

    if (!emailClean.endsWith('@gmail.com') && !emailClean.endsWith('@neshs.edu.ph')) {
      setLoginError('Authentication restricted: Please sign in with a valid Gmail or NESHS Institutional account.');
      return;
    }

    if (isLoginMode) {
      const existingUser = usersList.find((u) => u.email.toLowerCase() === emailClean);
      
      if (!existingUser) {
        setLoginError('Account not registered. Please sign up or contact administrator MARK NIEL PAITON.');
        return;
      }

      if (existingUser.role === 'teacher' && !existingUser.isVerified) {
        setVerificationPending(true);
        return;
      }

      setCurrentUser(existingUser);
      setVerificationPending(false);
      return;
    }

    const userExists = usersList.find((u) => u.email.toLowerCase() === emailClean);
    if (userExists) {
      setLoginError('Account already exists. Please switch to Sign In.');
      return;
    }

    const generatedName = emailClean.split('@')[0].replace('.', ' ').toUpperCase();

    if (loginRole === 'teacher') {
      if (!idFile) {
        setLoginError('Teacher ID document required for institutional verification.');
        return;
      }
      
      const newPending = {
        id: Date.now(),
        email: emailClean,
        name: generatedName,
        role: 'teacher',
        fileName: idFileName,
        uploadedAt: new Date().toLocaleTimeString(),
        isVerified: false
      };
      
      setPendingVerifications([...pendingVerifications, newPending]);
      setUsersList([...usersList, { ...newPending }]);
      setVerificationPending(true);
      
    } else if (loginRole === 'student') {
      const studentUser = {
        id: Date.now(),
        email: emailClean,
        name: generatedName,
        role: 'student',
        section: selectedSection,
        isVerified: true
      };
      setUsersList([...usersList, studentUser]);
      setCurrentUser(studentUser);
      setVerificationPending(false);
      
    } else if (loginRole === 'editor') {
      const editorUser = {
        id: Date.now(),
        email: emailClean,
        name: generatedName,
        role: 'editor',
        isVerified: true
      };
      setUsersList([...usersList, editorUser]);
      setCurrentUser(editorUser);
      setVerificationPending(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setLoginRole('student');
    setIdFile(null);
    setIdFileName('');
    setVerificationPending(false);
    setLoginError('');
    setActiveTab('bulletin');
  };

  const handleApproveTeacher = (pendingId) => {
    const item = pendingVerifications.find((p) => p.id === pendingId);
    if (!item) return;

    setUsersList((prev) => 
      prev.map(u => u.email === item.email ? { ...u, isVerified: true } : u)
    );
    
    setPendingVerifications(pendingVerifications.filter((p) => p.id !== pendingId));
    
    setNotifications([
      { id: Date.now(), text: `Teacher account approved for ${item.email}`, time: 'Just now', unread: true },
      ...notifications
    ]);
  };

  const handleRejectTeacher = (pendingId) => {
    const item = pendingVerifications.find((p) => p.id === pendingId);
    if (item) {
      setUsersList((prev) => prev.filter(u => u.email !== item.email));
    }
    setPendingVerifications(pendingVerifications.filter((p) => p.id !== pendingId));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          alert('Immunity Protected: The Super Admin Creator account cannot be modified or demoted.');
          return u;
        }
        return u.id === userId ? { ...u, role: newRole } : u;
      })
    );
  };

  const handleDeleteUser = (userId, userEmail) => {
    if (userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      alert('Immunity Protected: The Super Admin Creator account cannot be deleted.');
      return;
    }
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleTogglePinBulletin = (id) => {
    if (!canManageGlobalContent) return;
    setBulletins(
      bulletins.map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b))
    );
  };

  const handleDeleteBulletin = (id) => {
    if (!canManageGlobalContent) return;
    setBulletins(bulletins.filter((b) => b.id !== id));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (modalType === 'bulletin') {
      const newB = {
        id: Date.now(),
        title: formData.title || 'Untitled Bulletin',
        content: formData.content || '',
        author: currentUser?.name || 'Administrator',
        date: new Date().toISOString().split('T')[0],
        pinned: false
      };
      setBulletins([newB, ...bulletins]);
    } else if (modalType === 'project') {
      const newP = {
        id: Date.now(),
        title: formData.title || 'Untitled Project',
        section: formData.section || currentSectionView,
        deadline: formData.deadline || '2026-09-01',
        submissions: 0,
        fileType: formData.fileType || 'PDF'
      };
      setProjects([newP, ...projects]);
    } else if (modalType === 'showcase') {
      const newS = {
        id: Date.now(),
        name: formData.name || 'Student Name',
        section: formData.section || currentSectionView,
        gpa: formData.gpa || '95.0',
        achievement: formData.achievement || 'Academic Honor'
      };
      setShowcase([newS, ...showcase]);
    } else if (modalType === 'quiz') {
      const newQ = {
        id: Date.now(),
        title: formData.title || 'New Assessment',
        section: formData.section || currentSectionView,
        maxScore: Number(formData.maxScore) || 50,
        avgScore: 0
      };
      setQuizzes([newQ, ...quizzes]);
    }
    setIsAddModalOpen(false);
    setFormData({});
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">NESHS EDUCATION</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Academic Learning & Management Hub</p>
          </div>

          {verificationPending ? (
            <div className="text-center space-y-4 py-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 text-amber-400 animate-pulse" />
                <p className="font-semibold text-base mb-1">Teacher Verification Pending</p>
                <p className="text-xs text-slate-300">
                  Your verification document has been securely received. <strong>MARK NIEL PAITON</strong> (Super Admin Creator) will inspect your record in the Access Queue. Access is restricted until approved.
                </p>
              </div>
              <button
                onClick={() => {
                  setVerificationPending(false);
                  setLoginEmail('');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              
              <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(true); setLoginError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isLoginMode ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(false); setLoginError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isLoginMode ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your @gmail.com account"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                />
              </div>

              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Account Role</label>
                  <select
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher (Requires ID)</option>
                    <option value="editor">Editor / Content Manager</option>
                  </select>
                </div>
              )}

              {!isLoginMode && loginRole === 'student' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Designated Class Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  >
                    {SECTIONS_LIST.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              )}

              {!isLoginMode && loginRole === 'teacher' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Upload School ID / Verification Document</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 text-center transition-colors bg-slate-950/30 cursor-pointer relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIdFile(file);
                          setIdFileName(file.name);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <span className="text-xs text-slate-300 font-medium block">
                      {idFileName ? idFileName : 'Click or Drag JPG, PNG, PDF (Max 5MB)'}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoginMode ? 'Sign In with Google' : 'Register Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased">
      <div className="md:hidden bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <span className="font-bold text-sm tracking-wide text-white">NESHS EDUCATION</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900/90 border-r border-purple-500/10 p-6 flex flex-col justify-between z-30 transition-transform duration-200 backdrop-blur-xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          <div className="hidden md:flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">NESHS PORTAL</h1>
              <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase block">Academic Hub</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('bulletin'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'bulletin'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Pin className="w-4 h-4" /> Bulletin Board
            </button>

            <button
              onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" /> History Projects
            </button>

            <button
              onClick={() => { setActiveTab('showcase'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'showcase'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" /> Best Students
            </button>

            <button
              onClick={() => { setActiveTab('quizzes'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'quizzes'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Quizzes & Grades
            </button>

            {isAuthenticated && (
              <button
                onClick={() => { setActiveTab('access'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'access'
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" /> Access Panel
                </div>
                {pendingVerifications.length > 0 && (
                  <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {pendingVerifications.length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 hover:border-purple-500/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Quick Search
            </span>
            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-mono">⌘K</kbd>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-900/60 border-b border-purple-500/10 px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase text-slate-400 hidden sm:inline">Section Filter:</span>
            <div className="relative">
              <select
                value={currentSectionView}
                onChange={(e) => setCurrentSectionView(e.target.value)}
                className="appearance-none bg-slate-950/80 border border-purple-500/20 text-slate-200 text-xs font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="All Sections">All Sections</option>
                {SECTIONS_LIST.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/40 border border-slate-800 hover:border-purple-500/30 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                    <button
                      onClick={() => setNotifications(notifications.map((n) => ({ ...n, unread: false })))}
                      className="text-[10px] text-purple-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1">
                        <p className="text-slate-300">{n.text}</p>
                        <span className="text-[10px] text-slate-500 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-200 block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-purple-400 uppercase font-semibold block">{currentUser.role}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'bulletin' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Bulletin & Announcements</h2>
                  <p className="text-xs text-slate-400">Institutional notices and updates</p>
                </div>
                {canManageGlobalContent && (
                  <button
                    onClick={() => { setModalType('bulletin'); setIsAddModalOpen(true); }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Post Bulletin
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bulletins.map((b) => (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl bg-slate-900/60 border transition-all relative ${
                      b.pinned ? 'border-purple-500/50 shadow-lg shadow-purple-500/5' : 'border-slate-800'
                    }`}
                  >
                    {b.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-semibold mb-3">
                        <Pin className="w-3 h-3" /> Pinned Notice
                      </span>
                    )}

                    <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{b.content}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800">
                      <span>{b.author} • {b.date}</span>
                      {canManageGlobalContent && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePinBulletin(b.id)}
                            className="p-1 text-slate-400 hover:text-purple-400"
                            title="Pin / Unpin"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBulletin(b.id)}
                            className="p-1 text-slate-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">History & Course Projects</h2>
                  <p className="text-xs text-slate-400">Class submissions and project management</p>
                </div>
                {canManageGlobalContent && (
                  <button
                    onClick={() => { setModalType('project'); setIsAddModalOpen(true); }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Create Project
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects
                  .filter((p) => currentSectionView === 'All Sections' || p.section === currentSectionView)
                  .map((p) => (
                    <div key={p.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {p.section}
                          </span>
                          <h3 className="text-base font-bold text-white mt-2">{p.title}</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {p.fileType}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span>Deadline: {p.deadline}</span>
                        <span>{p.submissions} Submissions</span>
                      </div>

                      {isStudent && (
                        <button
                          onClick={() => alert(`Opening submission dialog for ${p.title}`)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Work
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'showcase' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Best Student Showcase</h2>
                  <p className="text-xs text-slate-400">Academic honors and top per section</p>
                </div>
                {canManageGlobalContent && (
                  <button
                    onClick={() => { setModalType('showcase'); setIsAddModalOpen(true); }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Student Honor
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {showcase
                  .filter((s) => currentSectionView === 'All Sections' || s.section === currentSectionView)
                  .map((s) => (
                    <div key={s.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3 relative overflow-hidden">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-inner">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{s.name}</h3>
                        <p className="text-xs text-purple-400 font-semibold">{s.section}</p>
                      </div>
                      <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">General Average</span>
                        <span className="text-lg font-extrabold text-amber-400">{s.gpa}%</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">{s.achievement}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Quizzes & Gradebook Module</h2>
                  <p className="text-xs text-slate-400">Section assessment records and exports</p>
                </div>
                {canManageGlobalContent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Exporting Gradebook report to CSV format...')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                    <button
                      onClick={() => { setModalType('quiz'); setIsAddModalOpen(true); }}
                      className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Quiz
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-4">Quiz Title</th>
                      <th className="p-4">Section</th>
                      <th className="p-4">Max Points</th>
                      <th className="p-4">Average Score</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {quizzes
                      .filter((q) => currentSectionView === 'All Sections' || q.section === currentSectionView)
                      .map((q) => (
                        <tr key={q.id} className="hover:bg-slate-800/30">
                          <td className="p-4 font-semibold text-white">{q.title}</td>
                          <td className="p-4 text-slate-300">{q.section}</td>
                          <td className="p-4 text-slate-300">{q.maxScore} pts</td>
                          <td className="p-4 text-amber-400 font-bold">{q.avgScore} pts</td>
                          <td className="p-4 text-right">
                            {isStudent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                                <Lock className="w-3 h-3" /> Section Locked
                              </span>
                            ) : (
                              <button
                                onClick={() => alert(`Opening grade entry view for ${q.title}`)}
                                className="px-2.5 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-[11px] font-semibold hover:bg-purple-600/30 transition-all"
                              >
                                Edit Grades
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'access' && isAuthenticated && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" /> Pending Teacher Verification Queue
                    </h2>
                    <p className="text-xs text-slate-400">Submitted school credentials awaiting creator approval</p>
                  </div>
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-semibold">
                    {pendingVerifications.length} Pending
                  </span>
                </div>

                {pendingVerifications.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                    No pending teacher approval requests in queue.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingVerifications.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">{p.email}</p>
                          <p className="text-[11px] text-slate-400">Document: {p.fileName} • Uploaded at {p.uploadedAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveTeacher(p.id)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectTeacher(p.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" /> User Permissions & Role Management
                  </h2>
                  <p className="text-xs text-slate-400">Code-level immunity enforced for Super Admin Creator (MARK NIEL PAITON)</p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-4">User Email</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {usersList.map((u) => {
                        const isImmune = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/30">
                            <td className="p-4 font-semibold text-white flex items-center gap-2">
                              {u.email}
                              {isImmune && (
                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                                  Immune Creator
                                </span>
                              )}
                              {!u.isVerified && u.role === 'teacher' && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-300">{u.name}</td>
                            <td className="p-4">
                              <select
                                disabled={isImmune || !isSuperAdmin}
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 disabled:opacity-50"
                              >
                                <option value="superadmin">SuperAdmin</option>
                                <option value="teacher">Teacher</option>
                                <option value="editor">Editor</option>
                                <option value="student">Student</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                disabled={isImmune || !isSuperAdmin}
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 z-50">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-purple-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search bulletins, projects, or students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2">System Quick Actions</p>
              <div
                onClick={() => { setActiveTab('bulletin'); setCommandPaletteOpen(false); }}
                className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center gap-2 text-slate-300"
              >
                <Pin className="w-3.5 h-3.5 text-purple-400" /> View Bulletin Board
              </div>
              <div
                onClick={() => { setActiveTab('projects'); setCommandPaletteOpen(false); }}
                className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center gap-2 text-slate-300"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Open History Projects
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Add New {modalType}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Title / Name</label>
                <input
                  type="text"
                  required
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {modalType === 'bulletin' && (
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Content</label>
                  <textarea
                    rows={3}
                    required
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  ></textarea>
                </div>
              )}

              {(modalType === 'project' || modalType === 'showcase' || modalType === 'quiz') && (
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Designated Section</label>
                  <select
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    {SECTIONS_LIST.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              )}

              {modalType === 'showcase' && (
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">GPA / Honor Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 98.5 / Top Performer"
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value, achievement: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/20"
              >
                Confirm and Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}