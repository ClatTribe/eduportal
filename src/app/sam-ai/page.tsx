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
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Globe,
  Heart,
  Calendar,
  BookOpen,
} from 'lucide-react';

// ─── INTERFACES ───────────────────────────────────────────────
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
  target_countries: string[];
}

interface MatchedUniversity {
  id: number;
  university_name: string;
  program_name: string;
  country: string;
  campus: string;
  tuition_fees: string;
}

interface ShortlistItem {
  id: number;
  user_id: string;
  item_type: 'course' | 'scholarship';
  course_id: number | null;
  scholarship_id: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  course?: any;
}

interface DisplayUniversity {
  id: number;
  name: string;
  program: string;
  country: string;
  campus: string;
  fees: string;
  courseId: number;
}

interface Deadline {
  examName: string;
  registrationEnds: string;
  examDate: string;
  linkToApply: string;
  countries: string[];
  degreeTypes: string[];
}

// ─── EduAbroad Brand Theme ────────────────────────────────────
const COLORS = {
  accent: '#A51C30',
  accentLight: '#d4243e',
  accentBg: 'rgba(165, 28, 48, 0.06)',
  accentBorder: 'rgba(165, 28, 48, 0.15)',
  background: '#FFFFFF',
  surface: '#FEF2F3',
  surfaceHigh: '#FFF5F6',
  border: '#FECDD3',
  borderLight: '#FEE2E5',
  text: '#1a1a2e',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  white: '#FFFFFF',
  chipBg: 'rgba(165, 28, 48, 0.08)',
  chipBorder: 'rgba(165, 28, 48, 0.20)',
  blue: '#0369a1',
  blueBg: '#f0f9ff',
};

// ─── STUDY ABROAD DEADLINES (hardcoded) ───────────────────────
const ALL_DEADLINES: Deadline[] = [
  // USA
  {
    examName: 'GRE General Test',
    registrationEnds: 'Rolling (book 3-4 weeks ahead)',
    examDate: 'Year-round',
    linkToApply: 'https://www.ets.org/gre',
    countries: ['USA', 'Canada'],
    degreeTypes: ["Master's", 'PhD'],
  },
  {
    examName: 'GMAT Focus Edition',
    registrationEnds: 'Rolling',
    examDate: 'Year-round',
    linkToApply: 'https://www.mba.com/exams/gmat-focus-edition',
    countries: ['USA', 'UK', 'Canada', 'Australia', 'Singapore'],
    degreeTypes: ['MBA'],
  },
  {
    examName: 'TOEFL iBT',
    registrationEnds: 'Rolling (book 2-4 weeks ahead)',
    examDate: 'Year-round',
    linkToApply: 'https://www.ets.org/toefl',
    countries: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'Singapore'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA', 'Diploma'],
  },
  {
    examName: 'IELTS Academic',
    registrationEnds: 'Rolling (book 2-4 weeks ahead)',
    examDate: 'Year-round',
    linkToApply: 'https://ielts.org',
    countries: ['UK', 'Canada', 'Australia', 'Ireland', 'New Zealand', 'Singapore', 'USA', 'Germany'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA', 'Diploma'],
  },
  {
    examName: 'PTE Academic',
    registrationEnds: 'Rolling',
    examDate: 'Year-round',
    linkToApply: 'https://www.pearsonpte.com',
    countries: ['Australia', 'UK', 'Canada', 'New Zealand', 'Ireland'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA', 'Diploma'],
  },
  {
    examName: 'Duolingo English Test',
    registrationEnds: 'Rolling',
    examDate: 'On-demand (online)',
    linkToApply: 'https://englishtest.duolingo.com',
    countries: ['USA', 'Canada', 'UK', 'Australia'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA'],
  },
  // Country-specific intakes
  {
    examName: 'USA Fall 2026 — Application Deadlines',
    registrationEnds: 'Dec 2025 – Mar 2026',
    examDate: 'Aug–Sep 2026 start',
    linkToApply: 'https://www.commonapp.org',
    countries: ['USA'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA'],
  },
  {
    examName: 'USA Spring 2027 — Application Deadlines',
    registrationEnds: 'Jul – Oct 2026',
    examDate: 'Jan 2027 start',
    linkToApply: 'https://www.commonapp.org',
    countries: ['USA'],
    degreeTypes: ["Bachelor's", "Master's"],
  },
  {
    examName: 'UK September 2026 — UCAS Deadline',
    registrationEnds: 'Jan 2026 (UG) / Rolling (PG)',
    examDate: 'Sep 2026 start',
    linkToApply: 'https://www.ucas.com',
    countries: ['UK'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA'],
  },
  {
    examName: 'Canada Fall 2026 — Application Deadlines',
    registrationEnds: 'Jan – Apr 2026',
    examDate: 'Sep 2026 start',
    linkToApply: 'https://www.ouac.on.ca',
    countries: ['Canada'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA', 'Diploma'],
  },
  {
    examName: 'Australia Feb 2027 — Application Deadlines',
    registrationEnds: 'Jul – Nov 2026',
    examDate: 'Feb 2027 start',
    linkToApply: 'https://www.studyaustralia.gov.au',
    countries: ['Australia'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA'],
  },
  {
    examName: 'Australia Jul 2026 — Application Deadlines',
    registrationEnds: 'Dec 2025 – Apr 2026',
    examDate: 'Jul 2026 start',
    linkToApply: 'https://www.studyaustralia.gov.au',
    countries: ['Australia'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA'],
  },
  {
    examName: 'Germany Winter 2026 — Uni-Assist Deadline',
    registrationEnds: 'Mar – Jul 2026',
    examDate: 'Oct 2026 start',
    linkToApply: 'https://www.uni-assist.de',
    countries: ['Germany'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD'],
  },
  {
    examName: 'Ireland September 2026 — CAO/Direct',
    registrationEnds: 'Feb – Jun 2026',
    examDate: 'Sep 2026 start',
    linkToApply: 'https://www.cao.ie',
    countries: ['Ireland'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA'],
  },
  {
    examName: 'New Zealand Feb 2027 Intake',
    registrationEnds: 'Aug – Nov 2026',
    examDate: 'Feb 2027 start',
    linkToApply: 'https://www.studyinnewzealand.govt.nz',
    countries: ['New Zealand'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA', 'Diploma'],
  },
  {
    examName: 'Singapore Aug 2026 Intake',
    registrationEnds: 'Nov 2025 – Mar 2026',
    examDate: 'Aug 2026 start',
    linkToApply: 'https://www.nus.edu.sg',
    countries: ['Singapore'],
    degreeTypes: ["Bachelor's", "Master's", 'PhD', 'MBA'],
  },
  // Scholarship deadlines
  {
    examName: 'Chevening Scholarship (UK) 2026-27',
    registrationEnds: 'Aug – Nov 2025',
    examDate: 'Sep 2026 start',
    linkToApply: 'https://www.chevening.org',
    countries: ['UK'],
    degreeTypes: ["Master's"],
  },
  {
    examName: 'DAAD Scholarship (Germany) 2026-27',
    registrationEnds: 'Jul – Oct 2025',
    examDate: 'Oct 2026 start',
    linkToApply: 'https://www.daad.de/en',
    countries: ['Germany'],
    degreeTypes: ["Master's", 'PhD'],
  },
  {
    examName: 'Fulbright-Nehru Fellowship (USA) 2026-27',
    registrationEnds: 'Feb – May 2026',
    examDate: 'Aug 2027 start',
    linkToApply: 'https://www.usief.org.in',
    countries: ['USA'],
    degreeTypes: ["Master's", 'PhD'],
  },
  {
    examName: 'Commonwealth Scholarship (UK) 2026',
    registrationEnds: 'Sep – Dec 2025',
    examDate: 'Sep 2026 start',
    linkToApply: 'https://cscuk.fcdo.gov.uk',
    countries: ['UK'],
    degreeTypes: ["Master's", 'PhD'],
  },
  {
    examName: 'Australia Awards Scholarship 2026',
    registrationEnds: 'Feb – Apr 2026',
    examDate: 'Jan 2027 start',
    linkToApply: 'https://www.dfat.gov.au/people-to-people/australia-awards',
    countries: ['Australia'],
    degreeTypes: ["Master's", 'PhD'],
  },
];

// ─── COLLEGE RECOMMENDATIONS BY DEGREE (study abroad focus) ───
const getRecommendedUniversities = (degree: string, countries: string[]) => {
  const d = (degree || '').toLowerCase();
  const primaryCountry = (countries?.[0] || '').toLowerCase();

  if (d.includes('master') || d.includes('ms') || d.includes("master's")) {
    if (primaryCountry.includes('usa') || primaryCountry.includes('united states')) {
      return [
        { name: 'Massachusetts Institute of Technology (MIT)', category: 'AMBITIOUS', field: 'STEM / Engineering', country: 'USA' },
        { name: 'Stanford University', category: 'AMBITIOUS', field: 'CS / Engineering / Business', country: 'USA' },
        { name: 'University of Illinois Urbana-Champaign', category: 'TARGET', field: 'Engineering / CS', country: 'USA' },
      ];
    }
    if (primaryCountry.includes('uk') || primaryCountry.includes('united kingdom')) {
      return [
        { name: 'Imperial College London', category: 'AMBITIOUS', field: 'STEM / Business', country: 'UK' },
        { name: 'University of Edinburgh', category: 'TARGET', field: 'CS / Data Science', country: 'UK' },
        { name: 'University of Warwick', category: 'TARGET', field: 'Engineering / Management', country: 'UK' },
      ];
    }
    if (primaryCountry.includes('canada')) {
      return [
        { name: 'University of Toronto', category: 'AMBITIOUS', field: 'STEM / Business', country: 'Canada' },
        { name: 'University of British Columbia', category: 'TARGET', field: 'Engineering / CS', country: 'Canada' },
        { name: 'University of Waterloo', category: 'TARGET', field: 'CS / Engineering', country: 'Canada' },
      ];
    }
    if (primaryCountry.includes('australia')) {
      return [
        { name: 'University of Melbourne', category: 'AMBITIOUS', field: 'Engineering / Business', country: 'Australia' },
        { name: 'University of Sydney', category: 'TARGET', field: 'STEM / Business', country: 'Australia' },
        { name: 'Monash University', category: 'TARGET', field: 'Engineering / IT', country: 'Australia' },
      ];
    }
    if (primaryCountry.includes('germany')) {
      return [
        { name: 'Technical University of Munich (TUM)', category: 'AMBITIOUS', field: 'Engineering / CS', country: 'Germany' },
        { name: 'RWTH Aachen University', category: 'TARGET', field: 'Engineering', country: 'Germany' },
        { name: 'University of Stuttgart', category: 'TARGET', field: 'Engineering / Automotive', country: 'Germany' },
      ];
    }
    // Default for Master's
    return [
      { name: 'University of Toronto', category: 'AMBITIOUS', field: 'STEM / Business', country: 'Canada' },
      { name: 'Imperial College London', category: 'AMBITIOUS', field: 'Engineering / STEM', country: 'UK' },
      { name: 'University of Melbourne', category: 'TARGET', field: 'Engineering / Business', country: 'Australia' },
    ];
  }

  if (d.includes('mba')) {
    return [
      { name: 'INSEAD', category: 'AMBITIOUS', field: 'MBA', country: 'France / Singapore' },
      { name: 'London Business School', category: 'AMBITIOUS', field: 'MBA', country: 'UK' },
      { name: 'Rotman School of Management, UofT', category: 'TARGET', field: 'MBA', country: 'Canada' },
    ];
  }

  if (d.includes('bachelor') || d.includes('ug') || d.includes("bachelor's")) {
    return [
      { name: 'University of British Columbia', category: 'AMBITIOUS', field: 'Engineering / Sciences', country: 'Canada' },
      { name: 'University of Sydney', category: 'TARGET', field: 'Business / Engineering', country: 'Australia' },
      { name: 'University of Birmingham', category: 'TARGET', field: 'Various UG Programs', country: 'UK' },
    ];
  }

  if (d.includes('phd') || d.includes('research')) {
    return [
      { name: 'MIT', category: 'AMBITIOUS', field: 'Research / STEM', country: 'USA' },
      { name: 'University of Oxford', category: 'AMBITIOUS', field: 'Research / STEM', country: 'UK' },
      { name: 'ETH Zurich', category: 'TARGET', field: 'Engineering / Science', country: 'Switzerland' },
    ];
  }

  // Default
  return [
    { name: 'University of Toronto', category: 'AMBITIOUS', field: degree || 'General', country: 'Canada' },
    { name: 'University College London (UCL)', category: 'TARGET', field: degree || 'General', country: 'UK' },
    { name: 'University of Melbourne', category: 'TARGET', field: degree || 'General', country: 'Australia' },
  ];
};

// ═══════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
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

  // ── NEW: Shortlist state ──
  const [displayUniversities, setDisplayUniversities] = useState<DisplayUniversity[]>([]);
  const [shortlistLoading, setShortlistLoading] = useState(true);

  const quickSuggestions = [
    'Best universities in Canada for MS in CS',
    'Study in UK under ₹20 lakh per year',
    'Scholarships for Indian students in USA',
    'MBA abroad vs MBA in India',
    'Study in Germany for free',
    'PR pathway after studying in Australia',
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  // ─── Fetch profile ─────────────────────────────────────────
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
          target_countries: data.target_countries || [],
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

  // ─── NEW: Fetch shortlisted universities from Supabase ─────
  const fetchShortlist = useCallback(async () => {
    if (!user) return;
    setShortlistLoading(true);
    try {
      const { data: shortlistData, error: shortlistError } = await supabase
        .from('shortlist_builder')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'course')
        .order('created_at', { ascending: false });

      if (shortlistError) {
        console.error('Shortlist fetch error:', shortlistError);
        setShortlistLoading(false);
        return;
      }

      if (shortlistData && shortlistData.length > 0) {
        const courseIds = shortlistData
          .map((item: any) => item.course_id)
          .filter(Boolean);

        if (courseIds.length > 0) {
          const { data: coursesData } = await supabase
            .from('courses')
            .select('id, University, "Program Name", Country, Campus, "Yearly Tuition Fees"')
            .in('id', courseIds);

          if (coursesData) {
            const unis: DisplayUniversity[] = coursesData.map((c: any) => ({
              id: c.id,
              name: c.University || 'Unknown University',
              program: c['Program Name'] || '',
              country: c.Country || '',
              campus: c.Campus || '',
              fees: c['Yearly Tuition Fees'] || '',
              courseId: c.id,
            }));
            setDisplayUniversities(unis);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching shortlist:', err);
    } finally {
      setShortlistLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchShortlist();
    }
  }, [user, fetchProfile, fetchShortlist]);

  // ─── NEW: Filter deadlines by user's target countries & degree ─
  const getFilteredDeadlines = () => {
    if (!profileData?.target_countries?.length && !profileData?.target_degree)
      return ALL_DEADLINES.slice(0, 5);

    const userCountries = (profileData?.target_countries || []).map((c) => c.toLowerCase());
    const userDegree = (profileData?.target_degree || '').toLowerCase();

    const filtered = ALL_DEADLINES.filter((d) => {
      const countryMatch =
        userCountries.length === 0 ||
        d.countries.some((dc) => userCountries.some((uc) => dc.toLowerCase().includes(uc) || uc.includes(dc.toLowerCase())));
      const degreeMatch =
        !userDegree ||
        d.degreeTypes.some((dt) => dt.toLowerCase().includes(userDegree) || userDegree.includes(dt.toLowerCase()));
      return countryMatch && degreeMatch;
    });

    return filtered.length > 0 ? filtered.slice(0, 6) : ALL_DEADLINES.slice(0, 5);
  };

  const filteredDeadlines = getFilteredDeadlines();

  // ─── NEW: Get college recommendations ───────────────────────
  const recommendedUniversities = getRecommendedUniversities(
    profileData?.target_degree || '',
    profileData?.target_countries || [],
  );

  // ─── Format AI response ────────────────────────────────────
  const formatResponse = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#A51C30">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  // ─── University matching from AI response ──────────────────
  const [matchedUniversities, setMatchedUniversities] = useState<MatchedUniversity[]>([]);

  const extractUniversityNames = (text: string): string[] => {
    const names: string[] = [];
    const numberedPattern = /\d+\.\s+\*{0,2}([A-Z][^*:\n]+?)\*{0,2}\s*[:\-\u2014]/g;
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

  // ─── Follow-up extraction ──────────────────────────────────
  const extractFollowUps = (text: string): { mainText: string; questions: string[] } => {
    const questions: string[] = [];
    const lines = text.split('\n');
    const mainLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.endsWith('?') && trimmed.length > 15 && trimmed.length < 150) {
        const cleaned = trimmed.replace(/^[-*\u2022]\s*/, '').replace(/^\d+[.)]\s*/, '').replace(/\*\*/g, '');
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
      if (q.length > 15 && q.length < 150) foundInline.push(q);
    }

    if (foundInline.length >= 2 && foundInline.length > questions.length) {
      let cleanedText = text;
      for (const q of foundInline) {
        cleanedText = cleanedText.replace(new RegExp('\\d+\\.\\s*\\*{0,2}' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*\\\*/g, '\\*{0,2}') + '\\*{0,2}', 'g'), '');
      }
      cleanedText = cleanedText.replace(/\s{2,}/g, ' ').replace(/\s+([.,!])/g, '$1').trim();
      cleanedText = cleanedText.replace(/\s*(Once I have|Once you provide|With this information|Let me know|Please share|To help you best|We'll figure)[\s\S]*$/i, '').trim();
      return { mainText: cleanedText, questions: foundInline.slice(0, 3) };
    }

    return {
      mainText: questions.length > 0 ? mainLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() : text,
      questions: questions.slice(0, 3),
    };
  };

  // ─── Search handler ────────────────────────────────────────
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
      const response = await fetch('/api/sam-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          profileContext: profileData ? {
            degree: profileData.target_degree,
            field: profileData.target_field,
            country: Array.isArray(profileData.target_countries) ? profileData.target_countries.join(', ') : profileData.target_state,
            budget: Array.isArray(profileData.budget) ? profileData.budget.join(', ') : profileData.budget,
          } : null,
        }),
      });

      const data: AIResponse = await response.json();
      if (data.response) {
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
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

  // ─── Follow-up option generator ────────────────────────────
  const generateOptions = (question: string): string[] => {
    const q = question.toLowerCase();
    if (q.includes('ielts') || q.includes('toefl') || q.includes('pte') || q.includes('duolingo') || q.includes('english') || q.includes('language'))
      return ["Haven't taken yet", '5.5-6.0', '6.0-6.5', '6.5-7.0', '7.0-7.5', '7.5+'];
    if (q.includes('gre') || q.includes('gmat'))
      return ["Haven't taken", 'Below 300/600', '300-310/600-650', '310-320/650-700', '320+/700+', 'Not required for my course'];
    if (q.includes('field') || q.includes('course') || q.includes('program') || q.includes('subject') || q.includes('specializ') || q.includes('study'))
      return ['Computer Science / IT', 'Business / MBA', 'Engineering', 'Data Science / AI', 'Healthcare / Medicine', 'Arts / Humanities', 'Law', 'Design', 'Other'];
    if (q.includes('budget') || q.includes('fee') || q.includes('afford') || q.includes('cost') || q.includes('spend'))
      return ['Under ₹15 Lakh/year', '₹15-25 Lakh/year', '₹25-40 Lakh/year', '₹40-60 Lakh/year', '₹60 Lakh+/year', 'Need full scholarship'];
    if (q.includes('country') || q.includes('destination') || q.includes('where') || q.includes('location') || q.includes('prefer'))
      return ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'Singapore', 'Open to suggestions'];
    if (q.includes('intake') || q.includes('when') || q.includes('start') || q.includes('join') || q.includes('semester'))
      return ['Fall 2026 (Sep)', 'Spring 2027 (Jan)', 'Fall 2027 (Sep)', 'Not sure yet'];
    if (q.includes('work experience') || q.includes('years of experience') || q.includes('working'))
      return ['Fresher', '1-2 years', '3-5 years', '5+ years'];
    if (q.includes('degree') || q.includes('level') || q.includes('ug') || q.includes('pg') || q.includes('masters') || q.includes('bachelor'))
      return ["Undergraduate (Bachelor's)", "Postgraduate (Master's)", 'PhD / Research', 'MBA', 'Diploma / Certificate'];
    if (q.includes('priority') || q.includes('important') || q.includes('matters') || q.includes('looking for'))
      return ['University ranking', 'Scholarships & affordability', 'PR / work visa pathway', 'Course specialization', 'Campus life & location'];
    if (q.includes('score') || q.includes('percentage') || q.includes('cgpa') || q.includes('gpa') || q.includes('marks') || q.includes('academic'))
      return ['Below 60% / 6.0 CGPA', '60-70% / 6.0-7.0', '70-80% / 7.0-8.0', '80-90% / 8.0-9.0', '90%+ / 9.0+'];
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

  // ═══════════════════════════════════════════════════════════
  // ─── RENDER ────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center" style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.accent }}></div>
            <p className="mt-4" style={{ color: COLORS.textSecondary }}>Loading...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center px-4" style={{ backgroundColor: COLORS.surface, minHeight: '100vh' }}>
          <div className="rounded-2xl p-8 max-w-md w-full text-center" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 24px rgba(165, 28, 48, 0.08)' }}>
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.accent }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
              Welcome to Ask Swati AI
            </h2>
            <p className="mb-6" style={{ color: COLORS.textSecondary }}>
              Sign in to access your AI-powered study abroad counsellor
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200"
              style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; }}
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
      <div className="py-8 mt-18 sm:mt-0" style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
        <div className="max-w-5xl mx-auto px-4 space-y-8">

          {/* ─── Welcome Header ─── */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2" style={{ color: COLORS.text }}>
                Welcome back, {displayName}
              </h1>
              <p className="text-lg" style={{ color: COLORS.textSecondary }}>
                Your AI-powered study abroad counsellor is ready.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">SWATI AI ACTIVE</span>
            </div>
          </div>

          {/* ─── AI Search Bar ─── */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{
                backgroundColor: COLORS.white,
                border: `2px solid ${COLORS.accent}`,
                boxShadow: '0 4px 20px rgba(165, 28, 48, 0.10)',
              }}
            >
              <Search className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.accent }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchQuery); }}
                placeholder="Ask me anything about studying abroad..."
                className="flex-1 bg-transparent outline-none text-lg"
                style={{ color: COLORS.text, caretColor: COLORS.accent }}
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isLoading}
                className="p-3 rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentLight; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; }}
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
                  style={{ backgroundColor: COLORS.chipBg, color: COLORS.accent, border: `1px solid ${COLORS.chipBorder}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; e.currentTarget.style.color = COLORS.white; e.currentTarget.style.borderColor = COLORS.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.chipBg; e.currentTarget.style.color = COLORS.accent; e.currentTarget.style.borderColor = COLORS.chipBorder; }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* ─── AI Response Card ─── */}
            {showResponse && messages.length > 0 && (
              <div className="rounded-2xl p-6 space-y-4 mt-6" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-2xl rounded-xl px-4 py-3" style={{ backgroundColor: COLORS.accent, color: COLORS.white }}>
                    <p className="text-sm">{messages[0]?.content}</p>
                  </div>
                </div>

                {/* AI Response */}
                {isLoading ? (
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: COLORS.accent }} />
                    <div className="space-y-2">
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>
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
                      <Sparkles className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: COLORS.accent }} />
                      <div className="flex-1">
                        <div
                          className="prose text-sm max-w-none leading-relaxed"
                          style={{ color: COLORS.text }}
                          dangerouslySetInnerHTML={{ __html: formatResponse(mainText) }}
                        />

                        {/* University Tiles from Supabase */}
                        {matchedUniversities.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: COLORS.textMuted }}>
                              Explore on EduAbroad
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {matchedUniversities.map((uni, idx) => (
                                <div
                                  key={uni.id}
                                  className="rounded-xl p-4 cursor-pointer transition-all duration-200"
                                  style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}` }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(165, 28, 48, 0.12)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                  onClick={() => router.push(`/course-finder/${uni.id}`)}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ backgroundColor: COLORS.accentBg, color: COLORS.accent }}>{idx + 1}</div>
                                      <Globe className="w-4 h-4" style={{ color: COLORS.accent }} />
                                    </div>
                                    <ChevronRight className="w-4 h-4" style={{ color: COLORS.textMuted }} />
                                  </div>
                                  <h4 className="text-sm font-semibold leading-tight mb-1" style={{ color: COLORS.text }}>{uni.university_name}</h4>
                                  {uni.program_name && <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>{uni.program_name}</p>}
                                  <div className="flex gap-2 flex-wrap">
                                    {uni.country && (
                                      <span className="text-xs px-2 py-0.5 rounded inline-block" style={{ backgroundColor: COLORS.accentBg, color: COLORS.accent }}>
                                        {uni.campus ? `${uni.campus}, ${uni.country}` : uni.country}
                                      </span>
                                    )}
                                    {uni.tuition_fees && (
                                      <span className="text-xs px-2 py-0.5 rounded inline-block" style={{ backgroundColor: COLORS.blueBg, color: COLORS.blue }}>
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
                  <div className="mt-4 rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}` }}>
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.borderLight}`, backgroundColor: COLORS.surfaceHigh }}>
                      <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                        {followUpState.questions[followUpState.currentIndex]}
                      </p>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <button
                          onClick={() => followUpState.currentIndex > 0 && setFollowUpState({ ...followUpState, currentIndex: followUpState.currentIndex - 1 })}
                          disabled={followUpState.currentIndex === 0}
                          className="text-xs"
                          style={{ color: followUpState.currentIndex === 0 ? COLORS.textMuted : COLORS.accent, cursor: followUpState.currentIndex === 0 ? 'default' : 'pointer' }}
                        >&lt;</button>
                        <span className="text-xs" style={{ color: COLORS.textSecondary }}>{followUpState.currentIndex + 1} of {followUpState.questions.length}</span>
                        <button
                          onClick={() => followUpState.currentIndex < followUpState.questions.length - 1 && setFollowUpState({ ...followUpState, currentIndex: followUpState.currentIndex + 1 })}
                          disabled={followUpState.currentIndex === followUpState.questions.length - 1}
                          className="text-xs"
                          style={{ color: followUpState.currentIndex === followUpState.questions.length - 1 ? COLORS.textMuted : COLORS.accent, cursor: followUpState.currentIndex === followUpState.questions.length - 1 ? 'default' : 'pointer' }}
                        >&gt;</button>
                        <button onClick={handleFollowUpClose} className="text-xs ml-1" style={{ color: COLORS.textMuted }}>&times;</button>
                      </div>
                    </div>

                    <div className="px-3 py-2 space-y-1">
                      {generateOptions(followUpState.questions[followUpState.currentIndex]).map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFollowUpAnswer(option)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150"
                          style={{ color: COLORS.text, backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentBg; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: COLORS.accentBg, color: COLORS.accent }}>{idx + 1}</span>
                          <span>{option}</span>
                        </button>
                      ))}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-sm" style={{ color: COLORS.textMuted }}>&#9998;</span>
                        <input
                          type="text"
                          placeholder="Something else..."
                          className="flex-1 bg-transparent text-sm outline-none"
                          style={{ color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '4px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              handleFollowUpAnswer((e.target as HTMLInputElement).value.trim());
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end px-4 py-2" style={{ borderTop: `1px solid ${COLORS.borderLight}` }}>
                      <button
                        onClick={handleFollowUpSkip}
                        className="px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                        style={{ color: COLORS.textSecondary, backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentBg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.surface; }}
                      >Skip</button>
                    </div>
                  </div>
                )}

                {!isLoading && (
                  <button
                    onClick={handleAskAnother}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{ backgroundColor: COLORS.white, color: COLORS.accent, border: `1px solid ${COLORS.accent}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; e.currentTarget.style.color = COLORS.white; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.white; e.currentTarget.style.color = COLORS.accent; }}
                  >
                    Ask another question
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── Profile Completion Card ─── */}
          <div
            className="rounded-2xl p-6 border-2"
            style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}
          >
            {!hasProfile ? (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.accent }} />
                  <div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.text }}>Complete your profile</h3>
                    <p style={{ color: COLORS.textSecondary }}>Get personalized university recommendations &amp; study abroad guidance</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
                  style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentLight; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; }}
                >Fill Profile Now</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" style={{ color: COLORS.accent }} />
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>Profile Complete</h3>
                    <p style={{ color: COLORS.textSecondary }}>
                      Target: {profileData?.target_degree || 'N/A'}{profileData?.target_field ? ` — ${profileData.target_field}` : ''}
                      {profileData?.target_countries?.length ? ` → ${profileData.target_countries.join(', ')}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{ backgroundColor: COLORS.surface, color: COLORS.accent, border: `1px solid ${COLORS.border}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.surface; }}
                >Edit Profile</button>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ─── NEW SECTION: My Shortlist ─────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: COLORS.accent }} />
                <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>My Shortlist</h2>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
                >
                  {displayUniversities.length}
                </span>
                {displayUniversities.length > 0 && (
                  <button
                    onClick={() => router.push('/shortlist-builder')}
                    className="flex items-center gap-1 text-sm font-semibold transition-all duration-200"
                    style={{ color: COLORS.accent }}
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {shortlistLoading ? (
              <div className="rounded-xl p-8 text-center" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 mb-2" style={{ borderColor: COLORS.accent }}></div>
                <p style={{ color: COLORS.textSecondary }}>Loading your shortlist...</p>
              </div>
            ) : displayUniversities.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                <Globe className="w-10 h-10 mx-auto mb-3" style={{ color: COLORS.textMuted }} />
                <p className="mb-1 font-semibold" style={{ color: COLORS.text }}>No universities shortlisted yet</p>
                <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>Use Course Finder to discover and shortlist universities!</p>
                <button
                  onClick={() => router.push('/course-finder')}
                  className="px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
                  style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentLight; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; }}
                >
                  Find Universities
                </button>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                {displayUniversities.slice(0, 6).map((uni, index) => (
                  <div
                    key={`${uni.id}-${index}`}
                    className="rounded-xl p-4 flex-shrink-0 w-72 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(165, 28, 48, 0.10)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => router.push(`/course-finder/${uni.courseId}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Globe className="w-5 h-5" style={{ color: COLORS.accent }} />
                      <ChevronRight className="w-4 h-4" style={{ color: COLORS.textMuted }} />
                    </div>
                    <h3 className="font-bold mb-1 text-sm leading-tight" style={{ color: COLORS.text }}>{uni.name}</h3>
                    {uni.program && <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>{uni.program}</p>}
                    <div className="flex gap-2 flex-wrap mt-2">
                      {uni.country && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: COLORS.accentBg, color: COLORS.accent }}>
                          {uni.campus ? `${uni.campus}, ${uni.country}` : uni.country}
                        </span>
                      )}
                      {uni.fees && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: COLORS.blueBg, color: COLORS.blue }}>
                          {uni.fees}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ─── NEW SECTION: Your College Recommendations ─────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5" style={{ color: COLORS.accent }} />
              <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>Your College Recommendations</h2>
            </div>

            {!hasProfile ? (
              <div className="rounded-xl p-8 text-center" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.textSecondary }}>Complete your profile to unlock AI-powered university recommendations</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedUniversities.map((uni, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-4 cursor-pointer transition-all duration-200 group"
                    style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(165, 28, 48, 0.10)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Globe className="w-5 h-5" style={{ color: COLORS.accent }} />
                      <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" style={{ color: COLORS.textMuted }} />
                    </div>
                    <h3 className="font-bold text-base mb-2" style={{ color: COLORS.text }}>{uni.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: uni.category === 'AMBITIOUS' ? COLORS.accentBg : COLORS.blueBg,
                          color: uni.category === 'AMBITIOUS' ? COLORS.accent : COLORS.blue,
                        }}
                      >
                        {uni.category}
                      </span>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.surface, color: COLORS.textSecondary }}>
                        {uni.field}
                      </span>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: COLORS.chipBg, color: COLORS.accent }}>
                        {uni.country}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ─── NEW SECTION: Upcoming Deadlines ───────────────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" style={{ color: COLORS.accent }} />
              <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>Upcoming Deadlines</h2>
              <div className="w-2 h-2 rounded-full animate-pulse ml-1" style={{ backgroundColor: '#ef4444' }}></div>
            </div>
            {profileData?.target_countries?.length ? (
              <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
                Showing deadlines for <span style={{ color: COLORS.accent, fontWeight: 600 }}>{profileData.target_countries.join(', ')}</span>
                {profileData?.target_degree ? <> · <span style={{ color: COLORS.accent, fontWeight: 600 }}>{profileData.target_degree}</span></> : ''}
              </p>
            ) : (
              <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
                Complete your profile to see deadlines for your target countries
              </p>
            )}

            <div className="space-y-4">
              {filteredDeadlines.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                  <p style={{ color: COLORS.textSecondary }}>No upcoming deadlines found. Check back later!</p>
                </div>
              ) : (
                filteredDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-4 flex gap-4 items-start"
                    style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}` }}
                  >
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: index === 0 ? '#ef4444' : COLORS.accent }}
                      ></div>
                      {index < filteredDeadlines.length - 1 && (
                        <div className="w-0.5 h-8" style={{ backgroundColor: COLORS.border }}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1" style={{ color: COLORS.text }}>{deadline.examName}</h4>
                      <p className="text-sm mb-1" style={{ color: COLORS.textSecondary }}>
                        Registration: <span style={{ color: COLORS.accent }}>{deadline.registrationEnds}</span>
                      </p>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                        Date: <span style={{ color: COLORS.text }}>{deadline.examDate}</span>
                      </p>
                    </div>
                    <a
                      href={deadline.linkToApply}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0"
                      style={{ backgroundColor: COLORS.accentBg, color: COLORS.accent, border: `1px solid ${COLORS.chipBorder}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; e.currentTarget.style.color = COLORS.white; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentBg; e.currentTarget.style.color = COLORS.accent; }}
                    >
                      Apply
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─── Next Steps Section ─── */}
          <div className="rounded-xl p-6" style={{ backgroundColor: COLORS.surface, borderLeft: `4px solid ${COLORS.accent}` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text }}>
              Next Steps by Swati AI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { number: '01', title: 'Explore Universities', description: 'Use our Course Finder to discover programs across 50+ countries matched to your profile' },
                { number: '02', title: 'Find Scholarships', description: 'Check Scholarship Finder for merit-based, need-based, and country-specific funding' },
                { number: '03', title: 'Build Your Application', description: 'Use Application Builder to organize SOPs, LORs, and documents for your target universities' },
              ].map((tip, index) => (
                <div key={index}>
                  <p className="text-sm font-bold mb-2" style={{ color: COLORS.accent }}>{tip.number}</p>
                  <h3 className="font-bold mb-2" style={{ color: COLORS.text }}>{tip.title}</h3>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>{tip.description}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => { if (searchInputRef.current) { searchInputRef.current.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              className="px-6 py-2 rounded-lg font-semibold transition-all duration-200"
              style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.accentLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.accent; }}
            >
              Ask Swati AI a Question
            </button>
          </div>

        </div>
      </div>
    </DefaultLayout>
  );
}