import React, { useState, useEffect, useRef } from 'react';

// Types
enum Section {
  HOME = 'HOME',
  LISTENING = 'LISTENING',
  READING = 'READING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  RESULTS = 'RESULTS'
}

interface Answers {
  reading: { [key: number]: string };
  listening: { [key: number]: string };
  writing: string;
  speaking: string;
  speakingSelfGrade?: number;
}

interface Scores {
  listening: { score: number; advice: string };
  reading: { score: number; advice: string };
  writing: { score: number; advice: string };
  speaking: { score: number; advice: string };
  overall: number;
}

// Constants
const SECTION_DURATIONS: { [key in Section]: number } = {
  [Section.HOME]: 0,
  [Section.LISTENING]: 1800, // 30 min
  [Section.READING]: 3600, // 60 min
  [Section.WRITING]: 3600, // 60 min
  [Section.SPEAKING]: 840, // 14 min
  [Section.RESULTS]: 0
};

const READING_PASSAGE = "Climate change represents one of the most pressing challenges facing humanity in the 21st century. Rising global temperatures, extreme weather events, and shifting precipitation patterns are already impacting ecosystems, agriculture, and human settlements worldwide. Scientists agree that human activities, particularly the burning of fossil fuels and deforestation, are the primary drivers of these changes.";

const READING_QUESTIONS = [
  {
    id: 1,
    text: "What is the main topic of the passage?",
    options: ["Climate change impacts", "Fossil fuel consumption", "Deforestation", "Agriculture practices"]
  },
  {
    id: 2,
    text: "According to the passage, what causes climate change?",
    options: ["Natural cycles", "Human activities", "Solar radiation", "Ocean currents"]
  }
];

const LISTENING_SCRIPT = "Good morning everyone. Today's lecture focuses on sustainable development. We'll explore how communities can balance economic growth with environmental protection. Key strategies include renewable energy adoption, waste reduction, and green infrastructure investment.";

const LISTENING_QUESTIONS = [
  {
    id: 1,
    text: "What is the lecture about?",
    options: ["Sustainable development", "Economic growth", "Environmental science", "Urban planning"]
  },
  {
    id: 2,
    text: "Which strategy was NOT mentioned?",
    options: ["Nuclear energy", "Renewable energy", "Waste reduction", "Green infrastructure"]
  }
];

const WRITING_PROMPT = "Some people believe that technology has made our lives more complex. Others argue it has simplified daily tasks. Discuss both views and give your opinion.";

const SPEAKING_CUE_CARD = "Describe a memorable journey you have taken. You should say: where you went, who you went with, what you did, and explain why it was memorable.";

// Scoring Service
const calculateScores = (answers: Answers): Scores => {
  const readingScore = (Object.keys(answers.reading).length / 2) * 4.5;
  const listeningScore = (Object.keys(answers.listening).length / 2) * 4.5;
  const writingScore = Math.min(9, (answers.writing.split(/\s+/).filter(w => w.length > 0).length / 100) * 6);
  const speakingScore = answers.speakingSelfGrade || 5;
  
  const overall = Math.round(((readingScore + listeningScore + writingScore + speakingScore) / 4) * 2) / 2;
  
  return {
    listening: { score: Math.round(listeningScore * 2) / 2, advice: "Focus on note-taking skills and practice with various accents." },
    reading: { score: Math.round(readingScore * 2) / 2, advice: "Improve skimming and scanning techniques for faster comprehension." },
    writing: { score: Math.round(writingScore * 2) / 2, advice: "Work on task response, coherence, and grammatical range." },
    speaking: { score: speakingScore, advice: "Practice fluency and use a wider range of vocabulary." },
    overall
  };
};

const getRoadToBand9 = (scores: Scores) => ({
  modules: [
    { module: "Listening", advice: ["Practice with diverse accents", "Improve note-taking speed", "Focus on detail recognition"] },
    { module: "Reading", advice: ["Build academic vocabulary", "Master time management", "Practice inference questions"] },
    { module: "Writing", advice: ["Study model essays", "Improve coherence devices", "Expand grammatical structures"] },
    { module: "Speaking", advice: ["Record and review responses", "Learn idiomatic expressions", "Practice with native speakers"] }
  ]
});

// Main Component
export const BandPredictorSection: React.FC = () => {
  const accentColor = '#A51C30';
  const lightBg = '#FEF2F3';
  const borderColor = '#FECDD3';
  
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [answers, setAnswers] = useState<Answers>({
    reading: {},
    listening: {},
    writing: '',
    speaking: '',
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [scores, setScores] = useState<Scores | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (timeLeft > 0 && currentSection !== Section.HOME && currentSection !== Section.RESULTS) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, currentSection]);

  const handleStart = () => {
    setAnswers({ reading: {}, listening: {}, writing: '', speaking: '' });
    setIsTimeUp(false);
    setTimeLeft(SECTION_DURATIONS[Section.LISTENING]);
    setCurrentSection(Section.LISTENING);
  };

  const handleNext = () => {
    const sections = [Section.HOME, Section.LISTENING, Section.READING, Section.WRITING, Section.SPEAKING, Section.RESULTS];
    const currentIndex = sections.indexOf(currentSection);
    const nextSection = sections[currentIndex + 1] as Section;
    
    if (nextSection) {
      setCurrentSection(nextSection);
      setTimeLeft(SECTION_DURATIONS[nextSection] || 0);
      setIsTimeUp(false);
    }

    if (nextSection === Section.RESULTS) {
      setScores(calculateScores(answers));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playListeningAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(LISTENING_SCRIPT);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const startSpeechRecognition = () => {
    if (isTimeUp) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswers(prev => ({ ...prev, speaking: prev.speaking + ' ' + transcript }));
      };
    }
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const shareResults = () => {
    if (!scores) return;
    const shareUrl = `${window.location.origin}/?band=${scores.overall}`;
    const text = `🎯 I just predicted my IELTS Band as ${scores.overall}! Can you beat my score?`;
    
    if (navigator.share) {
      navigator.share({
        title: 'IELTS Band Predictor Result',
        text: text,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied! Share with friends.");
    }
  };

  const SectionHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: lightBg, color: accentColor }}>
          {icon}
        </div>
        <h2 className="text-3xl font-bold" style={{ color: accentColor }}>{title}</h2>
      </div>
      <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl ${isTimeUp ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Time Left</span>
        <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="max-w-4xl mx-auto text-center py-20 px-4">
      <h1 className="text-6xl font-bold mb-6 text-gray-800">
        IELTS Band <span style={{ color: accentColor }}>Predictor</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        Take our comprehensive diagnostic test and get an accurate prediction of your IELTS band score across all modules.
      </p>
      <button 
        onClick={handleStart}
        className="text-white px-12 py-4 rounded-3xl text-xl font-bold hover:opacity-90 transition-all"
        style={{ backgroundColor: accentColor }}
      >
        Start Diagnostic Test
      </button>
    </div>
  );

  const renderListening = () => (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <SectionHeader 
        title="Listening Assessment" 
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>} 
      />
      
      <div className="mb-10 p-10 rounded-3xl text-center" style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}>
        <button 
          onClick={playListeningAudio}
          disabled={isTimeUp}
          className="text-white px-10 py-4 rounded-2xl flex items-center justify-center mx-auto gap-3 hover:opacity-90 transition-all disabled:opacity-40"
          style={{ backgroundColor: accentColor }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span className="text-lg font-bold">Play Audio</span>
        </button>
      </div>

      <div className="space-y-6">
        {LISTENING_QUESTIONS.map(q => (
          <div key={q.id} className="p-6 bg-white rounded-3xl" style={{ border: `1px solid ${borderColor}` }}>
            <p className="font-bold text-lg mb-4">{q.id}. {q.text}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {q.options.map(opt => (
                <button 
                  key={opt}
                  disabled={isTimeUp}
                  onClick={() => setAnswers(prev => ({ ...prev, listening: { ...prev.listening, [q.id]: opt } }))}
                  className={`p-4 rounded-2xl font-medium transition-all ${answers.listening[q.id] === opt ? 'text-white' : 'bg-gray-50 hover:bg-gray-100 disabled:opacity-40'}`}
                  style={answers.listening[q.id] === opt ? { backgroundColor: accentColor } : {}}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleNext} className="mt-8 w-full bg-gray-800 text-white py-4 rounded-3xl font-bold text-lg hover:bg-gray-700 transition-all">
        Continue to Reading
      </button>
    </div>
  );

  const renderReading = () => (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <SectionHeader 
        title="Reading Assessment" 
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>} 
      />
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className={`p-8 rounded-3xl leading-relaxed text-lg overflow-y-auto max-h-96 ${isTimeUp ? 'opacity-40' : ''}`} style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}>
          {READING_PASSAGE}
        </div>
        <div className="space-y-6">
          {READING_QUESTIONS.map(q => (
            <div key={q.id} className="p-6 bg-white rounded-3xl" style={{ border: `1px solid ${borderColor}` }}>
              <p className="font-bold text-lg mb-4">{q.id}. {q.text}</p>
              <div className="space-y-3">
                {q.options.map(opt => (
                  <button 
                    key={opt}
                    disabled={isTimeUp}
                    onClick={() => setAnswers(prev => ({ ...prev, reading: { ...prev.reading, [q.id]: opt } }))}
                    className={`w-full text-left p-4 rounded-2xl font-medium transition-all ${answers.reading[q.id] === opt ? 'text-white' : 'bg-gray-50 hover:bg-gray-100 disabled:opacity-40'}`}
                    style={answers.reading[q.id] === opt ? { backgroundColor: accentColor } : {}}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleNext} className="mt-8 w-full bg-gray-800 text-white py-4 rounded-3xl font-bold text-lg hover:bg-gray-700 transition-all">
        Continue to Writing
      </button>
    </div>
  );

  const renderWriting = () => (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <SectionHeader 
        title="Writing Assessment" 
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>} 
      />
      
      <div className="p-8 rounded-3xl mb-8" style={{ backgroundColor: accentColor, color: 'white' }}>
        <h3 className="font-bold text-white opacity-70 uppercase tracking-wider text-xs mb-4">Writing Prompt (100 Words Target)</h3>
        <p className="text-2xl font-light leading-relaxed">{WRITING_PROMPT}</p>
      </div>

      <div className="relative">
        <textarea 
          disabled={isTimeUp}
          className={`w-full h-80 p-8 rounded-3xl focus:outline-none text-lg leading-relaxed transition-all ${isTimeUp ? 'opacity-40' : ''}`}
          style={{ backgroundColor: lightBg, border: `2px solid ${borderColor}` }}
          placeholder="Write your response here... (Aim for 100 words)"
          value={answers.writing}
          onChange={(e) => setAnswers(prev => ({ ...prev, writing: e.target.value }))}
        />
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Word Count</span>
          <span className={`text-2xl font-bold ${answers.writing.split(/\s+/).filter(w => w.length > 0).length >= 100 ? 'text-green-600' : 'text-gray-800'}`}>
            {answers.writing.split(/\s+/).filter(w => w.length > 0).length} / 100
          </span>
        </div>
      </div>
      
      <button onClick={handleNext} className="mt-8 w-full bg-gray-800 text-white py-4 rounded-3xl font-bold text-lg hover:bg-gray-700 transition-all">
        Continue to Speaking
      </button>
    </div>
  );

  const renderSpeaking = () => (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <SectionHeader 
        title="Speaking Assessment" 
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>} 
      />
      
      <div className="p-8 rounded-3xl mb-8" style={{ backgroundColor: accentColor, color: 'white' }}>
        <h3 className="uppercase tracking-wider text-xs font-bold mb-4 opacity-70">Speaking Cue Card</h3>
        <p className="text-3xl font-bold leading-tight">{SPEAKING_CUE_CARD}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl text-center" style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}>
          <button 
            disabled={isTimeUp}
            onMouseDown={startSpeechRecognition}
            onMouseUp={stopSpeechRecognition}
            onMouseLeave={stopSpeechRecognition}
            className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 scale-110' : ''} disabled:opacity-40`}
            style={!isRecording ? { backgroundColor: accentColor } : {}}
          >
            {isRecording ? (
              <div className="flex gap-2">
                <div className="w-2 h-10 bg-white animate-pulse"></div>
                <div className="w-2 h-14 bg-white animate-pulse"></div>
                <div className="w-2 h-10 bg-white animate-pulse"></div>
              </div>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
            )}
          </button>
          <p className="mt-6 text-lg font-bold text-gray-600 uppercase tracking-wider">{isRecording ? "Recording..." : "Hold To Speak"}</p>
          <div className="mt-6 p-6 bg-white rounded-2xl h-40 overflow-y-auto text-left text-gray-600 text-base leading-relaxed">
            {answers.speaking || "Transcript will appear here..."}
          </div>
        </div>

        <div className="p-8 rounded-3xl flex flex-col justify-center" style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}>
          <h4 className="font-bold text-gray-600 uppercase tracking-wider text-xs mb-6 text-center">Self-Rating</h4>
          <div className="grid grid-cols-2 gap-3">
            {[4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num}
                disabled={isTimeUp}
                onClick={() => setAnswers(prev => ({ ...prev, speakingSelfGrade: num }))}
                className={`py-4 rounded-2xl font-bold text-xl transition-all ${answers.speakingSelfGrade === num ? 'text-white' : 'bg-white hover:opacity-80'}`}
                style={answers.speakingSelfGrade === num ? { backgroundColor: accentColor } : { border: `2px solid ${borderColor}` }}
              >
                {num}.0
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleNext} className="mt-8 w-full bg-gray-800 text-white py-4 rounded-3xl font-bold text-lg hover:bg-gray-700 transition-all">
        View Results
      </button>
    </div>
  );

  const renderResults = () => {
    if (!scores) return null;
    const roadmap = getRoadToBand9(scores);
    
    return (
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
          <div className="p-16 text-center" style={{ backgroundColor: accentColor, color: 'white' }}>
            <h2 className="text-xl uppercase tracking-widest font-bold mb-6 opacity-70">Your IELTS Band Score</h2>
            <div className="inline-flex items-center justify-center w-48 h-48 bg-white/20 backdrop-blur-xl rounded-full border-8 border-white/30 mb-6">
              <span className="text-8xl font-bold">{scores.overall}</span>
            </div>
            <p className="text-2xl font-medium">Predicted Overall Band</p>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Listening', value: scores.listening.score, icon: '🎧' },
                { label: 'Reading', value: scores.reading.score, icon: '📖' },
                { label: 'Writing', value: scores.writing.score, icon: '✍️' },
                { label: 'Speaking', value: scores.speaking.score, icon: '🎤' }
              ].map(item => (
                <div key={item.label} className="p-6 rounded-3xl transition-all" style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}>
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">{item.label}</p>
                  <p className="text-5xl font-bold" style={{ color: accentColor }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-8 mb-12">
              <h3 className="text-4xl font-bold" style={{ color: accentColor }}>Performance Analysis</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {['listening', 'reading', 'writing', 'speaking'].map((key) => (
                  <div key={key} className="p-6 rounded-3xl" style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}>
                    <h4 className="font-bold uppercase tracking-wider mb-3 text-sm" style={{ color: accentColor }}>
                      {key} Feedback
                    </h4>
                    <p className="text-gray-700 leading-relaxed font-medium">{(scores as any)[key].advice}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 rounded-3xl mb-12" style={{ backgroundColor: '#1f2937', color: 'white' }}>
              <h3 className="text-4xl font-bold mb-8 text-center">Road to Band 9.0</h3>
              <div className="grid lg:grid-cols-2 gap-10">
                {roadmap.modules.map((mod, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-2xl font-bold uppercase tracking-wide" style={{ color: '#fca5a5' }}>{mod.module}</h4>
                    <ul className="space-y-3">
                      {mod.advice.map((step, sIdx) => (
                        <li key={sIdx} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: accentColor }}></div>
                          <p className="text-gray-300">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <button 
                onClick={shareResults}
                className="flex-1 text-white py-4 rounded-3xl font-bold text-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: accentColor }}
              >
                Share Results
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-800 text-white py-4 rounded-3xl font-bold text-lg hover:bg-gray-700 transition-all"
              >
                Retake Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {currentSection === Section.HOME && renderHome()}
      {currentSection === Section.LISTENING && renderListening()}
      {currentSection === Section.READING && renderReading()}
      {currentSection === Section.WRITING && renderWriting()}
      {currentSection === Section.SPEAKING && renderSpeaking()}
      {currentSection === Section.RESULTS && renderResults()}
    </div>
  );
};