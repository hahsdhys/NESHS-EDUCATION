import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, User, LogOut, Search, BookOpen, Award, FileSpreadsheet,
  Pin, CheckCircle, Lock, ChevronDown, Menu, X, Clock, AlertTriangle, 
  Download, Activity, UserPlus, FolderPlus, Folder, ArrowRight,
  Plus, Edit, Trash2, Image as ImageIcon, FileText, Upload, ChevronLeft, Eye, Layout
} from 'lucide-react';

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================
const SUPER_ADMIN_EMAIL = 'marknielpaiton@gmail.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CORE_CATEGORIES = [
  { id: 'bulletin', icon: Pin, label: 'Bulletin Board' },
  { id: 'projects', icon: BookOpen, label: 'History Projects' },
  { id: 'showcase', icon: Award, label: 'Best Students' },
  { id: 'quizzes', icon: FileSpreadsheet, label: 'Quizzes & Grades' }
];

const SECTIONS_LIST = [
  '11 - STEM A', '11 - STEM B', '11 - HUMSS A', '11 - HUMSS B', '11 - TVL ICT',
  '12 - STEM A', '12 - STEM B', '12 - HUMSS A', '12 - HUMSS B', '12 - TVL ICT'
];

export default function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('neshs_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  // App & Auth States
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');     
  const [loginRole, setLoginRole] = useState('student');
  const [loginError, setLoginError] = useState('');
  const [selectedSection, setSelectedSection] = useState(SECTIONS_LIST[0]);
  const [verificationPending, setVerificationPending] = useState(false);
  const [activeTab, setActiveTab] = useState('bulletin');
  const [currentSectionView, setCurrentSectionView] = useState('All Sections');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom Sections
  const [customSections, setCustomSections] = useState([]);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [newSectionData, setNewSectionData] = useState({ title: '', category: 'bulletin' });
  const [sectionModalStep, setSectionModalStep] = useState(1);

  // Data Collections (Simulating DB)
  const [bulletins, setBulletins] = useState([
    { id: 1, folderId: null, title: 'Welcome to Academic Year 2026-2027', content: 'Classes officially begin today.', author: 'MARK NIEL PAITON', date: '2026-08-01', media: null }
  ]);
  
  const [projectFolders, setProjectFolders] = useState([
    { id: 1, folderId: null, title: 'Midterm Research Outlines' }
  ]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [activeProjectFolderId, setActiveProjectFolderId] = useState(null);

  const [students, setStudents] = useState([
    { id: 1, folderId: null, name: 'Angelica De Silva', section: '12 - STEM A', score: '98.5', achievements: 'Top Academic Performer', profilePic: null }
  ]);
  const [activeStudentId, setActiveStudentId] = useState(null);

  const [quizzes, setQuizzes] = useState([
    { id: 1, folderId: null, title: 'History Diagnostic Exam', password: '123', items: [{ qText: 'Who is the national hero?', type: 'Identification', answer: 'Jose Rizal' }] }
  ]);
  const [quizRecords, setQuizRecords] = useState([]);
  
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [quizMode, setQuizMode] = useState('list'); // 'list', 'take', 'builder', 'records'

  const [usersList, setUsersList] = useState([
    { id: 1, email: 'marknielpaiton@gmail.com', name: 'MARK NIEL PAITON', role: 'superadmin', isVerified: true, status: 'active' }
  ]);
  const [activityLog, setActivityLog] = useState([{ id: 1, action: 'System Initialized', user: 'SYSTEM', time: new Date().toISOString() }]);

  // Modals & Popups
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', type: '', data: null });
  const [permissionPopup, setPermissionPopup] = useState({ isOpen: false, pendingAction: null });
  const fileInputRef = useRef(null);

  // ==========================================
  // PERMISSIONS & UTILS
  // ==========================================
  useEffect(() => {
    if (currentUser) localStorage.setItem('neshs_session', JSON.stringify(currentUser));
    else localStorage.removeItem('neshs_session');
  }, [currentUser]);

  const isAuthenticated = !!currentUser;
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isTeacher = currentUser?.role === 'teacher';
  const isEditor = currentUser?.role === 'editor';
  const canManageGlobalContent = isSuperAdmin || (isTeacher && currentUser?.isVerified) || isEditor;

  const customSectionDetails = customSections.find(s => s.id === activeTab);
  const activeCategory = customSectionDetails ? customSectionDetails.category : activeTab;
  const activeFolderId = customSectionDetails ? activeTab : null;

  const logActivity = (action) => setActivityLog(prev => [{ id: Date.now(), action, user: currentUser?.name || 'Guest', time: new Date().toISOString() }, ...prev]);

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const emailClean = loginEmail.trim().toLowerCase();
    
    if (!emailClean) return setLoginError('Email address is required.');
    if (emailClean === SUPER_ADMIN_EMAIL.toLowerCase()) {
      setCurrentUser({ email: SUPER_ADMIN_EMAIL, name: 'MARK NIEL PAITON', role: 'superadmin', isVerified: true });
      return setVerificationPending(false);
    }
    
    if (isLoginMode) {
      const existingUser = usersList.find(u => u.email.toLowerCase() === emailClean);
      if (!existingUser) return setLoginError('Account not registered. Please sign up.');
      setCurrentUser(existingUser);
    } else {
      if (usersList.find(u => u.email.toLowerCase() === emailClean)) return setLoginError('Account already exists.');
      const newUser = { id: Date.now(), email: emailClean, name: emailClean.split('@')[0].toUpperCase(), role: loginRole, isVerified: true, section: loginRole === 'student' ? selectedSection : null, status: 'active' };
      setUsersList(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  };

  const handleLogout = () => { setCurrentUser(null); setActiveTab('bulletin'); };

  // ==========================================
  // GLOBAL CRUD HANDLERS
  // ==========================================
  const triggerFilePermission = (actionCallback) => {
    setPermissionPopup({ isOpen: true, pendingAction: actionCallback });
  };

  const confirmFilePermission = () => {
    if (permissionPopup.pendingAction) permissionPopup.pendingAction();
    setPermissionPopup({ isOpen: false, pendingAction: null });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && modalState.isOpen) setModalState({ ...modalState, data: { ...modalState.data, mediaName: file.name } });
  };

  const openModal = (type, mode, data = null) => {
    setModalState({ isOpen: true, type, mode, data: data || { folderId: activeFolderId } });
  };

  const deleteItem = (type, id) => {
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
    if (type === 'bulletin') setBulletins(prev => prev.filter(b => b.id !== id));
    if (type === 'projectFolder') setProjectFolders(prev => prev.filter(f => f.id !== id));
    if (type === 'projectFile') setProjectFiles(prev => prev.filter(f => f.id !== id));
    if (type === 'student') setStudents(prev => prev.filter(s => s.id !== id));
    if (type === 'quiz') setQuizzes(prev => prev.filter(q => q.id !== id));
    logActivity(`Deleted ${type} record (${id})`);
  };

  const saveModalData = () => {
    const { type, mode, data } = modalState;
    const payload = { ...data, id: mode === 'add' ? Date.now() : data.id };
    
    if (type === 'bulletin') {
      if (!payload.title) return alert('Title required');
      payload.author = currentUser.name;
      payload.date = new Date().toISOString().split('T')[0];
      if (mode === 'add') setBulletins(prev => [payload, ...prev]);
      else setBulletins(prev => prev.map(b => b.id === payload.id ? payload : b));
    }
    else if (type === 'projectFolder') {
      if (mode === 'add') setProjectFolders(prev => [payload, ...prev]);
      else setProjectFolders(prev => prev.map(f => f.id === payload.id ? payload : f));
    }
    else if (type === 'student') {
      if (mode === 'add') setStudents(prev => [payload, ...prev]);
      else setStudents(prev => prev.map(s => s.id === payload.id ? payload : s));
    }
    
    setModalState({ isOpen: false, mode: 'add', type: '', data: null });
    logActivity(`${mode === 'add' ? 'Created' : 'Updated'} ${type} record`);
  };

  // ==========================================
  // QUIZ ENGINE LOGIC
  // ==========================================
  const [activeQuizBuilder, setActiveQuizBuilder] = useState(null);
  const [studentQuizState, setStudentQuizState] = useState({ password: '', section: SECTIONS_LIST[0], answers: {}, hasStarted: false });

  const saveQuizBuilder = () => {
    if (activeQuizBuilder.id) setQuizzes(prev => prev.map(q => q.id === activeQuizBuilder.id ? activeQuizBuilder : q));
    else setQuizzes(prev => [...prev, { ...activeQuizBuilder, id: Date.now(), folderId: activeFolderId }]);
    setQuizMode('list');
    setActiveQuizBuilder(null);
  };

  const submitStudentQuiz = () => {
    const quiz = quizzes.find(q => q.id === activeQuizId);
    let score = 0;
    quiz.items.forEach((item, index) => {
      if (studentQuizState.answers[index]?.toLowerCase().trim() === item.answer.toLowerCase().trim()) score++;
    });
    
    const record = { id: Date.now(), quizId: quiz.id, studentName: currentUser.name, section: studentQuizState.section, score, maxScore: quiz.items.length, timestamp: new Date().toLocaleString() };
    setQuizRecords(prev => [...prev, record]);
    setQuizMode('list');
    setStudentQuizState({ password: '', section: SECTIONS_LIST[0], answers: {}, hasStarted: false });
    alert(`Quiz Submitted! Score: ${score}/${quiz.items.length}`);
  };

  // ==========================================
  // RENDERING COMPONENTS
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 mb-3"><ShieldCheck className="w-8 h-8" /></div>
            <h1 className="text-2xl font-bold text-white">NESHS EDUCATION</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Academic Learning & Management Hub</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800">
              <button type="button" onClick={() => setIsLoginMode(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${isLoginMode ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sign In</button>
              <button type="button" onClick={() => setIsLoginMode(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${!isLoginMode ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sign Up</button>
            </div>
            {loginError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">{loginError}</div>}
            <input type="email" required placeholder="Enter your @gmail.com account" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm" />
            {!isLoginMode && (
              <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="editor">Editor</option>
              </select>
            )}
            <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition-all">{isLoginMode ? 'Sign In' : 'Register'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased relative">
      
      {/* HIDDEN FILE INPUT */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx" />

      {/* PERMISSION POPUP */}
      {permissionPopup.isOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Device Access Request</h3>
            <p className="text-sm text-slate-400 mb-6">Allow website to access your device files to complete this upload.</p>
            <div className="flex gap-3">
              <button onClick={() => setPermissionPopup({ isOpen: false, pendingAction: null })} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700">Deny</button>
              <button onClick={confirmFilePermission} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-500">Allow</button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL ADD/EDIT MODAL */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h2 className="text-sm font-bold text-white capitalize">{modalState.mode} {modalState.type.replace(/([A-Z])/g, ' $1').trim()}</h2>
              <button onClick={() => setModalState({ isOpen: false, mode: 'add', type: '', data: null })} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              
              {modalState.type === 'bulletin' && (
                <>
                  <input placeholder="Title *" value={modalState.data?.title || ''} onChange={e => setModalState({ ...modalState, data: { ...modalState.data, title: e.target.value } })} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white" />
                  <textarea placeholder="Content details..." value={modalState.data?.content || ''} onChange={e => setModalState({ ...modalState, data: { ...modalState.data, content: e.target.value } })} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white h-24" />
                  <div className="border border-dashed border-slate-700 rounded-xl p-4 text-center">
                    <button onClick={() => triggerFilePermission(() => fileInputRef.current?.click())} className="text-sm text-purple-400 font-bold flex items-center justify-center gap-2 w-full"><Upload className="w-4 h-4" /> Upload Media / Document</button>
                    {modalState.data?.mediaName && <p className="text-xs text-slate-400 mt-2 truncate">{modalState.data.mediaName}</p>}
                  </div>
                </>
              )}

              {modalState.type === 'projectFolder' && (
                <input placeholder="Folder Title / Name *" value={modalState.data?.title || ''} onChange={e => setModalState({ ...modalState, data: { ...modalState.data, title: e.target.value } })} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white" />
              )}

              {modalState.type === 'student' && (
                <>
                  <input placeholder="Full Name *" value={modalState.data?.name || ''} onChange={e => setModalState({ ...modalState, data: { ...modalState.data, name: e.target.value } })} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white" />
                  <input placeholder="Baseline Score / GPA" value={modalState.data?.score || ''} onChange={e => setModalState({ ...modalState, data: { ...modalState.data, score: e.target.value } })} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white" />
                  <textarea placeholder="Achievements & Notes" value={modalState.data?.achievements || ''} onChange={e => setModalState({ ...modalState, data: { ...modalState.data, achievements: e.target.value } })} className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white h-24" />
                </>
              )}

              <button onClick={saveModalData} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all mt-4">Save Record</button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC SECTION CREATOR MODAL */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center"><h2 className="text-sm font-bold text-white"><FolderPlus className="inline w-4 h-4 text-purple-400 mr-2" /> Create Custom Section</h2><button onClick={() => setIsSectionModalOpen(false)} className="text-slate-400"><X className="w-4 h-4"/></button></div>
            <div className="p-6">
              {sectionModalStep === 1 ? (
                <div className="space-y-4">
                  <input placeholder="Section Title..." value={newSectionData.title} onChange={e => setNewSectionData({...newSectionData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  <button onClick={() => setSectionModalStep(2)} className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold">Next</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {CORE_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setNewSectionData({...newSectionData, category: cat.id})} className={`p-4 rounded-xl border text-left flex flex-col gap-2 ${newSectionData.category === cat.id ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-950 border-slate-800'}`}>
                        <cat.icon className={`w-5 h-5 ${newSectionData.category === cat.id ? 'text-purple-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold text-white">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setCustomSections(prev => [...prev, { id: `folder-${Date.now()}`, title: newSectionData.title, category: newSectionData.category }]); setIsSectionModalOpen(false); setSectionModalStep(1); setNewSectionData({title: '', category: 'bulletin'}); }} className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold">Create Section</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900/90 border-r border-slate-800 p-6 flex flex-col z-30 transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400"><ShieldCheck className="w-6 h-6" /></div>
          <div><h1 className="font-bold text-base text-white">NESHS PORTAL</h1></div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 pl-2">Core Modules</p>
          {CORE_CATEGORIES.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); setActiveProjectFolderId(null); setActiveStudentId(null); setQuizMode('list'); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${activeTab === tab.id ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300' : 'text-slate-400 hover:bg-slate-800'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
          {customSections.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-4 mb-2 pl-2">Custom Sections</p>
              {customSections.map(sec => (
                <button key={sec.id} onClick={() => { setActiveTab(sec.id); setMobileMenuOpen(false); setActiveProjectFolderId(null); setActiveStudentId(null); setQuizMode('list'); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${activeTab === sec.id ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}>
                  <Folder className="w-4 h-4" /> {sec.title}
                </button>
              ))}
            </>
          )}
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-4 mb-2 pl-2">System</p>
          <button onClick={() => setActiveTab('author')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'author' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' : 'text-slate-400 hover:bg-slate-800'}`}><User className="w-4 h-4" /> Author Profile</button>
        </div>
        {canManageGlobalContent && <button onClick={() => setIsSectionModalOpen(true)} className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-xl hover:bg-purple-600/10"><FolderPlus className="w-4 h-4" /> Add Section</button>}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-slate-900/60 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-400"><Menu className="w-5 h-5"/></button>
             <select value={currentSectionView} onChange={e => setCurrentSectionView(e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-200 text-xs py-1.5 px-3 rounded-lg outline-none">
               <option value="All Sections">All Sections</option>
               {SECTIONS_LIST.map(sec => <option key={sec} value={sec}>{sec}</option>)}
             </select>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block"><span className="text-xs font-bold text-slate-200 block">{currentUser.name}</span><span className="text-[10px] text-purple-400 uppercase">{currentUser.role}</span></div>
             <button onClick={handleLogout} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><LogOut className="w-4 h-4"/></button>
          </div>
        </header>

        <main className="p-6 max-w-5xl w-full mx-auto pb-20">
          
          {/* HEADER ROW WITH ADD BUTTON */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
              {activeCategory === 'author' ? <User className="w-6 h-6 text-amber-400" /> : <Layout className="w-6 h-6 text-purple-400" />}
              {customSectionDetails?.title || activeCategory.replace('-', ' ')}
            </h2>
            {canManageGlobalContent && activeCategory !== 'author' && activeCategory !== 'quizzes' && (
               <button onClick={() => openModal(activeCategory === 'projects' && !activeProjectFolderId ? 'projectFolder' : activeCategory === 'showcase' ? 'student' : activeCategory === 'bulletin' ? 'bulletin' : 'file', 'add')} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20">
                 <Plus className="w-4 h-4" /> Add Record
               </button>
            )}
          </div>

          {/* AUTHOR PROFILE */}
          {activeCategory === 'author' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center relative overflow-hidden">
               <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-amber-500 p-1 mb-6"><div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-4xl font-black text-white">MP</div></div>
               <h1 className="text-3xl font-extrabold text-white mb-2">MARK NIEL PAITON</h1>
               <span className="px-4 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full uppercase">Creator & Architect</span>
               <p className="text-slate-300 mt-6 max-w-lg mx-auto leading-relaxed">Visionary developer behind the NESHS EDUCATION Portal. Built to bridge the gap between complex academic administration and user-friendly digital ecosystems.</p>
            </div>
          )}

          {/* BULLETIN BOARD */}
          {activeCategory === 'bulletin' && (
            <div className="space-y-4">
              {bulletins.filter(b => b.folderId === activeFolderId).map(b => (
                <div key={b.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl relative group">
                  <h3 className="text-sm font-bold text-white mb-2">{b.title}</h3>
                  <p className="text-xs text-slate-300 mb-4">{b.content}</p>
                  {b.mediaName && <div className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-flex items-center gap-1"><FileText className="w-3 h-3"/> {b.mediaName}</div>}
                  <div className="text-[10px] text-slate-500 mt-4 uppercase">Posted by: {b.author}</div>
                  
                  {canManageGlobalContent && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal('bulletin', 'edit', b)} className="p-1.5 bg-slate-800 text-slate-300 rounded hover:text-purple-400"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => deleteItem('bulletin', b.id)} className="p-1.5 bg-slate-800 text-slate-300 rounded hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* HISTORY PROJECTS (FOLDERS & FILES) */}
          {activeCategory === 'projects' && (
             <div>
               {!activeProjectFolderId ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {projectFolders.filter(f => f.folderId === activeFolderId).map(f => (
                     <div key={f.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-purple-500/50 cursor-pointer group relative">
                       <div onClick={() => setActiveProjectFolderId(f.id)}>
                         <Folder className="w-8 h-8 text-amber-500 mb-3" />
                         <h3 className="text-sm font-bold text-white">{f.title}</h3>
                       </div>
                       {canManageGlobalContent && (
                         <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100">
                           <button onClick={() => openModal('projectFolder', 'edit', f)} className="p-1.5 bg-slate-800 rounded hover:text-purple-400 text-slate-400"><Edit className="w-4 h-4"/></button>
                           <button onClick={() => deleteItem('projectFolder', f.id)} className="p-1.5 bg-slate-800 rounded hover:text-red-400 text-slate-400"><Trash2 className="w-4 h-4"/></button>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="space-y-4">
                   <div className="flex items-center gap-3 mb-6">
                     <button onClick={() => setActiveProjectFolderId(null)} className="p-2 bg-slate-800 rounded-lg text-slate-300"><ChevronLeft className="w-4 h-4"/></button>
                     <h3 className="text-sm font-bold text-white">Folder: {projectFolders.find(f => f.id === activeProjectFolderId)?.title}</h3>
                   </div>
                   <div className="p-8 border border-dashed border-slate-700 rounded-2xl text-center flex flex-col items-center">
                      <FileText className="w-8 h-8 text-slate-500 mb-2"/>
                      <p className="text-sm text-slate-400 mb-4">Upload files into this directory.</p>
                      <button onClick={() => triggerFilePermission(() => {
                        const fakeFile = { id: Date.now(), folderId: activeProjectFolderId, name: `Upload_${Date.now()}.docx`, type: 'DOCX' };
                        setProjectFiles(prev => [...prev, fakeFile]);
                      })} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"><Upload className="inline w-4 h-4 mr-2"/> Upload File</button>
                   </div>
                   <div className="space-y-2 mt-4">
                     {projectFiles.filter(f => f.folderId === activeProjectFolderId).map(file => (
                       <div key={file.id} className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                         <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-purple-400"/><span className="text-sm font-medium text-slate-200">{file.name}</span></div>
                         <div className="flex gap-2">
                           <button onClick={() => alert('Previewing file...')} className="p-1.5 bg-slate-800 rounded hover:text-purple-400 text-slate-400"><Eye className="w-4 h-4"/></button>
                           <button onClick={() => alert('Downloading file to local device...')} className="p-1.5 bg-slate-800 rounded hover:text-blue-400 text-slate-400"><Download className="w-4 h-4"/></button>
                           {canManageGlobalContent && <button onClick={() => deleteItem('projectFile', file.id)} className="p-1.5 bg-slate-800 rounded hover:text-red-400 text-slate-400"><Trash2 className="w-4 h-4"/></button>}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
          )}

          {/* BEST STUDENTS */}
          {activeCategory === 'showcase' && (
            <div>
              {!activeStudentId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {students.filter(s => (currentSectionView === 'All Sections' || s.section === currentSectionView) && s.folderId === activeFolderId).map(s => (
                    <div key={s.id} className="p-5 bg-slate-900/80 border border-yellow-500/20 rounded-2xl relative group cursor-pointer" onClick={(e) => { if(!e.target.closest('button')) setActiveStudentId(s.id); }}>
                      <Award className="w-6 h-6 text-yellow-500/50 absolute top-4 right-4" />
                      <h3 className="text-base font-bold text-white mb-1">{s.name}</h3>
                      <p className="text-xs text-yellow-500/80 uppercase font-bold mb-3">{s.section}</p>
                      {canManageGlobalContent && (
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100">
                           <button onClick={() => deleteItem('student', s.id)} className="p-1.5 bg-slate-800 rounded hover:text-red-400 text-slate-400"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative">
                   <button onClick={() => setActiveStudentId(null)} className="absolute top-6 left-6 p-2 bg-slate-800 rounded-lg text-slate-300"><ChevronLeft className="w-4 h-4"/></button>
                   <div className="flex flex-col items-center mt-6">
                      <div className="w-24 h-24 bg-slate-800 rounded-full border-2 border-yellow-500/50 mb-4 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => triggerFilePermission(() => alert('Profile Picture Updated'))}>
                        {students.find(s=>s.id===activeStudentId)?.profilePic ? <img src="" alt="Profile"/> : <ImageIcon className="w-8 h-8 text-slate-500"/>}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{students.find(s=>s.id===activeStudentId)?.name}</h2>
                      <div className="mt-6 space-y-4 w-full max-w-md">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Baseline Score</label>
                          <p className="text-lg text-white">{students.find(s=>s.id===activeStudentId)?.score}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Achievements</label>
                          <p className="text-sm text-slate-300 mt-1 whitespace-pre-line">{students.find(s=>s.id===activeStudentId)?.achievements}</p>
                        </div>
                        {canManageGlobalContent && <button onClick={() => openModal('student', 'edit', students.find(s=>s.id===activeStudentId))} className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold mt-4"><Edit className="inline w-3 h-3 mr-2"/> Edit Details</button>}
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* QUIZZES & GRADES ENGINE */}
          {activeCategory === 'quizzes' && (
            <div>
              {quizMode === 'list' && (
                <>
                  <div className="flex justify-end mb-4">
                    {canManageGlobalContent && <button onClick={() => { setActiveQuizBuilder({ title: '', password: '', items: [] }); setQuizMode('builder'); }} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"><Plus className="inline w-4 h-4 mr-2"/> Create Quiz</button>}
                  </div>
                  <div className="grid gap-4">
                    {quizzes.filter(q => q.folderId === activeFolderId).map(q => (
                      <div key={q.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                        <div><h3 className="text-sm font-bold text-white">{q.title}</h3><p className="text-xs text-slate-400 mt-1">{q.items.length} Questions</p></div>
                        <div className="flex gap-2">
                           <button onClick={() => { setActiveQuizId(q.id); setQuizMode('take'); }} className="px-3 py-1.5 bg-green-600/20 text-green-400 text-xs font-bold rounded hover:bg-green-600/30">Take Quiz</button>
                           {canManageGlobalContent && (
                             <>
                               <button onClick={() => { setActiveQuizId(q.id); setQuizMode('records'); }} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-xs font-bold rounded hover:bg-blue-600/30">Records</button>
                               <button onClick={() => { setActiveQuizBuilder(q); setQuizMode('builder'); }} className="p-1.5 bg-slate-800 rounded text-slate-400 hover:text-purple-400"><Edit className="w-4 h-4"/></button>
                               <button onClick={() => deleteItem('quiz', q.id)} className="p-1.5 bg-slate-800 rounded text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                             </>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {quizMode === 'builder' && activeQuizBuilder && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white">Quiz Builder</h3><button onClick={() => setQuizMode('list')} className="text-slate-400"><X className="w-5 h-5"/></button></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <input placeholder="Quiz Title" value={activeQuizBuilder.title} onChange={e => setActiveQuizBuilder({...activeQuizBuilder, title: e.target.value})} className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                    <input placeholder="Access Password" value={activeQuizBuilder.password} onChange={e => setActiveQuizBuilder({...activeQuizBuilder, password: e.target.value})} className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm" />
                  </div>
                  <div className="space-y-4">
                    {activeQuizBuilder.items.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative">
                        <select value={item.type} onChange={e => { const newItems = [...activeQuizBuilder.items]; newItems[idx].type = e.target.value; setActiveQuizBuilder({...activeQuizBuilder, items: newItems}); }} className="mb-2 bg-slate-900 text-xs text-white p-1 rounded outline-none border border-slate-700">
                           <option>Multiple Choice</option><option>Identification</option><option>True/False</option>
                        </select>
                        <input placeholder="Question Text" value={item.qText} onChange={e => { const newItems = [...activeQuizBuilder.items]; newItems[idx].qText = e.target.value; setActiveQuizBuilder({...activeQuizBuilder, items: newItems}); }} className="w-full bg-transparent border-b border-slate-700 text-white text-sm mb-2 outline-none py-1" />
                        <input placeholder="Answer Key (Exact Text)" value={item.answer} onChange={e => { const newItems = [...activeQuizBuilder.items]; newItems[idx].answer = e.target.value; setActiveQuizBuilder({...activeQuizBuilder, items: newItems}); }} className="w-full bg-slate-900 border border-green-500/30 text-green-400 text-sm p-2 rounded outline-none" />
                        <button onClick={() => { const newItems = activeQuizBuilder.items.filter((_, i) => i !== idx); setActiveQuizBuilder({...activeQuizBuilder, items: newItems}); }} className="absolute top-4 right-4 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setActiveQuizBuilder({...activeQuizBuilder, items: [...activeQuizBuilder.items, {type: 'Identification', qText: '', answer: ''}]})} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl flex-1 border border-slate-700">+ Add Question</button>
                    <button onClick={saveQuizBuilder} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl flex-1">Save Quiz</button>
                  </div>
                </div>
              )}

              {quizMode === 'take' && (
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 max-w-2xl mx-auto">
                  {!studentQuizState.hasStarted ? (
                    <div className="text-center space-y-4">
                      <Lock className="w-12 h-12 text-slate-500 mx-auto mb-4"/>
                      <h3 className="text-lg font-bold text-white">Enter Quiz Credentials</h3>
                      <select value={studentQuizState.section} onChange={e => setStudentQuizState({...studentQuizState, section: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none">
                        {SECTIONS_LIST.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <input type="password" placeholder="Access Password" value={studentQuizState.password} onChange={e => setStudentQuizState({...studentQuizState, password: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none text-center" />
                      <div className="flex gap-3 pt-4">
                        <button onClick={() => setQuizMode('list')} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold">Cancel</button>
                        <button onClick={() => { if(studentQuizState.password === quizzes.find(q=>q.id===activeQuizId).password) setStudentQuizState({...studentQuizState, hasStarted: true}); else alert('Incorrect Password'); }} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold">Start Quiz</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white">{quizzes.find(q=>q.id===activeQuizId).title}</h3></div>
                      {quizzes.find(q=>q.id===activeQuizId).items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                          <p className="text-sm font-bold text-slate-200 mb-3">{idx + 1}. {item.qText}</p>
                          <input placeholder="Your Answer" value={studentQuizState.answers[idx] || ''} onChange={e => setStudentQuizState({...studentQuizState, answers: {...studentQuizState.answers, [idx]: e.target.value}})} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-sm outline-none focus:border-purple-500" />
                        </div>
                      ))}
                      <button onClick={submitStudentQuiz} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold mt-4">Submit Answers</button>
                    </div>
                  )}
                </div>
              )}

              {quizMode === 'records' && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Record Sheet: {quizzes.find(q=>q.id===activeQuizId)?.title}</h3>
                    <button onClick={() => setQuizMode('list')} className="text-slate-400"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr><th className="p-3">Student</th><th className="p-3">Section</th><th className="p-3">Score</th><th className="p-3">Timestamp</th></tr>
                      </thead>
                      <tbody>
                        {quizRecords.filter(r => r.quizId === activeQuizId && (currentSectionView === 'All Sections' || r.section === currentSectionView)).map(r => (
                          <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="p-3 font-bold text-white">{r.studentName}</td>
                            <td className="p-3">{r.section}</td>
                            <td className="p-3 font-bold text-green-400">{r.score} / {r.maxScore}</td>
                            <td className="p-3 text-[10px] text-slate-500">{r.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {quizRecords.filter(r => r.quizId === activeQuizId).length === 0 && <p className="text-center text-slate-500 py-6 text-sm">No submissions recorded yet.</p>}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}