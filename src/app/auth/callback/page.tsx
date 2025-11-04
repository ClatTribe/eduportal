"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        addDebug('🚀 ===== AUTH CALLBACK STARTED =====');
        
        // Get the code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        
        if (error) {
          addDebug(`❌ OAuth Error: ${error}`);
          localStorage.removeItem('pendingUserRole');
          router.push(`/register?error=${error}`);
          return;
        }
        
        if (!code) {
          addDebug('⚠️ No code, checking for existing session...');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            addDebug('✅ Found existing session');
            await processUserSession(session.user);
            return;
          }
          
          addDebug('❌ No code and no session');
          localStorage.removeItem('pendingUserRole');
          router.push('/register');
          return;
        }

        addDebug('🔄 Exchanging code for session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError || !sessionData.session?.user) {
          addDebug(`❌ Session exchange failed`);
          localStorage.removeItem('pendingUserRole');
          router.push('/register?error=auth_failed');
          return;
        }

        addDebug('✅ Session created successfully');
        await processUserSession(sessionData.session.user);
        
      } catch (error) {
        addDebug(`💥 Error: ${error}`);
        localStorage.removeItem('pendingUserRole');
        router.push('/register?error=auth_failed');
      }
    };

    const processUserSession = async (user: any) => {
      addDebug(`👤 User: ${user.email}`);

      const pendingRole = localStorage.getItem('pendingUserRole') as 'student' | 'mentor' | null;
      addDebug(`🎭 Pending Role: ${pendingRole || 'NOT FOUND'}`);
      
      if (!pendingRole) {
        addDebug('❌ No role found');
        await supabase.auth.signOut();
        router.push('/register?error=no_role');
        return;
      }

      const correctTable = pendingRole === 'mentor' ? 'mentor_profiles' : 'profiles';
      const wrongTable = pendingRole === 'mentor' ? 'profiles' : 'mentor_profiles';

      addDebug(`📊 Correct table: ${correctTable}`);

      // Check wrong table first
      const { data: wrongProfile } = await supabase
        .from(wrongTable)
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (wrongProfile) {
        addDebug(`❌ User exists in ${wrongTable} (CONFLICT!)`);
        setShowDebug(true);
        localStorage.removeItem('pendingUserRole');
        await supabase.auth.signOut();
        router.push(`/register?error=wrong_role&expected=${pendingRole}`);
        return;
      }

      // Check correct table
      const { data: correctProfile } = await supabase
        .from(correctTable)
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (correctProfile) {
        addDebug(`✅ Profile exists in ${correctTable}`);
      } else {
        addDebug(`⚠️ Profile NOT found in ${correctTable}`);
        addDebug('💡 This should have been created by database trigger');
        setShowDebug(true);
        
        // Wait a moment and check again (trigger might be delayed)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryProfile } = await supabase
          .from(correctTable)
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!retryProfile) {
          addDebug(`❌ Profile still not found after retry`);
          localStorage.removeItem('pendingUserRole');
          await supabase.auth.signOut();
          router.push('/register?error=profile_creation_failed');
          return;
        }
        
        addDebug(`✅ Profile found on retry!`);
      }

      localStorage.removeItem('pendingUserRole');
      const redirectUrl = pendingRole === 'mentor' ? '/mentor-dashboard' : '/';
      addDebug(`🚀 Redirecting to: ${redirectUrl}`);
      
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Completing Sign In...</h2>
            <p className="text-gray-600">Please wait while we set up your account</p>
          </div>
          
          {showDebug && (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">🔍 Debug Log</h3>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Hide
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {debugInfo.map((info, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs font-mono mb-1 ${
                      info.includes('❌') || info.includes('FAILED') ? 'text-red-400' :
                      info.includes('✅') || info.includes('SUCCESS') ? 'text-green-400' :
                      info.includes('⚠️') || info.includes('CONFLICT') ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}
                  >
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}