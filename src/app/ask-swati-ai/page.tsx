/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';
import {
  Search,
  Send,
  Sparkles,
  Zap,
  GraduationCap,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Globe,
  BookOpen,
  Plane,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  response: string;
}

interface ProfileData {
  target_degree: string;
  target_field: string;
  target_state: string[];
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  academic_year: string;
  budget: string[];
}

interface MatchedUniversity {
  id: number;
  university_name: string;
  program_name: string;
  country: string;
  campus: string;
  tuition_fees: string;
}

const COLORS = {
  background: '#0f1223',
  surfaceContainer: '#1b1f30',
  surfaceContainerLow: '#171b2b',
  surfaceContainerHigh: '#25293b',
  primary: '#ffc174',
  primaryContainer: '#f59e0b',
  onPrimary: '#472a00',
  onSurface: '#dfe1f9',
  onSurfaceVariant: '#d8c3ad',
  tertiary: '#bccbff',
  error: '#ffb4ab',
};

const glassEffect = {
  background: 'rgba(27, 31, 48, 0.4)',
  backdropFilter: 'blur(12px)',
  border: `1px solid rgba(255, 193, 116, 0.1)`,
};

export default function AskSwatiAIDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [followUpState, setFollowUpState] = useState<{
    questions: string[];
    currentIndex: number;
    answers: Record<number, string>;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const followUpTriggeredRef = useRef(false);
  const followUpRoundDoneRef = useRef(false);

  const quickSuggestions = [
    'Best universities in Canada for MS in CS',
    'Study in UK under â¹20 lakh per year',
    'Scholarships for Indian students in USA',
    'MBA abroad vs MBA in India',
    'Study in Germany for free',
    'PR pathway after studying in Australia',
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('admit_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfileData({
          target_degree: data.degree || '',
          target_field: data.program || '',
          target_state: data.target_state || [],
          name: data.name || user?.user_metadata?.full_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
          academic_year: data.academic_year || '',
          budget: data.budget || [],
        });
        const hasDegree = data.degree && data.degree.trim() !== '';
        setHasProfile(!!hasDegree);
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const formatResponse = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const [matchedUniversities, setMatchedUniversities] = useState<MatchedUniversity[]>([]);

  const extractUniversityNames = (text: string): string[] => {
    const names: string[] = [];
    const numberedPattern = /\d+\.\s+\*{0,2}([A-Z][^*:\n]+?)\*{0,2}\s*[:\-â]/g;
    let match;
    while ((match = numberedPattern.exec(text)) !== null) {
      const name = match[1].replace(/\*\*/g, '').replace(/[:*]/g, '').trim();
      if (name.length > 3 && name.length < 120) names.push(name);
    }
    if (names.length === 0) {
      const boldPattern = /\*\*([A-Z][^*\n]{5,80}?)\*\*/g;
      while ((match = boldPattern.exec(text)) !== null) {
        const name = match[1].trim();
        if (!name.match(/^(Why|Key|Note|Important|Fees|Average|Cutoff|Tips|Step|Here|Budget|Tuition|Scholarship)/i)) {
          names.push(name);
        }
      }
    }
    return names;
  };

  const fetchMatchingUniversities = useCallback(async (uniNames: string[]) => {
    if (uniNames.length === 0) { setMatchedUniversities([]); return; }
    try {
      const orFilter = uniNames
        .map(name => {
          const cleaned = name.replace(/\(.*?\)/g, '').replace(/,.*$/, '').trim();
          const words = cleaned.split(/\s+/).filter(w => w.length > 2);
          const searchTerm = words.slice(0, 3).join('%');
          return `University.ilike.%${searchTerm}%`;
        })
        .join(',');

      const { data, error } = await supabase
        .from('courses')
        .select('id, University, "Program Name", Country, Campus, "Yearly Tuition Fees"')
        .or(orFilter)
        .limit(8);

      if (error) { console.error('University match error:', error); return; }
      if (data && data.length > 0) {
        const seen = new Set<string>();
        const tiles: MatchedUniversity[] = [];
        for (const c of data) {
          const uniName = c.University || '';
          if (!seen.has(uniName)) {
            seen.add(uniName);
            tiles.push({
              id: c.id,
              university_name: uniName,
              program_name: c['Program Name'] || '',
              country: c.Country || '',
                country: c.Country || '',
              campus: c.Campus || '',
              tuition_fees: c['Yearly Tuition Fees'] || '',
            });
          }
        }
        setMatchedUniversities(tiles.slice(0, 6));
      } else {
        setMatchedUniversities([]);
      }
    } catch (err) {
      console.error('Error fetching matching universities:', err);
    }
  }, []);

  useEffect(() => {
    if (messages.length < 2) { setMatchedUniversities([]); return; }
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;
    const names = extractUniversityNames(lastMsg.content);
    if (names.length > 0) {
      fetchMatchingUniversities(names);
    } else {
      setMatchedUniversities([]);
    }
  }, [messages, fetchMatchingUniversities]);

  const extractFollowUps = (text: string): { mainText: string; questions: string[] } => {
    const questions: string[] = [];
    const lines = text.split('\n');
    const mainLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.endsWith('?') && trimmed.length > 15 && trimmed.length < 150) {
        const cleaned = trimmed.replace(/^[-*â¢]\s*/, '').replace(/^\d+[.)]\s*/, '').replace(/\*\*/g, '');
        questions.push(cleaned);
      } else {
        mainLines.push(line);
      }
    }

    const inlinePattern = /\d+\.\s+([^?]+\?)/g;
    let match;
    const foundInline: string[] = [];
    while ((match = inlinePattern.exec(text)) !== null) {
      const q = match[1].trim().replace(/\*\*/g, '');
      if (q.length > 15 && q.length < 150) {
        foundInline.push(q);
      }
    }

    if (foundInline.length >= 2 && foundInline.length > questions.length) {
      let cleanedText = text;
      for (const q of foundInline) {
        cleanedText = cleanedText.replace(new RegExp('\\d+\\.\\s*\\*{0,2}' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*\\\*/g, '\\*{0,2}') + '\\*{0,2}', 'g'), '');
      }
      cleanedText = cleanedText.replace(/\s{2,}/g, ' ').replace(/\s+([.,!])/g, '$1').trim();
      cleanedText = cleanedText.replace(/\s*(Once I have|Once you provide|Once you provide|With this information|Let me know|Please share|To help you best|We'll figure)[\s\S]*$/i, '').trim();
      return { mainText: cleanedText, questions: foundInline.slice(0, 3) };
    }

    return {
      mainText: questions.length > 0 ? mainLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() : text,
      questions: questions.slice(0, 3),
    };
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery('');
    setIsLoading(true);
    setFollowUpState(null);
    followUpTriggeredRef.current = false;
    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setShowResponse(true);

    try {
      const response = await fetch('/api/ask-swati-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          profileContext: profileData ? {
            degree: profileData.target_degree,
            field: profileData.target_field,
            country: profileData.target_state?.join(', '),
            budget: profileData.budget?.join(', '),
          } : null,
        }),
      });

      const data: AIResponse = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => handleSearch(suggestion);

  const handleAskAnother = () => {
    setMessages([]);
    setShowResponse(false);
    setFollowUpState(null);
    setMatchedUniversities([]);
    followUpTriggeredRef.current = false;
    followUpRoundDoneRef.current = false;
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const generateOptions = (question: string): string[] => {
    const q = question.toLowerCase();

    if (q.includes('ielts') || q.includes('toefl') || q.includes('pte') || q.includes('duolingo') || q.includes('english') || q.includes('language')) {
      return ["Haven't taken yet", '5.5-6.0', '6.0-6.5', '6.5-7.0', '7.0-7.5', '7.5+'];
    }
    if (q.includes('gre') || q.includes('gmat')) {
      return ["Haven't taken", 'Below 300/600', '300-310/600-650', '310-320/650-700', '320+/700+', 'Not required for my course'];
    }
    if (q.includes('field') || q.includes('course') || q.includes('program') || q.includes('subject') || q.includes('specializ') || q.includes('study')) {
      return ['Computer Science / IT', 'Business / MBA', 'Engineering', 'Data Science / AI', 'Healthcare / Medicine', 'Arts / Humanities', 'Law', 'Design', 'Other'];
    }
    if (q.includes('budget') || q.includes('fee') || q.includes('afford') || q.includes('cost') || q.includes('spend')) {
      return ['Under â¹15 Lakh/year', 'â¹15-25 Lakh/year', 'â¹25-40 Lakh/year', 'â¹40-60 Lakh/year', 'â¹60 Lakh+/year', 'Need full scholarship'];
    }
    if (q.includes('country') || q.includes('destination') || q.includes('where') || q.includes('location') || q.includes('prefer')) {
      return ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'Singapore', 'Open to suggestions'];
    }
    if (q.includes('intake') || q.includes('when') || q.includes('start') || q.includes('join') || q.includes('semester')) {
      return ['Fall 2026 (Sep)', 'Spring 2027 (Jan)', 'Fall 2027 (Sep)', 'Not sure yet'];
    }
    if (q.includes('work experience') || q.includes('years of experience') || q.includes('working')) {
      return ['Fresher', '1-2 years', '3-5 years', '5+ years'];
    }
    if (q.includes('degree') || q.includes('level') || q.includes('ug') || q.includes('pg') || q.includes('masters') || q.includes('bachelor')) {
      return ["Undergraduate (Bachelor's)", "Postgraduate (Master's)", 'PhD / Research', 'MBA', 'Diploma / Certificate'];
    }
    if (q.includes('priority') || q.includes('important') || q.includes('matters') || q.includes('looking for')) {
      return ['University ranking', 'Scholarships & affordability', 'PR / work visa pathway', 'Course specialization', 'Campus life & location'];
    }
    if (q.includes('score') || q.includes('percentage') || q.includes('cgpa') || q.includes('gpa') || q.includes('marks') || q.includes('academic')) {
      return ['Below 60% / 6.0 CGPA', '60-70% / 6.0-7.0', '70-80% / 7.0-8.0', '80-90% / 8.0-9.0', '90%+ / 9.0+'];
    }
    return [];
  };

  const handleFollowUpAnswer = (answer: string) => {
    if (!followUpState) return;
    const newAnswers = { ...followUpState.answers, [followUpState.currentIndex]: answer };
    const nextIndex = followUpState.currentIndex + 1;

    if (nextIndex >= followUpState.questions.length) {
      const compiled = followUpState.questions
        .map((q, i) => `${q} ${newAnswers[i] || 'Skipped'}`)
        .join('\n') + '\n\n[FINAL ANSWER] Based on my answers above, recommend me specific universities. Do not ask more questions.';
      setFollowUpState(null);
      followUpRoundDoneRef.current = true;
      handleSearch(compiled);
    } else {
      setFollowUpState({ ...followUpState, currentIndex: nextIndex, answers: newAnswers });
    }
  };

  const handleFollowUpSkip = () => {
    if (!followUpState) return;
    const nextIndex = followUpState.currentIndex + 1;
    if (nextIndex >= followUpState.questions.length) {
      const compiled = followUpState.questions
        .map((q, i) => `${q} ${followUpState.answers[i] || 'Skipped'}`)
        .join('\n') + '\n\n[FINAL ANSWER] Based on my answers above, recommend me specific universities. Do not ask more questions.';
      setFollowUpState(null);
      followUpRoundDoneRef.current = true;
      handleSearch(compiled);
    } else {
      setFollowUpState({ ...followUpState, currentIndex: nextIndex });
    }
  };

  const handleFollowUpClose = () => setFollowUpState(null);

  if (loading) {
    return (
      <DefaultLayout>
        <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }} className="flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
            <p className="mt-4" style={{ color: COLORS.onSurface }}>Loading...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) {
    return (
      <DefaultLayout>
        <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }} className="flex items-center justify-center px-4">
          <div style={glassEffect} className="rounded-2xl p-8 max-w-md w-full text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.primary }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.onSurface }}>
              Welcome to Ask Swati AI
            </h2>
            <p className="mb-6" style={{ color: COLORS.onSurfaceVariant }}>
              Sign in to access your AI-powered study abroad counsellor
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200"
              style={{ backgroundColor: COLORS.primary, color: COLORS.onPrimary }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primaryContainer; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary; }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }} className="py-8 mt-18 sm:mt-0">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          {/* Welcome Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2" style={{ color: COLORS.onSurface }}>
                Welcome back, {displayName}
              </h1>
              <p className="text-lg" style={{ color: COLORS.onSurfaceVariant }}>
                Your AI-powered study abroad counsellor is ready.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: COLORS.primaryContainer, color: COLORS.onPrimary }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">SWATI AI ACTIVE</span>
            </div>
          </div>

          {/* AI Search Bar */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{
                background: 'rgba(27, 31, 48, 0.85)',
                backdropFilter: 'blur(12px)',
                border: `2px solid ${COLORS.primary}60`,
                boxShadow: `0 0 20px ${COLORS.primary}15`,
              }}
            >
              <Search className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.primary }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchQuery); }}
                placeholder="Ask me anything about studying abroad..."
                className="flex-1 bg-transparent outline-none text-lg"
                style={{ color: '#ffffff', caretColor: COLORS.primary }}
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isLoading}
                className="p-3 rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: COLORS.primary, color: COLORS.onPrimary }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primaryContainer; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary; }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-3">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(255, 193, 116, 0.12)',
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}50`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary;
                    e.currentTarget.style.color = COLORS.onPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 193, 116, 0.12)';
                    e.currentTarget.style.color = COLORS.primary;
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* AI Response Card */}
            {showResponse && messages.length > 0 && (
              <div style={glassEffect} className="rounded-2xl p-6 space-y-4 mt-6">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-2xl rounded-xl px-4 py-3" style={{ backgroundColor: COLORS.primary, color: COLORS.onPrimary }}>
                    <p className="text-sm">{messages[0]?.content}</p>
                  </div>
                </div>

                {/* AI Response */}
                {isLoading ? (
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: COLORS.primary }} />
                    <div className="space-y-2">
                      <p className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>
                        Thinking<span className="inline-block">
                          <span className="animate-bounce inline-block" style={{ animationDelay: '0s' }}>.</span>
                          <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>.</span>
                          <span className="animate-bounce inline-block" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (() => {
                  const lastMsg = messages[messages.length - 1]?.content || '';
                  const { mainText, questions } = extractFollowUps(lastMsg);

                  if (questions.length > 0 && !followUpState && !isLoading && !followUpTriggeredRef.current && !followUpRoundDoneRef.current) {
                    followUpTriggeredRef.current = true;
                    setTimeout(() => {
                      setFollowUpState({ questions, currentIndex: 0, answers: {} });
                    }, 600);
                  }

                  return (
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: COLORS.primary }} />
                      <div className="flex-1">
                        <div
                          className="prose prose-invert text-sm max-w-none"
                          style={{ color: COLORS.onSurface }}
                          dangerouslySetInnerHTML={{ __html: formatResponse(mainText) }}
                        />

                        {/* University Tiles from Supabase */}
                        {matchedUniversities.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: COLORS.onSurfaceVariant, opacity: 0.7 }}>
                              Explore on EduAbroad
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {matchedUniversities.map((uni, idx) => (
                                <div
                                  key={uni.id}
                                  className="rounded-xl p-4 cursor-pointer transition-all duration-200"
                                  style={{ backgroundColor: COLORS.surfaceContainerHigh, border: `1px solid ${COLORS.primary}20` }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = `${COLORS.primary}60`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.primary}15`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = `${COLORS.primary}20`;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                  onClick={() => router.push(`/course-finder/${uni.id}`)}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}>{idx + 1}</div>
                                      <Globe className="w-4 h-4" style={{ color: COLORS.primary }} />
                                    </div>
                                    <ChevronRight className="w-4 h-4" style={{ color: COLORS.onSurfaceVariant }} />
                                  </div>
                                  <h4 className="text-sm font-semibold leading-tight mb-1" style={{ color: COLORS.onSurface }}>{uni.university_name}</h4>
                                  {uni.program_name && <p className="text-xs mb-1" style={{ color: COLORS.onSurfaceVariant }}>{uni.program_name}</p>}
                                  <div className="flex gap-2 flex-wrap">
                                    {uni.country && (
                                      <span className="text-xs px-2 py-0.5 rounded inline-block" style={{ backgroundColor: `${COLORS.tertiary}20`, color: COLORS.tertiary }}>
                                        {uni.campus ? `${uni.campus}, ${uni.country}` : uni.country}
                                      </span>
                                    )}
                                    {uni.tuition_fees && (
                                      <span className="text-xs px-2 py-0.5 rounded inline-block" style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}>
                                        {uni.tuition_fees}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Follow-up Question Card */}
                {followUpState && !isLoading && (
                  <div className="mt-4 rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.surfaceContainerHigh, border: `1px solid ${COLORS.primary}30` }}>
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.primary}20` }}>
                      <p className="text-sm font-medium" style={{ color: COLORS.onSurface }}>
                        {followUpState.questions[followUpState.currentIndex]}
                      </p>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <button
                          onClick={() => followUpState.currentIndex > 0 && setFollowUpState({ ...followUpState, currentIndex: followUpState.currentIndex - 1 })}
                          disabled={followUpState.currentIndex === 0}
                          className="text-xs"
                          style={{ color: followUpState.currentIndex === 0 ? COLORS.onSurfaceVariant + '40' : COLORS.onSurfaceVariant, cursor: followUpState.currentIndex === 0 ? 'default' : 'pointer' }}
                        >&lt;</button>
                        <span className="text-xs" style={{ color: COLORS.onSurfaceVariant }}>{followUpState.currentIndex + 1} of {followUpState.questions.length}</span>
                        <button
                          onClick={() => followUpState.currentIndex < followUpState.questions.length - 1 && setFollowUpState({ ...followUpState, currentIndex: followUpState.currentIndex + 1 })}
                          disabled={followUpState.currentIndex === followUpState.questions.length - 1}
                          className="text-xs"
                          style={{ color: followUpState.currentIndex === followUpState.questions.length - 1 ? COLORS.onSurfaceVariant + '40' : COLORS.onSurfaceVariant, cursor: followUpState.currentIndex === followUpState.questions.length - 1 ? 'default' : 'pointer' }}
                        >&gt;</button>
                        <button onClick={handleFollowUpClose} className="text-xs ml-1" style={{ color: COLORS.onSurfaceVariant }}>â</button>
                      </div>
                    </div>

                    <div className="px-3 py-2 space-y-1">
                      {generateOptions(followUpState.questions[followUpState.currentIndex]).map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFollowUpAnswer(option)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150"
                          style={{ color: COLORS.onSurface, backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${COLORS.primary}15`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}>{idx + 1}</span>
                          <span>{option}</span>
                        </button>
                      ))}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>âï¸</span>
                        <input
                          type="text"
                          placeholder="Something else..."
                          className="flex-1 bg-transparent text-sm outline-none"
                          style={{ color: COLORS.onSurface, borderBottom: `1px solid ${COLORS.primary}30`, paddingBottom: '4px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              handleFollowUpAnswer((e.target as HTMLInputElement).value.trim());
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end px-4 py-2" style={{ borderTop: `1px solid ${COLORS.primary}10` }}>
                      <button
                        onClick={handleFollowUpSkip}
                        className="px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                        style={{ color: COLORS.onSurfaceVariant, backgroundColor: COLORS.surfaceContainer, border: `1px solid ${COLORS.primary}20` }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${COLORS.primary}15`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.surfaceContainer; }}
                      >Skip</button>
                    </div>
                  </div>
                )}

                {!isLoading && (
                  <button
                    onClick={handleAskAnother}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{ backgroundColor: COLORS.surfaceContainerHigh, color: COLORS.primary, border: `1px solid ${COLORS.primary}40` }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary; e.currentTarget.style.color = COLORS.onPrimary; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.surfaceContainerHigh; e.currentTarget.style.color = COLORS.primary; }}
                  >
                    Ask another question
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Completion Card */}
          <div
            style={{ ...glassEffect, borderImage: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryContainer}) 1` }}
            className="rounded-2xl p-6 border-2"
          >
            {!hasProfile ? (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.primaryContainer }} />
                  <div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.onSurface }}>Complete your profile</h3>
                    <p style={{ color: COLORS.onSurfaceVariant }}>Get personalized university recommendations &amp; study abroad guidance</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
                  style={{ backgroundColor: COLORS.primary, color: COLORS.onPrimary }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primaryContainer; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary; }}
                >Fill Profile Now</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" style={{ color: COLORS.primary }} />
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: COLORS.onSurface }}>Profile Complete</h3>
                    <p style={{ color: COLORS.onSurfaceVariant }}>
                      Target: {profileData?.target_degree || 'N/A'}{profileData?.target_field ? ` â ${profileData.target_field}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{ backgroundColor: COLORS.surfaceContainerHigh, color: COLORS.primary, border: `1px solid ${COLORS.primary}40` }}
                >Edit Profile</button>
              </div>
            )}
          </div>

          {/* AI Tips Section */}
          <div style={{ backgroundColor: COLORS.surfaceContainer, borderLeft: `4px solid ${COLORS.primary}` }} className="rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.onSurface }}>
              Next Steps by Swati AI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { number: '01', title: 'Explore Universities', description: 'Use our Course Finder to discover programs across 50+ countries matched to your profile' },
                { number: '02', title: 'Find Scholarships', description: 'Check Scholarship Finder for merit-based, need-based, and country-specific funding' },
                { number: '03', title: 'Build Your Application', description: 'Use Application Builder to organize SOPs, LORs, and documents for your target universities' },
              ].map((tip, index) => (
                <div key={index}>
                  <p className="text-sm font-bold mb-2" style={{ color: COLORS.primary }}>{tip.number}</p>
                  <h3 className="font-bold mb-2" style={{ color: COLORS.onSurface }}>{tip.title}</h3>
                  <p className="text-sm" style={{ color: COLORS.onSurfaceVariant }}>{tip.description}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => { if (searchInputRef.current) { searchInputRef.current.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              className="px-6 py-2 rounded-lg font-semibold transition-all duration-200"
              style={{ backgroundColor: COLORS.primary, color: COLORS.onPrimary }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primaryContainer; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary; }}
            >
              Ask Swati AI a Question
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
