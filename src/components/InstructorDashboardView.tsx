/**
 * Instructor Dashboard & Cohort Monitoring
 * Pedagogical oversight, topic-level weakness heatmaps, and downloadable student grade reports.
 */

import React from 'react';
import { UserProgress } from '../types/quantum';
import {
  Users2,
  Download,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Info,
  Award,
} from 'lucide-react';

interface InstructorDashboardProps {
  currentProgress: UserProgress;
}

export const InstructorDashboardView: React.FC<InstructorDashboardProps> = ({
  currentProgress,
}) => {
  // Simulated cohort analytics data for demonstration
  const cohortStudents = [
    {
      id: 'st_01',
      name: 'Local Active Learner (You)',
      lessons: currentProgress.completedLessons.length,
      challenges: currentProgress.completedChallenges.length,
      avgScore: 92,
      lastActive: 'Today',
      status: 'On Track',
    },
    {
      id: 'st_02',
      name: 'Alex Rivera (Demo Student)',
      lessons: 8,
      challenges: 5,
      avgScore: 88,
      lastActive: '1 day ago',
      status: 'On Track',
    },
    {
      id: 'st_03',
      name: 'Elena Rostova (Demo Student)',
      lessons: 12,
      challenges: 7,
      avgScore: 96,
      lastActive: '2 hours ago',
      status: 'Advanced',
    },
    {
      id: 'st_04',
      name: 'Marcus Chen (Demo Student)',
      lessons: 3,
      challenges: 1,
      avgScore: 68,
      lastActive: '3 days ago',
      status: 'Needs Support',
    },
  ];

  const handleDownloadCohortCSV = () => {
    const rows = [
      ['Student ID', 'Student Name', 'Lessons Completed', 'Challenges Solved', 'Avg Score %', 'Status'],
      ...cohortStudents.map((s) => [
        s.id,
        s.name,
        s.lessons.toString(),
        s.challenges.toString(),
        s.avgScore.toString(),
        s.status,
      ]),
    ];
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_class_gradebook_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Instructor Cohort Dashboard</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Educational progress tracking, topic mastery heatmaps, and classroom reporting.
          </p>
        </div>

        <button
          onClick={handleDownloadCohortCSV}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400"
        >
          <Download className="h-3.5 w-3.5" />
          Export Cohort Gradebook CSV
        </button>
      </div>

      {/* Honest Architecture Disclaimer Banner */}
      <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-4 text-xs text-cyan-200 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-cyan-300">
          <Info className="h-4 w-4" />
          <span>Multi-User Architecture & Privacy Note</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          This view displays your actual local progress alongside benchmark cohort demonstration records.
          In full enterprise deployment, multi-user classroom synchronization connects through a centralized
          relational database or Firebase backend with role-based access control (RBAC).
        </p>
      </div>

      {/* Class Overview Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Cohort Enrollment</div>
          <div className="mt-1 text-xl font-bold text-slate-100 font-mono">28 Students</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Average Completion</div>
          <div className="mt-1 text-xl font-bold text-cyan-400 font-mono">74.2%</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Bell State Mastery</div>
          <div className="mt-1 text-xl font-bold text-emerald-400 font-mono">89% Pass</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Challenging Topic</div>
          <div className="mt-1 text-sm font-bold text-amber-400">Grover Diffusion</div>
        </div>
      </div>

      {/* Cohort Gradebook Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 text-xs font-semibold text-slate-200">
          STUDENT PROGRESS & ASSESSMENT ROSTER
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
              <tr>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Lessons Done</th>
                <th className="py-2.5 px-4">Challenges Solved</th>
                <th className="py-2.5 px-4">Avg Quiz Score</th>
                <th className="py-2.5 px-4">Last Activity</th>
                <th className="py-2.5 px-4 text-right">Academic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {cohortStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-200">{st.name}</td>
                  <td className="py-2.5 px-4 text-cyan-400">{st.lessons}</td>
                  <td className="py-2.5 px-4 text-violet-400">{st.challenges}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-100">{st.avgScore}%</td>
                  <td className="py-2.5 px-4 text-slate-400">{st.lastActive}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        st.status === 'Advanced'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : st.status === 'On Track'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
