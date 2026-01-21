"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Award } from 'lucide-react';

type FlashcardType = {
  id: number;
  word: string;
  synonyms: string;
};

const VOCAB_DATA: FlashcardType[] = [
  { id: 1, word: "Abundant", synonyms: "Ample, Plentiful, Copious" },
  { id: 2, word: "Beneficial", synonyms: "Advantageous, Helpful, Positive" },
  { id: 3, word: "Challenging", synonyms: "Difficult, Tough, Demanding" },
  { id: 4, word: "Diverse", synonyms: "Varied, Different, Assorted" },
  { id: 5, word: "Effective", synonyms: "Efficient, Productive, Successful" },
  { id: 6, word: "Essential", synonyms: "Necessary, Vital, Crucial" },
  { id: 7, word: "Flexible", synonyms: "Adaptable, Versatile, Adjustable" },
  { id: 8, word: "Innovative", synonyms: "Creative, Original, Groundbreaking" },
  { id: 9, word: "Important", synonyms: "Significant, Crucial, Major" },
  { id: 10, word: "Increasing", synonyms: "Growing, Rising, Escalating" },
  { id: 11, word: "Motivate", synonyms: "Inspire, Encourage, Stimulate" },
  { id: 12, word: "Persuade", synonyms: "Convince, Influence, Sway" },
  { id: 13, word: "Prominent", synonyms: "Famous, Notable, Distinguished" },
  { id: 14, word: "Resilient", synonyms: "Strong, Tough, Durable" },
  { id: 15, word: "Significant", synonyms: "Important, Notable, Considerable" },
  { id: 16, word: "Sustainable", synonyms: "Eco-friendly, Green, Lasting" },
  { id: 17, word: "Transform", synonyms: "Change, Alter, Revolutionize" },
  { id: 18, word: "Vary", synonyms: "Differ, Change, Fluctuate" },
  { id: 19, word: "Widespread", synonyms: "Common, Prevalent, Extensive" },
  { id: 20, word: "Yield", synonyms: "Produce, Generate, Provide" },
  { id: 21, word: "Advocate", synonyms: "Support, Promote, Champion" },
  { id: 22, word: "Complex", synonyms: "Complicated, Intricate, Sophisticated" },
  { id: 23, word: "Conserve", synonyms: "Preserve, Save, Protect" },
  { id: 24, word: "Enhance", synonyms: "Improve, Boost, Increase" },
  { id: 25, word: "Mitigate", synonyms: "Reduce, Lessen, Alleviate" }
];

const IELTSFlashcards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knewCount, setKnewCount] = useState(0);
  const [forgotCount, setForgotCount] = useState(0);

  const accentColor = '#A51C30';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  const handleNext = (knew: boolean) => {
    if (knew) {
      setKnewCount(prev => prev + 1);
    } else {
      setForgotCount(prev => prev + 1);
    }

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < VOCAB_DATA.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 200);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnewCount(0);
    setForgotCount(0);
  };

  const currentCard = VOCAB_DATA[currentIndex];
  const totalCards = knewCount + forgotCount;
  const scorePercentage = totalCards > 0 ? Math.round((knewCount / totalCards) * 100) : 0;
  const isCompleted = currentIndex >= VOCAB_DATA.length - 1 && (knewCount + forgotCount) > 0;

  const getScoreMessage = () => {
    if (scorePercentage >= 60) {
      return {
        title: "Outstanding Performance!",
        message: `Congratulations! You scored ${scorePercentage}%. You're absolutely crushing it! Your dedication and understanding of these words is exceptional. Keep this momentum going!`,
      };
    } else if (scorePercentage >= 30) {
      return {
        title: "Great Progress!",
        message: `Well done! You scored ${scorePercentage}%. You're on the right track and showing real improvement. Focus on reviewing the challenging words and you'll master them in no time!`,
      };
    } else {
      return {
        title: "Every Expert Started Here!",
        message: `You scored ${scorePercentage}%. Don't be discouraged - mastery takes practice and repetition. Each review session makes you stronger. Hit that reset button and watch yourself improve!`,
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3" style={{ color: accentColor }}>
            Master Today's <span className="text-gray-800">Key Facts</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Here are 25 IELTS-worthy words to help boost your vocabulary. Give at least 3 synonyms for each word.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white shadow-sm border" style={{ borderColor: borderColor }}>
            <span className="text-gray-600 text-xs sm:text-sm font-medium">Progress: </span>
            <span className="text-gray-900 font-bold text-xs sm:text-sm">
              {currentIndex + 1} / {VOCAB_DATA.length}
            </span>
          </div>
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-green-50 border border-green-200 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 text-green-600" />
            <span className="text-green-700 font-bold text-xs sm:text-sm">{knewCount}</span>
          </div>
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-red-50 border border-red-200 shadow-sm">
            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 text-red-600" />
            <span className="text-red-700 font-bold text-xs sm:text-sm">{forgotCount}</span>
          </div>
          {isCompleted && (
            <button
              onClick={handleReset}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-white font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
              style={{ backgroundColor: accentColor }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div
            className="relative w-full max-w-3xl h-[400px] sm:h-[450px] md:h-[500px] cursor-pointer"
            onClick={() => !isCompleted && setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
          >
            <div
              className="w-full h-full relative transition-transform duration-600"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT */}
              <div
                className="absolute inset-0 flex flex-col justify-between shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 border-2 bg-white"
                style={{
                  backfaceVisibility: 'hidden',
                  borderColor: borderColor,
                }}
              >
                {isCompleted ? (
                  <>
                    <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-4 gap-4">
                      <Award className="w-12 h-12 sm:w-16 sm:h-16 mb-2" style={{ color: accentColor }} />
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center" style={{ color: accentColor }}>
                        {getScoreMessage().title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-center leading-relaxed max-w-lg text-gray-700">
                        {getScoreMessage().message}
                      </p>
                      <div className="flex gap-4 mt-4">
                        <div className="text-center px-5 py-3 rounded-2xl bg-green-50 border-2 border-green-200 shadow-sm">
                          <div className="text-3xl sm:text-4xl font-bold text-green-600">{knewCount}</div>
                          <div className="text-[10px] sm:text-xs text-green-700 font-semibold mt-1">Words Mastered</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] sm:text-xs font-medium">
                      <span>Click the Reset button above to practice again</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-start">
                      <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                        IELTS Vocabulary
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-4">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900">
                        {currentCard.word}
                      </h3>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
                      <RefreshCw className="w-4 h-4" />
                      <span>Tap to reveal synonyms</span>
                    </div>
                  </>
                )}
              </div>

              {/* BACK */}
              <div
                className="absolute inset-0 flex flex-col justify-between shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 border-2"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: `linear-gradient(135deg, #E11D48, ${accentColor})`,
                  borderColor: '#E11D48',
                }}
              >
                <div className="flex justify-start">
                  <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 text-white uppercase backdrop-blur-sm">
                    SYNONYMS
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-center text-white">
                    {currentCard.synonyms}
                  </h3>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext(true);
                    }}
                    className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base transition-all hover:scale-105 bg-green-500 hover:bg-green-600 text-white shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Knew it</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext(false);
                    }}
                    className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base transition-all hover:scale-105 bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Review Later</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSFlashcards;