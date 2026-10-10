/**
 * Firebase Firestore Service Layer for AI Quantum Tutor
 * Manages cloud persistence for profiles, saved circuits, and collaborative experiments.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Circuit, UserProgress } from '../types/quantum';

export interface SharedExperimentItem {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  circuitJson: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export const FirebaseService = {
  /**
   * Save or sync learner progress to Firestore
   */
  async syncUserProfile(user: User, progress: UserProgress): Promise<void> {
    const docPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const now = new Date().toISOString();

      if (!snap.exists()) {
        const initialData = {
          id: user.uid,
          email: user.email || 'learner@quantum.local',
          displayName: user.displayName || 'Quantum Pioneer',
          learningStreak: progress.learningStreak || 1,
          totalXp: progress.totalXp || 0,
          selectedLearningPath: progress.selectedLearningPath || 'beginner',
          completedLessons: progress.completedLessons || [],
          completedChallenges: progress.completedChallenges || [],
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userRef, initialData);
      } else {
        await updateDoc(userRef, {
          displayName: user.displayName || snap.data()?.displayName || 'Quantum Pioneer',
          learningStreak: progress.learningStreak,
          totalXp: progress.totalXp,
          selectedLearningPath: progress.selectedLearningPath,
          completedLessons: progress.completedLessons,
          completedChallenges: progress.completedChallenges,
          updatedAt: now,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Fetch learner profile from Firestore
   */
  async fetchUserProfile(userId: string): Promise<Partial<UserProgress> | null> {
    const docPath = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        completedLessons: data.completedLessons || [],
        completedChallenges: data.completedChallenges || [],
        learningStreak: data.learningStreak || 1,
        totalXp: data.totalXp || 0,
        selectedLearningPath: data.selectedLearningPath || 'beginner',
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  },

  /**
   * Save or update quantum circuit to user's personal cloud library
   */
  async saveCircuit(userId: string, circuit: Circuit): Promise<void> {
    // Sanitize ID for firestore rules regex ^[a-zA-Z0-9_\-]+$
    const cleanId = circuit.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docPath = `users/${userId}/circuits/${cleanId}`;
    try {
      const circuitRef = doc(db, 'users', userId, 'circuits', cleanId);
      const snap = await getDoc(circuitRef);
      const now = new Date().toISOString();

      const gatesJson = JSON.stringify(circuit.gates).slice(0, 48000);
      const name = (circuit.name || 'Quantum Circuit').slice(0, 100);
      const description = (circuit.description || '').slice(0, 500);

      if (!snap.exists()) {
        await setDoc(circuitRef, {
          id: cleanId,
          userId,
          name,
          numQubits: circuit.numQubits,
          gatesJson,
          description,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        await updateDoc(circuitRef, {
          name,
          numQubits: circuit.numQubits,
          gatesJson,
          description,
          updatedAt: now,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Load all saved circuits for a user
   */
  async fetchCircuits(userId: string): Promise<Circuit[]> {
    const colPath = `users/${userId}/circuits`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'circuits'));
      const circuits: Circuit[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        try {
          circuits.push({
            id: d.id,
            name: d.name,
            numQubits: d.numQubits,
            gates: JSON.parse(d.gatesJson || '[]'),
            description: d.description,
          });
        } catch {
          // Skip malformed
        }
      });
      return circuits;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  },

  /**
   * Delete circuit from cloud
   */
  async deleteCircuit(userId: string, circuitId: string): Promise<void> {
    const cleanId = circuitId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docPath = `users/${userId}/circuits/${cleanId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'circuits', cleanId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  /**
   * Publish circuit to community shared experiments
   */
  async publishExperiment(
    user: User,
    circuit: Circuit,
    title: string,
    description: string
  ): Promise<string> {
    const expId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docPath = `shared_experiments/${expId}`;
    try {
      const now = new Date().toISOString();
      const expRef = doc(db, 'shared_experiments', expId);
      await setDoc(expRef, {
        id: expId,
        authorId: user.uid,
        authorName: user.displayName || 'Quantum Explorer',
        title: title.slice(0, 100) || circuit.name,
        description: description.slice(0, 1000) || (circuit.description || 'Quantum algorithm demonstration'),
        circuitJson: JSON.stringify(circuit).slice(0, 48000),
        likesCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      return expId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  /**
   * Realtime subscription to community shared experiments
   */
  subscribeToExperiments(
    onUpdate: (experiments: SharedExperimentItem[]) => void
  ): () => void {
    const colPath = 'shared_experiments';
    try {
      return onSnapshot(
        collection(db, colPath),
        (snapshot) => {
          const list: SharedExperimentItem[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as SharedExperimentItem);
          });
          // Sort newest first
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, colPath);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  },

  /**
   * Like a shared experiment
   */
  async likeExperiment(experimentId: string, currentLikes: number): Promise<void> {
    const docPath = `shared_experiments/${experimentId}`;
    try {
      const expRef = doc(db, 'shared_experiments', experimentId);
      const now = new Date().toISOString();
      await updateDoc(expRef, {
        likesCount: currentLikes + 1,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },
};
