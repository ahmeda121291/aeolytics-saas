import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthUser } from '../lib/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signUp(email, password, fullName);
      
      if (error) {
        toast.error(error.message || 'Failed to create account');
        throw error;
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Failed to sign in');
        throw error;
      }

      if (data.user) {
        toast.success('Welcome back!');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await authService.signOut();
      
      if (error) {
        toast.error(error.message || 'Failed to sign out');
        throw error;
      }

      toast.success('Signed out successfully');
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await authService.signInWithGoogle();
      
      if (error) {
        toast.error(error.message || 'Failed to sign in with Google');
        throw error;
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data, error } = await authService.updateProfile(updates);
      
      if (error) {
        toast.error(error.message || 'Failed to update profile');
        throw error;
      }

      // Update local state
      if (user && data) {
        setUser({ ...user, profile: data });
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}