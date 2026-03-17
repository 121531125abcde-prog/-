import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Tag, 
  Filter, 
  LayoutGrid, 
  Code, 
  Terminal, 
  Zap, 
  BookOpen, 
  Brain, 
  Cpu, 
  Wrench,
  X,
  Globe,
  Trash2,
  User,
  Users,
  Info,
  Folder,
  Save,
  MessageSquare,
  MessageCircle,
  Send,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Activity, Category, Member, ClubInfo, Question, Answer } from './types';
import { INITIAL_ACTIVITIES, CATEGORIES } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All': <LayoutGrid size={18} />,
  'Python': <Code size={18} />,
  'Arduino': <Cpu size={18} />,
  'AI-Model': <Brain size={18} />,
  'Project': <Folder size={18} />,
  'Other': <Globe size={18} />,
};

export default function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    president: '',
    vicePresident: '',
    purpose: '파이썬, 아두이노를 활용한 인공지능 관련 코딩 탐구',
    adminPassword: '',
  });
  const [tempClubInfo, setTempClubInfo] = useState<ClubInfo | null>(null);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState(false);
  const [isSettingAdminPassword, setIsSettingAdminPassword] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<{
    type: 'club_info' | 'add_member' | 'delete_member' | 'change_password';
    data?: any;
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    id: string; 
    type: 'member' | 'activity' | 'question' | 'answer';
    questionId?: string; // For answers
    passwordToVerify?: string; // For question password check
  } | null>(null);
  const [verifyPasswordInput, setVerifyPasswordInput] = useState('');
  const [verifyError, setVerifyError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    title: '',
    description: '',
    category: 'Other',
    tags: [],
  });
  const [newMember, setNewMember] = useState<Partial<Member>>({
    name: '',
    role: '',
  });
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    author: '',
    title: '',
    content: '',
    password: '',
  });
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Load from localStorage
  useEffect(() => {
    const savedActivities = localStorage.getItem('club_activities');
    const savedMembers = localStorage.getItem('club_members');
    const savedInfo = localStorage.getItem('club_info');
    const savedQuestions = localStorage.getItem('club_questions');

    if (savedActivities) setActivities(JSON.parse(savedActivities));
    else setActivities(INITIAL_ACTIVITIES);

    if (savedMembers) setMembers(JSON.parse(savedMembers));
    
    if (savedInfo) setClubInfo(JSON.parse(savedInfo));

    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('club_activities', JSON.stringify(activities));
    }
  }, [activities, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('club_members', JSON.stringify(members));
    }
  }, [members, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('club_info', JSON.stringify(clubInfo));
    }
  }, [clubInfo, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('club_questions', JSON.stringify(questions));
    }
  }, [questions, isLoaded]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch = 
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [activities, searchQuery, selectedCategory]);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title) return;

    const act: Activity = {
      id: Math.random().toString(36).substring(2, 11),
      title: newActivity.title,
      description: newActivity.description || '',
      category: (newActivity.category as Category) || 'Other',
      tags: newActivity.tags || [],
      addedAt: new Date().toISOString(),
    };

    setActivities([act, ...activities]);
    setIsAddActivityModalOpen(false);
    setNewActivity({ title: '', description: '', category: 'Other', tags: [] });
    setTagInput('');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;

    setIsAddMemberModalOpen(false); // Close the add modal first
    if (!clubInfo.adminPassword) {
      setIsSettingAdminPassword(true);
      setPendingAdminAction({ type: 'add_member' });
      setIsAdminAuthModalOpen(true);
      return;
    }

    setIsSettingAdminPassword(false);
    setPendingAdminAction({ type: 'add_member' });
    setIsAdminAuthModalOpen(true);
  };

  const executeAddMember = () => {
    const member: Member = {
      id: Math.random().toString(36).substring(2, 11),
      name: newMember.name,
      role: newMember.role,
    };

    setMembers([...members, member]);
    setIsAddMemberModalOpen(false);
    setNewMember({ name: '', role: '' });
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.title || !newQuestion.content || !newQuestion.author || !newQuestion.password) return;

    const question: Question = {
      id: Math.random().toString(36).substring(2, 11),
      author: newQuestion.author,
      title: newQuestion.title,
      content: newQuestion.content,
      password: newQuestion.password,
      answers: [],
      addedAt: new Date().toISOString(),
    };

    setQuestions([question, ...questions]);
    setIsAddQuestionModalOpen(false);
    setNewQuestion({ author: '', title: '', content: '', password: '' });
  };

  const handleAddAnswer = (questionId: string) => {
    const content = answerInputs[questionId];
    if (!content) return;

    const answer: Answer = {
      id: Math.random().toString(36).substring(2, 11),
      author: '부원', // 기본값
      content,
      addedAt: new Date().toISOString(),
    };

    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, answers: [...q.answers, answer] } : q
    ));
    setAnswerInputs({ ...answerInputs, [questionId]: '' });
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const handleDeleteMember = (id: string) => {
    setDeleteConfirm(null); // Close the confirmation modal first
    if (!clubInfo.adminPassword) {
      setIsSettingAdminPassword(true);
      setPendingAdminAction({ type: 'delete_member', data: id });
      setIsAdminAuthModalOpen(true);
      return;
    }

    setIsSettingAdminPassword(false);
    setPendingAdminAction({ type: 'delete_member', data: id });
    setIsAdminAuthModalOpen(true);
  };

  const executeDeleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    setDeleteConfirm(null);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    setDeleteConfirm(null);
    setVerifyPasswordInput('');
    setVerifyError(false);
  };

  const handleDeleteAnswer = (questionId: string, answerId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, answers: q.answers.filter(a => a.id !== answerId) } 
        : q
    ));
    setDeleteConfirm(null);
  };

  const handleSaveClubInfo = () => {
    if (!tempClubInfo) return;

    // If password is not set, we are setting it for the first time
    if (!clubInfo.adminPassword) {
      setIsSettingAdminPassword(true);
      setPendingAdminAction({ type: 'club_info' });
      setIsAdminAuthModalOpen(true);
      return;
    }

    // Otherwise, verify existing password
    setIsSettingAdminPassword(false);
    setPendingAdminAction({ type: 'club_info' });
    setIsAdminAuthModalOpen(true);
  };

  const handleChangeAdminPassword = () => {
    if (!clubInfo.adminPassword) {
      setIsSettingAdminPassword(true);
      setPendingAdminAction({ type: 'change_password' });
      setIsAdminAuthModalOpen(true);
      return;
    }

    setIsSettingAdminPassword(false);
    setPendingAdminAction({ type: 'change_password' });
    setIsAdminAuthModalOpen(true);
  };

  const confirmAdminAction = () => {
    if (isSettingAdminPassword) {
      if (!adminPasswordInput) {
        setAdminAuthError(true);
        return;
      }
      
      // Update password and then execute action
      const updatedClubInfo = { ...clubInfo, adminPassword: adminPasswordInput };
      setClubInfo(updatedClubInfo);
      
      if (pendingAdminAction?.type === 'club_info' && tempClubInfo) {
        setClubInfo({ ...tempClubInfo, adminPassword: adminPasswordInput });
        setTempClubInfo(null);
      } else if (pendingAdminAction?.type === 'add_member') {
        executeAddMember();
      } else if (pendingAdminAction?.type === 'delete_member') {
        executeDeleteMember(pendingAdminAction.data);
      }

      setIsAdminAuthModalOpen(false);
      setAdminPasswordInput('');
      setAdminAuthError(false);
      setPendingAdminAction(null);
      setIsSettingAdminPassword(false);
    } else {
      if (adminPasswordInput === clubInfo.adminPassword) {
        if (pendingAdminAction?.type === 'change_password') {
          setIsSettingAdminPassword(true);
          setAdminPasswordInput('');
          setAdminAuthError(false);
          return; // Keep modal open for new password entry
        }

        if (pendingAdminAction?.type === 'club_info' && tempClubInfo) {
          setClubInfo({ ...tempClubInfo });
          setTempClubInfo(null);
        } else if (pendingAdminAction?.type === 'add_member') {
          executeAddMember();
        } else if (pendingAdminAction?.type === 'delete_member') {
          executeDeleteMember(pendingAdminAction.data);
        }

        setIsAdminAuthModalOpen(false);
        setAdminPasswordInput('');
        setAdminAuthError(false);
        setPendingAdminAction(null);
      } else {
        setAdminAuthError(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white relative overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white">
              <Brain size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">인공지능 코딩 동아리</h1>
              <p className="text-[9px] text-black/40 font-bold uppercase tracking-[0.2em] font-mono">AI & Coding Club // SYSTEM_READY</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-[#1A1A1A] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="활동, 기술, 프로젝트 검색..." 
                className="w-full bg-black/5 border-none rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-[#1A1A1A]/10 transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={handleChangeAdminPassword}
              className="p-2.5 bg-black/5 rounded-xl hover:bg-black/10 transition-colors text-black/40 hover:text-[#1A1A1A]"
              title="관리자 비밀번호 변경"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Club Info Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="flex items-center justify-between text-[#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 rounded-lg">
                  <Info size={18} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Mission & Purpose</h2>
              </div>
              {tempClubInfo && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTempClubInfo(null)}
                    className="px-4 py-2 text-xs font-bold text-black/40 hover:text-black/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveClubInfo}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold hover:bg-black/80 transition-all shadow-lg shadow-black/10"
                  >
                    <Save size={14} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
            <div className="p-8 bg-black/[0.01] rounded-3xl border border-black/[0.03] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#1A1A1A] opacity-20" />
              <textarea 
                className="w-full bg-transparent border-none p-0 text-base leading-relaxed text-black/80 font-medium relative z-10 outline-none resize-none no-scrollbar"
                rows={2}
                value={tempClubInfo ? tempClubInfo.purpose : clubInfo.purpose}
                onChange={(e) => setTempClubInfo({ ...(tempClubInfo || clubInfo), purpose: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] font-mono">President</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                  <input 
                    type="text" 
                    className="w-full bg-black/5 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1A1A1A]/10 outline-none font-medium"
                    value={tempClubInfo ? tempClubInfo.president : clubInfo.president}
                    onChange={(e) => setTempClubInfo({ ...(tempClubInfo || clubInfo), president: e.target.value })}
                    placeholder="부장 이름"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] font-mono">Vice President</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                  <input 
                    type="text" 
                    className="w-full bg-black/5 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1A1A1A]/10 outline-none font-medium"
                    value={tempClubInfo ? tempClubInfo.vicePresident : clubInfo.vicePresident}
                    onChange={(e) => setTempClubInfo({ ...(tempClubInfo || clubInfo), vicePresident: e.target.value })}
                    placeholder="차장 이름"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-10 border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <div className="p-2 bg-black/5 rounded-lg">
                  <Users size={18} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Members</h2>
              </div>
              <button 
                onClick={() => setIsAddMemberModalOpen(true)}
                className="p-2 bg-black/5 rounded-xl hover:bg-black/10 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {members.length === 0 ? (
                <p className="text-sm text-black/30 text-center py-4 italic">등록된 부원이 없습니다.</p>
              ) : (
                members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-black/5 rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black/40">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-[9px] text-black/40 font-mono uppercase tracking-wider">{member.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDeleteConfirm({ id: member.id, type: 'member' })}
                      className="p-2 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1 group/del"
                      title="부원 삭제"
                    >
                      <Trash2 size={14} />
                      <span className="text-[10px] font-bold opacity-0 group-hover/del:opacity-100 transition-opacity">삭제</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-2">Projects & Logs</h2>
                <p className="text-sm text-black/40 font-mono uppercase tracking-widest">Archive of technological exploration</p>
              </div>
              <button 
                onClick={() => setIsAddActivityModalOpen(true)}
                className="p-2.5 bg-black/5 rounded-xl hover:bg-black/10 transition-colors mb-2"
                title="프로젝트 추가"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                    selectedCategory === cat.name 
                      ? "bg-[#1A1A1A] text-white shadow-md" 
                      : "bg-white text-black/60 hover:bg-black/5 border border-black/5"
                  )}
                >
                  {CATEGORY_ICONS[cat.name]}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((act) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={act.id}
                  className="group bg-white rounded-3xl border border-black/5 p-6 hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black/40 group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                        {CATEGORY_ICONS[act.category] || <Globe size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight tracking-tight">{act.title}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30 font-mono">{act.category}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDeleteConfirm({ id: act.id, type: 'activity' })}
                      className="p-1.5 text-black/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-sm text-black/60 mb-6 flex-grow leading-relaxed">
                    {act.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {act.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-black/5 px-2 py-1 rounded-md text-black/40 font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-black/20">
              <Folder size={48} strokeWidth={1} className="mb-4" />
              <p className="text-lg font-bold">기록된 활동이 없습니다.</p>
            </div>
          )}
        </section>

        {/* Q&A Section */}
        <section className="space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-2">Questions & Answers</h2>
                <p className="text-sm text-black/40 font-mono uppercase tracking-widest">Knowledge sharing & Community support</p>
              </div>
              <button 
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="p-2.5 bg-black/5 rounded-xl hover:bg-black/10 transition-colors mb-2"
                title="질문 추가"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {questions.map((q) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={q.id}
                  className="bg-white rounded-[2rem] border border-black/5 p-8 hover:shadow-xl hover:shadow-black/5 transition-all space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black/40">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl tracking-tight">{q.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-black/30 font-mono">
                          <span>{q.author}</span>
                          <span>•</span>
                          <span>{new Date(q.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDeleteConfirm({ 
                        id: q.id, 
                        type: 'question', 
                        passwordToVerify: q.password 
                      })}
                      className="p-1.5 text-black/10 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p className="text-base text-black/70 leading-relaxed">
                    {q.content}
                  </p>

                  <div className="space-y-4 pt-4 border-t border-black/5">
                    <div className="flex items-center gap-2 text-xs font-bold text-black/40">
                      <MessageCircle size={14} />
                      <span>{q.answers.length} Answers</span>
                    </div>

                    <div className="space-y-3">
                      {q.answers.map(ans => (
                        <div key={ans.id} className="bg-black/[0.02] rounded-2xl p-4 border border-black/[0.03] group/ans relative">
                          <p className="text-sm text-black/80 leading-relaxed pr-8">{ans.content}</p>
                          <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-black/30 uppercase tracking-wider font-mono">
                            <span>{ans.author}</span>
                            <span>•</span>
                            <span>{new Date(ans.addedAt).toLocaleDateString()}</span>
                          </div>
                          <button 
                            onClick={() => setDeleteConfirm({ 
                              id: ans.id, 
                              type: 'answer', 
                              questionId: q.id 
                            })}
                            className="absolute top-4 right-4 p-1 text-black/10 hover:text-red-500 opacity-0 group-hover/ans:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="답변을 입력하세요..." 
                        className="flex-1 bg-black/5 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/10"
                        value={answerInputs[q.id] || ''}
                        onChange={(e) => setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAnswer(q.id)}
                      />
                      <button 
                        onClick={() => handleAddAnswer(q.id)}
                        className="bg-[#1A1A1A] text-white p-2.5 rounded-xl hover:bg-black/80 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-black/20 border-2 border-dashed border-black/5 rounded-[2rem]">
                <MessageSquare size={48} strokeWidth={1} className="mb-4" />
                <p className="text-lg font-bold">등록된 질문이 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddActivityModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">새 활동 추가</h2>
                <button onClick={() => setIsAddActivityModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">활동 제목</label>
                  <input required type="text" className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/10" value={newActivity.title} onChange={(e) => setNewActivity({...newActivity, title: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">카테고리</label>
                  <select className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none appearance-none" value={newActivity.category} onChange={(e) => setNewActivity({...newActivity, category: e.target.value as Category})}>
                    {CATEGORIES.filter(c => c.name !== 'All').map(c => <option key={c.name} value={c.name}>{c.label}</option>)}
                    <option value="Other">기타</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">상세 설명</label>
                  <textarea rows={3} className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none resize-none" value={newActivity.description} onChange={(e) => setNewActivity({...newActivity, description: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-black/80 transition-all">활동 저장</button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddMemberModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">부원 추가</h2>
                <button onClick={() => setIsAddMemberModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">이름</label>
                  <input required type="text" className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/10" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">역할/직책</label>
                  <input required type="text" placeholder="예: 1학년 부원, 개발팀장 등" className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/10" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-black/80 transition-all">부원 등록</button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddQuestionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddQuestionModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">새 질문 작성</h2>
                <button onClick={() => setIsAddQuestionModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">작성자</label>
                  <input required type="text" className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/10" value={newQuestion.author} onChange={(e) => setNewQuestion({...newQuestion, author: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">질문 제목</label>
                  <input required type="text" className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/10" value={newQuestion.title} onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">내용</label>
                  <textarea required rows={4} className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none resize-none" value={newQuestion.content} onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40">삭제 비밀번호</label>
                  <input required type="password" placeholder="삭제 시 필요한 비밀번호" className="w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/10" value={newQuestion.password} onChange={(e) => setNewQuestion({...newQuestion, password: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-black/80 transition-all">질문 등록</button>
              </form>
            </motion.div>
          </div>
        )}

        {isAdminAuthModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAdminAuthModalOpen(false); setAdminPasswordInput(''); setAdminAuthError(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xs bg-white rounded-[2rem] shadow-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-black/5 text-black/40 rounded-2xl flex items-center justify-center mx-auto">
                <Save size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{isSettingAdminPassword ? '관리자 비밀번호 설정' : '관리자 인증'}</h3>
                <p className="text-sm text-black/40">
                  {isSettingAdminPassword 
                    ? pendingAdminAction?.type === 'change_password'
                      ? '새로운 관리자 비밀번호를 설정하세요.'
                      : '동아리 정보를 보호하기 위한 비밀번호를 설정하세요.' 
                    : pendingAdminAction?.type === 'add_member' 
                      ? '부원 추가를 위해 관리자 비밀번호를 입력하세요.'
                      : pendingAdminAction?.type === 'delete_member'
                        ? '부원 삭제를 위해 관리자 비밀번호를 입력하세요.'
                        : pendingAdminAction?.type === 'change_password'
                          ? '비밀번호 변경을 위해 현재 비밀번호를 입력하세요.'
                          : '정보 수정을 위해 관리자 비밀번호를 입력하세요.'}
                </p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">비밀번호</label>
                <input 
                  type="password" 
                  placeholder="비밀번호를 입력하세요"
                  className={cn(
                    "w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none transition-all",
                    adminAuthError && "ring-2 ring-red-500 bg-red-50"
                  )}
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminAuthError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && confirmAdminAction()}
                />
                {adminAuthError && <p className="text-[10px] text-red-500 font-bold ml-1">비밀번호가 일치하지 않거나 입력되지 않았습니다.</p>}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsAdminAuthModalOpen(false); setAdminPasswordInput(''); setAdminAuthError(false); }}
                  className="flex-1 py-3 bg-black/5 rounded-xl font-bold text-sm hover:bg-black/10 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={confirmAdminAction}
                  className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold text-sm hover:bg-black/80 transition-colors shadow-lg shadow-black/10"
                >
                  {isSettingAdminPassword ? '설정 완료' : '인증 완료'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setDeleteConfirm(null); setVerifyPasswordInput(''); setVerifyError(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xs bg-white rounded-[2rem] shadow-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">정말 삭제하시겠습니까?</h3>
                <p className="text-sm text-black/40">이 작업은 되돌릴 수 없습니다.</p>
              </div>

              {deleteConfirm.type === 'question' && (
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">비밀번호 확인</label>
                  <input 
                    type="password" 
                    placeholder="비밀번호를 입력하세요"
                    className={cn(
                      "w-full bg-black/5 border-none rounded-xl py-3 px-4 text-sm outline-none transition-all",
                      verifyError && "ring-2 ring-red-500 bg-red-50"
                    )}
                    value={verifyPasswordInput}
                    onChange={(e) => {
                      setVerifyPasswordInput(e.target.value);
                      setVerifyError(false);
                    }}
                  />
                  {verifyError && <p className="text-[10px] text-red-500 font-bold ml-1">비밀번호가 일치하지 않습니다.</p>}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => { setDeleteConfirm(null); setVerifyPasswordInput(''); setVerifyError(false); }}
                  className="flex-1 py-3 bg-black/5 rounded-xl font-bold text-sm hover:bg-black/10 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'member') handleDeleteMember(deleteConfirm.id);
                    else if (deleteConfirm.type === 'activity') handleDeleteActivity(deleteConfirm.id);
                    else if (deleteConfirm.type === 'question') {
                      if (verifyPasswordInput === deleteConfirm.passwordToVerify) {
                        handleDeleteQuestion(deleteConfirm.id);
                      } else {
                        setVerifyError(true);
                      }
                    }
                    else if (deleteConfirm.type === 'answer' && deleteConfirm.questionId) {
                      handleDeleteAnswer(deleteConfirm.questionId, deleteConfirm.id);
                    }
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6 text-black/20">
        <div className="flex items-center gap-2">
          <Brain size={16} />
          <span className="text-sm font-bold">인공지능 코딩 동아리 &copy; 2026</span>
        </div>
        <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] font-mono">
          <span>Python.py</span>
          <span>Arduino.ino</span>
          <span>AI_Model.bin</span>
        </div>
      </footer>
    </div>
  );
}
