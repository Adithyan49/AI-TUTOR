import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CircuitBoard,
  Code2,
  Cpu,
  BarChart3,
  Globe2,
  BookOpen,
  Bot,
  Bug,
  Sparkles,
  Trophy,
  CheckSquare,
  Compass,
  LineChart,
  Users2,
  Share2,
  Server,
  HelpCircle,
  X,
  FlaskConical,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';

export type NavTabId =
  | 'dashboard'
  | 'login'
  | 'learn'
  | 'builder'
  | 'code'
  | 'simulator'
  | 'state_visualizer'
  | 'bloch_sphere'
  | 'algorithms'
  | 'tutor'
  | 'debugger'
  | 'optimization'
  | 'challenges'
  | 'assessments'
  | 'learning_paths'
  | 'analytics'
  | 'instructor'
  | 'collaboration'
  | 'backends'
  | 'science'
  | 'docs';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isOpen: boolean;
  onClose: () => void;
  badgeCounts?: {
    debuggerErrors?: number;
    completedChallenges?: number;
  };
}

interface NavSection {
  title: string;
  items: {
    id: NavTabId;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  badgeCounts,
}) => {
  const { user } = useAuth();

  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'login',
          label: user ? 'Account & Cloud' : 'Login / Register',
          icon: user ? UserCheck : LogIn,
          badge: user ? 'SYNCED' : 'AUTH',
        },
        { id: 'docs', label: 'Documentation & About', icon: HelpCircle },
      ],
    },
    {
      title: 'LEARNING & AI',
      items: [
        { id: 'learn', label: 'Learn Quantum', icon: GraduationCap },
        { id: 'tutor', label: 'AI Quantum Tutor', icon: Bot, badge: 'AI' },
        { id: 'learning_paths', label: 'Learning Paths', icon: Compass },
        { id: 'science', label: 'Science & VQE Lab', icon: FlaskConical, badge: 'SCIENCE' },
      ],
    },
    {
      title: 'CIRCUIT DESIGN',
      items: [
        { id: 'builder', label: 'Circuit Builder', icon: CircuitBoard },
        { id: 'code', label: 'Code Editor', icon: Code2 },
        { id: 'simulator', label: 'Quantum Simulator', icon: Cpu },
      ],
    },
    {
      title: 'VISUALIZATION',
      items: [
        { id: 'state_visualizer', label: 'State Visualizer', icon: BarChart3 },
        { id: 'bloch_sphere', label: 'Bloch Sphere', icon: Globe2 },
        { id: 'algorithms', label: 'Algorithm Library', icon: BookOpen },
      ],
    },
    {
      title: 'DIAGNOSTICS & LABS',
      items: [
        {
          id: 'debugger',
          label: 'Circuit Debugger',
          icon: Bug,
          badge: badgeCounts?.debuggerErrors ? badgeCounts.debuggerErrors : undefined,
        },
        { id: 'optimization', label: 'Optimization Lab', icon: Sparkles },
      ],
    },
    {
      title: 'EVALUATION',
      items: [
        { id: 'challenges', label: 'Coding Challenges', icon: Trophy },
        { id: 'assessments', label: 'Assessments & Quizzes', icon: CheckSquare },
        { id: 'analytics', label: 'Progress Analytics', icon: LineChart },
      ],
    },
    {
      title: 'COMMUNITY & HARDWARE',
      items: [
        { id: 'instructor', label: 'Instructor Dashboard', icon: Users2 },
        { id: 'collaboration', label: 'Collaboration', icon: Share2 },
        { id: 'backends', label: 'Backend Manager', icon: Server },
      ],
    },
  ];

  const handleItemClick = (id: NavTabId) => {
    onSelectTab(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950/95 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-3 lg:hidden">
          <span className="text-sm font-semibold text-slate-200">Navigation Menu</span>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {section.title}
              </h3>
              <div className="mt-1.5 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 shadow-sm border border-cyan-500/30'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? 'text-cyan-400'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? 'bg-cyan-400/20 text-cyan-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info & Quick Account Status */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950/40 space-y-2">
          <button
            onClick={() => handleItemClick('login')}
            className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg border transition-all ${
              activeTab === 'login'
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800/60 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="h-5 w-5 rounded-full border border-cyan-500/50 shrink-0 object-cover"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-bold text-cyan-300 flex items-center justify-center shrink-0">
                  {user ? (user.displayName?.[0] || user.email?.[0] || 'U') : 'Q'}
                </div>
              )}
              <div className="truncate">
                <p className="text-[11px] font-medium truncate">
                  {user ? (user.displayName || user.email?.split('@')[0]) : 'Sign In / Account'}
                </p>
                <p className="text-[9px] text-slate-500 truncate">
                  {user ? 'Cloud Firestore Active' : 'Local Storage Mode'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold shrink-0">
              {user ? 'Manage' : 'Login'}
            </span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Engine: State-Vector</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
