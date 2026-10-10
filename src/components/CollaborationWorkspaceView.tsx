/**
 * Collaboration Workspace
 * Modular architecture for circuit sharing, JSON import/export, laboratory notes,
 * and real-time community quantum experiments backed by Firebase Firestore.
 */

import React, { useState, useEffect } from 'react';
import { Circuit } from '../types/quantum';
import { useAuth } from '../firebase/AuthContext';
import { FirebaseService, SharedExperimentItem } from '../firebase/service';
import {
  Share2,
  Download,
  Upload,
  Copy,
  Check,
  FileText,
  Sparkles,
  Info,
  Globe2,
  Heart,
  ExternalLink,
  PlusCircle,
  Loader2,
  LogIn,
} from 'lucide-react';

interface CollaborationWorkspaceProps {
  currentCircuit: Circuit;
  onImportCircuit: (circuit: Circuit) => void;
  circuitNotes: Record<string, string>;
  onSaveCircuitNote: (circuitId: string, note: string) => void;
}

export const CollaborationWorkspaceView: React.FC<CollaborationWorkspaceProps> = ({
  currentCircuit,
  onImportCircuit,
  circuitNotes,
  onSaveCircuitNote,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [noteText, setNoteText] = useState<string>(
    circuitNotes[currentCircuit.id] ||
      `# Research Notes for ${currentCircuit.name}\n- Qubit configuration: ${currentCircuit.numQubits}\n- Hypothesis:\n- Gate sequence justification:`
  );
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // Community Experiments State
  const [experiments, setExperiments] = useState<SharedExperimentItem[]>([]);
  const [publishTitle, setPublishTitle] = useState<string>(currentCircuit.name);
  const [publishDesc, setPublishDesc] = useState<string>(currentCircuit.description || '');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string>('');

  useEffect(() => {
    // Realtime subscription to Firestore shared experiments
    try {
      const unsub = FirebaseService.subscribeToExperiments((items) => {
        setExperiments(items);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Realtime subscription offline or waiting for connection', e);
    }
  }, []);

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(currentCircuit, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCircuit.name.toLowerCase().replace(/\s+/g, '_')}_circuit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareableString = async () => {
    const encoded = btoa(JSON.stringify(currentCircuit));
    const shareableUrl = `${window.location.origin}#circuit=${encoded}`;
    await navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleImportJSON = () => {
    try {
      setImportError('');
      const parsed = JSON.parse(jsonInput);
      if (!parsed.numQubits || !Array.isArray(parsed.gates)) {
        setImportError('Invalid circuit schema: must include "numQubits" and "gates" array.');
        return;
      }
      onImportCircuit(parsed);
      setJsonInput('');
    } catch (e: any) {
      setImportError(`JSON parse error: ${e.message}`);
    }
  };

  const handleSaveNote = () => {
    onSaveCircuitNote(currentCircuit.id, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handlePublishToCloud = async () => {
    if (!user) return;
    setIsPublishing(true);
    setPublishError('');
    try {
      await FirebaseService.publishExperiment(
        user,
        currentCircuit,
        publishTitle,
        publishDesc
      );
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 3000);
    } catch (err: any) {
      setPublishError(err.message || 'Failed to publish experiment.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLoadExperiment = (exp: SharedExperimentItem) => {
    try {
      const parsed = JSON.parse(exp.circuitJson);
      onImportCircuit(parsed);
    } catch (e) {
      console.error('Failed to parse experiment circuit:', e);
    }
  };

  const handleLikeExperiment = async (exp: SharedExperimentItem) => {
    try {
      await FirebaseService.likeExperiment(exp.id, exp.likesCount);
    } catch (e) {
      console.error('Failed to like experiment:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Quantum Collaboration Workspace</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Shareable circuit artifacts, peer exchange, and cloud-synchronized algorithmic experiments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShareableString}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400"
          >
            <Download className="h-3.5 w-3.5" />
            Export Circuit JSON
          </button>
        </div>
      </div>

      {/* Cloud Community Experiments Section */}
      <div className="rounded-xl border border-cyan-900/40 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-cyan-950/20 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Globe2 className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Community Quantum Experiments (Firestore)</h3>
              <p className="text-xs text-slate-400">Live peer-reviewed quantum circuits published to Firebase</p>
            </div>
          </div>

          {user ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected as {user.displayName || user.email}
            </span>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/60 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In to Publish Circuits
            </button>
          )}
        </div>

        {/* Publish Current Circuit Form */}
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2 mb-3">
            <PlusCircle className="h-4 w-4 text-cyan-400" />
            Publish Active Circuit to Community
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Experiment Title</label>
              <input
                type="text"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="e.g. 3-Qubit GHZ State Verification"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Abstract / Description</label>
              <input
                type="text"
                value={publishDesc}
                onChange={(e) => setPublishDesc(e.target.value)}
                placeholder="Brief explanation of the quantum circuit hypothesis"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-400">
              Active Circuit: <span className="font-semibold text-cyan-300">{currentCircuit.name}</span> ({currentCircuit.numQubits} Qubits, {currentCircuit.gates.length} Gates)
            </div>
            <div className="flex items-center gap-2">
              {publishSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Published successfully!
                </span>
              )}
              {publishError && (
                <span className="text-xs text-rose-400 font-mono">{publishError}</span>
              )}
              <button
                onClick={handlePublishToCloud}
                disabled={!user || isPublishing || !publishTitle.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition-all shadow-md shadow-cyan-500/20"
              >
                {isPublishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Publish to Cloud
              </button>
            </div>
          </div>
        </div>

        {/* Live Community Feed */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              RECENT EXPERIMENTS ({experiments.length})
            </span>
          </div>

          {experiments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/30 p-8 text-center">
              <Globe2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No community experiments published yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">Be the first to publish your quantum circuit above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 hover:border-cyan-800/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{exp.title}</h5>
                      <button
                        onClick={() => handleLikeExperiment(exp)}
                        className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
                        title="Upvote experiment"
                      >
                        <Heart className="h-3 w-3 fill-rose-500/20" />
                        <span>{exp.likesCount}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{exp.description}</p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>By {exp.authorName}</span>
                      <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-900 flex justify-end">
                    <button
                      onClick={() => handleLoadExperiment(exp)}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Load into Canvas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manual JSON Import & Lab Notes Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Import Circuit JSON Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>IMPORT CIRCUIT FROM JSON</span>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={8}
            placeholder='Paste circuit JSON here (e.g. {"name": "Bell Pair", "numQubits": 2, "gates": [...]})'
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-cyan-200 placeholder-slate-600 focus:outline-none"
          />

          {importError && (
            <div className="text-xs text-rose-400 font-mono">{importError}</div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleImportJSON}
              disabled={!jsonInput.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-30"
            >
              <Upload className="h-3.5 w-3.5" />
              Load Circuit into Canvas
            </button>
          </div>
        </div>

        {/* Laboratory Notes Notebook */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FileText className="h-4 w-4 text-violet-400" />
              <span>CIRCUIT LABORATORY NOTES</span>
            </div>
            {noteSaved && <span className="text-[11px] text-emerald-400 font-bold">Saved!</span>}
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:outline-none leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveNote}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-500"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
