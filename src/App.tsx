/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Circuit, UserProgress, Gate } from './types/quantum';
import { StorageManager } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CircuitBuilder } from './components/CircuitBuilder';
import { CodeEditor } from './components/CodeEditor';
import { QuantumSimulatorLab } from './components/QuantumSimulatorLab';
import { StateVisualizer } from './components/StateVisualizer';
import { BlochSphere } from './components/BlochSphere';
import { AlgorithmLibraryView } from './components/AlgorithmLibraryView';
import { TutorPanel } from './components/TutorPanel';
import { CircuitDebuggerView } from './components/CircuitDebuggerView';
import { OptimizationLabView } from './components/OptimizationLabView';
import { ChallengesView } from './components/ChallengesView';
import { AssessmentsView } from './components/AssessmentsView';
import { LearningModulesView } from './components/LearningModulesView';
import { LearningPathsView } from './components/LearningPathsView';
import { AnalyticsView } from './components/AnalyticsView';
import { InstructorDashboardView } from './components/InstructorDashboardView';
import { CollaborationWorkspaceView } from './components/CollaborationWorkspaceView';
import { BackendManagerView } from './components/BackendManagerView';
import { DocumentationView } from './components/DocumentationView';
import { ScienceResearchView } from './components/ScienceResearchView';
import { TestRunnerModal } from './components/TestRunnerModal';
import { LoginPage } from './components/LoginPage';
import { CircuitDebugger } from './engine/circuitDebugger';
import { useAuth } from './firebase/AuthContext';
import { FirebaseService } from './firebase/service';

export default function App() {
  const { user, syncProgressToCloud } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);

  // Active Circuit Canvas (Synchronized across all tools)
  const [activeCircuit, setActiveCircuit] = useState<Circuit>({
    id: 'active_circuit_1',
    name: 'Bell State |Φ⁺⟩ Experiment',
    numQubits: 2,
    gates: [
      { id: 'g0', type: 'H', qubit: 0, col: 0 },
      { id: 'g1', type: 'CX', qubit: 0, targetQubit: 1, col: 1 },
      { id: 'g2', type: 'MEASURE', qubit: 0, col: 2 },
      { id: 'g3', type: 'MEASURE', qubit: 1, col: 2 },
    ],
    description: 'Standard maximally entangled Bell state generator',
  });

  // Learner Progress State
  const [progress, setProgress] = useState<UserProgress>(StorageManager.loadProgress());
  const [learnerLevel, setLearnerLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // Load cloud circuits if user is logged in
  useEffect(() => {
    if (user) {
      FirebaseService.fetchCircuits(user.uid).then((circuits) => {
        if (circuits && circuits.length > 0) {
          const current = StorageManager.loadProgress();
          // Merge circuits
          const existingIds = new Set(current.savedCircuits.map((c) => c.id));
          const newCircuits = circuits.filter((c) => !existingIds.has(c.id));
          if (newCircuits.length > 0) {
            const merged = { ...current, savedCircuits: [...current.savedCircuits, ...newCircuits] };
            StorageManager.saveProgress(merged);
            setProgress(merged);
          }
        }
      }).catch((e) => console.log('Notice: Cloud circuit fetch skipped or offline', e));
    }
  }, [user]);

  // Load URL hash if shared circuit is present
  useEffect(() => {
    if (window.location.hash.includes('circuit=')) {
      try {
        const hash = window.location.hash.split('circuit=')[1];
        const decoded = JSON.parse(atob(hash));
        if (decoded.numQubits && Array.isArray(decoded.gates)) {
          setActiveCircuit(decoded);
          setActiveTab('builder');
        }
      } catch (e) {
        console.error('Failed to load circuit from hash:', e);
      }
    }
  }, []);

  const handleUpdateCircuit = (updated: Circuit) => {
    setActiveCircuit(updated);
    StorageManager.saveCircuit(updated);
    if (user) {
      FirebaseService.saveCircuit(user.uid, updated).catch((err) =>
        console.warn('Could not sync circuit to cloud:', err)
      );
    }
  };

  const handleResetCanvas = () => {
    const blank: Circuit = {
      id: `blank_${Date.now()}`,
      name: 'Ground State Canvas',
      numQubits: 2,
      gates: [],
      description: 'Initialized in state |00⟩',
    };
    handleUpdateCircuit(blank);
  };

  const handleApplyGate = (gate: Gate) => {
    handleUpdateCircuit({
      ...activeCircuit,
      gates: [...activeCircuit.gates, gate],
    });
  };

  const handleCompleteLesson = (lessonId: string) => {
    const updated = StorageManager.completeLesson(lessonId);
    setProgress(updated);
    if (user) syncProgressToCloud(updated);
  };

  const handleCompleteChallenge = (challengeId: string, xp: number) => {
    const updated = StorageManager.recordChallengeAttempt(challengeId, true, xp);
    setProgress(updated);
    if (user) syncProgressToCloud(updated);
  };

  const handleSaveQuizScore = (quizId: string, score: number, total: number) => {
    const updated = StorageManager.recordQuizScore(quizId, score, total);
    setProgress(updated);
    if (user) syncProgressToCloud(updated);
  };

  const handleSaveCircuitNote = (circuitId: string, note: string) => {
    const p = StorageManager.loadProgress();
    p.circuitNotes = { ...p.circuitNotes, [circuitId]: note };
    StorageManager.saveProgress(p);
    setProgress(p);
  };

  // Diagnostic badge counts
  const debuggerErrors = CircuitDebugger.validate(activeCircuit).filter((e) => e.severity === 'error').length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 quantum-grid-bg">
      {/* Sidebar Navigation (All 19 pages) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        badgeCounts={{
          debuggerErrors: debuggerErrors > 0 ? debuggerErrors : undefined,
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          activeCircuit={activeCircuit}
          totalXp={progress.totalXp}
          streak={progress.learningStreak}
          onOpenTestRunner={() => setTestModalOpen(true)}
          onResetCanvas={handleResetCanvas}
          onRunSimulation={() => setActiveTab('simulator')}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNavigateToLogin={() => setActiveTab('login')}
          activeTab={activeTab}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'login' && (
            <LoginPage
              onNavigateToTab={(tab) => setActiveTab(tab as NavTabId)}
              currentProgress={progress}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              activeCircuit={activeCircuit}
              progress={progress}
              onNavigate={setActiveTab}
              onLoadPreset={handleUpdateCircuit}
            />
          )}

          {activeTab === 'learn' && (
            <LearningModulesView
              completedLessons={progress.completedLessons}
              onCompleteLesson={handleCompleteLesson}
              onLoadCircuitToCanvas={(circuit) => {
                handleUpdateCircuit(circuit);
                setActiveTab('builder');
              }}
            />
          )}

          {activeTab === 'builder' && (
            <CircuitBuilder
              circuit={activeCircuit}
              onChangeCircuit={handleUpdateCircuit}
              onNavigateToCode={() => setActiveTab('code')}
              onNavigateToBloch={() => setActiveTab('bloch_sphere')}
              onNavigateToSimulator={() => setActiveTab('simulator')}
            />
          )}

          {activeTab === 'code' && (
            <CodeEditor
              circuit={activeCircuit}
              onUpdateCircuit={handleUpdateCircuit}
            />
          )}

          {activeTab === 'simulator' && (
            <QuantumSimulatorLab circuit={activeCircuit} />
          )}

          {activeTab === 'state_visualizer' && (
            <StateVisualizer
              circuit={activeCircuit}
              onLoadBellState={() => {
                handleUpdateCircuit({
                  id: 'bell_exp',
                  name: 'Bell State |Φ⁺⟩',
                  numQubits: 2,
                  gates: [
                    { id: 'g0', type: 'H', qubit: 0, col: 0 },
                    { id: 'g1', type: 'CX', qubit: 0, targetQubit: 1, col: 1 },
                  ],
                });
              }}
            />
          )}

          {activeTab === 'bloch_sphere' && (
            <BlochSphere
              circuit={activeCircuit}
              onApplyGateToCircuit={handleApplyGate}
            />
          )}

          {activeTab === 'algorithms' && (
            <AlgorithmLibraryView
              onLoadAlgorithm={(circuit) => {
                handleUpdateCircuit(circuit);
                setActiveTab('builder');
              }}
              onNavigateToCode={() => setActiveTab('code')}
            />
          )}

          {activeTab === 'tutor' && (
            <TutorPanel
              circuit={activeCircuit}
              learnerLevel={learnerLevel}
              onChangeLearnerLevel={setLearnerLevel}
            />
          )}

          {activeTab === 'debugger' && (
            <CircuitDebuggerView
              circuit={activeCircuit}
              onUpdateCircuit={handleUpdateCircuit}
              onNavigateToLesson={(lessonId) => {
                setActiveTab('learn');
              }}
            />
          )}

          {activeTab === 'optimization' && (
            <OptimizationLabView
              circuit={activeCircuit}
              onApplyOptimizedCircuit={(opt) => {
                handleUpdateCircuit(opt);
                setActiveTab('builder');
              }}
            />
          )}

          {activeTab === 'challenges' && (
            <ChallengesView
              completedChallenges={progress.completedChallenges}
              onCompleteChallenge={handleCompleteChallenge}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentsView onSaveQuizScore={handleSaveQuizScore} />
          )}

          {activeTab === 'learning_paths' && (
            <LearningPathsView
              progress={progress}
              onSelectPath={(path) => {
                const updated = { ...progress, selectedLearningPath: path };
                StorageManager.saveProgress(updated);
                setProgress(updated);
              }}
              onNavigateToLesson={(lessonId) => {
                setActiveTab('learn');
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              progress={progress}
              onRefreshProgress={() => setProgress(StorageManager.loadProgress())}
            />
          )}

          {activeTab === 'instructor' && (
            <InstructorDashboardView currentProgress={progress} />
          )}

          {activeTab === 'collaboration' && (
            <CollaborationWorkspaceView
              currentCircuit={activeCircuit}
              onImportCircuit={(circuit) => {
                handleUpdateCircuit(circuit);
                setActiveTab('builder');
              }}
              circuitNotes={progress.circuitNotes}
              onSaveCircuitNote={handleSaveCircuitNote}
            />
          )}

          {activeTab === 'backends' && <BackendManagerView />}

          {activeTab === 'science' && <ScienceResearchView />}

          {activeTab === 'docs' && <DocumentationView />}
        </main>
      </div>

      {/* 14 Automated Tests Modal */}
      <TestRunnerModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
      />
    </div>
  );
}
