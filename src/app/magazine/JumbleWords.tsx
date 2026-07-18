"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Undo2,
  Shuffle,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const WORDS = [
  {
    word: "CAMPUS",
    hint: "The grounds and buildings of a university or college",
  },
  {
    word: "DEGREE",
    hint: "An academic rank conferred by a college or university",
  },
  { word: "COLLEGE", hint: "An educational institution or establishment" },
  { word: "STUDENT", hint: "A person who is studying at a school or college" },
  { word: "TEACHER", hint: "A person who helps students to acquire knowledge" },
  {
    word: "SCIENCE",
    hint: "The systematic study of the physical and natural world",
  },
  {
    word: "PHYSICS",
    hint: "The branch of science concerned with the nature and properties of matter and energy",
  },
  { word: "HISTORY", hint: "The study of past events" },
  { word: "BIOLOGY", hint: "The study of living organisms" },
  {
    word: "LIBRARY",
    hint: "A building or room containing collections of books",
  },
  {
    word: "ALUMNI",
    hint: "A graduate or former student of a specific school, college, or university",
  },
  { word: "SCHOLAR", hint: "A specialist in a particular branch of study" },
  {
    word: "DIPLOMA",
    hint: "A certificate awarded by an educational establishment",
  },
  { word: "FACULTY", hint: "The teaching staff of a university or college" },
  {
    word: "TUITION",
    hint: "A sum of money charged for teaching or instruction",
  },
  { word: "EXAMINE", hint: "Inspect (someone or something) in detail" },
  { word: "ACADEMY", hint: "A place of study or training in a special field" },
  {
    word: "SEMINAR",
    hint: "A conference or other meeting for discussion or training",
  },
  {
    word: "PROJECT",
    hint: "A collaborative enterprise that is carefully planned",
  },
  { word: "LECTURE", hint: "An educational talk to an audience" },
  { word: "HOSTEL", hint: "An establishment providing lodging for students" },
  { word: "CAREER", hint: "An occupation undertaken for a significant period" },
  { word: "SUCCESS", hint: "The accomplishment of an aim or purpose" },
  { word: "LEARNING", hint: "The acquisition of knowledge or skills" },
  { word: "SUBJECT", hint: "A branch of knowledge studied or taught" },
  { word: "ENGLISH", hint: "The language of England, widely used" },
  { word: "GRAMMAR", hint: "The whole system and structure of a language" },
  { word: "CHEMISTRY", hint: "The branch of science dealing with substances" },
  { word: "WRITING", hint: "The activity of marking coherent words on paper" },
  {
    word: "READING",
    hint: "The action of looking at and comprehending written matter",
  },
  { word: "LESSON", hint: "An amount of teaching given at one time" },
  {
    word: "TESTING",
    hint: "The means by which quality or genuineness is determined",
  },
  {
    word: "GRADING",
    hint: "The action of classifying something according to quality",
  },
  { word: "RESULTS", hint: "A consequence, effect, or outcome of something" },
  { word: "CHAPTER", hint: "A main division of a book" },
  { word: "CLASSROOM", hint: "A room in a school in which a class is taught" },
  {
    word: "RESEARCH",
    hint: "The systematic investigation into materials and sources",
  },
  {
    word: "INNOVATE",
    hint: "Make changes by introducing new methods or ideas",
  },
  {
    word: "COMPUTER",
    hint: "An electronic device for storing and processing data",
  },
  { word: "SOFTWARE", hint: "The programs used by a computer" },
  { word: "INTERNET", hint: "A global computer network" },
  {
    word: "WEBSITE",
    hint: "A set of related web pages located under a single domain name",
  },
  {
    word: "NETWORK",
    hint: "A group or system of interconnected people or things",
  },
  { word: "ROBOTICS", hint: "The branch of technology dealing with robots" },
  {
    word: "BUSINESS",
    hint: "A person's regular occupation, profession, or trade",
  },
  { word: "FINANCE", hint: "The management of large amounts of money" },
  {
    word: "ACCOUNT",
    hint: "A report or description of an event or experience",
  },
  {
    word: "MARKET",
    hint: "A regular gathering of people for the purchase and sale of goods",
  },
  { word: "MANAGER", hint: "A person responsible for controlling a company" },
  { word: "CREATE", hint: "To make something new" },
  { word: "DEVELOP", hint: "Grow or cause to grow and become more mature" },
  {
    word: "DESIGN",
    hint: "A plan or drawing produced to show the look and function",
  },
  {
    word: "FUTURE",
    hint: "The time following the moment of speaking or writing",
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}
export default function JumbleWords() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jumbledLetters, setJumbledLetters] = useState<
    { letter: string; id: number }[]
  >([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [hasWrongAttempt, setHasWrongAttempt] = useState(false);

  // Initialize game
  const initGame = useCallback(() => {
    // Pick a random word that hasn't been played if possible, or just truly random for simplicity
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    setCurrentIndex(randomIndex);

    const word = WORDS[randomIndex].word;
    const letters = word.split("").map((letter, id) => ({ letter, id }));

    // Ensure the jumbled version isn't exactly the correct word
    let shuffled = shuffleArray(letters);
    while (shuffled.map((l) => l.letter).join("") === word && word.length > 1) {
      shuffled = shuffleArray(letters);
    }

    setJumbledLetters(shuffled);
    setSelectedIndices([]);
    setIsSolved(false);
    setIsWrong(false);
    setHasWrongAttempt(false);
  }, []);

  // Start the first game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  const currentWordObj = WORDS[currentIndex];
  if (!currentWordObj) return <div className="p-4 bg-red-100 text-red-500">JumbleWords: No current word found</div>;

  const targetWordLength = currentWordObj.word.length;

  const handleSelectLetter = (index: number) => {
    if (isSolved || selectedIndices.includes(index)) return;

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);
    setIsWrong(false);

    // Check if word is complete
    if (newSelected.length === targetWordLength) {
      const formedWord = newSelected
        .map((idx) => jumbledLetters[idx].letter)
        .join("");
      if (formedWord === currentWordObj.word) {
        setIsSolved(true);
      } else {
        setIsWrong(true);
        setHasWrongAttempt(true);
      }
    }
  };

  const handleUndo = () => {
    if (isSolved || selectedIndices.length === 0) return;
    setSelectedIndices((prev) => prev.slice(0, -1));
    setIsWrong(false);
  };

  const handleShuffle = () => {
    if (isSolved) return;
    setJumbledLetters((prev) => shuffleArray(prev));
    setSelectedIndices([]);
    setIsWrong(false);
  };

  const handleNext = () => {
    initGame();
  };

  const handleShowAnswer = () => {
    const correctIndices: number[] = [];

    // Find the indices in jumbledLetters that spell out the correct word
    for (const char of currentWordObj.word) {
      const idx = jumbledLetters.findIndex(
        (item, index) =>
          item.letter === char && !correctIndices.includes(index),
      );
      if (idx !== -1) {
        correctIndices.push(idx);
      }
    }

    setSelectedIndices(correctIndices);
    setIsSolved(true);
    setIsWrong(false);
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 pt-4 pb-3 border-b border-gray-100 px-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Word Jumble
        </span>
        <div className="flex gap-1">
          {["W", "O", "R", "D", "S"].map((l, i) => (
            <div
              key={i}
              className="w-5 h-6 flex items-center justify-center bg-[#A51C30] text-white rounded-md font-black text-[11px]"
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Answer boxes */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {Array.from({ length: targetWordLength }).map((_, i) => {
            const isFilled = i < selectedIndices.length;
            const letter = isFilled
              ? jumbledLetters[selectedIndices[i]].letter
              : "";
            return (
              <div
                key={i}
                className={`w-8 h-9 flex items-center justify-center rounded-lg border-[1.5px] text-sm font-black transition-all
                ${
                  isFilled
                    ? isWrong
                      ? "bg-red-50 border-red-400 text-red-600"
                      : isSolved
                        ? "bg-green-50 border-green-500 text-green-600"
                        : "bg-rose-50 border-[#A51C30] text-[#A51C30]"
                    : "bg-gray-50 border-gray-200 text-transparent"
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        {/* Letter tiles */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {jumbledLetters.map((item, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <button
                key={item.id}
                disabled={isSelected || isSolved}
                onClick={() => handleSelectLetter(idx)}
                className={`w-8 h-9 flex items-center justify-center rounded-lg text-sm font-black border-[1.5px] transition-all
                  ${
                    isSelected
                      ? "opacity-20 scale-90 border-gray-200 bg-gray-50 pointer-events-none"
                      : "bg-white border-gray-200 text-gray-800 hover:border-[#A51C30] hover:text-[#A51C30] hover:bg-rose-50 hover:-translate-y-0.5 cursor-pointer"
                  }`}
              >
                {item.letter}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2 mb-4">
          <Lightbulb className="w-3.5 h-3.5 text-[#A51C30] shrink-0 mt-0.5" />
          <p className="text-[12px] text-gray-500 leading-snug">
            {currentWordObj.hint}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2 flex-wrap">
          {isSolved ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" /> Well done!
              </div>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#A51C30] text-white rounded-xl text-xs font-bold hover:bg-[#8b1728] transition-colors"
              >
                Next word <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleUndo}
                disabled={selectedIndices.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Undo2 size={13} /> Undo
              </button>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Shuffle size={13} /> Shuffle
              </button>
              {hasWrongAttempt && (
                <button
                  onClick={handleShowAnswer}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-200 text-[#A51C30] bg-rose-50 hover:bg-rose-100 transition-all"
                >
                  <Lightbulb size={13} /> Answer
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
