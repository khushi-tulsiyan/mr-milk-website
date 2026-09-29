import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('full_name, phone, address, city, state, pincode')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Failed to load profile', error);
        setProfile(data || {});
      });
  }, [userId]);

  const saveProfile = useCallback(async (fields) => {
    const row = {
      id: userId,
      full_name: fields.full_name?.trim() || null,
      phone: fields.phone?.trim() || null,
      address: fields.address?.trim() || null,
      city: fields.city?.trim() || null,
      state: fields.state?.trim() || null,
      pincode: fields.pincode?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('profiles').upsert(row);
    if (error) throw new Error('Could not save your details. Please try again.');
    setProfile(row);
  }, [userId]);

  const value = useMemo(() => ({
    enabled: Boolean(supabase),
    session,
    user: session?.user || null,
    profile,
    saveProfile,
    signOut: () => supabase.auth.signOut(),
    accountOpen,
    openAccount: () => setAccountOpen(true),
    closeAccount: () => setAccountOpen(false),
  }), [session, profile, saveProfile, accountOpen]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
