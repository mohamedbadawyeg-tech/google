import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MEDICATIONS, TIME_SLOT_CONFIG, SYMPTOMS } from './constants';
import { AppState, TimeSlot, HealthReport, AIAnalysisResult } from './types';
import { analyzeHealthStatus } from './services/geminiService';
import { speakText, stopSpeech } from './services/audioService';
import { 
  Heart, 
  Activity, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  BrainCircuit, 
  RefreshCw,
  Star,
  History,
  Settings,
  X,
  VolumeX,
  UserPlus,
  Camera,
  Pill,
  Droplets,
  Zap,
  ShieldPlus,
  Thermometer,
  Syringe,
  MapPin,
  Copy,
  ChevronLeft
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 6).toUpperCase();

const App: React.FC = () => {
  const [state, setState] = useState<AppState & { customSymptoms: string[] }>(() => {
    const saved = localStorage.getItem('healthTrackData_v14');
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentReport.date !== today) {
          return {
            ...parsed,
            dailyReports: { ...parsed.dailyReports, [parsed.currentReport.date]: parsed.currentReport },
            takenMedications: {},
            sentNotifications: [],
            currentReport: {
              date: today, healthRating: 0, painLevel: 0, painLocation: '', sleepQuality: '', appetite: '', symptoms: [], notes: ''
            }
          };
        }
        return parsed;
      } catch (e) {
        console.error("Storage error:", e);
      }
    }
    
    return {
      patientName: "الوالد العزيز",
      patientAge: 65,
      patientId: generateId(),
      caregiverMode: false,
      caregiverTargetId: null,
      takenMedications: {},
      notificationsEnabled: false,
      sentNotifications: [],
      customReminderTimes: {},
      medicationCustomizations: {},
      customSymptoms: [],
      history: [],
      dailyReports: {},
      currentReport: {
        date: today, healthRating: 0, painLevel: 0, painLocation: '', sleepQuality: '', appetite: '', symptoms: [], notes: ''
      }
    };
  });

  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Storage Persistence (Local Only)
  useEffect(() => {
    localStorage.setItem('healthTrackData_v14', JSON.stringify(state));
  }, [state]);

  const toggleMedication = useCallback((id: string) => {
    setState(prev => {
      const isTaken = !prev.takenMedications[id];
      const med = MEDICATIONS.find(m => m.id === id);
      const entry = {
        date: new Date().toLocaleDateString('ar-EG'),
        action: isTaken ? '✅ تناول الدواء' : '🔄 إلغاء التناول',
        details: med?.name || id,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      return {
        ...prev,
        takenMedications: { ...prev.takenMedications, [id]: isTaken },
        history: [entry, ...prev.history].slice(0, 50)
      };
    });
  }, []);

  const updateReport = useCallback((updates: Partial<HealthReport>) => {
    setState(prev => ({
      ...prev,
      currentReport: { ...prev.currentReport, ...updates }
    }));
  }, []);

  const handleAIAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const result = await analyzeHealthStatus(state);
      setAiResult(result);
      if (result.summary) await speakText(result.summary);
    } catch (error: any) {
      alert("عذراً، حدث خطأ: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takenCount = useMemo(() => Object.values(state.takenMedications).filter(Boolean).length, [state.takenMedications]);
  const progress = (takenCount / MEDICATIONS.length) * 100;

  return (
    <div className="min-h-screen pb-48 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsSettingsOpen(false)} 
              className="absolute top-8 left-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
            
            <header className="mb-12">
              <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Settings className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-800">إعدادات الملف الشخصي</h2>
              <p className="text-slate-400 font-medium mt-1">خصص تجربتك الصحية بما يناسبك</p>
            </header>

            <div className="space-y-10">
              <section className="space-y-4">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2 px-2 uppercase tracking-widest">
                  <Activity className="w-4 h-4" /> الاسم الكامل
                </label>
                <input 
                  type="text" 
                  value={state.patientName} 
                  onChange={(e) => setState(prev => ({ ...prev, patientName: e.target.value }))} 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-700 focus:border-indigo-400 focus:bg-white outline-none transition-all shadow-sm" 
                  placeholder="ادخل الاسم هنا..."
                />
              </section>

              <section className="space-y-4">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2 px-2 uppercase tracking-widest">
                  <UserPlus className="w-4 h-4" /> معرف المستخدم (ID)
                </label>
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between group overflow-hidden relative shadow-xl shadow-indigo-100">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">معرفك الخاص للتتبع المحلي</p>
                    <span className="text-3xl font-black tracking-widest font-mono text-indigo-300">{state.patientId}</span>
                  </div>
                  <button 
                    onClick={() => { 
                      navigator.clipboard.writeText(state.patientId); 
                      alert('تم نسخ الرمز بنجاح'); 
                    }} 
                    className="relative z-10 bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all active:scale-95"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                </div>
              </section>

              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-4"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative bg-white pt-10 pb-20 px-4 overflow-hidden border-b border-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-50 rounded-full -ml-32 -mb-32 opacity-40"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="text-center md:text-right space-y-6">
            <div className="inline-flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 pr-6 rounded-full border border-indigo-100 shadow-sm mb-4">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">تطبيق الرعاية الذكية</span>
              <div className="bg-indigo-600 p-2 rounded-full"><Heart className="w-3 h-3 text-white fill-white" /></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
              صحتي اليوم
            </h1>
            <p className="text-slate-500 text-xl md:text-2xl font-bold flex items-center justify-center md:justify-start gap-3">
               مرحباً، <span className="text-indigo-600 font-black">{state.patientName}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto">
            <StatCard icon={<CheckCircle className="text-emerald-500" />} label="الإنجاز" value={`${Math.round(progress)}%`} color="emerald" />
            <StatCard icon={<Pill className="text-indigo-500" />} label="الأدوية" value={`${takenCount}/${MEDICATIONS.length}`} color="indigo" />
            <StatCard icon={<MapPin className="text-rose-500" />} label="الألم" value={state.currentReport.painLevel > 0 ? `${state.currentReport.painLevel}/10` : "لا يوجد"} color="rose" />
            <StatCard icon={<Activity className="text-sky-500" />} label="الحالة" value={state.currentReport.healthRating > 3 ? "جيدة" : "تحتاج انتباه"} color="sky" />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 -mt-10 grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Medications Panel */}
        <div className="xl:col-span-7 space-y-10">
          <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800">جدول الأدوية</h2>
                  <p className="text-slate-400 font-bold text-sm">التزم بالمواعيد المحددة لنتائج أفضل</p>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                 <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                 </div>
                 <span className="text-xs font-black text-slate-600">{Math.round(progress)}% مكتمل</span>
              </div>
            </header>

            <div className="space-y-16">
              {(Object.keys(TIME_SLOT_CONFIG) as TimeSlot[]).map(slot => {
                const meds = MEDICATIONS.filter(m => m.timeSlot === slot);
                if (meds.length === 0) return null;
                const config = TIME_SLOT_CONFIG[slot];
                return (
                  <div key={slot} className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className={`p-4 rounded-2xl text-slate-700 shadow-sm border ${config.color} transition-transform group-hover:scale-110`}>
                        {config.icon}
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">{config.label}</h3>
                      <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    
                    <div className="grid gap-6">
                      {meds.map(med => (
                        <div 
                          key={med.id} 
                          className={`group relative flex items-center gap-6 p-6 md:p-8 rounded-[2rem] border-2 transition-all duration-500 ${state.takenMedications[med.id] ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' : 'bg-white border-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50'}`}
                        >
                          <button
                            onClick={() => toggleMedication(med.id)}
                            className="flex items-center gap-6 text-right flex-1"
                          >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${state.takenMedications[med.id] ? 'bg-emerald-500 text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                              {state.takenMedications[med.id] ? <CheckCircle className="w-8 h-8" /> : <Pill className="w-8 h-8" />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className={`font-black text-2xl transition-all ${state.takenMedications[med.id] ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                {med.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${state.takenMedications[med.id] ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {med.dosage}
                                </span>
                                {med.isCritical && <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-lg text-[10px] font-black">حرج</span>}
                                <p className="text-xs text-slate-400 font-bold">{med.notes}</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Health Report Panel */}
        <div className="xl:col-span-5 space-y-10">
          <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50 space-y-12">
            <header className="flex items-center gap-4">
              <div className="bg-rose-600 p-4 rounded-2xl shadow-lg shadow-rose-100">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800">التقرير الصحي</h2>
                <p className="text-slate-400 font-bold text-sm">كيف تشعر في هذه اللحظة؟</p>
              </div>
            </header>

            {/* Rating Stars */}
            <div className="space-y-6">
              <label className="text-lg font-black text-slate-700 block px-2">التقييم العام لليوم</label>
              <div className="flex justify-between bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => updateReport({ healthRating: star })}
                    className={`p-2 transition-all transform hover:scale-125 ${state.currentReport.healthRating >= star ? 'text-amber-500 scale-110' : 'text-slate-200'}`}
                  >
                    <Star className={`w-12 h-12 ${state.currentReport.healthRating >= star ? 'fill-amber-500' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Pain Slider */}
            <div className="space-y-8 bg-rose-50/30 p-8 rounded-[2.5rem] border border-rose-100/50">
               <div className="flex items-center justify-between">
                 <label className="text-lg font-black text-slate-700 flex items-center gap-2">
                   <MapPin className="w-6 h-6 text-rose-500" /> مقياس الألم
                 </label>
                 <span className={`text-2xl font-black ${state.currentReport.painLevel > 6 ? 'text-rose-600' : 'text-slate-600'}`}>
                   {state.currentReport.painLevel} / 10
                 </span>
               </div>
               <input 
                 type="range" min="0" max="10" 
                 value={state.currentReport.painLevel} 
                 onChange={(e) => updateReport({ painLevel: parseInt(e.target.value) })}
                 className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
               />
               <input 
                  type="text"
                  value={state.currentReport.painLocation}
                  onChange={(e) => updateReport({ painLocation: e.target.value })}
                  placeholder="أين يتركز الألم؟ (اختياري)"
                  className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-rose-300 outline-none transition-all placeholder:text-slate-300 shadow-sm"
               />
            </div>

            {/* AI Action */}
            <div className="pt-6">
              <button 
                onClick={handleAIAnalysis} 
                disabled={isAnalyzing}
                className="w-full py-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white rounded-[2.5rem] font-black text-2xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-6 disabled:opacity-50 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    جاري التفكير...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                    تحليل الحالة بالذكاء الاصطناعي
                  </>
                )}
              </button>
            </div>

            {/* AI Result Card */}
            {aiResult && (
              <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white space-y-10 animate-in fade-in slide-in-from-top-6 duration-700 shadow-2xl relative overflow-hidden border border-white/5">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                 
                 <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-3 text-indigo-400">
                     <BrainCircuit className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">تحليل Gemini AI</span>
                   </div>
                   <p className="text-xl md:text-2xl leading-relaxed font-bold border-b border-white/10 pb-8">{aiResult.summary}</p>
                 </div>
                 
                 <div className="grid gap-8 relative z-10">
                    <AIList title="توصيات طبية" items={aiResult.recommendations} color="emerald" icon={<CheckCircle className="w-6 h-6" />} />
                    {aiResult.warnings.length > 0 && (
                      <AIList title="تحذيرات عاجلة" items={aiResult.warnings} color="rose" icon={<AlertTriangle className="w-6 h-6" />} />
                    )}
                    <AIList title="مؤشرات إيجابية" items={aiResult.positivePoints} color="amber" icon={<Star className="w-6 h-6" />} />
                 </div>
              </div>
            )}
          </section>

          {/* Activity Log */}
          <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50 space-y-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-4">
              <History className="text-slate-300 w-8 h-8" /> سجل النشاط
            </h2>
            <div className="space-y-4 max-h-[30rem] overflow-y-auto px-2 custom-scrollbar">
              {state.history.length > 0 ? state.history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.8rem] border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="text-right space-y-1">
                    <p className="font-black text-slate-800 text-lg">{h.action}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{h.details}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl text-xs font-black text-indigo-600 border border-slate-100 shadow-sm">
                    {h.timestamp}
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center text-slate-300 font-bold">لا يوجد نشاط مسجل لليوم</div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Floating Action Bar */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl glass-card p-4 rounded-[3rem] shadow-2xl z-[100] border border-white/40 flex items-center justify-between gap-4 px-8">
          <FooterAction onClick={() => setIsSettingsOpen(true)} icon={<Settings />} label="الإعدادات" active={isSettingsOpen} />
          <div className="h-8 w-px bg-slate-200/50"></div>
          <FooterAction onClick={() => stopSpeech()} icon={<VolumeX />} label="إسكات" color="rose" />
          
          <div className="flex-1 flex justify-center">
             <div className="bg-slate-900 text-white p-4 rounded-full shadow-lg -mt-16 border-[6px] border-[#f8fafc] animate-float">
                <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
             </div>
          </div>

          <FooterAction 
            onClick={() => { if(confirm('تأكيد: هل تريد مسح بيانات اليوم والبدء من جديد؟')) window.location.reload(); }} 
            icon={<RefreshCw />} 
            label="يوم جديد" 
            color="emerald"
          />
      </footer>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center transform hover:-translate-y-1 transition-all">
    <div className={`mb-3 p-3 rounded-xl bg-${color}-50`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-lg font-black text-slate-900 truncate w-full">{value}</p>
  </div>
);

const AIList: React.FC<{ title: string, items: string[], icon: React.ReactNode, color: string }> = ({ title, items, icon, color }) => (
  <div className="space-y-4">
    <div className={`flex items-center gap-3 text-${color}-400`}>
       {icon}
       <h4 className="font-black text-lg">{title}</h4>
    </div>
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="text-sm opacity-80 leading-relaxed font-medium flex gap-3">
          <span className="text-indigo-400 shrink-0">•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FooterAction: React.FC<{ onClick: () => void, icon: React.ReactNode, label: string, color?: string, active?: boolean }> = ({ onClick, icon, label, color = "indigo", active }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 group transition-all active:scale-90 ${active ? 'text-indigo-600 scale-110' : 'text-slate-500'}`}
  >
    <div className={`group-hover:scale-110 group-hover:text-${color}-600 transition-all`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
    </div>
    <span className="text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
  </button>
);

export default App;