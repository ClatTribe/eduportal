import { useEffect, useRef, useState } from "react";
import {
  Users,
  TrendingUp,
  HeartPulse,
  Flag,
  Play,
  Pause,
  StepBack,
  StepForward,
  X,
  LucideIcon,
} from "lucide-react";

/* ---------------- CONSTANTS ---------------- */

const accentColor = '#A51C30';
const secondaryAccent = '#8B1528';
const borderColor = '#FECDD3';
const lightBg = '#FEF2F3';

/* ---------------- TYPES ---------------- */

type AudioLog = {
  id: number;
  title: string;
  duration: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  audio: string;
};

/* ---------------- DATA ---------------- */

const audioLogs: AudioLog[] = [
  {
    id: 1,
    title: "The Argumentative Architect",
    duration: "0:39",
    description:
      "Many students fail IELTS Writing Task 2 not because of English, but because of poor logic. This builds Idea Generation.",
    icon: Users,
    tags: ["IELTS", "Writing Tasks", "Boundaries"],
    audio: "/audio/Argument.mp4",
  },
  {
    id: 2,
    title: " The \"Paraphrase\" Perspective",
    duration: "0:30",
    description:
      "IELTS rewards students who don't repeat words. This journal entry forces students to think in synonyms—a core skill for Writing and Speaking.",
    icon: HeartPulse,
    tags: ["IELTS", "Speaking", "Writing"],
    audio: "/audio/Paraphrase.mp4",
  },
  {
    id: 3,
    title: "The \"Fluency Mirror\"",
    duration: "0:46",
    description:
      "To reduce \"filler words\" (um, ah, like) and build the ability to speak for 2 minutes straight",
    icon: Flag,
    tags: ["IELTS", "Filler Words", "Peak Performance"],
    audio: "/audio/Fluency.mp4",
  },
  {
    id: 4,
    title: "The \"Active Listener\" Audit",
    duration: "0:37",
    description:
      "To move from \"hearing\" to \"deciphering\" accents (British, Australian, American) common in the IELTS Listening test",
    icon: Flag,
    tags: ["IELTS", "Hearing", "Listening test"],
    audio: "/audio/Listener.mp4",
  },
  {
    id: 5,
    title: "The \"Error Log & Growth\" Mindset",
    duration: "0:41",
    description:
      "To prevent the \"Plateau Effect\" where scores get stuck at Band 6.0 or 6.5.",
    icon: Flag,
    tags: ["IELTS", "Mindset", "Growth"],
    audio: "/audio/Error_Log.mp4",
  },
];

/* ---------------- COMPONENT ---------------- */

export default function MindJournalsSection() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLog =
    currentIndex !== null ? audioLogs[currentIndex] : null;

  /* ---------------- AUDIO CONTROLS ---------------- */

  const playAudio = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentIndex(index);
    setProgress(0);

    audio.src = audioLogs[index].audio;
    audio.load();

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err: Error) => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentIndex === null) {
      playAudio(0);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err: Error) =>
          console.error("Playback failed:", err)
        );
    }
  };

  const next = () => {
    if (currentIndex === null) return;
    playAudio((currentIndex + 1) % audioLogs.length);
  };

  const prev = () => {
    if (currentIndex === null) return;
    playAudio(
      (currentIndex - 1 + audioLogs.length) % audioLogs.length
    );
  };

  const closePlayer = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentIndex(null);
    setIsPlaying(false);
    setProgress(0);
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress(
          (audio.currentTime / audio.duration) * 100
        );
      }
    };

    const handleEnded = () => {
      const nextIdx =
        currentIndex !== null
          ? (currentIndex + 1) % audioLogs.length
          : 0;
      playAudio(nextIdx);
    };

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [currentIndex]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-32">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="text-center mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-800 mt-6">
            <span 
              className="bg-clip-text text-transparent"
              style={{ 
                background: `linear-gradient(to right, ${accentColor}, ${secondaryAccent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Unfiltered Voice Notes
            </span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mt-4 text-sm">
            Raw audio clips from IELTS private prep diary.
          </p>
        </div>

        <div className="space-y-4">
          {audioLogs.map((log, index: number) => {
            const Icon = log.icon;
            const active = currentIndex === index;

            return (
              <div
                key={log.id}
                onClick={() => playAudio(index)}
                className="cursor-pointer rounded-2xl p-6 transition-all bg-white"
                style={{
                  border: active 
                    ? `1px solid ${accentColor}` 
                    : `1px solid ${borderColor}`
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (!active) e.currentTarget.style.borderColor = accentColor;
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (!active) e.currentTarget.style.borderColor = borderColor;
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: active
                        ? accentColor
                        : lightBg,
                      color: active ? "#fff" : accentColor,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold"
                      style={{
                        color: active ? accentColor : '#1f2937'
                      }}
                    >
                      {log.title}
                    </h3>
                  </div>

                  <span 
                    className="px-4 py-1 rounded-full text-xs font-black"
                    style={{
                      backgroundColor: lightBg,
                      color: accentColor,
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    {log.duration}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">
                  {log.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-bold rounded-full"
                      style={{
                        backgroundColor: lightBg,
                        color: accentColor,
                        border: `1px solid ${borderColor}`
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAYER */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white/95 transition-transform ${
          currentLog ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ borderTop: `1px solid ${borderColor}` }}
      >
        <div 
          className="h-1" 
          style={{ 
            width: `${progress}%`, 
            background: accentColor 
          }} 
        />

        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 py-4">
          <button onClick={closePlayer} className="text-gray-600 hover:text-gray-800">
            <X />
          </button>

          <div className="flex-1">
            <p className="font-bold text-gray-800">{currentLog?.title}</p>
            <p 
              className="text-sm"
              style={{ color: accentColor }}
            >
              {isPlaying ? "Now Playing" : "Paused"}
            </p>
          </div>

          <button onClick={prev} className="text-gray-600 hover:text-gray-800">
            <StepBack />
          </button>

          <button
            onClick={togglePlay}
            style={{ backgroundColor: accentColor }}
            className="p-4 rounded-full text-white"
          >
            {isPlaying ? <Pause /> : <Play />}
          </button>

          <button onClick={next} className="text-gray-600 hover:text-gray-800">
            <StepForward />
          </button>
        </div>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}