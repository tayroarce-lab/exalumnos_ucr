'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
// @ts-ignore
import type { User } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { logError } from '@/lib/logger';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface ProfileContextType {
  user: User | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUserAndProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      setUser(authUser);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      let profileDataResult = profileData;

      if (profileError && profileError.code === 'PGRST116') {
        const emailName = authUser.email ? authUser.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Nuevo Usuario';
        const correctName = authUser.user_metadata?.nombre || authUser.user_metadata?.full_name || emailName;
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: correctName
          })
          .select()
          .single();
          
        if (insertError) {
          logError('ProfileContext.tsx/fetchUserAndProfile', insertError, { userId: authUser.id });
        } else {
          profileDataResult = newProfile;
        }
      } else if (profileError) {
        logError('ProfileContext.tsx/fetchUserAndProfile', profileError, { userId: authUser.id });
      }
      
      // Auto-reparar perfiles que quedaron con "Nuevo Usuario" debido a que la metadata estaba en "nombre"
      if (profileDataResult && profileDataResult.full_name === 'Nuevo Usuario') {
        const emailName = authUser.email ? authUser.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Nuevo Usuario';
        const correctName = authUser.user_metadata?.nombre || authUser.user_metadata?.full_name || emailName;
        if (correctName && correctName !== 'Nuevo Usuario') {
          const { error: updateError } = await supabase.from('profiles').update({ full_name: correctName }).eq('id', authUser.id);
          if (updateError) logError('ProfileContext.tsx/fetchUserAndProfile', updateError, { userId: authUser.id });
          profileDataResult.full_name = correctName;
        }
      }

      setProfile(profileDataResult || null);
    } catch (err) {
      logError('ProfileContext.tsx/fetchUserAndProfile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUserAndProfile();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ user, profile, isLoading, refreshProfile: fetchUserAndProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
