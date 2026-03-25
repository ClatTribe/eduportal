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

// EduAbroad Brand Theme â Crimson Red + White
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
    'Study in UK under \u20B920 lakh per year',
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
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#A51C30">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

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
        6×W3¢2ä6×W2ÇÂrrÀ¢GVFöåöfVW3¢5²uV&ÇGVFöâfVW2uÒÇÂrrÀ¢Ò°¢Ð¢Ð¢6WDÖF6VEVæfW'6FW2FÆW2ç6Æ6RÂb°¢ÒVÇ6R°¢6WDÖF6VEVæfW'6FW2µÒ°¢Ð¢Ò6F6W'"°¢6öç6öÆRæW'&÷"tW'&÷"fWF6ærÖF6ærVæfW'6FW3¢rÂW'"°¢Ð¢ÒÂµÒ° ¢W6TVffV7BÓâ°¢bÖW76vW2æÆVæwFÂ"²6WDÖF6VEVæfW'6FW2µÒ²&WGW&ã²Ð¢6öç7BÆ7D×6rÒÖW76vW5¶ÖW76vW2æÆVæwFÒÓ°¢bÆ7D×6rç&öÆRÓÒv767FçBr&WGW&ã°¢6öç7BæÖW2ÒWG&7EVæfW'6GæÖW2Æ7D×6ræ6öçFVçB°¢bæÖW2æÆVæwFâ°¢fWF6ÖF6æuVæfW'6FW2æÖW2°¢ÒVÇ6R°¢6WDÖF6VEVæfW'6FW2µÒ°¢Ð¢ÒÂ¶ÖW76vW2ÂfWF6ÖF6æuVæfW'6FW5Ò° ¢6öç7BWG&7DföÆÆ÷uW2ÒFWC¢7G&ær¢²ÖåFWC¢7G&æs²VW7Föç3¢7G&æuµÒÒÓâ°¢6öç7BVW7Föç3¢7G&æuµÒÒµÓ°¢6öç7BÆæW2ÒFWBç7ÆBuÆâr°¢6öç7BÖäÆæW3¢7G&æuµÒÒµÓ° ¢f÷"6öç7BÆæRöbÆæW2°¢6öç7BG&ÖÖVBÒÆæRçG&Ò°¢bG&ÖÖVBæVæG5vFsòrbbG&ÖÖVBæÆVæwFâRbbG&ÖÖVBæÆVæwFÂS°¢6öç7B6ÆVæVBÒG&ÖÖVBç&WÆ6Rõå²Ò¥ÇS##%ÕÇ2¢òÂrrç&WÆ6RõåÆBµ²âÕÇ2¢òÂrrç&WÆ6RõÂ¥Â¢örÂrr°¢VW7Föç2çW66ÆVæVB°¢ÒVÇ6R°¢ÖäÆæW2çW6ÆæR°¢Ð¢Ð ¢6öç7BæÆæUGFW&âÒõÆBµÂåÇ2²µãõÒµÃòös°¢ÆWBÖF6°¢6öç7Bf÷VæDæÆæS¢7G&æuµÒÒµÓ°¢vÆRÖF6ÒæÆæUGFW&âæWV2FWBÓÒçVÆÂ°¢6öç7BÒÖF6³ÒçG&Òç&WÆ6RõÂ¥Â¢örÂrr°¢bæÆVæwFâRbbæÆVæwFÂS°¢f÷VæDæÆæRçW6°¢Ð¢Ð ¢bf÷VæDæÆæRæÆVæwFãÒ"bbf÷VæDæÆæRæÆVæwFâVW7Föç2æÆVæwF°¢ÆWB6ÆVæVEFWBÒFWC°¢f÷"6öç7Böbf÷VæDæÆæR°¢6ÆVæVEFWBÒ6ÆVæVEFWBç&WÆ6RæWr&VtWuÅÆBµÅÂåÅÇ2¥ÅÂ§³Ã'Òr²ç&WÆ6Rõ²â¢³õâG·ÒÅµÅÕÅÅÒörÂuÅÂBbrç&WÆ6RõÅÅÂ¥ÅÅÂ¢örÂuÅÂ§³Ã'Òr²uÅÂ§³Ã'ÒrÂvrrÂrr°¢Ð¢6ÆVæVEFWBÒ6ÆVæVEFWBç&WÆ6RõÇ7³"ÇÒörÂrrç&WÆ6RõÇ2²²âÂÒörÂrCrçG&Ò°¢6ÆVæVEFWBÒ6ÆVæVEFWBç&WÆ6RõÇ2¢öæ6RfWÄöæ6R÷R&÷fFWÅvFF2æf÷&ÖFöçÄÆWBÖR¶æ÷wÅÆV6R6&WÅFòVÇ÷R&W7GÅvRvÆÂfwW&RµÇ5Å5Ò¢BöÂrrçG&Ò°¢&WGW&â²ÖåFWC¢6ÆVæVEFWBÂVW7Föç3¢f÷VæDæÆæRç6Æ6RÂ2Ó°¢Ð ¢&WGW&â°¢ÖåFWC¢VW7Föç2æÆVæwFâòÖäÆæW2æ¦öâuÆârç&WÆ6RõÆç³2ÇÒörÂuÆåÆârçG&Ò¢FWBÀ¢VW7Föç3¢VW7Föç2ç6Æ6RÂ2À¢Ó°¢Ó° ¢6öç7BæFÆU6V&6Ò7æ2VW'¢7G&ærÓâ°¢bVW'çG&Ò&WGW&ã°¢6WE6V&6VW'rr°¢6WD4ÆöFærG'VR°¢6WDföÆÆ÷uW7FFRçVÆÂ°¢föÆÆ÷uWG&vvW&VE&Vbæ7W'&VçBÒfÇ6S°¢6öç7BæWtÖW76vW3¢ÖW76vUµÒÒ²ââæÖW76vW2Â²&öÆS¢wW6W"rÂ6öçFVçC¢VW'ÕÓ°¢6WDÖW76vW2æWtÖW76vW2°¢6WE6÷u&W7öç6RG'VR° ¢G'°¢6öç7B&W7öç6RÒvBfWF6röö6²×7vFÖrÂ°¢ÖWFöC¢uõ5BrÀ¢VFW'3¢²t6öçFVçBÕGRs¢vÆ6Föâö§6öârÒÀ¢&öG¢¥4ôâç7G&ævg°¢ÖW76vW3¢æWtÖW76vW2À¢&öfÆT6öçFWC¢&öfÆTFFò°¢FVw&VS¢&öfÆTFFçF&vWEöFVw&VRÀ¢fVÆC¢&öfÆTFFçF&vWEöfVÆBÀ¢6÷VçG'¢&öfÆTFFçF&vWE÷7FFSòæ¦öârÂrÀ¢'VFvWC¢&öfÆTFFæ'VFvWCòæ¦öârÂrÀ¢Ò¢çVÆÂÀ¢ÒÀ¢Ò° ¢6öç7BFF¢&W7öç6RÒvB&W7öç6Ræ§6öâ°¢bFFç&W7öç6R°¢6WDÖW76vW2²ââææWtÖW76vW2Â²&öÆS¢v767FçBrÂ6öçFVçC¢FFç&W7öç6RÕÒ°¢ÒVÇ6R°¢6WDÖW76vW2²ââææWtÖW76vW2Â²&öÆS¢v767FçBrÂ6öçFVçC¢u6÷''ÂVæ6÷VçFW&VBâW'&÷"âÆV6RG'vâârÕÒ°¢Ð¢Ò6F6W'&÷"°¢6öç6öÆRæW'&÷"tW'&÷#¢rÂW'&÷"°¢6WDÖW76vW2²ââææWtÖW76vW2Â²&öÆS¢v767FçBrÂ6öçFVçC¢u6÷''ÂVæ6÷VçFW&VBâW'&÷"âÆV6RG'vâârÕÒ°¢ÒfæÆÇ°¢6WD4ÆöFærfÇ6R°¢Ð¢Ó° ¢6öç7BæFÆUV6µ7VvvW7FöâÒ7VvvW7Föã¢7G&ærÓâæFÆU6V&67VvvW7Föâ° ¢6öç7BæFÆT6´æ÷FW"ÒÓâ°¢6WDÖW76vW2µÒ°¢6WE6÷u&W7öç6RfÇ6R°¢6WDföÆÆ÷uW7FFRçVÆÂ°¢6WDÖF6VEVæfW'6FW2µÒ°¢föÆÆ÷uWG&vvW&VE&Vbæ7W'&VçBÒfÇ6S°¢föÆÆ÷uW&÷VæDFöæU&Vbæ7W'&VçBÒfÇ6S°¢b6V&6çWE&Vbæ7W'&VçB6V&6çWE&Vbæ7W'&VçBæfö7W2°¢Ó° ¢6öç7BvVæW&FT÷Föç2ÒVW7Föã¢7G&ær¢7G&æuµÒÓâ°¢6öç7BÒVW7FöâçFôÆ÷vW$66R° ¢bææ6ÇVFW2vVÇG2rÇÂææ6ÇVFW2wFöVfÂrÇÂææ6ÇVFW2wFRrÇÂææ6ÇVFW2vGVöÆævòrÇÂææ6ÇVFW2vVævÆ6rÇÂææ6ÇVFW2vÆæwVvRr°¢&WGW&â²$fVâwBF¶VâWB"ÂsRãRÓbãrÂsbãÓbãRrÂsbãRÓrãrÂsrãÓrãRrÂsrãR²uÓ°¢Ð¢bææ6ÇVFW2vw&RrÇÂææ6ÇVFW2vvÖBr°¢&WGW&â²$fVâwBF¶Vâ"Ât&VÆ÷r3ócrÂs3Ó3ócÓcSrÂs3Ó3#ócSÓsrÂs3#²ós²rÂtæ÷B&WV&VBf÷"×6÷W'6RuÓ°¢Ð¢bææ6ÇVFW2vfVÆBrÇÂææ6ÇVFW2v6÷W'6RrÇÂææ6ÇVFW2w&öw&ÒrÇÂææ6ÇVFW2w7V&¦V7BrÇÂææ6ÇVFW2w7V6Æ¢rÇÂææ6ÇVFW2w7GVGr°¢&WGW&â²t6ö×WFW"66Væ6RòBrÂt'W6æW72òÔ$rÂtVævæVW&ærrÂtFF66Væ6RòrÂtVÇF6&RòÖVF6æRrÂt'G2òVÖæFW2rÂtÆrrÂtFW6vârÂt÷FW"uÓ°¢Ð¢bææ6ÇVFW2v'VFvWBrÇÂææ6ÇVFW2vfVRrÇÂææ6ÇVFW2vff÷&BrÇÂææ6ÇVFW2v6÷7BrÇÂææ6ÇVFW2w7VæBr°¢&WGW&â²uVæFW"ÇS##RÆ¶÷V"rÂuÇS##RÓ#RÆ¶÷V"rÂuÇS###RÓCÆ¶÷V"rÂuÇS##CÓcÆ¶÷V"rÂuÇS##cÆ¶²÷V"rÂtæVVBgVÆÂ66öÆ'6uÓ°¢Ð¢bææ6ÇVFW2v6÷VçG'rÇÂææ6ÇVFW2vFW7FæFöârÇÂææ6ÇVFW2wvW&RrÇÂææ6ÇVFW2vÆö6FöârÇÂææ6ÇVFW2w&VfW"r°¢&WGW&â²uU4rÂuT²rÂt6æFrÂtW7G&ÆrÂtvW&ÖçrÂt&VÆæBrÂtæWr¦VÆæBrÂu6æv÷&RrÂt÷VâFò7VvvW7Föç2uÓ°¢Ð¢bææ6ÇVFW2vçF¶RrÇÂææ6ÇVFW2wvVârÇÂææ6ÇVFW2w7F'BrÇÂææ6ÇVFW2v¦öârÇÂææ6ÇVFW2w6VÖW7FW"r°¢&WGW&â²tfÆÂ##b6WrÂu7&ær##r¦ârÂtfÆÂ##r6WrÂtæ÷B7W&RWBuÓ°¢Ð¢bææ6ÇVFW2wv÷&²WW&Væ6RrÇÂææ6ÇVFW2wV'2öbWW&Væ6RrÇÂææ6ÇVFW2wv÷&¶ærr°¢&WGW&â²tg&W6W"rÂsÓ"V'2rÂs2ÓRV'2rÂsR²V'2uÓ°¢Ð¢bææ6ÇVFW2vFVw&VRrÇÂææ6ÇVFW2vÆWfVÂrÇÂææ6ÇVFW2wVrrÇÂææ6ÇVFW2wrrÇÂææ6ÇVFW2vÖ7FW'2rÇÂææ6ÇVFW2v&6VÆ÷"r°¢&WGW&â²%VæFW&w&GVFR&6VÆ÷"w2"Â%÷7Fw&GVFRÖ7FW"w2"ÂuBò&W6V&6rÂtÔ$rÂtFÆöÖò6W'Ff6FRuÓ°¢Ð¢bææ6ÇVFW2w&÷&GrÇÂææ6ÇVFW2v×÷'FçBrÇÂææ6ÇVFW2vÖGFW'2rÇÂææ6ÇVFW2vÆöö¶ærf÷"r°¢&WGW&â²uVæfW'6G&æ¶ærrÂu66öÆ'62bff÷&F&ÆGrÂu"òv÷&²f6FvrÂt6÷W'6R7V6Æ¦FöârÂt6×W2ÆfRbÆö6FöâuÓ°¢Ð¢bææ6ÇVFW2w66÷&RrÇÂææ6ÇVFW2wW&6VçFvRrÇÂææ6ÇVFW2v6wrÇÂææ6ÇVFW2vwrÇÂææ6ÇVFW2vÖ&·2rÇÂææ6ÇVFW2v6FVÖ2r°¢&WGW&â²t&VÆ÷rcRòbã4urÂscÓsRòbãÓrãrÂssÓRòrãÓãrÂsÓRòãÓãrÂsR²òã²uÓ°¢Ð¢&WGW&âµÓ°¢Ó° ¢6öç7BæFÆTföÆÆ÷uWç7vW"Òç7vW#¢7G&ærÓâ°¢bföÆÆ÷uW7FFR&WGW&ã°¢6öç7BæWtç7vW'2Ò²ââæföÆÆ÷uW7FFRæç7vW'2Â¶föÆÆ÷uW7FFRæ7W'&VçDæFWÓ¢ç7vW"Ó°¢6öç7BæWDæFWÒföÆÆ÷uW7FFRæ7W'&VçDæFW²° ¢bæWDæFWãÒföÆÆ÷uW7FFRçVW7Föç2æÆVæwF°¢6öç7B6ö×ÆVBÒföÆÆ÷uW7FFRçVW7Föç0¢æÖÂÓâG·ÒG¶æWtç7vW'5¶ÒÇÂu6¶VBwÖ¢æ¦öâuÆâr²uÆåÆå´däÂå5tU%Ò&6VBöâ×ç7vW'2&÷fRÂ&V6öÖÖVæBÖR7V6f2VæfW'6FW2âFòæ÷B6²Ö÷&RVW7Föç2âs°¢6WDföÆÆ÷uW7FFRçVÆÂ°¢föÆÆ÷uW&÷VæDFöæU&Vbæ7W'&VçBÒG'VS°¢æFÆU6V&66ö×ÆVB°¢ÒVÇ6R°¢6WDföÆÆ÷uW7FFR²ââæföÆÆ÷uW7FFRÂ7W'&VçDæFW¢æWDæFWÂç7vW'3¢æWtç7vW'2Ò°¢Ð¢Ó° ¢6öç7BæFÆTföÆÆ÷uW6¶ÒÓâ°¢bföÆÆ÷uW7FFR&WGW&ã°¢6öç7BæWDæFWÒföÆÆ÷uW7FFRæ7W'&VçDæFW²°¢bæWDæFWãÒföÆÆ÷uW7FFRçVW7Föç2æÆVæwF°¢6öç7B6ö×ÆVBÒföÆÆ÷uW7FFRçVW7Föç0¢æÖÂÓâG·ÒG¶föÆÆ÷uW7FFRæç7vW'5¶ÒÇÂu6¶VBwÖ¢æ¦öâuÆâr²uÆåÆå´däÂå5tU%Ò&6VBöâ×ç7vW'2&÷fRÂ&V6öÖÖVæBÖR7V6f2VæfW'6FW2âFòæ÷B6²Ö÷&RVW7Föç2âs°¢6WDföÆÆ÷uW7FFRçVÆÂ°¢föÆÆ÷uW&÷VæDFöæU&Vbæ7W'&VçBÒG'VS°¢æFÆU6V&66ö×ÆVB°¢ÒVÇ6R°¢6WDföÆÆ÷uW7FFR²ââæföÆÆ÷uW7FFRÂ7W'&VçDæFW¢æWDæFWÒ°¢Ð¢Ó° ¢6öç7BæFÆTföÆÆ÷uW6Æ÷6RÒÓâ6WDföÆÆ÷uW7FFRçVÆÂ° ¢bÆöFær°¢&WGW&â¢ÄFVfVÇDÆ÷WCà¢ÆFb6Æ74æÖSÒ&fÆWFV×2Ö6VçFW"§W7FgÖ6VçFW""7GÆS×·²&6¶w&÷VæD6öÆ÷#¢4ôÄõ%2æ&6¶w&÷VæBÂÖäVvC¢sfr×Óà¢ÆFb6Æ74æÖSÒ'FWBÖ6VçFW"#à¢ÆFb6Æ74æÖSÒ&æÆæRÖ&Æö6²æÖFR×7â&÷VæFVBÖgVÆÂÓ"rÓ"&÷&FW"Ö"Ó""7GÆS×·²&÷&FW$6öÆ÷#¢4ôÄõ%2æ66VçB×ÓãÂöFcà¢Ç6Æ74æÖSÒ&×BÓB"7GÆS×·²6öÆ÷#¢4ôÄõ%2çFWE6V6öæF'×ÓäÆöFærââãÂ÷à¢ÂöFcà¢ÂöFcà¢ÂôFVfVÇDÆ÷WCà¢°¢Ð ¢bW6W"°¢&WGW&â¢ÄFVfVÇDÆ÷WCà¢ÆFb6Æ74æÖSÒ&fÆWFV×2Ö6VçFW"§W7FgÖ6VçFW"ÓB"7GÆS×·²&6¶w&÷VæD6öÆ÷#¢4ôÄõ%2ç7W&f6RÂÖäVvC¢sfr×Óà¢ÆFb6Æ74æÖSÒ'&÷VæFVBÓ'ÂÓÖ×rÖÖBrÖgVÆÂFWBÖ6VçFW""7GÆS×·²&6¶w&÷VæD6öÆ÷#¢4ôÄõ%2çvFRÂ&÷&FW#¢6öÆBG´4ôÄõ%2æ&÷&FW'ÖÂ&÷6F÷s¢sG#G&v&cRÂ#ÂCÂãr×Óà¢Å7&¶ÆW26Æ74æÖSÒ'rÓbÓb×ÖWFòÖ"ÓB"7GÆS×·²6öÆ÷#¢4ôÄõ%2æ66VçB×Òóà¢Æ"6Æ74æÖSÒ'FWBÓ'ÂföçBÖ&öÆBÖ"Ó""7GÆS×·²6öÆ÷#¢4ôÄõ%2çFWB×Óà¢vVÆ6öÖRFò6²7vF¢Âö#à¢Ç6Æ74æÖSÒ&Ö"Ób"7GÆS×·²6öÆ÷#¢4ôÄõ%2çFWE6V6öæF'×Óà¢6vââFò66W72÷W"×÷vW&VB7GVG'&öB6÷Vç6VÆÆ÷ ¢Â÷à¢Æ'WGFöà¢öä6Æ6³×²Óâ&÷WFW"çW6r÷&Vv7FW"rÐ¢6Æ74æÖSÒ'rÖgVÆÂÓ2ÓB&÷VæFVBÖÆrföçB×6VÖ&öÆBG&ç6FöâÖÆÂGW&FöâÓ# ¢7GÆS×·²&6¶w&÷VæD6öÆ÷#¢4ôÄõ%2æ66VçBÂ6öÆ÷#¢4ôÄõ%2çvFR×Ð¢öäÖ÷W6TVçFW#×²RÓâ²Ræ7W'&VçEF&vWBç7GÆRæ&6¶w&÷VæD6öÆ÷"Ò4ôÄõ%2æ66VçDÆvC²×Ð¢öäÖ÷W6TÆVfS×²RÓâ²Ræ7W'&VçEF&vWBç7GÆRæ&6¶w&÷VæD6öÆ÷"Ò4ôÄõ%2æ66VçC²×Ð¢à¢6vââvFvöövÆP¢Âö'WGFöãà¢ÂöFcà¢ÂöFcà¢ÂôFVfVÇDÆ÷WCà¢°¢Ð ¢&WGW&â¢ÄFVfVÇDÆ÷WCà¢ÆFb6Æ74æÖSÒ'Ó×BÓ6Ó¦×BÓ"7GÆS×·²&6¶w&÷VæD6öÆ÷#¢4ôÄõ%2æ&6¶w&÷VæBÂÖäVvC¢sfr×Óà¢ÆFb6Æ74æÖSÒ&Ö×rÓWÂ×ÖWFòÓB76R×Ó#à ¢²ò¢vVÆ6öÖRVFW"¢÷Ð¢ÆFb6Æ74æÖSÒ&fÆWFV×2×7F'B§W7FgÖ&WGvVVâfÆW×w&vÓB#à¢iv>
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

          {/* AI Search Bar */}
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
                  style={{
                    backgroundColor: COLORS.chipBg,
                    color: COLORS.accent,
                    border: `1px solid ${COLORS.chipBorder}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.accent;
                    e.currentTarget.style.color = COLORS.white;
                    e.currentTarget.style.borderColor = COLORS.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.chipBg;
                    e.currentTarget.style.color = COLORS.accent;
                    e.currentTarget.style.borderColor = COLORS.chipBorder;
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* AI Response Card */}
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
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = COLORS.accent;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(165, 28, 48, 0.12)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = COLORS.border;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
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
                                      <span className="text-xs px-2 py-0.5 rounded inline-block" style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
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

          {/* Profile Completion Card */}
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
                      Target: {profileData?.target_degree || 'N/A'}{profileData?.target_field ? ` - ${profileData.target_field}` : ''}
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

          {/* Next Steps Section */}
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
