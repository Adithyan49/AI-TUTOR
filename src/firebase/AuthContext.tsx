/**
 * React Firebase Authentication & Cloud Sync Context
 * Supports Google popup authentication, anonymous/guest fallback,
 * and automated bi-directional cloud synchronization.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config';
import { FirebaseService } from './service';
import { UserProgress } from '../types/quantum';
import { StorageManager } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authReady: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
  syncProgressToCloud: (progress: UserProgress) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authReady: false,
  cloudSyncStatus: 'idle',
  lastSyncedAt: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
  sendPasswordReset: async () => ({ success: false }),
  signOutUser: async () => {},
  syncProgressToCloud: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
  onCloudProgressLoaded?: (cloudProgress: Partial<UserProgress>) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onCloudProgressLoaded,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setAuthReady(true);

      if (currentUser) {
        // Load cloud profile and merge with local progress
        try {
          setCloudSyncStatus('syncing');
          const cloudData = await FirebaseService.fetchUserProfile(currentUser.uid);
          if (cloudData && onCloudProgressLoaded) {
            onCloudProgressLoaded(cloudData);
          } else {
            // First time login - upload existing local progress
            const localProgress = StorageManager.loadProgress();
            await FirebaseService.syncUserProfile(currentUser, localProgress);
          }
          setCloudSyncStatus('synced');
          setLastSyncedAt(new Date().toLocaleTimeString());
        } catch (err) {
          console.error('Error fetching/syncing cloud profile on login:', err);
          setCloudSyncStatus('error');
        }
      } else {
        setCloudSyncStatus('idle');
      }
    });

    return () => unsubscribe();
  }, [onCloudProgressLoaded]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true };
    } catch (err: unknown) {
      console.error('Email Sign-In Error:', err);
      const errorObj = err as { code?: string; message?: string };
      let message = 'Failed to sign in. Please verify your email and password.';
      if (
        errorObj.code === 'auth/user-not-found' ||
        errorObj.code === 'auth/wrong-password' ||
        errorObj.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid email address or password.';
      } else if (errorObj.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (errorObj.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again in a few moments.';
      }
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName && userCred.user) {
        await updateProfile(userCred.user, { displayName: displayName.trim() });
      }
      return { success: true };
    } catch (err: unknown) {
      console.error('Email Sign-Up Error:', err);
      const errorObj = err as { code?: string; message?: string };
      let message = 'Failed to create account.';
      if (errorObj.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email address.';
      } else if (errorObj.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (errorObj.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: unknown) {
      console.error('Password Reset Error:', err);
      const errorObj = err as { code?: string; message?: string };
      let message = 'Failed to send password reset email.';
      if (errorObj.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (errorObj.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      return { success: false, error: message };
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCloudSyncStatus('idle');
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  const syncProgressToCloud = async (currentProgress: UserProgress) => {
    if (!user) return;
    try {
      setCloudSyncStatus('syncing');
      await FirebaseService.syncUserProfile(user, currentProgress);
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error syncing progress to Firestore:', error);
      setCloudSyncStatus('error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authReady,
        cloudSyncStatus,
        lastSyncedAt,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOutUser,
        syncProgressToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
