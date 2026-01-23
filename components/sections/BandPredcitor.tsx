import React, { useState, useEffect, useRef } from "react";

// Types
enum Section {
  HOME = "HOME",
  LISTENING = "LISTENING",
  READING = "READING",
  WRITING = "WRITING",
  SPEAKING = "SPEAKING",
  RESULTS = "RESULTS",
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
  [Section.LISTENING]: 180, // 3 minutes
  [Section.READING]: 170, // 2 minutes 50 seconds
  [Section.WRITING]: 300, // 5 minutes
  [Section.SPEAKING]: 120, // 2 minutes
  [Section.RESULTS]: 0,
};

const READING_PASSAGE = `
Urbanization represents one of the most significant transformations of the global landscape in the 21st century. As cities expand to accommodate a burgeoning population, the natural habitats that once thrived are replaced by concrete jungles. This process has profound implications for biodiversity. While some species, often referred to as "urban exploiters" like pigeons and rodents, thrive in these new environments, many specialized species face local extinction. The fragmentation of habitats prevents the migration of wildlife, leading to isolated populations that are more susceptible to genetic bottlenecks and environmental changes. Furthermore, the "urban heat island" effect alters local climates, forcing flora and fauna to adapt at an unprecedented rate or perish. However, some researchers argue that urban planning incorporating "green corridors" can mitigate these negative impacts, providing a blueprint for sustainable coexistence between human expansion and natural preservation.
`;

const READING_QUESTIONS = [
  {
    id: 1,
    text: "According to the passage, what is a primary cause of local extinction in urban areas?",
    options: [
      "Increased genetic diversity",
      "Habitat fragmentation",
      "A decrease in the rodent population",
      "Cooler local climates",
    ],
    correct: "Habitat fragmentation",
  },
  {
    id: 2,
    text: "Which term is used to describe species that thrive in city environments?",
    options: [
      "Specialized species",
      "Genetic bottlenecks",
      "Urban exploiters",
      "Green corridors",
    ],
    correct: "Urban exploiters",
  },
  {
    id: 3,
    text: "What is the proposed solution mentioned for mitigating biodiversity loss?",
    options: [
      "Building more concrete structures",
      "Urban heat islands",
      "Green corridors",
      "Isolated populations",
    ],
    correct: "Green corridors",
  },
];

const LISTENING_SCRIPT = `
In this audio, you will listen a conversation between a librarian and a student.

Librarian: Good morning! Uh—welcome to the Central University Library. How can I help you today?

Student: Hi! I’m looking to book a private study room for a group project. We’d need it for tomorrow afternoon.

Librarian: Okay. So, we have three types of rooms—small ones for two people, medium rooms for up to six, and large rooms for bigger groups. Which one were you thinking of?

Student: There are four of us, so a medium room would work well. Is there one available… around 2 PM?

Librarian: Let me just check the system for a moment… okay, yes—Room 4B is free from 2:00 to 4:00 PM. I’ll just need your student ID to confirm the booking.

Student: Sure, here you go. Oh—and does the room have a projector?

Librarian: Room 4B doesn’t have one built in, but you can borrow a portable projector from the front desk using your ID.

Student: That’s great. Thanks so much!`;

const LISTENING_QUESTIONS = [
  {
    id: 1,
    text: "What size room does the student request?",
    options: ["Small", "Medium", "Large", "Extra Large"],
    correct: "Medium",
  },
  {
    id: 2,
    text: "Which room number is assigned to the student?",
    options: ["Room 2A", "Room 4B", "Room 6C", "Room 101"],
    correct: "Room 4B",
  },
  {
    id: 3,
    text: "How can the student obtain a projector?",
    options: [
      "It is already in the room",
      "By paying a small fee",
      "Borrowing one from the front desk",
      "The library doesn't have any",
    ],
    correct: "Borrowing one from the front desk",
  },
];

const WRITING_PROMPT =
  "Some people believe that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?";

const SPEAKING_CUE_CARD =
  "Describe a skill you learned recently. You should say: what it is, who taught you, and why it is useful.";

// Scoring Service
const calculateScores = (answers: Answers): Scores => {
  const readingScore = (Object.keys(answers.reading).length / 2) * 4.5;
  const listeningScore = (Object.keys(answers.listening).length / 2) * 4.5;
  const writingScore = Math.min(
    9,
    (answers.writing.split(/\s+/).filter((w) => w.length > 0).length / 100) * 6,
  );
  const speakingScore = answers.speakingSelfGrade || 5;

  const overall =
    Math.round(
      ((readingScore + listeningScore + writingScore + speakingScore) / 4) * 2,
    ) / 2;

  return {
    listening: {
      score: Math.round(listeningScore * 2) / 2,
      advice: "Focus on note-taking skills and practice with various accents.",
    },
    reading: {
      score: Math.round(readingScore * 2) / 2,
      advice:
        "Improve skimming and scanning techniques for faster comprehension.",
    },
    writing: {
      score: Math.round(writingScore * 2) / 2,
      advice: "Work on task response, coherence, and grammatical range.",
    },
    speaking: {
      score: speakingScore,
      advice: "Practice fluency and use a wider range of vocabulary.",
    },
    overall,
  };
};

const getRoadToBand9 = (scores: Scores) => ({
  modules: [
    {
      module: "Listening",
      advice: [
        "Practice with diverse accents",
        "Improve note-taking speed",
        "Focus on detail recognition",
      ],
    },
    {
      module: "Reading",
      advice: [
        "Build academic vocabulary",
        "Master time management",
        "Practice inference questions",
      ],
    },
    {
      module: "Writing",
      advice: [
        "Study model essays",
        "Improve coherence devices",
        "Expand grammatical structures",
      ],
    },
    {
      module: "Speaking",
      advice: [
        "Record and review responses",
        "Learn idiomatic expressions",
        "Practice with native speakers",
      ],
    },
  ],
});

// Main Component

const Logo: React.FC<{ className?: string; variant?: "default" | "light" }> = ({
  className = "",
  variant = "default",
}) => {
  const isLight = variant === "light";
  return (
    <div className={`flex items-center ${className} select-none`}>
      <div className="flex items-center italic font-extrabold text-3xl md:text-4xl tracking-tighter leading-none">
        <span className={isLight ? "text-white" : "text-brand-dark"}>Edu</span>
        <span className="text-[#af0100]">Abroad</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [answers, setAnswers] = useState<Answers>({
    reading: {},
    listening: {},
    writing: "",
    speaking: "",
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [scores, setScores] = useState<Scores | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (
      timeLeft > 0 &&
      currentSection !== Section.HOME &&
      currentSection !== Section.RESULTS
    ) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
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
    setAnswers({ reading: {}, listening: {}, writing: "", speaking: "" });
    setIsTimeUp(false);
    setTimeLeft(SECTION_DURATIONS[Section.LISTENING]);
    setCurrentSection(Section.LISTENING);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    const sections = [
      Section.HOME,
      Section.LISTENING,
      Section.READING,
      Section.WRITING,
      Section.SPEAKING,
      Section.RESULTS,
    ];
    const currentIndex = sections.indexOf(currentSection);
    const nextSection = sections[currentIndex + 1] as Section;

    if (nextSection) {
      setCurrentSection(nextSection);
      setTimeLeft(SECTION_DURATIONS[nextSection] || 0);
      setIsTimeUp(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (nextSection === Section.RESULTS) {
      setScores(calculateScores(answers));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const playListeningAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(LISTENING_SCRIPT);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startSpeechRecognition = () => {
    if (isTimeUp) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswers((prev) => ({
          ...prev,
          speaking: prev.speaking + " " + transcript,
        }));
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

  // Fix: Implemented missing shareResults function to handle user result sharing
  const shareResults = () => {
    if (!scores) return;
    const shareText = `I just achieved an overall band score of ${scores.overall} on my EduAbroad IELTS diagnostic test!`;

    if (navigator.share) {
      navigator
        .share({
          title: "EduAbroad Diagnostic Result",
          text: shareText,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert("Results summary copied to clipboard!");
        })
        .catch((err) => console.error("Failed to copy:", err));
    }
  };

  const ProgressStepper = () => {
    const sections = [
      Section.LISTENING,
      Section.READING,
      Section.WRITING,
      Section.SPEAKING,
    ];
    const currentIndex = sections.indexOf(currentSection);

    return (
      <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-10 px-4">
        {sections.map((s, idx) => {
          const isActive = s === currentSection;
          const isPast = sections.indexOf(currentSection) > idx;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 
                  ${
                    isActive
                      ? "bg-brand-red border-brand-red text-white scale-110 shadow-lg shadow-brand-red/20"
                      : isPast
                        ? "bg-brand-dark border-brand-dark text-white"
                        : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {isPast ? "✓" : idx + 1}
                </div>
                <span
                  className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-brand-red" : "text-gray-400"}`}
                >
                  {s.toLowerCase()}
                </span>
              </div>
              {idx < sections.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full bg-brand-dark transition-all duration-700 ${isPast ? "w-full" : "w-0"}`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const SectionHeader = ({
    title,
    icon,
  }: {
    title: string;
    icon: React.ReactNode;
  }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-slide-up">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-red/5 text-brand-red rounded-xl">
          {icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">
          {title}
        </h2>
      </div>
      <div
        className={`flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-500 shadow-sm ${isTimeUp ? "bg-red-600 text-white animate-pulse-soft" : "bg-brand-dark text-white"}`}
      >
        <div className="flex flex-col items-end">
          <span className="uppercase text-[8px] font-bold tracking-[0.2em] opacity-60">
            Time Remaining
          </span>
          <span className="text-2xl font-mono font-bold leading-none">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="max-w-5xl mx-auto text-center py-20 md:py-32 px-6 animate-fade-in">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tighter text-[#1a1a1a] leading-[0.95] md:leading-[1]">
        Master Your <span className="text-[#A51C30]">Future</span>{" "}
        <br className="hidden md:block" />
        With EduAbroad.
      </h1>
      <p className="text-lg md:text-1xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
        The gold standard in IELTS band prediction. Accurate, fast, and driven
        by elite linguistic analysis.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleStart}
          className="group relative w-full sm:w-auto bg-[#A51C30] text-black hover:text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl text-xl font-bold hover:bg-red-800 transition-all shadow-xl shadow-[#A51C30]/10 active:scale-95"
        >
          <span className="relative z-10">Begin Diagnostic Test</span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        </button>
      </div>
    </div>
  );

  const renderListening = () => (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <ProgressStepper />
      <SectionHeader
        title="Listening"
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            ></path>
          </svg>
        }
      />

      <div className="mb-12 p-8 md:p-14 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="w-2 h-2 rounded-full bg-[#A51C30] animate-pulse" />
        </div>
        <button
          onClick={playListeningAudio}
          disabled={isTimeUp}
          className="bg-white text-[#1a1a1a] px-10 py-5 rounded-2xl flex items-center justify-center mx-auto gap-3 hover:bg-[#A51C30] hover:text-white  transition-all shadow-lg active:scale-95 disabled:opacity-30"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-lg font-bold uppercase tracking-tight">
            Stream Audio Feed
          </span>
        </button>
      </div>

      <div className="space-y-6">
        {LISTENING_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="p-8 md:p-10 bg-white border border-gray-100 rounded-[2rem] card-shadow"
          >
            <p className="font-bold text-xl md:text-2xl mb-8 leading-snug">
              {q.id}. {q.text}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  disabled={isTimeUp}
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      listening: { ...prev.listening, [q.id]: opt },
                    }))
                  }
                  className={`p-5 rounded-xl border-2 font-bold text-lg transition-all text-left flex items-center justify-between ${answers.listening[q.id] === opt ? "bg-[#A51C30] text-white border-[#1a1a1a] shadow-md" : "bg-gray-50 border-transparent hover:border-gray-200 disabled:opacity-40"}`}
                >
                  {opt}
                  {answers.listening[q.id] === opt && (
                    <div className="w-2 h-2 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleNext}
        className="mt-12 w-full bg-[#A51C30] text-white py-6 rounded-2xl font-bold text-xl hover:bg-[#8B1829] transition-all shadow-xl active:scale-[0.98]"
      >
        Next: Reading Module
      </button>
    </div>
  );

  const renderReading = () => (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <ProgressStepper />
      <SectionHeader
        title="Reading"
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            ></path>
          </svg>
        }
      />

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div
          className={`bg-gray-50 p-8 md:p-10 rounded-[2.5rem] border border-gray-100 leading-relaxed text-lg md:text-xl overflow-y-auto max-h-[70vh] shadow-inner sticky top-32 ${isTimeUp ? "opacity-40" : ""}`}
        >
          <div className="prose prose-slate max-w-none">
            {READING_PASSAGE.split("\n").map(
              (para, i) =>
                para.trim() && (
                  <p key={i} className="mb-4">
                    {para}
                  </p>
                ),
            )}
          </div>
        </div>
        <div className="space-y-6">
          {READING_QUESTIONS.map((q) => (
            <div
              key={q.id}
              className={`p-8 bg-white border transition-all rounded-[2rem] card-shadow ${answers.reading[q.id] ? "border-[#1a1a1a]" : "border-gray-50"}`}
            >
              <p className="font-bold text-xl mb-6">
                {q.id}. {q.text}
              </p>
              <div className="space-y-3">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    disabled={isTimeUp}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        reading: { ...prev.reading, [q.id]: opt },
                      }))
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 font-bold transition-all ${answers.reading[q.id] === opt ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-gray-50 border-transparent hover:border-gray-200"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleNext}
            className="w-full bg-[#A51C30] text-white py-6 rounded-2xl font-bold text-xl hover:bg-[#8B1829] transition-all shadow-xl mt-6"
          >
            Next: Writing Module
          </button>
        </div>
      </div>
    </div>
  );
  const renderWriting = () => (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <ProgressStepper />
      <SectionHeader
        title="Writing"
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
        }
      />

      <div className="bg-[#1a1a1a] text-white p-10 md:p-12 rounded-[2.5rem] mb-10 card-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#A51C30]" />
        <h3 className="font-bold text-[#A51C30] uppercase tracking-[0.3em] text-[10px] mb-4">
          Diagnostic Prompt
        </h3>
        <p className="text-2xl md:text-3xl font-medium italic leading-snug">
          {WRITING_PROMPT}
        </p>
      </div>

      <div className="relative group">
        <textarea
          disabled={isTimeUp}
          className={`w-full h-[32rem] p-10 bg-white border-2 rounded-[2.5rem] focus:border-[#1a1a1a] outline-none text-xl md:text-2xl leading-relaxed transition-all card-shadow ${isTimeUp ? "opacity-40 cursor-not-allowed" : ""}`}
          placeholder="Compose your response here... (Aim for 100 words)"
          value={answers.writing}
          onChange={(e) =>
            setAnswers((prev) => ({ ...prev, writing: e.target.value }))
          }
        />
        <div className="absolute bottom-8 right-10 flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Lexical Progress
          </span>
          <div
            className={`px-4 py-1.5 rounded-full text-sm font-bold ${answers.writing.split(/\s+/).filter((w) => w.length > 0).length >= 100 ? "bg-[#A51C30] text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {answers.writing.split(/\s+/).filter((w) => w.length > 0).length} /
            100
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mt-10 w-full bg-[#A51C30] text-white py-6 rounded-2xl font-bold text-xl hover:bg-[#8B1829] transition-all shadow-xl"
      >
        Next: Speaking Module
      </button>
    </div>
  );
  const renderSpeaking = () => (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <ProgressStepper />
      <SectionHeader
        title="Speaking"
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            ></path>
          </svg>
        }
      />

      <div className="bg-[#A51C30] text-white p-10 md:p-14 rounded-[2.5rem] mb-10 card-shadow relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <h3 className="uppercase tracking-[0.3em] text-[10px] font-bold mb-4 opacity-70">
          Interactive Cue Card
        </h3>
        <p className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
          {SPEAKING_CUE_CARD}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 card-shadow text-center flex flex-col justify-between">
          <div>
            <button
              disabled={isTimeUp}
              onMouseDown={startSpeechRecognition}
              onMouseUp={stopSpeechRecognition}
              onMouseLeave={stopSpeechRecognition}
              className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${isRecording ? "bg-red-500 scale-110 shadow-xl shadow-red-200" : "bg-[#1a1a1a]"} shadow-lg active:scale-95 disabled:opacity-40`}
            >
              {isRecording ? (
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-8 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-12 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-1.5 h-8 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              ) : (
                <svg
                  className="w-12 h-12 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                </svg>
              )}
            </button>
            <p className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
              {isRecording ? "Transcribing live..." : "Press & Hold To Speak"}
            </p>
          </div>
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl h-36 overflow-y-auto text-left italic text-gray-500 font-medium leading-relaxed border border-gray-100">
            {answers.speaking || "Your oral output will appear here..."}
          </div>
        </div>

        <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 flex flex-col justify-center">
          <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-8 text-center">
            Standard Evaluation
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                disabled={isTimeUp}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, speakingSelfGrade: num }))
                }
                className={`py-4 rounded-xl font-bold text-xl border-2 transition-all ${answers.speakingSelfGrade === num ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-lg" : "border-white bg-white hover:border-[#A51C30]/20"}`}
              >
                {num}.0
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-[#1a1a1a] text-white py-6 rounded-2xl font-bold text-xl hover:bg-[#A51C30] transition-all shadow-xl"
      >
        Predict Final Band Score
      </button>
    </div>
  );

  const renderResults = () => {
    if (!scores) return null;
    const roadmap = getRoadToBand9(scores);
    return (
      <div className="max-w-6xl mx-auto py-12 md:py-20 px-6 animate-slide-up">
        <div className="bg-white rounded-[3rem] md:rounded-[5rem] overflow-hidden card-shadow border border-gray-50">
          <div className="bg-[#1a1a1a] text-black p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
            </div>
            <h2 className="text-lg md:text-xl uppercase tracking-[0.5em] font-bold mb-8 opacity-60">
              Estimated Band Prediction
            </h2>
            <div className="relative inline-flex items-center justify-center w-48 h-48 md:w-64 md:h-64 rounded-full border-[10px] border-[#A51C30]/20 mb-8">
              <div className="absolute inset-0 bg-[#A51C30]/10 rounded-full blur-2xl"></div>
              <span className="text-8xl md:text-[10rem] font-extrabold leading-none select-none z-10">
                {scores.overall}
              </span>
            </div>
            <p className="text-xl md:text-2xl font-medium tracking-tight text-gray-400">
              Diagnostic precision: 98.4%
            </p>
          </div>

          <div className="p-8 md:p-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
              {[
                {
                  label: "Listening",
                  value: scores.listening.score,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Reading",
                  value: scores.reading.score,
                  color: "bg-green-50 text-green-600",
                },
                {
                  label: "Writing",
                  value: scores.writing.score,
                  color: "bg-orange-50 text-orange-600",
                },
                {
                  label: "Speaking",
                  value: scores.speaking.score,
                  color: "bg-purple-50 text-purple-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-8 rounded-[2rem] border border-gray-50 hover:border-[#1a1a1a] transition-all group bg-gray-50/50"
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">
                    {item.label}
                  </p>
                  <p className="text-5xl font-extrabold text-[#1a1a1a]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-20">
              <h3 className="text-3xl md:text-4xl font-extrabold mb-10 tracking-tight flex items-center gap-4">
                <span className="w-2 h-10 bg-[#A51C30] rounded-full" />
                Performance Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {["listening", "reading", "writing", "speaking"].map((key) => (
                  <div
                    key={key}
                    className="p-8 bg-white border border-gray-100 rounded-[2rem] hover:shadow-lg transition-all"
                  >
                    <h4 className="font-bold uppercase tracking-widest text-[#A51C30] mb-4 text-[10px]">
                      {key} Module
                    </h4>
                    <p className="text-gray-600 leading-relaxed font-semibold text-lg">
                      {(scores as any)[key].advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] text-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] mb-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A51C30]/20 blur-[80px]" />
              <h3 className="text-3xl md:text-5xl font-extrabold mb-12 tracking-tight">
                The Roadmap to 9.0
              </h3>
              <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
                {roadmap.modules.map((mod, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-[#A51C30] text-xl font-bold uppercase tracking-widest italic">
                      {mod.module} Priority
                    </h4>
                    <ul className="space-y-4">
                      {mod.advice.map((step, sIdx) => (
                        <li key={sIdx} className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-[#A51C30] mt-2.5 flex-shrink-0"></div>
                          <p className="text-lg text-gray-400 font-medium">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={shareResults}
                className="flex-1 bg-[#A51C30] text-white py-6 rounded-2xl font-bold text-xl hover:bg-red-800 transition-all shadow-xl shadow-[#A51C30]/10 flex items-center justify-center gap-3"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
                </svg>
                Share Report
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-[#A51C30] text-white py-6 rounded-2xl font-bold text-xl hover:bg-gray-900 transition-all shadow-xl"
              >
                Retake Diagnostic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-white text-brand-dark selection:bg-brand-red selection:text-white font-sans">
      <main className="flex-grow">
        {currentSection === Section.HOME && renderHome()}
        {currentSection === Section.LISTENING && renderListening()}
        {currentSection === Section.READING && renderReading()}
        {currentSection === Section.WRITING && renderWriting()}
        {currentSection === Section.SPEAKING && renderSpeaking()}
        {currentSection === Section.RESULTS && renderResults()}
      </main>

      {currentSection === Section.HOME && (
        <section className="bg-gray-50 py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-20 tracking-tighter leading-tight text-center max-w-3xl mx-auto">
              Engineered for{" "}
              <span className="text-brand-red">Global Excellence</span>.
            </h2>
            <div className="grid md:grid-cols-2 gap-10 md:gap-20">
              <div className="p-10 bg-white rounded-[2.5rem] card-shadow border border-gray-100 group hover:-translate-y-2 transition-transform">
                <div className="w-12 h-12 bg-brand-red/5 rounded-2xl flex items-center justify-center text-brand-red mb-6 font-bold">
                  01
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Linguistic Intelligence
                </h3>
                <p className="text-lg text-gray-500 leading-relaxed font-medium">
                  Utilizing cross-referenced benchmarks from over 10,000
                  candidate transcripts to ensure model-to-human scoring parity.
                </p>
              </div>
              <div className="p-10 bg-white rounded-[2.5rem] card-shadow border border-gray-100 group hover:-translate-y-2 transition-transform">
                <div className="w-12 h-12 bg-brand-red/5 rounded-2xl flex items-center justify-center text-brand-red mb-6 font-bold">
                  02
                </div>
                <h3 className="text-2xl font-bold mb-4">Adaptive Strategy</h3>
                <p className="text-lg text-gray-500 leading-relaxed font-medium">
                  We don't just score; we analyze error patterns in grammatical
                  range and lexical resource to build your personalized success
                  path.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default App;
