"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { log } from 'console';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  username: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("User");

  // Load initial user and username only after first sign in
  useEffect(() => {
    const fetchSessionAndUsername = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        setUsername(profile?.full_name ?? null);
      } else {
        setUsername('User');
      }
    };
    fetchSessionAndUsername();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

/*  useEffect(() => {
  const handleAuthChange = async (_event: string, session: Session | null) => {
    setSession(session ?? null);
    setUser(session?.user ?? null);
    setLoading(false);

   
    if (session?.user && _event === 'SIGNED_IN') {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: session.user.id,
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              '',
            email: session.user.email,
            avatar_url:
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture,
          });
        }
      } catch (err) {
        console.error('Error creating profile:', err);
      }
    }
  };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

  return () => subscription.unsubscribe();
}, []); */


  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data.user) {
      // Insert user profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session,username, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// "use client";
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { User, Session } from '@supabase/supabase-js';
// import { supabase } from '../lib/supabase';

// interface AuthContextType {
//   user: User | null;
//   session: Session | null;
//   loading: boolean;
//   username: string | null;
//   signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
//   signIn: (email: string, password: string) => Promise<{ error: any }>;
//   signInWithGoogle: () => Promise<{ error: any }>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [username, setUsername] = useState<string | null>(null);

//   // Initial session check
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         setSession(session);
//         setUser(session?.user ?? null);

//         if (session?.user) {
//           const { data: profile } = await supabase
//             .from('profiles')
//             .select('full_name')
//             .eq('id', session.user.id)
//             .single();
//           setUsername(profile?.full_name ?? 'User');
//         }
//       } catch (error) {
//         console.error('Error initializing auth:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   // ✅ CRITICAL: Listen to auth state changes
//   useEffect(() => {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         console.log('Auth event:', event); // Debug log
        
//         setSession(session);
//         setUser(session?.user ?? null);
//         setLoading(false);

//         // Handle user profile
//         if (session?.user) {
//           // Fetch username
//           const { data: profile } = await supabase
//             .from('profiles')
//             .select('full_name')
//             .eq('id', session.user.id)
//             .single();

//           if (profile) {
//             setUsername(profile.full_name);
//           } else {
//             // Create profile if it doesn't exist (for Google auth)
//             const fullName = session.user.user_metadata?.full_name || 
//                            session.user.user_metadata?.name || 
//                            'User';
            
//             await supabase.from('profiles').insert({
//               id: session.user.id,
//               full_name: fullName,
//               email: session.user.email,
//               avatar_url: session.user.user_metadata?.avatar_url || 
//                          session.user.user_metadata?.picture,
//             });
            
//             setUsername(fullName);
//           }
//         } else {
//           setUsername(null);
//         }
//       }
//     );

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   const signUp = async (email: string, password: string, fullName: string) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: fullName,
//         },
//       },
//     });

//     if (!error && data.user) {
//       await supabase.from('profiles').insert({
//         id: data.user.id,
//         full_name: fullName,
//         email: email,
//       });
//     }

//     return { error };
//   };

//   const signIn = async (email: string, password: string) => {
//     const { error, data } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
    
//     // ✅ Auth state will be updated by onAuthStateChange listener
//     // No need to manually update here
    
//     return { error };
//   };

//   const signInWithGoogle = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `${window.location.origin}/auth/callback`,
//         queryParams: {
//           access_type: 'offline',
//           prompt: 'consent',
//         },
//       },
//     });
//     return { error };
//   };

//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (!error) {
//       // ✅ Clear state immediately
//       setUser(null);
//       setSession(null);
//       setUsername(null);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       session, 
//       username, 
//       loading, 
//       signUp, 
//       signIn, 
//       signInWithGoogle, 
//       signOut 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };