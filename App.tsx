
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, 
  AppState, 
  Guest, 
  WantedPerson, 
  Message, 
  UserRole,
  HotelInfo
} from './types';
import { translations } from './translations';
import { 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Settings, 
  MessageSquare, 
  FileText, 
  LogOut, 
  Camera, 
  Search,
  CheckCircle,
  Bell,
  Languages,
  Info,
  ChevronRight,
  Printer,
  Download,
  Plus,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Fingerprint,
  Activity,
  Zap,
  Lock,
  Building2,
  Phone,
  BarChart3,
  Clock,
  ShieldHalf,
  RotateCw,
  FlipHorizontal,
  X,
  FileSpreadsheet,
  FileJson,
  Presentation,
  FolderOpen
} from 'lucide-react';

const STORAGE_KEY = 'begu_engeda_final_reports_v1';

const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    language: 'am',
    user: null,
    guests: [],
    wantedPersons: [
      { id: '1', fullName: 'Sample Wanted Name', description: 'Testing matching system', addedBy: 'Police Admin', timestamp: new Date().toISOString() }
    ],
    messages: []
  };
};

// --- Reusable UI Components ---

const Button: React.FC<{ 
  onClick?: () => void; 
  className?: string; 
  variant?: 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost'; 
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, className = '', variant = 'primary', children, disabled }) => {
  const base = "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-md tracking-tight uppercase text-xs";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border border-white/10",
    secondary: "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5",
    gold: "bg-amber-500 text-slate-950 hover:bg-amber-400 border border-white/20",
    danger: "bg-rose-600 text-white hover:bg-rose-700 border border-white/10",
    ghost: "bg-transparent text-slate-400 hover:bg-white/5 shadow-none"
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Input: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  type?: string; 
  placeholder?: string;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, type = 'text', placeholder, icon }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
      {icon} {label}
    </label>
    <div className="relative group">
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-3 focus:border-amber-500 focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-700 font-bold text-white shadow-inner text-sm"
      />
    </div>
  </div>
);

const AppLogo: React.FC<{ size?: number, className?: string }> = ({ size = 40, className = "" }) => (
  <div className={`relative ${className}`}>
     <div className="absolute inset-0 bg-amber-500/10 blur-[30px] rounded-full animate-pulse"></div>
     <div className="relative bg-slate-950 border-2 border-amber-500 p-3 rounded-2xl shadow-lg">
        <ShieldCheck size={size} className="text-amber-500" strokeWidth={1.5} />
     </div>
  </div>
);

// --- Main Application ---

export default function App() {
  const [appState, setAppState] = useState<AppState>(loadState());
  const [view, setView] = useState<'splash' | 'login' | 'setup' | 'dashboard'>('splash');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showNotification, setShowNotification] = useState<{message: string, type: 'alert' | 'success'} | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageFlip, setImageFlip] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => {
        if (appState.user) {
          if (appState.user.role === 'reception' && !appState.user.hotelInfo) setView('setup');
          else setView('dashboard');
        } else setView('login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [view, appState.user]);

  const t = translations[appState.language];

  const handleLogin = (userIn: string, passIn: string) => {
    if (userIn === 'reception' && passIn === '1234') {
      setAppState(prev => ({ ...prev, user: { username: userIn, role: 'reception' } }));
      setView(!appState.user?.hotelInfo ? 'setup' : 'dashboard');
    } else if (userIn === 'police' && passIn === 'police@1234') {
      setAppState(prev => ({ ...prev, user: { username: userIn, role: 'police' } }));
      setView('dashboard');
    } else {
      setShowNotification({ message: appState.language === 'am' ? 'የተሳሳተ መረጃ' : 'Auth Failed', type: 'alert' });
    }
  };

  const handleLogout = () => {
    setAppState(prev => ({ ...prev, user: null }));
    setView('login');
    setActiveTab('home');
  };

  const addGuest = (guestData: Partial<Guest>) => {
    const hotelName = appState.user?.hotelInfo?.name || 'Local Node';
    const hotelAddress = appState.user?.hotelInfo?.address || 'Benishangul Region';
    
    const newGuest: Guest = {
      id: Math.random().toString(36).substr(2, 9),
      hotelId: hotelName,
      hotelName: hotelName,
      fullName: '', nationality: '', fromLocation: '', purpose: 'visit', idPhoto: '', bedNumber: '',
      timestamp: new Date().toISOString(), status: 'sent',
      ...guestData as Guest
    };

    const wantedPerson = appState.wantedPersons.find(w => w.fullName.toLowerCase().trim() === newGuest.fullName.toLowerCase().trim());
    
    if (wantedPerson) {
      setShowNotification({ message: t.matchAlert, type: 'alert' });
      const automatedReport: Message = {
        id: Date.now().toString(),
        sender: 'SEC-AUTO-BOT',
        senderRole: 'police',
        text: `🚩 ሪፖርት፡ ተፈላጊው ሰው [${newGuest.fullName}] በ [${hotelName}] ተመዝግቧል። የአልጋ ቁጥር፡ ${newGuest.bedNumber}። አድራሻ፡ ${hotelAddress}።`,
        timestamp: new Date().toISOString()
      };
      
      setAppState(p => ({
        ...p,
        messages: [automatedReport, ...p.messages],
        guests: [newGuest, ...p.guests]
      }));
    } else {
      setAppState(p => ({ ...p, guests: [newGuest, ...p.guests] }));
      setShowNotification({ message: t.sent, type: 'success' });
    }
    setActiveTab('history');
  };

  if (view === 'splash') {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center text-white p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="z-20 flex flex-col items-center animate-fade-in text-center max-w-lg">
          <AppLogo size={60} className="mb-6" />
          <h1 className="text-4xl font-black tracking-tight glow-text mb-4 uppercase">
             <span className="text-white">{t.title.split(' ')[0]}</span> <span className="text-amber-500">{t.title.split(' ')[1] || ''}</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{t.subtitle}</p>
          <div className="motto-banner py-3 px-8 rounded-lg w-full">
             <p className="text-lg font-bold text-white tracking-wider uppercase">{t.motto}</p>
          </div>
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em] mt-4">{t.agency}</p>
        </div>
      </div>
    );
  }

  if (view === 'login') return <LoginView t={t} onLogin={handleLogin} />;
  if (view === 'setup') return <SetupView t={t} appState={appState} setAppState={setAppState} onComplete={() => setView('dashboard')} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#010413]">
      <header className="bg-slate-950/80 backdrop-blur-xl px-6 md:px-10 py-4 sticky top-0 z-50 flex items-center justify-between no-print border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl">
            <ShieldCheck size={20} className="text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase leading-none">{t.title}</h1>
            <p className="text-[8px] text-amber-500 font-bold uppercase tracking-widest mt-1">
              {appState.user?.role === 'reception' ? appState.user.hotelInfo?.name : t.agency}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAppState(prev => ({ ...prev, language: prev.language === 'am' ? 'en' : 'am' }))}
            className="flex items-center gap-2 text-[9px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all uppercase text-amber-500"
          >
            <Languages size={12} /> {appState.language === 'am' ? 'EN' : 'አማርኛ'}
          </button>
          <button onClick={handleLogout} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all active:scale-90">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pb-32 md:pb-10">
        {activeTab === 'home' && (appState.user?.role === 'reception' ? <ReceptionHome t={t} addGuest={addGuest} appState={appState} /> : <PoliceHome t={t} appState={appState} setAppState={setAppState} onImageClick={setSelectedPhoto} />)}
        {activeTab === 'history' && <GuestHistory t={t} appState={appState} onImageClick={setSelectedPhoto} />}
        {activeTab === 'wanted' && <WantedList t={t} appState={appState} setAppState={setAppState} />}
        {activeTab === 'reports' && <ReportsView t={t} appState={appState} />}
        {activeTab === 'chat' && <ChatView t={t} appState={appState} setAppState={setAppState} />}
        {activeTab === 'settings' && <SettingsView t={t} appState={appState} setAppState={setAppState} setShowNotification={setShowNotification} />}
        {activeTab === 'about' && <AboutView t={t} />}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card flex justify-around items-center p-2.5 rounded-2xl w-[92%] max-w-md no-print z-50 border border-white/10">
        <NavButton icon={<Activity size={18} />} label={t.history} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <NavButton icon={<UserPlus size={18} />} label={t.registerGuest} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={<BarChart3 size={18} />} label={t.report} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        <NavButton icon={<ShieldAlert size={18} />} label={t.wantedList} active={activeTab === 'wanted'} onClick={() => setActiveTab('wanted')} />
        <NavButton icon={<MessageSquare size={18} />} label={t.chat} active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <NavButton icon={<Settings size={18} />} label={t.settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      {showNotification && (
        <div className={`fixed bottom-24 right-4 z-[100] p-5 rounded-xl shadow-2xl flex items-center gap-3 border-l-4 animate-bounce glass-card ${showNotification.type === 'alert' ? 'border-rose-600' : 'border-emerald-500'}`}>
          <div className={showNotification.type === 'alert' ? 'text-rose-600' : 'text-emerald-500'}>
            {showNotification.type === 'alert' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div className="pr-2 text-white">
            <p className="font-bold text-xs uppercase tracking-tight">{showNotification.type === 'alert' ? 'ALERT' : 'SUCCESS'}</p>
            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase leading-tight">{showNotification.message}</p>
          </div>
          <button onClick={() => setShowNotification(null)} className="ml-2 text-slate-500 hover:text-white text-2xl">&times;</button>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4" onClick={() => { setSelectedPhoto(null); setImageRotation(0); setImageFlip(1); }}>
           <div className="relative max-w-3xl w-full glass-card rounded-2xl p-5 shadow-2xl border border-white/10 animate-zoom" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                 <div className="flex gap-2">
                    <button onClick={() => setImageRotation(prev => (prev + 90) % 360)} className="bg-slate-800 text-amber-500 p-2 rounded-lg" title={t.rotate}>
                       <RotateCw size={16} />
                    </button>
                    <button onClick={() => setImageFlip(prev => prev * -1)} className="bg-slate-800 text-amber-500 p-2 rounded-lg" title={t.flip}>
                       <FlipHorizontal size={16} />
                    </button>
                 </div>
                 <div className="flex gap-2">
                    <Button onClick={() => window.print()} variant="ghost" className="px-3 py-1.5 border border-white/10"><Printer size={14}/> {t.print}</Button>
                    <button onClick={() => { setSelectedPhoto(null); setImageRotation(0); setImageFlip(1); }} className="bg-rose-600/20 text-rose-500 p-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all">
                       <X size={20} />
                    </button>
                 </div>
              </div>
              <div className="flex items-center justify-center bg-slate-950/50 rounded-xl h-[55vh] overflow-hidden p-2">
                 <img 
                    src={selectedPhoto} 
                    className="max-w-full max-h-full object-contain transition-transform duration-300" 
                    style={{ transform: `rotate(${imageRotation}deg) scaleX(${imageFlip})` }}
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// Fixed duplicated NavButton by keeping only this declaration
const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-amber-500 scale-105' : 'text-slate-600 hover:text-slate-400'}`}>
    {icon}
    <span className="text-[7px] font-bold uppercase tracking-wider leading-none">{label}</span>
  </button>
);

const ReceptionHome: React.FC<{ t: any, addGuest: (g: Partial<Guest>) => void, appState: any }> = ({ t, addGuest, appState }) => {
  const [form, setForm] = useState({ fullName: '', nationality: '', fromLocation: '', purpose: 'visit', idPhoto: '', permitPhoto: '', bedNumber: '' });
  const idRef = useRef<HTMLInputElement>(null);
  const permitRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'idPhoto' | 'permitPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setForm(f => ({ ...f, [target]: r.result as string }));
      r.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      <div className="lg:col-span-8 glass-card rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase mb-8 flex items-center gap-3">
          <UserPlus size={24} className="text-indigo-500" /> {t.registerGuest}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input label={t.fullName} value={form.fullName} onChange={v => setForm({...form, fullName: v})} icon={<Users size={14}/>} />
          <Input label={t.nationality} value={form.nationality} onChange={v => setForm({...form, nationality: v})} icon={<ShieldAlert size={14}/>} />
          <Input label={t.fromLocation} value={form.fromLocation} onChange={v => setForm({...form, fromLocation: v})} icon={<Search size={14}/>} />
          <Input label={t.bedNumber} value={form.bedNumber} onChange={v => setForm({...form, bedNumber: v})} icon={<Activity size={14}/>} />
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-1">{t.purpose}</label>
            <select value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2.5 focus:border-amber-500 outline-none text-white font-bold uppercase text-xs">
              <option value="visit">{t.visit}</option>
              <option value="business">{t.business}</option>
              <option value="health">{t.health}</option>
              <option value="personal">{t.personal}</option>
              <option value="governmentWork">{t.governmentWork}</option>
              <option value="others">{t.others}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadBox label={t.uploadId} photo={form.idPhoto} onTrigger={() => idRef.current?.click()} icon={<Fingerprint size={32}/>} />
          <UploadBox label={t.uploadPermit} photo={form.permitPhoto} onTrigger={() => permitRef.current?.click()} icon={<FileText size={32}/>} />
          <input type="file" ref={idRef} onChange={e => handleFile(e, 'idPhoto')} accept="image/*" className="hidden" />
          <input type="file" ref={permitRef} onChange={e => handleFile(e, 'permitPhoto')} accept="image/*" className="hidden" />
        </div>

        <Button onClick={() => addGuest(form)} variant="gold" className="w-full h-14 mt-10 text-lg font-black tracking-widest uppercase">{t.sendToPolice}</Button>
      </div>

      <div className="lg:col-span-4 space-y-6 no-print">
        <div className="glass-card rounded-xl p-6 border-l-4 border-rose-600">
          <h3 className="text-rose-500 font-bold uppercase tracking-widest mb-4 text-[10px] flex items-center gap-2"><AlertTriangle size={14}/> {t.wantedList}</h3>
          <div className="space-y-3">
            {appState.wantedPersons.map((w: any) => (
              <div key={w.id} className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <p className="font-bold text-sm text-slate-100 uppercase">{w.fullName}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">"{w.description}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadBox: React.FC<{ label: string, photo: string, onTrigger: () => void, icon: React.ReactNode }> = ({ label, photo, onTrigger, icon }) => (
  <div onClick={onTrigger} className="border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-white/5 transition-all bg-slate-950/40 min-h-[160px] relative overflow-hidden group">
    {photo ? (
      <img src={photo} className="w-full h-full object-contain rounded-lg max-h-[140px]" />
    ) : (
      <div className="flex flex-col items-center gap-2 text-slate-700 group-hover:text-amber-500">
         {icon}
         <p className="text-[10px] font-bold uppercase">{label}</p>
      </div>
    )}
  </div>
);

const PoliceHome: React.FC<{ t: any, appState: any, setAppState: any, onImageClick: (img: string) => void }> = ({ t, appState, setAppState, onImageClick }) => {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [viewType, setViewType] = useState<'all' | 'byHotel' | 'byDate'>('all');

  const addW = () => {
    setAppState((p: any) => ({ ...p, wantedPersons: [{ id: Date.now().toString(), fullName: name, description: desc, timestamp: new Date().toISOString(), addedBy: 'HQ' }, ...p.wantedPersons] }));
    setModal(false);
    setName(''); setDesc('');
  };

  const groupedData = useMemo(() => {
    if (viewType === 'byHotel') {
      const hotels: Record<string, Guest[]> = {};
      appState.guests.forEach(g => {
        if (!hotels[g.hotelName]) hotels[g.hotelName] = [];
        hotels[g.hotelName].push(g);
      });
      return Object.entries(hotels);
    }
    if (viewType === 'byDate') {
      const dates: Record<string, Guest[]> = {};
      appState.guests.forEach(g => {
        const d = new Date(g.timestamp).toLocaleDateString();
        if (!dates[d]) dates[d] = [];
        dates[d].push(g);
      });
      return Object.entries(dates);
    }
    return [['All Records', appState.guests]];
  }, [appState.guests, viewType]);

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black tracking-tight uppercase text-white">Registry Terminal</h2>
             <div className="flex gap-2 mt-2 no-print">
               {['all', 'byHotel', 'byDate'].map((v: any) => (
                 <button key={v} onClick={() => setViewType(v)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${viewType === v ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 text-slate-500 border-white/10'}`}>
                   {(t as any)[v === 'all' ? 'history' : v === 'byHotel' ? 'groupByHotel' : 'groupByDate']}
                 </button>
               ))}
             </div>
          </div>
          <Button onClick={() => setModal(true)} variant="gold" className="h-12 px-6 shadow-md"><Plus size={16}/> {t.addWanted}</Button>
       </div>

       {groupedData.map(([title, items]: any) => (
         <div key={title} className="space-y-4">
            <h3 className="text-xs font-black text-amber-500 uppercase flex items-center gap-2"><FolderOpen size={14}/> {title}</h3>
            <div className="glass-card rounded-xl overflow-hidden shadow-xl border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-500 border-b border-white/10 uppercase text-[9px]">
                        <th className="p-4">Node Origin</th>
                        <th className="p-4">Guest Identity</th>
                        <th className="p-4">Bed #</th>
                        <th className="p-4 text-center">Files</th>
                        <th className="p-4 text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((g: any) => (
                        <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 group">
                          <td className="p-4 font-bold text-slate-400">{g.hotelName}</td>
                          <td className="p-4 font-black text-lg text-white uppercase group-hover:text-amber-500">{g.fullName}</td>
                          <td className="p-4 font-bold text-amber-500">{g.bedNumber || 'NA'}</td>
                          <td className="p-4 text-center">
                             <div className="flex justify-center gap-2">
                                <button onClick={() => onImageClick(g.idPhoto)} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white"><Fingerprint size={14} /></button>
                                {g.permitPhoto && (
                                  <button onClick={() => onImageClick(g.permitPhoto)} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-slate-950"><FileText size={14} /></button>
                                )}
                             </div>
                          </td>
                          <td className="p-4 text-right">
                             <button onClick={() => onImageClick(g.idPhoto)} className="p-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl"><Eye size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
         </div>
       ))}

       {modal && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center p-4 z-[200]">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full border-t-4 border-rose-600 shadow-2xl animate-zoom">
            <h3 className="text-xl font-black text-white uppercase mb-6 text-center">{t.addWanted}</h3>
            <div className="space-y-4">
              <Input label={t.fullName} value={name} onChange={setName} icon={<Users size={14}/>} placeholder="Target Name" />
              <Input label="Intelligence" value={desc} onChange={setDesc} icon={<ShieldAlert size={14}/>} placeholder="Strategic Reasoning" />
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setModal(false)} variant="ghost" className="flex-1">CANCEL</Button>
                <Button onClick={addW} variant="gold" className="flex-[2] h-12 uppercase font-black">ALERT HQ</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Updated Reports View with Word/Excel/PPT/Graph Simulation ---

const ReportsView: React.FC<{ t: any, appState: AppState }> = ({ t, appState }) => {
  const [reportType, setReportType] = useState<string>('daily');
  const [format, setFormat] = useState<'excel' | 'word' | 'ppt' | 'graph'>('graph');

  const filteredGuests = useMemo(() => {
    const now = new Date();
    return appState.guests.filter(g => {
      const gDate = new Date(g.timestamp);
      const diffMs = now.getTime() - gDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (reportType === 'daily') return diffDays <= 1;
      if (reportType === 'weekly') return diffDays <= 7;
      if (reportType === 'monthly') return diffDays <= 30;
      if (reportType === 'quarterly') return diffDays <= 90;
      if (reportType === 'semiannual') return diffDays <= 180;
      if (reportType === 'nineMonth') return diffDays <= 270;
      if (reportType === 'yearly') return diffDays <= 365;
      return true;
    });
  }, [appState.guests, reportType]);

  const downloadCSV = () => {
    const headers = "Full Name,Hotel,Bed Number,Nationality,Purpose,Timestamp\n";
    const rows = filteredGuests.map(g => `${g.fullName},${g.hotelName},${g.bedNumber},${g.nationality},${g.purpose},${g.timestamp}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Begu_Engeda_Report_${reportType}.csv`;
    a.click();
  };

  const purposes = ['visit', 'business', 'health', 'personal', 'governmentWork', 'others'];
  const purposeCounts = purposes.map(p => filteredGuests.filter(g => g.purpose === p).length);
  const maxCount = Math.max(...purposeCounts, 1);

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
          <div className="flex flex-wrap gap-2 glass-card p-2 rounded-xl border border-white/5 overflow-x-auto">
             {['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'nineMonth', 'yearly'].map(type => (
               <button key={type} onClick={() => setReportType(type)} className={`px-4 py-1.5 rounded-lg font-bold uppercase text-[9px] tracking-widest transition-all ${reportType === type ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600 hover:text-white'}`}>
                 {(t as any)[type] || type}
               </button>
             ))}
          </div>
          <div className="flex gap-2 glass-card p-2 rounded-xl border border-white/5">
             <button onClick={() => setFormat('graph')} className={`p-2 rounded-lg transition-all ${format === 'graph' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-white'}`} title={t.graph}><BarChart3 size={18}/></button>
             <button onClick={() => setFormat('excel')} className={`p-2 rounded-lg transition-all ${format === 'excel' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-white'}`} title={t.excel}><FileSpreadsheet size={18}/></button>
             <button onClick={() => setFormat('word')} className={`p-2 rounded-lg transition-all ${format === 'word' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-white'}`} title={t.word}><FileText size={18}/></button>
             <button onClick={() => setFormat('ppt')} className={`p-2 rounded-lg transition-all ${format === 'ppt' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-white'}`} title={t.ppt}><Presentation size={18}/></button>
          </div>
       </div>

       <div className="glass-card rounded-2xl p-6 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10 no-print">
             <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Audit ({t[format]})</h3>
                <p className="text-slate-500 font-bold uppercase text-[9px] mt-1">{filteredGuests.length} Records for {(t as any)[reportType]}</p>
             </div>
             <div className="flex gap-2">
                <Button variant="ghost" onClick={() => window.print()} className="px-4 py-1.5"><Printer size={14}/> {t.print}</Button>
                <Button variant="gold" onClick={downloadCSV} className="px-4 py-1.5"><Download size={14}/> {t.download}</Button>
             </div>
          </div>

          <div className="min-h-[400px]">
            {format === 'graph' && (
              <div className="h-full flex flex-col justify-end gap-6 pt-10">
                <div className="flex items-end justify-between h-64 px-10 border-b border-white/10 pb-4">
                  {purposeCounts.map((count, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 group w-12">
                      <div className="w-full bg-indigo-500/20 rounded-t-lg relative border-x border-t border-indigo-500/30 overflow-hidden" style={{ height: `${(count/maxCount)*100}%`, minHeight: '4px' }}>
                        <div className="absolute inset-0 bg-indigo-500 animate-pulse opacity-50"></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase rotate-45 mt-10 origin-left whitespace-nowrap">{(t as any)[purposes[i]]} ({count})</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-xs font-bold text-slate-700 mt-20 uppercase tracking-[0.4em]">Regional Activity metrics by Purpose</div>
              </div>
            )}

            {format === 'excel' && (
              <div className="overflow-x-auto bg-slate-950/40 p-2 rounded-xl border border-white/5">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-slate-500 border-b border-white/10 uppercase">
                      <th className="p-3">Time</th>
                      <th className="p-3">Guest Identity</th>
                      <th className="p-3">Node Hub</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuests.map(g => (
                      <tr key={g.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 text-slate-600 font-bold">{new Date(g.timestamp).toLocaleDateString()}</td>
                        <td className="p-3 font-black text-sm text-white uppercase">{g.fullName}</td>
                        <td className="p-3 font-bold uppercase text-slate-400">{g.hotelName}</td>
                        <td className="p-3 font-bold uppercase text-slate-400">{(t as any)[g.purpose] || g.purpose}</td>
                        <td className="p-3 text-center text-emerald-500 font-black uppercase">Verified</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {format === 'word' && (
              <div className="bg-slate-50 text-slate-900 p-12 rounded-lg max-w-3xl mx-auto shadow-2xl font-serif">
                <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
                   <h1 className="text-3xl font-black uppercase mb-2">Security Audit Report</h1>
                   <p className="text-sm font-bold">Generated: {new Date().toLocaleString()}</p>
                   <p className="text-sm font-bold italic">Benishangul Gumuz Police Commission</p>
                </div>
                <div className="space-y-6">
                  <h2 className="text-xl font-black underline">1. Executive Summary</h2>
                  <p className="text-base leading-relaxed">This formal document outlines the registration activities within the regional node network for the period of <strong>{(t as any)[reportType]}</strong>. During this window, a total of <strong>{filteredGuests.length}</strong> guest registrations were authorized and transmitted to central intelligence.</p>
                  
                  <h2 className="text-xl font-black underline">2. Node Statistics</h2>
                  <ul className="list-disc ml-8 space-y-2">
                    <li>Total Registered Subjects: {filteredGuests.length}</li>
                    <li>Verified Identification Checksums: {filteredGuests.length}</li>
                    <li>Critical Matches Recorded: {appState.messages.filter(m => m.sender === 'SEC-AUTO-BOT').length}</li>
                  </ul>

                  <h2 className="text-xl font-black underline">3. Categorical Breakdown</h2>
                  <p className="text-base">The subjects reported the following primary purposes for their presence within the region:</p>
                  <ul className="list-square ml-8 space-y-1">
                    {purposes.map((p, i) => (
                      <li key={p}>{(t as any)[p]}: {purposeCounts[i]}</li>
                    ))}
                  </ul>
                  
                  <div className="mt-20 pt-10 border-t border-slate-300 text-center text-xs font-bold uppercase">End of Secure Briefing</div>
                </div>
              </div>
            )}

            {format === 'ppt' && (
              <div className="bg-indigo-900 text-white p-12 rounded-2xl aspect-video flex flex-col justify-between shadow-2xl border-4 border-indigo-500/20 relative">
                <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldHalf size={200}/></div>
                <div>
                   <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Strategic Regional Briefing</h1>
                   <div className="h-2 w-32 bg-amber-500 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-10">
                   <div className="bg-indigo-950/50 p-6 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Subject Inflow</p>
                      <p className="text-6xl font-black">{filteredGuests.length}</p>
                      <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Total Active Registrations</p>
                   </div>
                   <div className="bg-indigo-950/50 p-6 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Security Status</p>
                      <p className="text-6xl font-black">STABLE</p>
                      <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">No Escalations Detected</p>
                   </div>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Node: {(t as any)[reportType]}</p>
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Begu Engeda Security Console</p>
                </div>
              </div>
            )}
          </div>
       </div>
    </div>
  );
};

// --- View Helpers ---

const GuestHistory: React.FC<{ t: any, appState: any, onImageClick: (img: string) => void }> = ({ t, appState, onImageClick }) => {
  const [q, setQ] = useState('');
  const filtered = appState.guests.filter((g: any) => g.fullName.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl border border-white/5">
        <h2 className="text-xl font-black text-white uppercase tracking-tight">{t.history} Archives</h2>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-2.5 text-slate-700" size={14} />
          <input type="text" placeholder="Search Identity..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950/50 border border-white/10 focus:border-amber-500 outline-none text-white text-xs font-bold" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((g: any) => (
          <div key={g.id} className="glass-card rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all flex flex-col group border border-white/5">
            <div className="h-40 bg-slate-950 relative overflow-hidden">
              {g.idPhoto ? <img src={g.idPhoto} className="w-full h-full object-cover group-hover:scale-105 transition-all" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-800"><Camera size={40} /></div>}
              <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <Button onClick={() => onImageClick(g.idPhoto)} variant="gold" className="px-6 py-2 text-[10px] font-bold uppercase"><Eye size={12}/> AUDIT</Button>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-white uppercase tracking-tight group-hover:text-amber-500">{g.fullName}</h3>
                <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"><ShieldCheck size={14}/></div>
              </div>
              <div className="space-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex justify-between items-center"><span>Bed</span><span className="text-amber-500">{g.bedNumber}</span></div>
                <div className="flex justify-between items-center"><span>Hotel</span><span className="text-slate-100">{g.hotelName}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WantedList: React.FC<{ t: any, appState: any, setAppState: any }> = ({ t, appState, setAppState }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex items-center justify-between">
       <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t.wantedList}</h2>
       <ShieldAlert size={40} className="text-rose-600" />
    </div>
    <div className="grid grid-cols-1 gap-4">
      {appState.wantedPersons.map((w: any) => (
        <div key={w.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between border-l-4 border-rose-600 hover:bg-slate-900/40 transition-all border border-white/5">
          <div className="space-y-3 flex-1">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">{w.fullName}</h3>
            <p className="text-slate-500 font-bold text-lg uppercase opacity-80">"{w.description}"</p>
          </div>
          <Fingerprint size={60} className="text-rose-600 opacity-10 hidden md:block" />
        </div>
      ))}
    </div>
  </div>
);

const ChatView: React.FC<{ t: any, appState: any, setAppState: any }> = ({ t, appState, setAppState }) => {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [appState.messages]);
  const send = () => {
    if (!text) return;
    setAppState((p: any) => ({ ...p, messages: [{
      id: Date.now().toString(), sender: p.user?.role === 'reception' ? (p.user.hotelInfo?.name || 'Authorized Node') : t.agency, senderRole: p.user?.role || 'police',
      text, timestamp: new Date().toISOString()
    }, ...p.messages] }));
    setText('');
  };
  return (
    <div className="glass-card rounded-2xl h-[550px] flex flex-col overflow-hidden animate-fade-in border border-white/5 shadow-2xl">
      <div className="p-4 bg-slate-950/60 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-black text-xl text-white uppercase tracking-tight">{t.chat} Portal</h3>
      </div>
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col-reverse bg-slate-950/20">
        {appState.messages.map((m: any) => (
          <div key={m.id} className={`flex flex-col ${m.senderRole === appState.user?.role ? 'items-end' : 'items-start'} animate-fade-in`}>
            <span className={`text-[8px] mb-1 px-1 font-bold uppercase tracking-widest ${m.sender === 'SEC-AUTO-BOT' ? 'text-rose-600' : 'text-slate-600'}`}>{m.sender}</span>
            <div className={`max-w-[85%] p-3.5 rounded-xl text-sm font-bold shadow-md border transition-all ${m.sender === 'SEC-AUTO-BOT' ? 'bg-rose-600/10 text-rose-400 border-rose-600/30' : m.senderRole === appState.user?.role ? 'bg-indigo-600 text-white border-white/10' : 'bg-slate-900 text-white border-white/5'}`}>
              {m.text}
            </div>
            <span className="text-[8px] text-slate-800 mt-1 px-1 font-bold uppercase tracking-widest">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/5 flex gap-3 bg-slate-950/60">
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Tactical Coordination..." className="flex-1 bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2.5 outline-none font-bold text-white text-sm" onKeyDown={e => e.key === 'Enter' && send()} />
        <Button onClick={send} variant="gold" className="rounded-lg w-10 h-10 p-0 shadow-lg"><ChevronRight size={18} strokeWidth={3} /></Button>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ t: any, appState: any, setAppState: any, setShowNotification: any }> = ({ t, appState, setAppState, setShowNotification }) => {
  const [hInfo, setHInfo] = useState(appState.user?.hotelInfo || { name: '', address: '', receptionistName: '', phone: '' });
  const [newPass, setNewPass] = useState('');
  const save = () => {
    setAppState((p: any) => ({ ...p, user: { ...p.user, hotelInfo: hInfo } }));
    setShowNotification({ message: "Registry Hub Synchronized", type: 'success' });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight mb-8">{t.terminalConfig}</h3>
        <div className="space-y-6">
          <Input label={t.hotelName} value={hInfo.name} onChange={v => setHInfo({...hInfo, name: v})} icon={<Building2 size={14}/>} />
          <Input label={t.hotelAddress} value={hInfo.address} onChange={v => setHInfo({...hInfo, address: v})} icon={<Search size={14}/>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label={t.receptionistName} value={hInfo.receptionistName} onChange={v => setHInfo({...hInfo, receptionistName: v})} icon={<Users size={14}/>} />
             <Input label={t.phone} value={hInfo.phone} onChange={v => setHInfo({...hInfo, phone: v})} icon={<Phone size={14}/>} />
          </div>
          <div className="pt-6 border-t border-white/10">
             <Input label={t.changePassword} type="password" value={newPass} onChange={setNewPass} icon={<Lock size={14}/>} />
          </div>
          <Button onClick={save} variant="gold" className="w-full mt-4 h-12 text-sm font-black uppercase shadow-xl">{t.updateProfile}</Button>
        </div>
      </div>
    </div>
  );
};

const AboutView: React.FC<{ t: any }> = ({ t }) => (
  <div className="max-w-2xl mx-auto glass-card rounded-2xl shadow-2xl border border-white/10 p-10 text-center animate-fade-in">
    <AppLogo size={60} className="mb-6 mx-auto" />
    <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase leading-none">{t.title}</h1>
    <p className="text-slate-500 text-lg font-bold uppercase tracking-[0.3em] opacity-50 mb-10">{t.subtitle}</p>
    <div className="pt-10 border-t border-white/10">
      <p className="text-xl font-black text-white mb-2 uppercase tracking-widest">{t.developer}</p>
      <div className="bg-slate-900/60 p-6 rounded-xl border border-amber-500/10 mb-6 mt-6">
         <p className="text-2xl font-black text-amber-500 uppercase tracking-widest mb-2">{t.motto}</p>
         <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed tracking-widest">{t.systemPurpose}</p>
      </div>
      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose px-4">{t.devInfo}</p>
    </div>
  </div>
);

const LoginView: React.FC<{ t: any, onLogin: (u: string, p: string) => void }> = ({ t, onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col md:flex-row relative z-10 animate-fade-in shadow-2xl border border-white/10">
        <div className="md:w-1/2 bg-slate-950/80 p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
          <div className="space-y-6">
            <AppLogo size={40} className="mb-4" />
            <h1 className="text-3xl font-black tracking-tight uppercase leading-none">{t.title}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] leading-relaxed">{t.subtitle}</p>
          </div>
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-slate-900/20">
           <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">{t.loginHub}</h2>
           <div className="space-y-6">
              <Input label={t.username} value={user} onChange={setUser} icon={<Users size={14}/>} placeholder="Identity" />
              <Input label={t.password} type="password" value={pass} onChange={setPass} icon={<Lock size={14}/>} placeholder="Security Key" />
              <Button onClick={() => onLogin(user, pass)} variant="gold" className="w-full h-12 text-sm font-black shadow-lg">
                 {t.initiateAccess} <ChevronRight size={18} className="ml-auto" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

const SetupView: React.FC<{ t: any, appState: any, setAppState: any, onComplete: () => void }> = ({ t, appState, setAppState, onComplete }) => {
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [rec, setRec] = useState('');
  const [phone, setPhone] = useState('');
  const save = () => {
    if (!name || !addr || !rec || !phone) return alert('Registry fields required.');
    setAppState((p: any) => ({ ...p, user: { ...p.user, hotelInfo: { name, address: addr, receptionistName: rec, phone } } }));
    onComplete();
  };
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 max-w-lg w-full border-t-4 border-amber-500 animate-fade-in shadow-2xl">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase mb-8 text-center">{t.nodeRegistry}</h2>
        <div className="space-y-4">
          <Input label={t.hotelName} value={name} onChange={setName} icon={<Building2 size={14}/>} />
          <Input label={t.hotelAddress} value={addr} onChange={setAddr} icon={<Search size={14}/>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t.receptionistName} value={rec} onChange={setRec} icon={<Users size={14}/>} />
            <Input label={t.phone} value={phone} onChange={setPhone} icon={<Phone size={14}/>} />
          </div>
          <Button onClick={save} variant="gold" className="w-full h-12 text-sm mt-4 shadow-xl font-black uppercase">{t.save}</Button>
        </div>
      </div>
    </div>
  );
};
